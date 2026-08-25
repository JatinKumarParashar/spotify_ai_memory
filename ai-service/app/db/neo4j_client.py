import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase
from app.core.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Neo4j Driver Connection Pool
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def write_memory_fact(user_id: str, fact: str, pref_type: str, confidence: float = 1.0) -> str:
    """Inserts a new active preference edge into the graph with valid_to = null."""
    memory_id = f"mem_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    
    query = """
    MERGE (u:User {id: $user_id})
    CREATE (u)-[r:HAS_PREFERENCE {
        memory_id: $memory_id,
        fact: $fact,
        preference_type: $pref_type,
        valid_from: $now,
        valid_to: null,
        confidence: $confidence
    }]->(e:MemoryEntity {name: $fact})
    RETURN $memory_id AS id
    """
    with driver.session() as session:
        result = session.run(
            query,
            user_id=user_id,
            memory_id=memory_id,
            fact=fact,
            pref_type=pref_type,
            now=now,
            confidence=confidence
        )
        return result.single()["id"]

def get_active_memories(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves only currently active preferences where valid_to IS NULL."""
    query = """
    MATCH (u:User {id: $user_id})-[r:HAS_PREFERENCE]->(e:MemoryEntity)
    WHERE r.valid_to IS NULL
    RETURN r.memory_id AS id, r.fact AS fact, r.preference_type AS type, 
           r.valid_from AS valid_from, r.confidence AS confidence
    """
    with driver.session() as session:
        result = session.run(query, user_id=user_id)
        return [record.data() for record in result]

def supersede_memory(memory_id: str, new_fact: str) -> Optional[str]:
    """Closes valid_to on the old fact and creates a new active version."""
    now = datetime.now(timezone.utc).isoformat()
    new_memory_id = f"mem_{uuid.uuid4().hex[:8]}"
    
    query = """
    MATCH (u:User)-[r:HAS_PREFERENCE {memory_id: $memory_id}]->(old_e:MemoryEntity)
    SET r.valid_to = $now
    CREATE (u)-[r2:HAS_PREFERENCE {
        memory_id: $new_memory_id,
        fact: $new_fact,
        preference_type: r.preference_type,
        valid_from: $now,
        valid_to: null,
        confidence: 1.0
    }]->(new_e:MemoryEntity {name: $new_fact})
    RETURN $new_memory_id AS id
    """
    with driver.session() as session:
        result = session.run(query, memory_id=memory_id, new_fact=new_fact, new_memory_id=new_memory_id, now=now)
        record = result.single()
        return record["id"] if record else None

def delete_memory_cascade(memory_id: str) -> None:
    """Deletes the memory connection relationship from the graph."""
    query = """
    MATCH ()-[r:HAS_PREFERENCE {memory_id: $memory_id}]->()
    DELETE r
    """
    with driver.session() as session:
        session.run(query, memory_id=memory_id)