# app/models/medical_report.py
from beanie import Document
from typing import List, Optional
from app.models.medical_history_entry import MedicalHistoryEntry

class MedicalReport(Document):
    user_id: str
    email: str
    allergy: Optional[List[str]] = None
    current_medication: Optional[List[str]] = None

    history: List[MedicalHistoryEntry] = []

    class Settings:
        name = "medical_reports"