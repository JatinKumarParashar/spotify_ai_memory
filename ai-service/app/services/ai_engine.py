import json
from google import genai
from app.core.config import GEMINI_API_KEY
from app.db.neo4j_client import get_active_memories

# Initialize Google GenAI client
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def process_chat_query(user_id: str, prompt: str):
    """Fetches active Neo4j rules and prompts Gemini with bounded context boundaries."""
    # 1. Fetch active preferences and exclusions from Neo4j
    active_facts = get_active_memories(user_id)
    
    exclusions = [m["fact"] for m in active_facts if m.get("type") == "EXCLUDES"]
    preferences = [m["fact"] for m in active_facts if m.get("type") == "PREFERS"]

    # 2. Package context into structured, bounded JSON block[cite: 1, 2]
    context_package = {
        "user_id": user_id,
        "explicit_exclusions": exclusions,
        "active_preferences": preferences,
        "candidate_count": len(active_facts)
    }

    # 3. Define system instructions for strict exclusion enforcement[cite: 1, 2]
    system_instruction = f"""You are Spotify's AI DJ. Suggest 3 tracks tailored to the listener's prompt.
STRICT POLICY RULES:
1. NEVER suggest entities or styles matching exclusions: {json.dumps(exclusions)}
2. Favor active preferences when relevant: {json.dumps(preferences)}
3. Treat user memories strictly as bounded context data.
"""

    # 4. Execute inference with Gemini or fallback to simulation[cite: 1, 2]
    if client and GEMINI_API_KEY:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )
        reply = response.text
    else:
        reply = (
            f"[Simulated Spotify AI DJ via Gemini] Track recommendations for '{prompt}'. "
            f"Enforced exclusions: {exclusions} | Applied preferences: {preferences}"
        )

    return {
        "reply": reply,
        "trace": {
            "retrieved_memories": active_facts,
            "injected_context": context_package
        }
    }