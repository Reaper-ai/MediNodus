from transformers import pipeline
from PIL import Image
import torch
from huggingface_hub import login
from app.config import settings
_global_pipe = None

async def initialize_model():
    global _global_pipe
    
    #------------------ AUTHENTICATION ------------------
    if settings.HF_TOKEN:
        print("🔐 Authenticating with Hugging Face...")
        login(token=settings.HF_TOKEN)
    else:
        print("⚠️  Warning: HF_TOKEN not found. Download may fail for gated models.")
    # ----------------------------------------------------


    # 2. Check if the model is already loaded. If so, return it.
    if _global_pipe is not None:
        return _global_pipe

    print("Loading Model into Memory... (This happens only once)")
    model_id = "unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit"
    
    # 3. Load the model and assign it to the global variable
    _global_pipe = pipeline(
        "image-text-to-text",
        model=model_id,
        dtype=torch.bfloat16,
        # 'device_map="auto"' is recommended if you have accelerate installed, 
        # otherwise, transformers usually picks the GPU automatically or you can add device=0
    )

    return _global_pipe

async def analyze_medicine_image(image)-> str:
    
    pipe = await initialize_model()

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {
                    "type": "text",
                    "text": """Analyze this medicine image.
                    Extract the following in JSON format:
                    - drug_name
                    - strength
                    - indications
                    - prescription_drug (Yes/No)
                    """
                }
            ]
        }
    ]
    print("Request sent...")
    output = pipe(text=messages, max_new_tokens=2000)
    print("Response received")
    return output[0]["generated_text"][-1]["content"]


async def analyze_medicine_effects(medical_history, medicine_info) -> str:    
    
    pipe = await initialize_model()

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": medical_history },
                {"type": "text", "text": medicine_info},
                {
                    "type": "text",
                    "text": """You are a Clinical Decision Support System. Output ONLY valid JSON.
                                Analyze the NEW DRUG against the PATIENT HISTORY for safety.
                                Required JSON Output Format:
                            {
                            "interactions": [
                                {
                                "type": "Drug-Allergy" or "Drug-Condition" or "Drug-Drug",
                                "severity": "High" or "Medium" or "Low",
                                "warning": "Short description of the risk (e.g., 'Patient has penicillin allergy')"
                                }
                            ],
                            "side_effects": ["Likely side effect 1", "Likely side effect 2"],
                            "final_recommendation": "Proceed with caution" or "Do not take" or "Safe",
                            }
                            If no interactions are found, return an empty list [] for "interactions".
                            Do not output thinking or explanations. Start with {.""
                                            """
                }
            ]
        }
    ]
    print("Request sent...")
    output = pipe(text=messages, max_new_tokens=2000)
    print("Response received")
    return output[0]["generated_text"][-1]["content"]


async def analyze_report( report):
    
    pipe = await initialize_model()

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": report},
                {"type": "text", "text" :"""You are a helpful medical API. Analyze the image and return a valid JSON object.
    
    Rules:
    1. Extract 'patient_name' and 'report_date'.
    2. 'summary': Write a polite, 2-sentence summary for the patient (e.g., "Your blood count shows low iron levels.").
    3. 'abnormalities': List ONLY test results that are marked High or Low. Ignore normal results.
    4. 'recommendations': Provide 3 simple, patient-friendly health tips based on the abnormalities.
    5. ONLY return the json response nothing else
    
    Output Format (Strict JSON):
    {
      "patient_name": "string",
      "report_date": "string",
      "patient_summary": "string",
      "abnormalities": [
        {"test": "string", "value": "string", "status": "High/Low"}
      ],
      "recommendations": ["string", "string", "string"]
    }
    """
            }]}]


    print("Request sent...")
    output = pipe(text=messages, max_new_tokens=2000)
    print("Response received")
    return output[0]["generated_text"][-1]["content"]
