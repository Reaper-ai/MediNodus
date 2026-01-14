from pydantic import BaseModel
from typing import List,Optional

class ReportAnalysisResult(BaseModel):
    pateint_name:Optional[str]
    report_id: Optional[str]
    summary: str
    abnormalities: List[str]
    recommendations: List[str]
    raw_text: str

class ReportUploadResponse(BaseModel):
    filename:str
    analysis: ReportAnalysisResult
