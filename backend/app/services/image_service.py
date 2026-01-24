# # services/image_service.py
# import uuid
# from pathlib import Path

# BASE_DIR = Path("storage/images")
# BASE_DIR.mkdir(parents=True, exist_ok=True)

# async def save_image(image_bytes: bytes, filename: str) -> str:
#     ext = filename.split(".")[-1]
#     name = f"{uuid.uuid4()}.{ext}"
#     path = BASE_DIR / name

#     with open(path, "wb") as f:
#         f.write(image_bytes)

#     return str(path)

import cloudinary
from app.config import settings
import cloudinary.uploader
from io import BytesIO

cloudinary.config( 
        cloud_name = "diazqav7b", 
        api_key = "677363252955965", #dont, worry, this is not neccessarily hidden
        api_secret = settings.CLOUDINARY_KEY, 
        secure=True
    )
async def save_image(image_bytes: bytes, filename: str , image_user_id:str) -> str:
    image_stream = BytesIO(image_bytes)


    # Upload an image
    upload_result = cloudinary.uploader.upload(image_stream,
                                               resource_type="image",
                                            context={
        "user": str(image_user_id),
    }) #uploads image with user id as tag
    return str(upload_result["secure_url"])#url is stored in database