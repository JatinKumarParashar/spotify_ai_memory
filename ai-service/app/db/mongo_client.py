from datetime import datetime, timezone
from pymongo import MongoClient
from app.core.config import MONGODB_URI

client = MongoClient(MONGODB_URI)
db = client.get_database() # Uses 'spotify_memory' from URI
logs_collection = db["user_interaction_logs"]

def insert_mongo_audit_log(user_id: str, fact: str, pref_type: str, confidence: float):
    """Saves raw event into MongoDB document collection for audit history."""
    try:
        log_entry = {
            "userId": user_id,
            "fact": fact,
            "prefType": pref_type,
            "confidence": confidence,
            "createdAt": datetime.now(timezone.utc)
        }
        logs_collection.insert_one(log_entry)
    except Exception as e:
        print(f"[MongoDB Warning] Failed to write audit record: {e}")