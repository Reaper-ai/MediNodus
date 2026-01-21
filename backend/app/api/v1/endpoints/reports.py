from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from app.services.ai_service import analyze_medicine_image
from app.services.image_service import save_image


# MOCK PATIENT HISTORY (Replace with real MongoDB call later)
async def get_patient_history(user_id: str):
    # In real life: user = await User.get(user_id); return user.medical_history
    return "Patient is diabetic (Type 2) and allergic to Penicillin."


router = APIRouter(prefix = "/report" ,tags=['Pipeline'])
llm_service = LLMService()


@router.post("/process_pipeline")
async def process_pipeline(
    file: UploadFile = File(...),
    type: str = Form(...),  # "report" or "medicine"
    user_id: str = Form(...)  # needed to fetch history
):
    """
    Full pipeline: OCR → Clean → History → LLM Branch → Result
    Supports:
      - type="report" for lab reports
      - type="medicine" for medicine images
    """
    # 1. READ & PREPROCESS IMAGE
    image_bytes = await file.read()

    # 2. OCR (Extract)
    print("--- [1] Running OCR ---")
    raw_text = OCRService.extract_text(image_bytes)

    # 3. CLEANER
    print("--- [2] Cleaning Text ---")
    cleaned_text = OCRService.clean_text(raw_text)

    if not cleaned_text.strip():
        raise HTTPException(status_code=400, detail="No readable text found in document")

    # 4. FETCH PREVIOUS HISTORY (Context)
    print("--- [3] Fetching History ---")
    history = await get_patient_history(user_id)

    # 5. BRANCHING PIPELINE
    final_result = {}

    if type == "report":
        print("--- [4] Branch: Report Analysis ---")
        # Direct Pipeline: Text + History -> LLM
        final_result = llm_service.analyze_report(cleaned_text, history)

    elif type == "medicine":
        print("--- [4] Branch: Medicine Analysis ---")

        # Step A: Find the drug name (LLM Step 1)
        drug_name = llm_service.extract_drug_name(cleaned_text)
        print(f"    Detected Drug: {drug_name}")

        # Step B: Get External Data (FDA API)
        fda_entry = {}
        if drug_name and drug_name != "Unknown":
            print("    Querying OpenFDA...")
            fda_entry = await FDAService.get_drug_details(drug_name)

        # Step C: Final Synthesis (LLM Step 2)
        # Context = Clean Text + FDA Entry + History
        final_result = llm_service.analyze_medicine(cleaned_text, fda_entry, history)

    else:
        raise HTTPException(status_code=400, detail="Invalid type. Use 'report' or 'medicine'")

    return {
        "status": "success",
        "pipeline_type": type,
        "raw_text": raw_text[:500],  # Return first 500 chars for debugging
        "cleaned_text": cleaned_text[:500],
        "result": final_result
    }