# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import JsonOutputParser
# from pydantic import BaseModel, Field
# from typing import List, Optional
# import os
# from dotenv import load_dotenv

# load_dotenv()  # Load .env

# GEMINI_API_KEY = os.environ[GEMINI_API_KEY]
# if not GEMINI_API_KEY:
#     raise ValueError("GEMINI_API_KEY not set in .env")

# class LabReportSchema(BaseModel):
#     patient_name: str = Field(description="Name or 'Unknown'")
#     report_date: str = Field(description="Date or 'Unknown'")
#     summary: str = Field(description="Plain-English explanation of the lab findings")
#     abnormalities: List[str] = Field(description="Only clearly abnormal values with comparison to normal range")
#     medications: List[str] = Field(description="List of medications mentioned")
#     recommendations: List[str] = Field(description="Actionable advice or next steps")

# class MedicineSchema(BaseModel):
#     drug_name: str = Field(description="Exact name or 'Unknown'")
#     strength: str = Field(description="Dosage strength or 'Unknown'")
#     indications: List[str] = Field(description="List of stated uses")
#     warnings: List[str] = Field(description="List of warnings")
#     usage_instructions: List[str] = Field(description="List of instructions")
#     is_prescription_drug: bool = Field(description="True if prescription, False otherwise")

# class LLMService:
#     def __init__(self):
#         self.llm = ChatGoogleGenerativeAI(
#             model="gemini-3-flash-preview",
#             google_api_key=GEMINI_API_KEY,
#             temperature=0.0,  # Consistent output
#             max_tokens=2048
#         )
#         self.parser_lab = JsonOutputParser(pydantic_object=LabReportSchema)
#         self.parser_medicine = JsonOutputParser(pydantic_object=MedicineSchema)

#     def generate_lab_report_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
#         schema_format = self.parser_lab.get_format_instructions()
        
#         prompt = f"""
# You are a highly skilled medical laboratory analyst. Analyze the medical report text provided.

# IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

# JSON SCHEMA FORMAT:
# {schema_format}

# INSTRUCTIONS:
# 1. Extract patient name from the text (look for phrases like "Name:", "Patient:", "Yash Patel", etc.)

# 2. Extract report date (look for dates like "02 Dec, 202X", "Dec 202X", etc.)

# 3. Look for any test results, values, ranges in the text (search for patterns like:
#    - Numbers followed by units: "200 mg/dL", "45 U/L", "3.2 ng/mL"
#    - Test names with values: "Cholesterol 240", "Hemoglobin 12.5"
#    - Tables or lists of lab values)

# 4. If NO specific test results are found, set abnormalities to empty list [] and provide general recommendations based on patient age/gender if available.

# 5. If test results ARE found:
#    - Compare each value against typical normal ranges for the test type
#    - Identify values that are clearly outside normal parameters
#    - Format as: "Test Name: Value vs Normal Range (Unit) (low/high)"

# 6. Provide a summary explaining the findings (or lack thereof)

# 7. List any medications mentioned

# 8. Provide recommendations:
#    - If specific results exist: Targeted to those findings
#    - If no specific results: General health recommendations based on patient info

# CRITICAL: Even if no specific lab values are found, you MUST still return complete JSON with patient info and general recommendations.

# LAB REPORT TEXT:
# {cleaned_text}

# Previous context (if any):
# {previous_context}

# CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
# """
#         return prompt

#     def generate_medicine_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
#         schema_format = self.parser_medicine.get_format_instructions()
        
#         prompt = f"""
# You are a pharmaceutical assistant. Extract structured info from a medicine label/photo.

# IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

# JSON SCHEMA FORMAT:
# {schema_format}

# Then extract:
# - drug_name: Exact name or 'Unknown'
# - strength: Dosage strength or 'Unknown'
# - indications: List of stated uses
# - warnings: List of warnings
# - usage_instructions: List of instructions
# - is_prescription_drug: True if prescription, False otherwise

# Text to analyze:
# {cleaned_text}

# Previous context (if any):
# {previous_context}

# CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
# """
#         return prompt

#     def call_gemini_with_prompt(self, prompt: str, parser):
#         prompt_template = ChatPromptTemplate.from_messages([
#             ("system", "You are a precise medical assistant that returns ONLY valid JSON. Always return complete JSON even if data is limited."),
#             ("human", "{prompt}")
#         ])
#         chain = prompt_template | self.llm | parser
        
#         try:
#             result = chain.invoke({"prompt": prompt})
#             return result
#         except Exception as e:
#             raise ValueError(f"LLM Error: {str(e)}")
# # from openai import OpenAI
# # from langchain_core.output_parsers import JsonOutputParser
# # from pydantic import BaseModel, Field
# # from typing import List, Optional
# # import os
# # from dotenv import load_dotenv

# # load_dotenv()  # Load .env

# # # Use your API key directly since you provided it
# # OPENROUTER_API_KEY = os.environ[OPENROUTER_API_KEY]

# # class LabReportSchema(BaseModel):
# #     patient_name: str = Field(description="Name or 'Unknown'")
# #     report_date: str = Field(description="Date or 'Unknown'")
# #     summary: str = Field(description="Plain-English explanation of the lab findings")
# #     abnormalities: List[str] = Field(description="Only clearly abnormal values with comparison to normal range")
# #     medications: List[str] = Field(description="List of medications mentioned")
# #     recommendations: List[str] = Field(description="Actionable advice or next steps")

# # class MedicineSchema(BaseModel):
# #     drug_name: str = Field(description="Exact name or 'Unknown'")
# #     strength: str = Field(description="Dosage strength or 'Unknown'")
# #     indications: List[str] = Field(description="List of stated uses")
# #     warnings: List[str] = Field(description="List of warnings")
# #     usage_instructions: List[str] = Field(description="List of instructions")
# #     is_prescription_drug: bool = Field(description="True if prescription, False otherwise")

# # class LLMService:
# #     def __init__(self):
# #         # Initialize OpenRouter client
# #         self.client = OpenAI(
# #             base_url="https://openrouter.ai/api/v1",
# #             api_key=OPENROUTER_API_KEY,
# #             default_headers={
# #                 "HTTP-Referer": "http://localhost",
# #                 "X-Title": "MediNodus",
# #             },
# #         )
# #         # Use a working free model
# #         self.model = "google/gemma-3n-e2b-it:free"  # Changed to working model
# #         self.parser_lab = JsonOutputParser(pydantic_object=LabReportSchema)
# #         self.parser_medicine = JsonOutputParser(pydantic_object=MedicineSchema)

# #     def generate_lab_report_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
# #         # Include the schema format in the prompt
# #         schema_format = self.parser_lab.get_format_instructions()
        
# #         prompt = f"""
# # You are a highly skilled medical laboratory analyst. Analyze this lab report carefully.

# # IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

# # JSON SCHEMA FORMAT:
# # {schema_format}

# # INSTRUCTIONS:
# # 1. Extract patient name and report date from: "Name Ana Betz" and "Date 2011-08-25 08:32"
# # 2. Parse the lab results table format: "Test Name Result Normal Range Units"
# #    Examples: "Hemoglobin 12 11.0 - 16.0 g/dl" → Test: Hemoglobin, Result: 12, Range: 11.0-16.0, Unit: g/dl
# #    Examples: "R8c 3.3 3.5-5.50 10% 6/uL" → Test: R8c (likely RBC), Result: 3.3, Range: 3.5-5.50, Unit: 10^6/uL
# #    Examples: "HcT 36 37,0-50.0 %" → Test: HcT (Hematocrit), Result: 36, Range: 37.0-50.0, Unit: %

# # 3. Compare each result against its normal range to identify ABNORMAL VALUES:
# #    - If result < minimum of range → abnormal (low)
# #    - If result > maximum of range → abnormal (high)
# #    - If result within range → normal

# # 4. For each ABNORMAL value, format as: "Test Name: Actual Value vs Normal Range (Units) (low/high)"
# #    Example: "RBC: 3.3 million/uL vs 3.5-5.5 million/uL (low)"

# # 5. Provide a clinical summary explaining what the abnormalities mean.

# # 6. List any medications mentioned (usually not in CBC reports).

# # 7. Provide actionable recommendations based on findings.

# # LAB REPORT TEXT:
# # {cleaned_text}

# # Previous context (if any):
# # {previous_context}

# # CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
# # """
# #         return prompt

# #     def generate_medicine_prompt(self, cleaned_text: str, previous_context: str = "") -> str:
# #         schema_format = self.parser_medicine.get_format_instructions()
        
# #         prompt = f"""
# # You are a pharmaceutical assistant. Extract structured info from a medicine label/photo.

# # IMPORTANT: You MUST follow the EXACT JSON format provided below. DO NOT create your own format.

# # JSON SCHEMA FORMAT:
# # {schema_format}

# # Then extract:
# # - drug_name: Exact name or 'Unknown'
# # - strength: Dosage strength or 'Unknown'
# # - indications: List of stated uses
# # - warnings: List of warnings
# # - usage_instructions: List of instructions
# # - is_prescription_drug: True if prescription, False otherwise

# # Text to analyze:
# # {cleaned_text}

# # Previous context (if any):
# # {previous_context}

# # CRITICAL: Return ONLY valid JSON matching the EXACT schema format. NO additional text or explanations outside JSON.
# # """
# #         return prompt

# #     def call_gemini_with_prompt(self, prompt: str, parser):
# #         try:
# #             response = self.client.chat.completions.create(
# #                 model=self.model,
# #                 messages=[
# #                     {
# #                         "role": "system",
# #                         "content": "You are a precise medical assistant that returns ONLY valid JSON. Do not add any text outside the JSON structure."
# #                     },
# #                     {
# #                         "role": "user",
# #                         "content": prompt
# #                     }
# #                 ],
# #                 temperature=0.0,  # Consistent output
# #                 max_tokens=2048,
# #             )
            
# #             content = response.choices[0].message.content.strip()
            
# #             # Clean up potential markdown code blocks
# #             if content.startswith('```json'):
# #                 content = content[7:]  # Remove ```json
# #             elif content.startswith('```'):
# #                 content = content[3:]  # Remove ```
# #             if content.endswith('```'):
# #                 content = content[:-3]  # Remove ```
# #             content = content.strip()
            
# #             # Parse the JSON response using the parser
# #             parsed_result = parser.parse(content)
# #             return parsed_result
            
# #         except Exception as e:
# #             raise ValueError(f"LLM Error: {str(e)}")
