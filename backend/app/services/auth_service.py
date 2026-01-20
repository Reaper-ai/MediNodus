from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = settings.SECRET_KEY
ALGO = "HS256"

class AuthService:

    @staticmethod
    def hash_password(password: str):
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain, hashed):
        return pwd_context.verify(plain, hashed)

    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        to_encode["exp"] = datetime.now(datetime.timezone.utc) + timedelta(hours=12)
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGO)
