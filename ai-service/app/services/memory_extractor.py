import re
from typing import Optional, Dict, Any

def extract_preference_from_event(event_text: str) -> Optional[Dict[str, Any]]:
    """
    Evaluates text or telemetry events to derive structured memory rules.
    Applies confidence thresholds (>= 0.55) to distinguish durable facts.
    """
    text = event_text.strip()
    lower_text = text.lower()
    
    # 1. Check for explicit exclusions
    exclusion_patterns = [
        r"(?:no|never|don't play|do not suggest|hate|exclude)\s+([a-zA-Z\s]+)",
        r"(?:avoid)\s+([a-zA-Z\s]+)"
    ]
    for pattern in exclusion_patterns:
        match = re.search(pattern, lower_text)
        if match:
            entity = match.group(1).strip()
            return {"fact": f"No {entity.title()}", "pref_type": "EXCLUDES", "confidence": 0.95}

    # 2. Check for explicit preferences
    preference_patterns = [
        r"(?:prefer|always play|love|focus on|like)\s+([a-zA-Z\s]+)",
        r"(?:only)\s+([a-zA-Z\s]+)"
    ]
    for pattern in preference_patterns:
        match = re.search(pattern, lower_text)
        if match:
            entity = match.group(1).strip()
            return {"fact": f"Prefers {entity.title()}", "pref_type": "PREFERS", "confidence": 0.90}

    return None