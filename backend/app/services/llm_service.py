from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env

GEMINI_API_KEY = "AIzaSyAYKA96yKfhnI_1CfVDNq60jgcO9wcmYAo"
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")

class LabReportSchema(BaseModel):
    patient_name: str = Field(description="Name or 'Unknown'")
    report_date: str = Field(description="Date or 'Unknown'")
    summary: str = Field(description="Plain-English explanation of the lab findings")
    abnormalities: List[str] = Field(description="Only clearly abnormal values with comparison to normal range")
    medications: List[str] = Field(description="List of medications mentioned")
    recommendations: List[str] = Field(description="Actionable advice or next steps")

class MedicineSchema(BaseModel):
    drug_name: str = Field(description="Exact name or 'Unknown'")
    strength: str = Field(description="Dosage strength or 'Unknown'")
    indications: List[str] = Field(description="List of stated uses")
    warnings: List[str] = Field(description="List of warnings")
    usage_instructions: List[str] = Field(description="List of instructions")
    is_prescription_drug: bool = Field(description="True if prescription, False otherwise")

class LLMService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3-flash-preview",
            google_api_key=GEMINI_API_KEY,
            temperature=0.0,  # Lowest temperature for most consistent output
            max_tokens=2048
        )
        self.parser_lab = JsonOutputParser(pydantic_object=LabReportSchema)
        self.parser_medicine = JsonOutputParser(pydantic_object=MedicineSchema)

    def generate_lab_report_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
        # Include the schema format in the prompt
        schema_format = self.parser_lab.get_format_instructions()
        
        prompt = f"""
You are a highly skilled medical laboratory analyst. Analyze this lab report carefully.

IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

JSON SCHEMA FORMAT:
{schema_format}

INSTRUCTIONS:
1. Extract patient name and report date from: "Name Ana Betz" and "Date 2011-08-25 08:32"
2. Parse the lab results table format: "Test Name Result Normal Range Units"
   Examples: "Hemoglobin 12 11.0 - 16.0 g/dl" → Test: Hemoglobin, Result: 12, Range: 11.0-16.0, Unit: g/dl
   Examples: "R8c 3.3 3.5-5.50 10% 6/uL" → Test: R8c (likely RBC), Result: 3.3, Range: 3.5-5.50, Unit: 10^6/uL
   Examples: "HcT 36 37,0-50.0 %" → Test: HcT (Hematocrit), Result: 36, Range: 37.0-50.0, Unit: %

3. Compare each result against its normal range to identify ABNORMAL VALUES:
   - If result < minimum of range → abnormal (low)
   - If result > maximum of range → abnormal (high)
   - If result within range → normal

4. For each ABNORMAL value, format as: "Test Name: Actual Value vs Normal Range (Units) (low/high)"
   Example: "RBC: 3.3 million/uL vs 3.5-5.5 million/uL (low)"

5. Provide a clinical summary explaining what the abnormalities mean.

6. List any medications mentioned (usually not in CBC reports).

7. Provide actionable recommendations based on findings.

LAB REPORT TEXT:
{cleaned_text}

Previous context (if any):
{previous_context}

CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
"""
        return prompt

    def generate_medicine_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
        schema_format = self.parser_medicine.get_format_instructions()
        
        prompt = f"""
You are a pharmaceutical assistant. Extract structured info from a medicine label/photo.

IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

JSON SCHEMA FORMAT:
{schema_format}

Then extract:
- drug_name: Exact name or 'Unknown'
- strength: Dosage strength or 'Unknown'
- indications: List of stated uses
- warnings: List of warnings
- usage_instructions: List of instructions
- is_prescription_drug: True if prescription, False otherwise

Text to analyze:
{cleaned_text}

Previous context (if any):
{previous_context}

CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
"""
        return prompt

    def call_gemini_with_prompt(self, prompt: str, parser):
        # More explicit chain construction
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a precise medical assistant that returns ONLY valid JSON."),
            ("human", "{prompt}")
        ])
        chain = prompt_template | self.llm | parser
        
        try:
            result = chain.invoke({"prompt": prompt})
            return result
        except Exception as e:
            raise ValueError(f"LLM Error: {str(e)}")