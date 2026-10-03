from datetime import datetime, timezone
from pymongo import MongoClient
from pymongo import ReturnDocument
from app.core.config import MONGODB_URI

client = None
db = None
logs_collection = None
memories_collection = None

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    client.admin.command("ping")
    db = client.get_database("spotify_memory")
    logs_collection = db["user_interaction_logs"]
    memories_collection = db["memories"]
    memories_collection.create_index("memoryId", unique=True)
except Exception as exc:  # pragma: no cover - fail-open for local/demo usage
    print(f"[MongoDB Warning] MongoDB unavailable; continuing without audit storage: {exc}")


def _require_memories_collection():
    if memories_collection is None:
        raise RuntimeError("MongoDB memory storage is unavailable")
    return memories_collection


def get_memory_record(memory_id: str):
    collection = _require_memories_collection()
    return collection.find_one({"memoryId": memory_id, "status": "active"})


def insert_memory_record(memory_id: str, user_id: str, fact: str, pref_type: str, confidence: float, valid_from: str):
    collection = _require_memories_collection()
    collection.insert_one({
        "memoryId": memory_id,
        "userId": user_id,
        "fact": fact,
        "prefType": pref_type,
        "confidence": confidence,
        "validFrom": valid_from,
        "validTo": None,
        "status": "active",
        "createdAt": datetime.now(timezone.utc),
    })


def ensure_memory_record(memory: dict):
    collection = _require_memories_collection()
    return collection.find_one_and_update(
        {"memoryId": memory["memory_id"]},
        {"$setOnInsert": {
            "memoryId": memory["memory_id"],
            "userId": memory["user_id"],
            "fact": memory["fact"],
            "prefType": memory["preference_type"],
            "confidence": memory["confidence"],
            "validFrom": memory["valid_from"],
            "validTo": None,
            "status": "active",
            "createdAt": datetime.now(timezone.utc),
        }},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )


def remove_memory_record(memory_id: str):
    collection = _require_memories_collection()
    return collection.find_one_and_delete({"memoryId": memory_id})


def restore_memory_record(memory: dict):
    collection = _require_memories_collection()
    collection.replace_one({"memoryId": memory["memoryId"]}, memory, upsert=True)


def supersede_memory_record(memory_id: str, new_memory_id: str, new_fact: str, valid_from: str):
    collection = _require_memories_collection()
    old_memory = collection.find_one({"memoryId": memory_id, "status": "active"})
    if old_memory is None:
        return None

    new_memory = {
        "memoryId": new_memory_id,
        "userId": old_memory["userId"],
        "fact": new_fact,
        "prefType": old_memory["prefType"],
        "confidence": 1.0,
        "validFrom": valid_from,
        "validTo": None,
        "status": "active",
        "createdAt": datetime.now(timezone.utc),
    }
    collection.insert_one(new_memory)
    try:
        result = collection.update_one(
            {"_id": old_memory["_id"], "status": "active"},
            {"$set": {"status": "superseded", "validTo": valid_from, "supersededBy": new_memory_id}},
        )
        if result.modified_count != 1:
            collection.delete_one({"memoryId": new_memory_id})
            return None
    except Exception:
        collection.delete_one({"memoryId": new_memory_id})
        collection.replace_one({"memoryId": memory_id}, old_memory, upsert=True)
        raise
    return old_memory


def rollback_memory_supersede(old_memory: dict, new_memory_id: str):
    collection = _require_memories_collection()
    collection.delete_one({"memoryId": new_memory_id})
    collection.replace_one({"memoryId": old_memory["memoryId"]}, old_memory, upsert=True)


def insert_mongo_audit_log(user_id: str, fact: str, pref_type: str, confidence: float, memory_id: str = None):
    """Saves raw event into MongoDB document collection for audit history."""
    if logs_collection is None:
        return
    try:
        log_entry = {
            "userId": user_id,
            "fact": fact,
            "prefType": pref_type,
            "confidence": confidence,
            "memoryId": memory_id,
            "createdAt": datetime.now(timezone.utc)
        }
        logs_collection.insert_one(log_entry)
    except Exception as e:
        print(f"[MongoDB Warning] Failed to write audit record: {e}")