from pydantic import BaseModel, Field
from typing import Optional

class EventPayload(BaseModel):
    user_id: str = Field(..., description="Unique listener identifier")
    fact: str = Field(..., description="Musical preference or constraint")
    pref_type: str = Field(..., description="PREFERS or EXCLUDES")
    confidence: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)

class EditPayload(BaseModel):
    fact: str = Field(..., description="Updated memory text")

class ChatPayload(BaseModel):
    user_id: str = Field(..., description="Unique user ID")
    prompt: str = Field(..., description="User prompt text")