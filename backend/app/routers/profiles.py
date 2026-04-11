from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..data_provider import ProviderError, get_data_provider
from ..models.profile import (
    LinkedAccount,
    ProfileCreateRequest,
    ProfileLinkRequest,
    ProfileListItem,
    ProfileResponse,
    ProfileUpdateRequest,
)
from ..utils.security import get_current_account_id


router = APIRouter(prefix="/profiles", tags=["profiles"])


def _ensure_profile_access(account_id: str, profile_id: str) -> None:
    provider = get_data_provider()
    try:
        provider.ensure_profile_access(account_id, profile_id)
    except ProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("", response_model=dict)
def create_profile(
    payload: ProfileCreateRequest,
    account_id: str = Depends(get_current_account_id),
) -> dict:
    profile_data = payload.dict(exclude={"relation"}, exclude_none=True)
    profile_data["dob"] = payload.dob.isoformat()
    provider = get_data_provider()
    try:
        profile = provider.create_profile(account_id, profile_data, payload.relation)
    except ProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return {"profile_id": profile["id"], "profile": profile}


@router.post("/link", response_model=dict)
def link_profile(
    payload: ProfileLinkRequest,
    account_id: str = Depends(get_current_account_id),
) -> dict:
    provider = get_data_provider()
    try:
        profile = provider.link_profile(account_id, payload.profile_id, payload.relation)
    except ProviderError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return {"profile": profile}


@router.get("", response_model=list[ProfileListItem])
def list_profiles(account_id: str = Depends(get_current_account_id)) -> list[ProfileListItem]:
    provider = get_data_provider()
    rows = provider.list_profiles(account_id)

    return [ProfileListItem(**row) for row in rows]


@router.get("/{profile_id}", response_model=dict)
def get_profile(
    profile_id: str,
    account_id: str = Depends(get_current_account_id),
) -> dict:
    _ensure_profile_access(account_id, profile_id)

    provider = get_data_provider()
    profile, linked_accounts = provider.get_profile(profile_id)
    formatted_accounts = [LinkedAccount(**row) for row in linked_accounts]

    return {"profile": ProfileResponse(**profile), "linked_accounts": formatted_accounts}


@router.patch("/{profile_id}", response_model=dict)
def update_profile(
    profile_id: str,
    payload: ProfileUpdateRequest,
    account_id: str = Depends(get_current_account_id),
) -> dict:
    _ensure_profile_access(account_id, profile_id)

    updates = payload.dict(exclude_none=True)
    provider = get_data_provider()
    profile = provider.update_profile(profile_id, updates)

    return {"profile": ProfileResponse(**profile)}
