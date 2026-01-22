from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware 
from backend.app.config import settings
from app.models.user import User
from backend.app.models.medical_record import MedicalReport
# Import User model here later

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGO_URL)
    database = client.medinodus_db
    
    # Initialize Beanie with your models
    await init_beanie(database=database, document_models=[User,MedicalReport])
    
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

