from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..data_provider import ProviderError, get_data_provider
from ..models.account import (
    LoginRequest,
    LoginResponse,
    NotifPrefsResponse,
    NotifPrefsUpdate,
    PushTokenRequest,
    RegisterRequest,
    RegisterResponse,
)
from ..utils.security import get_current_account_id


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=RegisterResponse)
def register(payload: RegisterRequest) -> RegisterResponse:
    provider = get_data_provider()

    try:
        account_id = provider.register_account(
            payload.username, payload.email, payload.mobile, payload.password
        )
    except ProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return RegisterResponse(account_id=account_id, token="")


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    provider = get_data_provider()

    try:
        session = provider.create_session(payload.identifier, payload.password)
    except ProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return LoginResponse(
        account_id=session.account_id,
        token=session.token,
        expires_at=session.expires_at,
    )


@router.patch("/push-token")
def update_push_token(
    payload: PushTokenRequest,
    account_id: str = Depends(get_current_account_id),
) -> dict:
    provider = get_data_provider()
    provider.update_push_token(account_id, payload.expo_push_token)

    return {"ok": True}


@router.patch("/notif-prefs", response_model=NotifPrefsResponse)
def update_notif_prefs(
    payload: NotifPrefsUpdate,
    account_id: str = Depends(get_current_account_id),
) -> NotifPrefsResponse:
    provider = get_data_provider()
    updates = payload.dict(exclude_none=True)
    current_prefs = provider.update_notif_prefs(account_id, updates)

    return NotifPrefsResponse(notif_prefs=current_prefs)
