from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from .core.config import settings
from .models.report import MedicalReport
from .api.v1.router import api_router
# Import User model here later

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGO_URL)
    database = client.medinodus_db
    
    # Initialize Beanie with your models
    await init_beanie(database=database, document_models=[MedicalReport])
    
    print(" Connected to MongoDB Atlas")
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Include API routes
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "MediNodus Backend is Online 🩺"}