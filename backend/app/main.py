from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware 
from app.core.config import settings
from app.models.user import User
from app.models.medical_report import MedicalReport
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




"""
login yahse se laga,

-> update medicalhistory -> text entry of user history -> allergy, current medication, chronic condition 


-> get medicalhisytou -> return above info


-> post analyseMEDImage ->  image -> store in image db,
                            stor its refence in mongodb
                            { image : ref, date: date, type: med| report, respone : ai respone}
                            < ai stuff return name of info  use plraceholder>
                            use openfda to get info of med 
                            pass the info to lmm service,
                            get medical history
                            save respone to  mongo db DB

-> psote analyseReportimage -> image -> store image i image -> store in image db,
                            stor its refence in mongodb
                            { image : ref, date: date, type: med| report, respone : ai respone}
                            pass the info to lmm service,
                            save respone to  mongo db DB

-> post alanlyseRpopertPDF -> image -> store image i image -> store in image db,
                            stor its refence in mongodb
                            { image : pdf icon, date: date, type: med| report, respone : ai respone}
                            pass the info to lmm service,
                            save respone to  mongo db D
-> get hystoty -> jo upar record save kiye un sabo return kar de list mein

"""