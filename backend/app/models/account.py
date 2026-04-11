from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    mobile: str
    password: str


class RegisterResponse(BaseModel):
    account_id: str
    token: str


class LoginRequest(BaseModel):
    identifier: str
    password: str


class LoginResponse(BaseModel):
    account_id: str
    token: str
    expires_at: int


class PushTokenRequest(BaseModel):
    expo_push_token: str


class QuietHours(BaseModel):
    enabled: bool
    start: str
    end: str
    tz: str


class NotifPrefsUpdate(BaseModel):
    medication_reminder: Optional[bool] = None
    appointment: Optional[bool] = None
    telemetry_alert: Optional[bool] = None
    panic: Optional[bool] = None
    quiet_hours: Optional[QuietHours] = None


class NotifPrefsResponse(BaseModel):
    notif_prefs: dict[str, Any]
