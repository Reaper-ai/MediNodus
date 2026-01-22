from pydantic import BaseModel, EmailStr
from typing import List,Optional, Literal
from datetime import datetime

# ---- USER AUTH ----
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- AI RESPONSE ----
class ReportAnalysisResult(BaseModel):
    pateint_name:Optional[str]
    report_id: Optional[str]
    summary: str
    abnormalities: List[str]
    recommendations: List[str]
    raw_text: str


class MedicineAIResponse(BaseModel):
    drug_name : str
    strength : str
    indications : str
    prescription_drug : str

# ---- UPLOAD HISTORY ---
class UploadResponse(BaseModel):
    image_ref: str                
    date: datetime
    type: Literal["med", "report"]
    response: Optional[dict] = None  



# ---- MEDICAL HISTORY ---- 
class MedicalHistory(BaseModel):
    allergy: str = ""
    current_medication: str = ""
    chronic_condition: str = ""