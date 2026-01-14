import cv2
import numpy as np
import os
os.environ["DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["PADDLEX_DISABLE_RETRIEVER"] = "True"

from paddleocr import PaddleOCR
import re
from fastapi import UploadFile


# ocr_engine=PaddleOCR(use_angle_cls=True, lang='en',show_logs=False)  # Initialize PaddleOCR once    
ocr = PaddleOCR(
    
    lang="en",
    use_textline_orientation=True
)
def preprocess_image(file_bytes:bytes):
    """Conver raw uploded files into open cv image format"""
    #string data to numpy array
    nparr=np.frombuffer(file_bytes,np.uint8)

    img=cv2.imdecode(nparr,cv2.IMREAD_COLOR) #decode image
    return img


def clean_text(text:str)->str:
    """clean ocr artifacts borders, special characters"""
    #1. remove single pipe charaters 
    text=text.replace('|',' ')
    #2. remove long underscores or dashes (lines)
    text=re.sub(r'[_]{2,}',' ',text)
    text=re.sub(r'[-]{2,}',' ',text)
    #3. remove non ascii charaters (noise)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    #4. collaspe multiple spaces into one 
    text=re.sub(r'\s+',' ',text).strip()

    return text

async def extract_text_from_file(file:UploadFile)->str:
    """Main function : Orchestrates reading ->preprocessing->cleaning"""

    contents=await file.read()  #read file contents as bytes

    img=preprocess_image(contents)

    # ocr 
    # cls detect if text is upside dodwn 
    result=ocr_engine.ocr(img,cls=True)

    extracted_text=""
    # Parse PaddleOCR result (it returns a complex list of lists)
    # Structure: [[[[coords], (text, confidence)], ...]]
    if result and result[0]:
        for line in result[0]:
            text_segment=line[1][0]
            extracted_text+=text_segment+" "


    final_clean_text=clean_text(extracted_text)

    return final_clean_text

    

    

