import re
import string

class TextCleanerService:
    @staticmethod
    def clean_text(raw_text: str) -> str:
        """
        Clean OCR-extracted text by removing noise, special chars, extra spaces, etc.
        """
        if not raw_text.strip():
            return ""

        # Step 1: Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', raw_text).strip()

        # Step 2: Remove non-printable characters
        cleaned = ''.join(c for c in cleaned if c.isprintable())

        # Step 3: Remove excessive punctuation at start/end (optional)
        cleaned = cleaned.strip(string.punctuation + " \t\n\r")

        # Step 4: Remove lines that are just borders or separators (e.g., "-----", "=====")
        lines = cleaned.split('\n')
        filtered_lines = []
        for line in lines:
            # Skip lines that are mostly non-alphanumeric or too short
            if len(line.strip()) < 3:
                continue
            if re.match(r'^[\-\=\+\*\#\.\_]{3,}$', line.strip()):
                continue
            filtered_lines.append(line.strip())

        cleaned = '\n'.join(filtered_lines)

        # Step 5: Replace multiple newlines with single newline
        cleaned = re.sub(r'\n+', '\n', cleaned).strip()

        return cleaned