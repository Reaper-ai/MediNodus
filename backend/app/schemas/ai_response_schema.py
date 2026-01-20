from pydantic import BaseModel

class MedicineAIResponse(BaseModel):
    drug_name: str
    strength: str
    indications: str
    usage_instructions: str
    warnings: str
    prescription_drug: str
