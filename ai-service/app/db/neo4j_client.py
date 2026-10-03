import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase
from app.core.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Fail-open during local/demo startup so the app remains usable even when the
# external graph isn't reachable.
driver = None

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        session.run("RETURN 1")
except Exception as exc:  # pragma: no cover - fallback for local/dev runs
    print(f"[Neo4j Warning] Graph database unavailable; continuing without persisted memory graph: {exc}")


def _require_driver():
    if driver is None:
        raise RuntimeError("Neo4j memory storage is unavailable")
    return driver


def write_memory_fact(user_id: str, fact: str, pref_type: str, confidence: float = 1.0, memory_id: Optional[str] = None) -> str:
    """Inserts a new active preference edge into the graph with valid_to = null."""
    driver = _require_driver()
    memory_id = memory_id or f"mem_{uuid.uuid4().hex[:8]}"
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
    driver = _require_driver()

    query = """
    MATCH (u:User {id: $user_id})-[r:HAS_PREFERENCE]->(e:MemoryEntity)
    WHERE r.valid_to IS NULL
    RETURN r.memory_id AS id, r.fact AS fact, r.preference_type AS type,
           r.valid_from AS valid_from, r.confidence AS confidence
    """
    with driver.session() as session:
        result = session.run(query, user_id=user_id)
        return [record.data() for record in result]


def get_memory_by_id(memory_id: str) -> Optional[Dict[str, Any]]:
    driver = _require_driver()
    query = """
    MATCH (u:User)-[r:HAS_PREFERENCE {memory_id: $memory_id}]->(e:MemoryEntity)
    WHERE r.valid_to IS NULL
    RETURN r.memory_id AS memory_id, u.id AS user_id, r.fact AS fact,
           r.preference_type AS preference_type, r.valid_from AS valid_from,
           r.confidence AS confidence
    """
    with driver.session() as session:
        record = session.run(query, memory_id=memory_id).single()
        return record.data() if record else None


def supersede_memory(memory_id: str, new_fact: str, new_memory_id: Optional[str] = None) -> Optional[str]:
    """Closes valid_to on the old fact and creates a new active version."""
    driver = _require_driver()

    now = datetime.now(timezone.utc).isoformat()
    new_memory_id = new_memory_id or f"mem_{uuid.uuid4().hex[:8]}"

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


def rollback_memory_supersede(memory_id: str, new_memory_id: str) -> None:
    driver = _require_driver()
    query = """
    MATCH (u:User)-[old:HAS_PREFERENCE {memory_id: $memory_id}]->()
    OPTIONAL MATCH ()-[new:HAS_PREFERENCE {memory_id: $new_memory_id}]->()
    DELETE new
    SET old.valid_to = null
    """
    with driver.session() as session:
        session.run(query, memory_id=memory_id, new_memory_id=new_memory_id)


def delete_memory_cascade(memory_id: str) -> Optional[Dict[str, Any]]:
    """Deletes a memory relationship and returns its data for rollback if needed."""
    driver = _require_driver()

    query = """
    MATCH (u:User)-[r:HAS_PREFERENCE {memory_id: $memory_id}]->(e:MemoryEntity)
    WITH u, r, e, {
        memory_id: r.memory_id,
        user_id: u.id,
        fact: r.fact,
        preference_type: r.preference_type,
        valid_from: r.valid_from,
        confidence: r.confidence
    } AS memory
    DELETE r
    RETURN memory
    """
    with driver.session() as session:
        record = session.run(query, memory_id=memory_id).single()
        return record["memory"] if record else None


def restore_memory_fact(memory: Dict[str, Any]) -> None:
    driver = _require_driver()
    query = """
    MERGE (u:User {id: $user_id})
    MERGE (e:MemoryEntity {name: $fact})
    MERGE (u)-[r:HAS_PREFERENCE {memory_id: $memory_id}]->(e)
    ON CREATE SET r.fact = $fact,
                  r.preference_type = $preference_type,
                  r.valid_from = $valid_from,
                  r.valid_to = null,
                  r.confidence = $confidence
    """
    with driver.session() as session:
        session.run(query, **memory)








        