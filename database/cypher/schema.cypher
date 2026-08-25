// Neo4j Unique Constraints and Indices
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT entity_name_unique IF NOT EXISTS FOR (e:MemoryEntity) REQUIRE e.name IS UNIQUE;
CREATE INDEX preference_valid_to_idx IF NOT EXISTS FOR ()-[r:HAS_PREFERENCE]-() ON (r.valid_to);