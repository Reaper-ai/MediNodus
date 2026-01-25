# backend/app/api/v1/endpoints/meds.py
from fastapi import UploadFile, File, Depends, HTTPException, APIRouter
from PIL import Image
import json, re, io
from typing import List
from datetime import datetime
from pydantic import ValidationError
from app.schemas import MedicineAIResponse, MedicalHistory
from app.services.auth_service import AuthService
from app.services.image_service import save_image
from app.services.ai_service import analyze_medicine_image, analyze_medicine_effects, analyze_report
from app.models.history_entry import AppHistoryEntry
from app.models.medical_record import MedicalHistoryRecord
from app.services.fda_service import FDAService
from pdf2image import convert_from_bytes
from beanie.operators import In
router = APIRouter(prefix="/med", tags=["Med"])

# ---- HELPER --------------
async def get_medical_history(user_id: str) -> str:
    """
    Fetches the user's medical profile (Allergies, Conditions, Meds) 
    to provide context for the AI.
    """
    record = await MedicalHistoryRecord.find_one(MedicalHistoryRecord.user_id == user_id)
    
    if not record:
        return "Patient has no known medical history."

    # Build a context string
    context_parts = []
    # Using join in case they are lists (handling the previous list vs str issue)
    if record.allergy:
        val = record.allergy if isinstance(record.allergy, str) else ", ".join(record.allergy)
        context_parts.append(f"Allergies: {val}")
    if record.chronic_condition:
        val = record.chronic_condition if isinstance(record.chronic_condition, str) else ", ".join(record.chronic_condition)
        context_parts.append(f"Chronic Conditions: {val}")
    if record.current_medication:
        val = record.current_medication if isinstance(record.current_medication, str) else ", ".join(record.current_medication)
        context_parts.append(f"Current Medications: {val}")
    
    if not context_parts:
        return "Patient has no known medical history."
        
    return ". ".join(context_parts)


async def save_record(image_ref: str, current_user, response_data: dict, record_type: str):
    """
    Creates a history entry and links it to the user's MedicalHistoryRecord.
    """
    # 1. Create and Save the Entry Document
    new_entry = AppHistoryEntry(
        image_ref=image_ref,
        date=datetime.utcnow(),
        type=record_type,
        response=response_data  # This MUST be a dict
    )
    await new_entry.save()

    # 2. Find the User's Record (or create one if it doesn't exist)
    record = await MedicalHistoryRecord.find_one(MedicalHistoryRecord.user_id == str(current_user.id))
    
    if not record:
        record = MedicalHistoryRecord(
            user_id=str(current_user.id),
            email=current_user.email
        )
        await record.insert()

    # 3. Append the new entry to the history list
    if record.history is None:
        record.history = []
        
    record.history.append(new_entry)
    await record.save()

# ------------------ HELPER ---------------------
def convert_pdf_to_long_image(pdf_bytes: bytes) -> Image.Image:
    images = convert_from_bytes(pdf_bytes)
    if not images:
        raise ValueError("PDF contains no pages")

    max_width = max(img.width for img in images)
    total_height = sum(img.height for img in images)

    stitched_image = Image.new("RGB", (max_width, total_height), (255, 255, 255))

    current_y = 0
    for img in images:
        stitched_image.paste(img, (0, current_y))
        current_y += img.height

    return stitched_image

def parse_json_output(raw_text: str) -> dict:
    """
    Robustly extracts JSON from AI output that might contain 
    thoughts, markdown, or other noise.
    """
    try:
        # 1. Try finding a markdown code block first
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        
        # 2. Fallback: Find the first '{' and the last '}'
        start = raw_text.find('{')
        end = raw_text.rfind('}')
        if start != -1 and end != -1 and end > start:
            json_str = raw_text[start:end+1]
            return json.loads(json_str)
            
    except (json.JSONDecodeError, Exception) as e:
        print(f"JSON Parsing failed: {e}")
    
    # Return a safe default to prevent crashes
    return {
        "error": "Failed to parse AI response",
        "raw_text": raw_text
    }

# ------------------- MEDICINE -------------------------

@router.post("/upload-medicine-image")
async def upload_medical_image(
    image: UploadFile = File(...),
    current_user = Depends(AuthService.get_current_user)
):
    # 1️⃣ Read & store image
    image_bytes = await image.read()
    # RENAME to pil_image to avoid overwriting the 'image' UploadFile object
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # 2️⃣ Run AI pipeline
    medicine_details_str = await analyze_medicine_image(pil_image)
    
    # Use helper to parse
    parsed_medicine_details = parse_json_output(medicine_details_str)
    
    # Convert to Pydantic for validation/structure if needed
    try:
        validated_med = MedicineAIResponse(**parsed_medicine_details)
        parsed_medicine_details = validated_med.dict()
    except ValidationError:
        # Keep the dict as is if validation fails but it's still a dict
        pass

    drug_name = parsed_medicine_details.get("drug_name", "UNKNOWN")

    if not drug_name or drug_name == "Unknown":
        return {
            "status": "failure",
            "message": "Could not read image",
        }

    print("    Querying OpenFDA...")
    fda_entry = await FDAService.get_drug_details(drug_name)

    medical_history = await get_medical_history(str(current_user.id))
    
    # Combine info for the second AI call
    medicine_full_info = f"FDA Info: {fda_entry}\nExtracted Details: {parsed_medicine_details}"
    
    # 3️⃣ Analyze Effects (The part that was crashing)
    effects_response_str = await analyze_medicine_effects(medical_history, medicine_full_info)
    
    # FIX: Parse the string into a dict
    cleaned_effects_response = parse_json_output(effects_response_str)
    final_response = {**parsed_medicine_details, **cleaned_effects_response}
    # 4️⃣ Save Record
    # Now using 'image.filename' works because we didn't overwrite 'image'
    image_ref = await save_image(image_bytes, image.filename, str(current_user.id))
    
    # Pass the DICT, not the string
    await save_record(image_ref, current_user, cleaned_effects_response, "med")

    return {
        "status": "success",
        "message": final_response
    }


# ------------------ REPORT ---------------------

@router.post("/upload-medical-report-image")
async def upload_medical_report_image(
    image: UploadFile = File(...),
    current_user = Depends(AuthService.get_current_user)
):
    # 1️⃣ Read & store image
    image_bytes = await image.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
    # 2️⃣ Run AI pipeline
    response_str = await analyze_report(pil_image)
    cleaned_response = parse_json_output(response_str)
    
    image_ref = await save_image(image_bytes, image.filename, str(current_user.id))
    await save_record(image_ref, current_user, cleaned_response, "report")    
    
    return {
        "status": "success",
        "message": cleaned_response
    }

   
@router.post("/upload-medical-report-pdf")
async def upload_medical_report_pdf(
    file: UploadFile = File(...),
    current_user = Depends(AuthService.get_current_user)
):
    # 1. Validation
    if file.content_type != "application/pdf":
        return {"status": "failure", "message": "File must be a PDF"}

    # 2. Read bytes & Convert to Image
    file_bytes = await file.read()
    
    try:
        # Stitch pages into one long image
        image = convert_pdf_to_long_image(file_bytes)
    except Exception as e:
        print(f"PDF Conversion Failed: {e}")
        return {"status": "failure", "message": "Could not process PDF file."}

    # 3. Run AI pipeline
    response_text = await analyze_report(image)
    cleaned_response = parse_json_output(response_text)
    
    # 4. Save Record
    output_buffer = io.BytesIO()
    image.save(output_buffer, format="JPEG")
    image_bytes = output_buffer.getvalue()
    
    image_ref = await save_image(image_bytes, file.filename.replace(".pdf", ".jpg"), str(current_user.id))
    
    await save_record(image_ref, current_user, cleaned_response, "report")
    
    return {
        "status": "success",
        "message": cleaned_response
    }


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

# -------- HISTORY -------------------
@router.get("/history")
async def get_user_history(current_user = Depends(AuthService.get_current_user)):
    # 1. Fetch the user's record container (WITHOUT fetch_links to avoid the crash)
    record = await MedicalHistoryRecord.find_one(
        MedicalHistoryRecord.user_id == str(current_user.id)
    )
    
    if not record or not record.history:
        return []
    
    # 2. Manually extract IDs from the Links
    # Beanie Link objects store the reference in .ref.id
    try:
        ids = [link.ref.id for link in record.history if link.ref]
    except AttributeError:
        # Fallback if structure is different in your version
        ids = [link.id for link in record.history if hasattr(link, 'id')]

    if not ids:
        return []

    # 3. Fetch the actual documents using the IDs
    # This bypasses the broken Aggregation pipeline in Motor 3.0
    history_entries = await AppHistoryEntry.find(
        In(AppHistoryEntry.id, ids)
    ).sort("-date").to_list()
    
    return history_entries