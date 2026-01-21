# app/schemas/medical_report.py
from pydantic import BaseModel
from typing import List, Optional

class MedicalReportIn(BaseModel):
    allergy: Optional[List[str]] = None
    current_medication: Optional[List[str]] = None


class MedicalReportOut(BaseModel):
    allergy: Optional[List[str]] = None
    current_medication: Optional[List[str]] = None
