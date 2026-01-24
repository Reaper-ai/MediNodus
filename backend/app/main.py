from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware 
from app.config import settings
from app.models.user import User
# CHANGE 1: Import the correct models used in your endpoints
from app.models.medical_record import MedicalHistoryRecord
from app.models.history_entry import AppHistoryEntry

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGO_URL)
    database = client.medinodus_db
    
    # CHANGE 2: Add MedicalHistoryRecord and AppHistoryEntry to document_models
    await init_beanie(
        database=database, 
        document_models=[User, MedicalHistoryRecord, AppHistoryEntry]
    )
    
    print(" Connected to MongoDB Atlas")
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "MediNodus Backend is Online 🩺"}