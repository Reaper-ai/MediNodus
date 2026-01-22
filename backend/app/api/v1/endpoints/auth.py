from fastapi import APIRouter, HTTPException , Depends
from app.models.user import User
from app.schemas import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import AuthService

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(data: UserRegister):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = AuthService.hash_password(data.password)

    user = User(
        email=data.email,
        hashed_password=hashed,
        full_name=data.full_name
    )

    await user.insert()

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):  # <--- CHANGED: Use Pydantic Model (JSON)
    # Now we access data.email instead of form_data.username
    user = await User.find_one(User.email == data.email)

    if not user or not AuthService.verify_password(
        data.password,  # <--- CHANGED: Use data.password
        user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = AuthService.create_access_token({
        "sub": str(user.id)
    })

    return TokenResponse(access_token=token)

@router.post("/swagger/login")
async def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await User.find_one(User.email == form_data.username)

    if not user or not AuthService.verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = AuthService.create_access_token({"sub": str(user.id)})

    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
async def logout():
    # JWT logout = client deletes token
    return {"message": "Logged out successfully"}

@router.post("/current") #endpoint to get currently logged in user information
async def current(
    current_user: User = Depends(AuthService.get_current_user)
):
     return {
        "email": current_user.email,
        "full_name": current_user.full_name,
    }

