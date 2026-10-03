import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

# Prefer local defaults for a demo environment so the app can still boot when
# cloud-backed services are unavailable or the DNS entry is invalid.
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/spotify_memory")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))

# If the environment is still pointing at a remote Atlas/Neo4j cluster that is not
# resolvable in the current environment, switch to a local in-memory-safe dev stance.
# if "cluster0.wh9ybof.mongodb.net" in (os.getenv("MONGODB_URI") or ""):
#     MONGODB_URI = "mongodb://localhost:27017/spotify_memory"
# if "databases.neo4j.io" in (os.getenv("NEO4J_URI") or ""):
#     NEO4J_URI = "bolt://localhost:7687"