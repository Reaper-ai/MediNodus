from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediNodus API"
    MONGO_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CLOUDINARY_KEY: str
    HF_TOKEN: str | None = None 

    class Config:
        env_file = ".env"

settings = Settings()