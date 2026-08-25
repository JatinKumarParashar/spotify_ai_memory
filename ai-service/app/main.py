from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.schemas import EventPayload, EditPayload, ChatPayload
from app.db.neo4j_client import (
    write_memory_fact,
    get_active_memories,
    supersede_memory,
    delete_memory_cascade
)
from app.db.mongo_client import insert_mongo_audit_log
from app.services.ai_engine import process_chat_query

app = FastAPI(title="Spotify AI Memory Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/internal/memories")
def get_memories_endpoint(user_id: str):
    return get_active_memories(user_id)

@app.post("/internal/events", status_code=201)
def create_event_endpoint(payload: EventPayload):
    # Log raw event in MongoDB
    insert_mongo_audit_log(payload.user_id, payload.fact, payload.pref_type, payload.confidence)
    # Persist durable preference in Neo4j
    mem_id = write_memory_fact(payload.user_id, payload.fact, payload.pref_type, payload.confidence)
    return {"status": "success", "memory_id": mem_id}

@app.patch("/internal/memories/{memory_id}")
def edit_memory_endpoint(memory_id: str, payload: EditPayload):
    new_id = supersede_memory(memory_id, payload.fact)
    if not new_id:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    return {"status": "superseded", "new_memory_id": new_id}

@app.delete("/internal/memories/{memory_id}")
def delete_memory_endpoint(memory_id: str):
    delete_memory_cascade(memory_id)
    return {"status": "deleted", "memory_id": memory_id}

@app.post("/internal/chat")
def chat_endpoint(payload: ChatPayload):
    print("ai services fastapi is working",payload.prompt)
    return process_chat_query(payload.user_id, payload.prompt)