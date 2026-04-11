from __future__ import annotations

from dataclasses import dataclass
import os
from typing import List

from dotenv import load_dotenv


load_dotenv()


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_key: str
    supabase_jwt_issuer: str
    supabase_jwks_url: str
    cors_origins: list[str]


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        supabase_url = _require("SUPABASE_URL")
        issuer = os.getenv("SUPABASE_JWT_ISSUER")
        if not issuer:
            issuer = supabase_url.rstrip("/") + "/auth/v1"

        jwks_url = os.getenv("SUPABASE_JWKS_URL")
        if not jwks_url:
            jwks_url = supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json"

        _settings = Settings(
            supabase_url=supabase_url,
            supabase_publishable_key=_require("SUPABASE_PUBLISHABLE_KEY"),
            supabase_secret_key=_require("SUPABASE_SECRET_KEY"),
            supabase_jwt_issuer=issuer,
            supabase_jwks_url=jwks_url,
            cors_origins=_split_csv(os.getenv("CORS_ORIGINS")),
        )

    return _settings
