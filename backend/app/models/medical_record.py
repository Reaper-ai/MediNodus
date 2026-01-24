# app/models/medical_report.py
from beanie import Document
from typing import List
from app.models.history_entry import AppHistoryEntry

class MedicalHistoryRecord(Document):
    user_id: str
    email: str
    allergy: str = ""
    current_medication: str = ""
    chronic_condition: str = ""
    
    history: List[AppHistoryEntry] = []

    class Settings:
        name = "medical_reports"