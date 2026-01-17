from .ocr_service import OCRService
from .text_cleaner import TextCleanerService
from .llm_service import LLMService

class MediNodusPipeline:
    def __init__(self):
        self.ocr = OCRService()
        self.cleaner = TextCleanerService()
        self.llm = LLMService()

    def process(self, image_input, doc_type: str, previous_info: str = ""):
        """
        Main pipeline function.
        :param image_input: Image path or bytes
        :param doc_type: "report" or "medicine"
        :param previous_info: Previous context (from DB or history)
        :return: Structured JSON dict
        """

        # Step 1: OCR
        raw_text = self.ocr.get_raw_text(image_input)
        print("[OCR] Raw Text:\n", raw_text[:500])  # Debug first 500 chars

        # Step 2: Clean
        cleaned_text = self.cleaner.clean_text(raw_text)
        print("[CLEANER] Cleaned Text:\n", cleaned_text[:500])

        # Step 3: Generate Prompt based on type
        if doc_type == "report":
            prompt = self.llm.generate_lab_report_prompt(cleaned_text, previous_info)
            parser = self.llm.parser_lab
        elif doc_type == "medicine":
            prompt = self.llm.generate_medicine_prompt(cleaned_text, previous_info)
            parser = self.llm.parser_medicine
        else:
            raise ValueError("doc_type must be 'report' or 'medicine'")

        # Step 4: Call LLM
        result = self.llm.call_gemini_with_prompt(prompt, parser)
        print("[LLM] Generated JSON:\n", result)

        return result