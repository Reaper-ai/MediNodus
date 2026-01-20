# services/image_service.py
import uuid
from pathlib import Path

BASE_DIR = Path("storage/images")
BASE_DIR.mkdir(parents=True, exist_ok=True)

async def save_image(image_bytes: bytes, filename: str) -> str:
    ext = filename.split(".")[-1]
    name = f"{uuid.uuid4()}.{ext}"
    path = BASE_DIR / name

    with open(path, "wb") as f:
        f.write(image_bytes)

    return str(path)
