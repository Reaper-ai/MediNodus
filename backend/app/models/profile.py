from __future__ import annotations

from datetime import date
from typing import Any, Optional

from pydantic import BaseModel


class EmergencyContact(BaseModel):
    name: str
    mobile: str
    relation: str


class ProfileCreateRequest(BaseModel):
    name: str
    dob: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    relation: str
    emergency_contact: Optional[EmergencyContact] = None


class ProfileLinkRequest(BaseModel):
    profile_id: str
    relation: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    dob: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact: Optional[dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProfileListItem(BaseModel):
    profile_id: str
    name: str
    dob: date
    relation: str
    linked_accounts_count: int


class LinkedAccount(BaseModel):
    account_id: str
    username: Optional[str] = None
    relation: Optional[str] = None
