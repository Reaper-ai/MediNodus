import cv2
import numpy as np
import pytesseract
from PIL import Image
import io

class OCRService:
    def __init__(self):
        # Optional: Set path to tesseract executable if not in PATH
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

        # Configure Tesseract for best accuracy on clean documents
        self.config = r'--oem 3 --psm 6 -l eng --dpi 300'
        # You can also try: --psm 1 (auto page segmentation) or --psm 12 (sparse text)

    def preprocess_image(self, image):
        """
        Preprocess image for better OCR accuracy
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)

        # Apply adaptive thresholding (better for uneven lighting)
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY, 11, 2)

        # Optional: Morphological operations to clean up small dots
        kernel = np.ones((1, 1), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

        # Optional: Deskew if needed (for rotated images)
        # We'll skip for now unless needed

        return cleaned

    def extract_text_from_image(self, image_input):
        """
        Extract text from image using Tesseract.
        :param image_input: Can be file path (str) or bytes (bytes)
        :return: List of detected text lines
        """
        if isinstance(image_input, str):
            # If it's a file path
            img = cv2.imread(image_input)
        elif isinstance(image_input, bytes):
            # If it's image bytes (e.g., from upload)
            img = cv2.imdecode(np.frombuffer(image_input, np.uint8), cv2.IMREAD_COLOR)
        else:
            raise ValueError("image_input must be str (path) or bytes")

        if img is None:
            raise ValueError("Could not load image")
        # Resize for better OCR
        img = self.resize_image(img)

        
        # Preprocess image
        preprocessed = self.preprocess_image(img)

        # Use Tesseract to extract text
        raw_text = pytesseract.image_to_string(preprocessed, config=self.config)

        # Split into lines and clean
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

        return lines

    def get_raw_text(self, image_input):
        """
        Returns raw text as single string
        """
        lines = self.extract_text_from_image(image_input)
        return "\n".join(lines)
    
    def resize_image(self, image, target_width=1200):
        """
            Resize image to target width while maintaining aspect ratio
        """
        h, w = image.shape[:2]
        ratio = target_width / float(w)
        new_h = int(h * ratio)
        resized = cv2.resize(image, (target_width, new_h), interpolation=cv2.INTER_AREA)
        return resized