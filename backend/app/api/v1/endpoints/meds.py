# main.py (or router file)
from fastapi import UploadFile, File, Depends, HTTPException, APIRouter
from PIL import Image
import json, re, io
from pydantic import ValidationError
from app.schemas import MedicineAIResponse, MedicalHistory
from app.services.auth_service import AuthService
from app.services.image_service import save_image
from app.services.ai_service import analyze_medicine_image, analyze_medicine_effects, analyze_report
from backend.app.models.history_entry import AppHistoryEntry
from backend.app.models.medical_record import MedicalHistoryRecord
from app.services.fda_service import FDAService

router = APIRouter(prefix="/med", tags=["Med"])


# ------------------- MEDICINE -------------------------

@router.post("/upload-medicine-image")
async def upload_medical_image(
    image: UploadFile = File(...),
    current_user = Depends(AuthService.get_current_user)
):

    # 1️⃣ Read & store image
    image_bytes = await image.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")


    def parse_medicine_ai_response(raw_text: str) -> dict:
        try:
            # 1. Regex to find the JSON block { ... }
            # This ignores everything before the first '{' (the thought process)
            # and everything after the last '}'
            match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
    
            if match:
                data = json.loads(raw_text)
                validated = MedicineAIResponse(**data)
                print(raw_text)
                return validated.dict()

        except (json.JSONDecodeError, ValidationError):
            # Fallback (never crash backend)
            return {
                "drug_name" : "UNKNOWN",
                "strength" : "UNKNOWN",
                "indications" : "UNKNOWN",
                "prescription_drug" : "UNKNOWN"}
        
    # 2️⃣ Run AI pipeline
    medicine_details = await analyze_medicine_image(image)
    parsed_response = parse_medicine_ai_response(medicine_details)
    drug_name = parsed_response["drug_name"]

    if not drug_name or drug_name == "Unknown":
        return {
            "status": "failure",
            "message": "Could not read image",
        }

    fda_entry = {}
    print("    Querying OpenFDA...")
    fda_entry = await FDAService.get_drug_details(drug_name)

    medical_history = get_medical_history()
    medicine_full_info = str(fda_entry) + str(medicine_details)
    response = analyze_medicine_effects(medicine_full_info, medical_history)

    image_ref = await save_image(image_bytes, image.filename,str(current_user.id))
    save_record(image_ref, current_user, response, "med")


    return {
        "status": "success",
        "message": response
    }


# ------------------ REPORT ---------------------

@router.post("/upload-medical-report-image")
async def upload_medical_image(
image: UploadFile = File(...),
    current_user = Depends(AuthService.get_current_user)
):
    # 1️⃣ Read & store image
    image_bytes = await image.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")


    def parse_response(raw_text: str) -> dict:
        try:
            # 1. Regex to find the JSON block { ... }
            # This ignores everything before the first '{' (the thought process)
            # and everything after the last '}'
            match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
    
            if match:
                data = json.loads(raw_text)
                validated = MedicineAIResponse(**data)
                print(raw_text) 
                return {
                    "status": "success",
                    "message": validated.dict()
                    }

        except (json.JSONDecodeError, ValidationError):
            # Fallback (never crash backend)
            return {
            "status": "failure",
            "message": "Could not read image",
            }

        
    # 2️⃣ Run AI pipeline
    response = await analyze_report(image)
    cleaned_response = parse_response(response)
    image_ref = await save_image(image_bytes, image.filename,str(current_user.id))
    save_record(image_ref, current_user, cleaned_response, "report")
    
    return cleaned_response

   


@router.post("/upload-medical-report-pdf")
# TODO



# -------------------- CONTEXT -------------------
@router.post("/infoupdate", response_model=MedicalHistory)
async def upsert_medical_report(
    data: MedicalHistory,
    current_user = Depends(AuthService.get_current_user)
):
    report = await MedicalHistoryRecord.find_one(
        MedicalHistoryRecord.user_id == str(current_user.id)
    )

    if report:
        if data.allergy is not None:
            report.allergy = data.allergy
        if data.current_medication is not None:
            report.current_medication = data.current_medication
        if data.chronic_condition is not None:
            report.chronic_condition = data.chronic_condition

        await report.save()
    else:
        report = MedicalHistoryRecord(
            user_id=str(current_user.id),
            email=current_user.email,
            allergy=data.allergy,
            current_medication=data.current_medication,
            chronic_condition=data.chronic_condition

        )
        await report.insert()

    return {"result" : "updated medical info"}


@router.get("/infoget", response_model=MedicalHistory)
async def get_medical_report(
    current_user = Depends(AuthService.get_current_user)
):
    report = await MedicalHistoryRecord.find_one(
        MedicalHistoryRecord.user_id == str(current_user.id)
    )

    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")

    return {
        "allergy": report.allergy,
        "current_medication": report.current_medication,
        "chronic_condition" : report.chronic_condition
    }
