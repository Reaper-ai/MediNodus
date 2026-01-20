# app/models/medical_history_entry.py
from pydantic import BaseModel
from datetime import datetime
from typing import Literal, Optional

class MedicalHistoryEntry(BaseModel):
    image_ref: str                 # path or image_id
    date: datetime
    type: Literal["med", "report"]
    response: Optional[dict] = None  # AI response later
