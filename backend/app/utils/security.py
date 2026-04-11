from __future__ import annotations

import time

import httpx
from fastapi import Header, HTTPException, status
from jose import JWTError, jwk, jwt

from ..config import get_settings


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header")

    return parts[1]


_jwks_cache: dict[str, object] = {"keys": [], "expires_at": 0.0}


def _fetch_jwks(jwks_url: str) -> list[dict]:
    response = httpx.get(jwks_url, timeout=10.0)
    response.raise_for_status()
    payload = response.json()
    return payload.get("keys", [])


def _get_jwks(settings) -> list[dict]:
    now = time.time()
    if _jwks_cache["keys"] and now < float(_jwks_cache["expires_at"]):
        return _jwks_cache["keys"]

    keys = _fetch_jwks(settings.supabase_jwks_url)
    _jwks_cache["keys"] = keys
    _jwks_cache["expires_at"] = now + 300
    return keys


def _find_jwk(keys: list[dict], kid: str) -> dict | None:
    for key in keys:
        if key.get("kid") == kid:
            return key
    return None


def decode_jwt_token(token: str) -> dict:
    settings = get_settings()

    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise JWTError("Missing kid in token header")

    keys = _get_jwks(settings)
    jwk_data = _find_jwk(keys, kid)
    if not jwk_data:
        keys = _fetch_jwks(settings.supabase_jwks_url)
        _jwks_cache["keys"] = keys
        _jwks_cache["expires_at"] = time.time() + 300
        jwk_data = _find_jwk(keys, kid)

    if not jwk_data:
        raise JWTError("Signing key not found")

    key = jwk.construct(jwk_data)

    return jwt.decode(
        token,
        key,
        algorithms=[header.get("alg", "RS256")],
        issuer=settings.supabase_jwt_issuer,
        options={"verify_aud": False},
    )


def get_current_account_id(authorization: str = Header(None)) -> str:
    token = _extract_bearer_token(authorization)

    try:
        payload = decode_jwt_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    account_id = payload.get("sub")
    if not account_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return account_id
