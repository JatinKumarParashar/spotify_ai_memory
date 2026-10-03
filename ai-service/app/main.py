import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.schemas import EventPayload, EditPayload, ChatPayload
from app.db.neo4j_client import (
    write_memory_fact,
    get_active_memories,
    get_memory_by_id,
    supersede_memory,
    rollback_memory_supersede as rollback_neo4j_supersede,
    delete_memory_cascade,
    restore_memory_fact,
)
from app.db.mongo_client import (
    ensure_memory_record,
    get_memory_record,
    insert_memory_record,
    insert_mongo_audit_log,
    remove_memory_record,
    restore_memory_record,
    rollback_memory_supersede as rollback_mongo_supersede,
    supersede_memory_record,
)
from app.services.ai_engine import process_chat_query

app = FastAPI(title="Spotify AI Memory Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommendations")
def recommendations_endpoint(user_id: str, prompt: str):
    """Endpoint to get track recommendations based on user preferences and exclusions."""
    return process_chat_query(user_id, "what are some good tracks for me according to my preferences and exclusions? ")

@app.get("/internal/memories")
def get_memories_endpoint(user_id: str):
    return get_active_memories(user_id)

@app.post("/internal/events", status_code=201)
def create_event_endpoint(payload: EventPayload):
    memory_id = f"mem_{uuid.uuid4().hex}"
    valid_from = datetime.now(timezone.utc).isoformat()
    try:
        insert_memory_record(
            memory_id,
            payload.user_id,
            payload.fact,
            payload.pref_type,
            payload.confidence,
            valid_from,
        )
        try:
            write_memory_fact(
                payload.user_id,
                payload.fact,
                payload.pref_type,
                payload.confidence,
                memory_id,
            )
        except Exception:
            remove_memory_record(memory_id)
            raise
        insert_mongo_audit_log(
            payload.user_id,
            payload.fact,
            payload.pref_type,
            payload.confidence,
            memory_id,
        )
        return {"status": "success", "memory_id": memory_id}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Memory could not be persisted in both MongoDB and Neo4j",
        ) from exc

@app.patch("/internal/memories/{memory_id}")
def edit_memory_endpoint(memory_id: str, payload: EditPayload):
    graph_memory = get_memory_by_id(memory_id)
    mongo_memory = get_memory_record(memory_id)
    if graph_memory is None and mongo_memory is None:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    if graph_memory is None:
        raise HTTPException(status_code=409, detail="Memory exists in MongoDB but not Neo4j")

    if mongo_memory is None:
        mongo_memory = ensure_memory_record(graph_memory)
    if (
        mongo_memory.get("userId") != graph_memory["user_id"]
        or mongo_memory.get("fact") != graph_memory["fact"]
        or mongo_memory.get("prefType") != graph_memory["preference_type"]
    ):
        raise HTTPException(status_code=409, detail="Memory records differ between MongoDB and Neo4j")

    new_memory_id = f"mem_{uuid.uuid4().hex}"
    valid_from = datetime.now(timezone.utc).isoformat()
    old_memory = supersede_memory_record(memory_id, new_memory_id, payload.fact, valid_from)
    if old_memory is None:
        raise HTTPException(status_code=409, detail="Memory is no longer active in MongoDB")

    try:
        graph_new_id = supersede_memory(memory_id, payload.fact, new_memory_id)
        if graph_new_id is None:
            rollback_mongo_supersede(old_memory, new_memory_id)
            raise HTTPException(status_code=409, detail="Memory is no longer active in Neo4j")
    except HTTPException:
        raise
    except Exception as exc:
        try:
            rollback_neo4j_supersede(memory_id, new_memory_id)
            rollback_mongo_supersede(old_memory, new_memory_id)
        except Exception:
            pass
        raise HTTPException(
            status_code=503,
            detail="Memory edit could not be committed in both MongoDB and Neo4j",
        ) from exc

    insert_mongo_audit_log(
        graph_memory["user_id"],
        payload.fact,
        graph_memory["preference_type"],
        1.0,
        new_memory_id,
    )
    return {"status": "superseded", "new_memory_id": new_memory_id}

@app.delete("/internal/memories/{memory_id}")
def delete_memory_endpoint(memory_id: str):
    graph_memory = get_memory_by_id(memory_id)
    mongo_memory = get_memory_record(memory_id)
    if graph_memory is None and mongo_memory is None:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    if graph_memory is None:
        raise HTTPException(status_code=409, detail="Memory exists in MongoDB but not Neo4j")

    if mongo_memory is None:
        mongo_memory = ensure_memory_record(graph_memory)
    if (
        mongo_memory.get("userId") != graph_memory["user_id"]
        or mongo_memory.get("fact") != graph_memory["fact"]
        or mongo_memory.get("prefType") != graph_memory["preference_type"]
    ):
        raise HTTPException(status_code=409, detail="Memory records differ between MongoDB and Neo4j")

    deleted_graph_memory = delete_memory_cascade(memory_id)
    if deleted_graph_memory is None:
        raise HTTPException(status_code=409, detail="Memory is no longer active in Neo4j")
    try:
        deleted_mongo_memory = remove_memory_record(memory_id)
        if deleted_mongo_memory is None:
            restore_memory_fact(graph_memory)
            raise HTTPException(status_code=409, detail="Memory is no longer active in MongoDB")
    except HTTPException:
        raise
    except Exception as exc:
        try:
            restore_memory_record(mongo_memory)
            restore_memory_fact(graph_memory)
        except Exception:
            pass
        raise HTTPException(
            status_code=503,
            detail="Memory delete could not be committed in both MongoDB and Neo4j",
        ) from exc
    return {"status": "deleted", "memory_id": memory_id}

@app.post("/internal/chat")
def chat_endpoint(payload: ChatPayload):
    print("ai services fastapi is working",payload.prompt)
    return process_chat_query(payload.user_id, payload.prompt)