# main.py (or router file)
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, APIRouter
from datetime import datetime
from PIL import Image
import json
from pydantic import ValidationError
from app.schemas.ai_response_schema import MedicineAIResponse
import io
from app.services.auth_service import AuthService
from app.services.image_service import save_image
from app.services.ai_service import analyze_medicine_image
from app.services.report_service import get_or_create_report
from app.models.medical_history_entry import MedicalHistoryEntry

router = APIRouter(prefix="/med", tags=["Med"])

@router.post("/upload-medical-image")
async def upload_medical_image(
    image: UploadFile = File(...),
    type: str = "med",  # "med" or "report"
    current_user = Depends(AuthService.get_current_user)
):
    if type not in ["med", "report"]:
        raise HTTPException(400, "type must be 'med' or 'report'")

    # 1️⃣ Read & store image
    image_bytes = await image.read()
    image_ref = await save_image(image_bytes, image.filename)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")


    def parse_medicine_ai_response(raw_text: str) -> dict:
        try:
            # Try direct JSON parse
            data = json.loads(raw_text)
            validated = MedicineAIResponse(**data)
            print(raw_text)
            return validated.dict()

        except (json.JSONDecodeError, ValidationError):
            # Fallback (never crash backend)
            return {
                "drug_name": "Unknown",
                "strength": "Unknown",
                "indications": "Unknown",
                "usage_instructions": "Unknown",
                "warnings": "Unknown",
                "prescription_drug": "Unknown",
                "raw_output": raw_text[:1000]  # keep for debugging
            }
    # 2️⃣ Run AI pipeline
    ai_response = await analyze_medicine_image(
        image=image,
        type=type
    )
    
    parsed_response = parse_medicine_ai_response(ai_response)


    # 3️⃣ Fetch user medical report
    report = await get_or_create_report(current_user)

    # 4️⃣ Append embedded history entry
    report.history.append(
        MedicalHistoryEntry(
            image_ref=image_ref,
            date=datetime.utcnow(),
            type=type,
            response=parsed_response
        )
    )

    await report.save()

    return {
        "status": "success",
        "message": "Image processed and stored",
        "history_length": len(report.history),
        "latest_entry": report.history[-1]
    }
