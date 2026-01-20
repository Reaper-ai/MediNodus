from fastapi import APIRouter, HTTPException , Depends
from app.models.user import User
from app.schemas.auth_schema import UserRegister, UserLogin, TokenResponse
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

    # ✅ Do NOT return hashed password
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username == email
    # form_data.password == password

    user = await User.find_one(User.email == form_data.username)

    if not user or not AuthService.verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = AuthService.create_access_token({
        "sub": str(user.id)
    })

    return TokenResponse(access_token=token)


@router.post("/logout")
async def logout():
    # JWT logout = client deletes token
    return {"message": "Logged out successfully"}
