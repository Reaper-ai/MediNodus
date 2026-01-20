# Make sure to install the accelerate library first via `pip install accelerate`
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image
from pydantic import BaseModel, Field
from typing import List, Optional
import requests
import torch



class LabReportSchema(BaseModel):
    patient_name: str = Field(description="Name or 'Unknown'")
    report_date: str = Field(description="Date or 'Unknown'")
    summary: str = Field(description="Plain-English explanation of the lab findings")
    abnormalities: List[str] = Field(description="Only clearly abnormal values with comparison to normal range")
    medications: List[str] = Field(description="List of medications mentioned")
    recommendations: List[str] = Field(description="Actionable advice or next steps")


def initialize_model():
    model_id = "unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit"

    model = AutoModelForImageTextToText.from_pretrained(
        model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    processor = AutoProcessor.from_pretrained(model_id,use_fast=True)

    return model, processor



def inference(model, processor, data, mode):
    if mode == "Report":
        image = Image.open(data)
        messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text" :"You are a helpful medical assistant that extracts and analyzes lab test results from medical reports.\
                                  Extract patient name (e.g., “Name:”, “Patient:”, or direct name).\
                                  Extract report date (any valid date format).\
                                  Extract lab test results (test name, value, unit).\
                                  If no test values found,\
                                  set abnormalities = []\
                                  and give general health recommendations (use age/gender if mentioned).\
                                  If test values exist:\
                                  Compare with standard normal ranges\
                                  List only abnormal results as:\
                                  Test: Value vs Normal Range (Unit) - high/low\
                                  Write a brief medical summary.\
                                  Give recommendations:\
                                  Targeted if abnormalities exist\
                                  format everything as a keyvalue pair\
                                  General if none exist.\
                                  Do not explain.Do not show reasoning.Output only the final extracted information.If a detail cannot be determined, write 'Unknown'"
            }]}]

    elif mode == "MedicineID":
        image = Image.open(data)
        messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": "Look at the medicine / tablet / capsule image Extract the Drug name. Do not explain.\
                Do not show reasoning.Output only the final extracted information.If a detail cannot be determined, write 'Unknown'"
            }]}]

    elif mode == "MedicineREF":
        medicine_context = data
        medicine_context = "paracitamol" + "medical_history"
        messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": medicine_context},
                {"type": "text", "text": "Analyse the prescribed medicine fda entry and the medical history provided by the patient"
            }]}]
    else:
        raise "INVALID INPUT MODE"
    
    inputs = processor.apply_chat_template(
        messages, add_generation_prompt=True, tokenize=True,
        return_dict=True, return_tensors="pt"
    ).to(model.device, dtype=torch.bfloat16)

    input_len = inputs["input_ids"].shape[-1]

    with torch.inference_mode():
        generation = model.generate(**inputs, max_new_tokens=2000, do_sample=False)
        generation = generation[0][input_len:]

        decoded = processor.decode(generation, skip_special_tokens=True)

    return decoded

