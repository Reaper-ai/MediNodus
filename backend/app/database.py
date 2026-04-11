from __future__ import annotations

from supabase import Client, create_client

from .config import get_settings


_public_client: Client | None = None
_service_client: Client | None = None


def get_supabase_public() -> Client:
    global _public_client
    if _public_client is None:
        settings = get_settings()
        _public_client = create_client(settings.supabase_url, settings.supabase_publishable_key)
    return _public_client


def get_supabase_service() -> Client:
    global _service_client
    if _service_client is None:
        settings = get_settings()
        _service_client = create_client(settings.supabase_url, settings.supabase_secret_key)
    return _service_client
