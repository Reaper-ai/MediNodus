
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.models.user import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGO = "HS256"

# This tells FastAPI to read: Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/swagger/login")#THIS IS TEMPORARY , PLS CHANGE BACK TOKEN URL TO /auth/login after testing


class AuthService:

    # =====================
    # PASSWORD
    # =====================
    @staticmethod
    def hash_password(password: str):
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain, hashed):
        return pwd_context.verify(plain, hashed)

    # =====================
    # JWT
    # =====================
    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        to_encode["exp"] = datetime.utcnow() + timedelta(hours=12)
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGO)

   
    @staticmethod
    async def get_current_user(
        token: str = Depends(oauth2_scheme)
    ) -> User:
        """
        Dependency used in protected endpoints.
        Extracts user from JWT token.
        """

        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        try:
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGO]
            )

            user_id: str | None = payload.get("sub")
            if user_id is None:
                raise credentials_exception

        except JWTError:
            raise credentials_exception

        user = await User.get(user_id)
        if user is None:
            raise credentials_exception

        return user
