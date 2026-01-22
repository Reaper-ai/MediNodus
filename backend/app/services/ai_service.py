from transformers import pipeline
from PIL import Image
import torch

async def initialize_model():
    model_id = "unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit"
    pipe = pipeline(
    "image-text-to-text",
    model=model_id,
    dtype=torch.bfloat16,
    )

    return pipe

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
                    "text": """Analyze the given medicince information and patient history to tell any warings,precautions, or side effects that can happen
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
