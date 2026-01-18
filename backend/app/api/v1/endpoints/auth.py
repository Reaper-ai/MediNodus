from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.schemas.auth_schema import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(data: UserRegister):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(400, "Email already registered")

    hashed = AuthService.hash_password(data.password)
    user = User(email=data.email, hashed_password=hashed, full_name=data.full_name)
    return await user.insert()

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await User.find_one(User.email == data.email)
    if not user or not AuthService.verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    token = AuthService.create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)

@router.post("/logout")
async def logout():
    # optional token blacklist
    return {"message": "Logged out"}
