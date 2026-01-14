import os 
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate 
from app.core.config import settings 


llm=ChatGoogleGenerativeAI(
    model="gemini-1.5-turbo",
    temperature=0.2,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# the system prompt 
# this is where we tell the ai exacltyhwo to behave 

medical_prompt_template = """
You are MediNodus, an expert AI Medical Assistant. 
Your task is to analyze the following text extracted from a medical lab report.

INPUT TEXT:
{ocr_text}

INSTRUCTIONS:
1. Identify the **Patient Name** and **Date** if present.
2. Analyze the medical values. Identify any **Abnormalities** (values out of standard range).
3. Write a **Summary** in simple, non-medical English explaining the user's health status.
4. Provide 3 specific **Dietary/Lifestyle Recommendations** based ONLY on the abnormalities found.
5. If the text does not look like a medical report, return "Invalid Report".

FORMAT YOUR RESPONSE AS VALID JSON ONLY:
{{
  "patient_name": "Name or Unknown",
  "report_date": "Date or Unknown",
  "summary": "Your summary here...",
  "abnormalities": ["High Sugar", "Low Iron", etc.],
  "recommendations": ["Eat less sugar", "Walk more", etc.]
}}
"""

prompt = PromptTemplate(
    input_variables=["ocr_text"],
    template=medical_prompt_template
)

async def analyze_medical_text(text:str):
    """ send the cleaned text to gemini and proccess the response"""
    try:
        chain=prompt|llm

        response=await chain.ainvoke({"ocr_text":text})

        response_text=response.content
        
        cleaned_response = response_text.replace("```json", "").replace("```", "").strip()


        return cleaned_response
    except Exception as e:
        print(f"LLM Error:{e}")
        return None