from beanie import Document
from datetime import datetime

class User(Document):
    email: str
    hashed_password: str
    full_name: str | None = None
    created_at: datetime = datetime.utcnow()
    diagnosis: str = None

    class Settings:
        name = "user"
