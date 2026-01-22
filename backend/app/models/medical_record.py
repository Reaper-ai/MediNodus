# app/models/medical_report.py
from beanie import Document
from typing import List
from backend.app.models.history_entry import MedicalHistoryEntry

class MedicalHistoryRecord(Document):
    user_id: str
    email: str
    allergy: str = ""
    current_medication: str = ""
    chronic_condition: str = ""
    
    history: List[MedicalHistoryEntry] = []

    class Settings:
        name = "medical_reports"