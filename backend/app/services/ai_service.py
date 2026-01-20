from transformers import AutoProcessor, AutoModelForImageTextToText,BitsAndBytesConfig
from PIL import Image
import torch
print("CUDA:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))
    print("VRAM GB:", torch.cuda.get_device_properties(0).total_memory / 1e9)
MODEL_ID = "unsloth/medgemma-1.5-4b-it-unsloth-bnb-4bit"

# 🔥 4-bit quantization config (GPU friendly)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
    llm_int8_enable_fp32_cpu_offload=True  # prevents OOM
)

# ✅ Load model on GPU
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID,
    quantization_config=bnb_config,
    device_map="auto"  # GPU first, CPU offload if needed
)

processor = AutoProcessor.from_pretrained(MODEL_ID, use_fast=True)


async def analyze_medicine_image(image: Image , type: str) -> str:
    
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {
                    "type": "text",
                    "text": """
Look at the medicine / tablet / capsule image.

Extract the following fields and return ONLY valid JSON:

{
  "drug_name": string,
  "strength": string,
  "indications": string,
  "usage_instructions": string,
  "warnings": string,
  "prescription_drug": "Yes" | "No" | "Unknown"
}
If unknown, write "Unknown".
"""
                }
            ]
        }
    ]

    inputs = processor.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    ).to(model.device, dtype=torch.bfloat16)

    input_len = inputs["input_ids"].shape[-1]

    with torch.inference_mode():
        generation = model.generate(
            **inputs,
            max_new_tokens=1000,
            do_sample=False
        )

    decoded = processor.decode(
        generation[0][input_len:],
        skip_special_tokens=True
    )

    return decoded
