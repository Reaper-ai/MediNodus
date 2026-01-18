import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediNodus API"
    MONGO_URL: str 
    SECRET_KEY: str
    MONGO_NAME :str= "main"
    # ALGORITHM: str = "HS256"
    # GOOGLE_API_KEY: str = "your_google_api_key_here"

    # Pydantic V2 way to load .env file
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_ignore_empty=True,
        extra="ignore"
    )

settings = Settings()