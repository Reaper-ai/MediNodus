from __future__ import annotations

from dataclasses import dataclass
import os
from typing import Any, TypedDict, cast

from supabase import Client, create_client
from supabase_auth.errors import AuthApiError

from .config import get_settings


class ProviderError(Exception):
    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass
class AuthSession:
    account_id: str
    token: str
    expires_at: int


class SignInCredentials(TypedDict, total=False):
    email: str
    phone: str
    password: str


class SupabaseProvider:
    def __init__(self) -> None:
        settings = get_settings()
        self._public: Client = create_client(
            settings.supabase_url, settings.supabase_publishable_key
        )
        self._service: Client = create_client(
            settings.supabase_url, settings.supabase_secret_key
        )

    def register_account(self, username: str, email: str, mobile: str, password: str) -> str:
        # --- STEP 1: PRE-FLIGHT CHECKS (Do this BEFORE calling Auth) ---
        # We combine these into one query to save speed and prevent rate limits
        existing = self._service.table("account").select("username, email, mobile").or_(
            f"username.eq.{username},email.eq.{email},mobile.eq.{mobile}"
        ).execute().data

        if existing:
            conflict = existing[0]
            if conflict.get("username") == username:
                raise ProviderError("Username is already taken", 400)
            if conflict.get("email") == email:
                raise ProviderError("Email is already registered", 400)
            if conflict.get("mobile") == mobile:
                raise ProviderError("Mobile number is already registered", 400)

        # --- STEP 2: SUPABASE AUTH (Only happens if Step 1 passes) ---
        try:
            # Note: Using service.auth.admin.create_user is safer for dual email/phone 
            # and avoids email rate limits if you set email_confirm=True
            result = self._service.auth.admin.create_user({
                "email": email,
                "phone": mobile if mobile.startswith('+') else f"+91{mobile}",
                "password": password,
                "email_confirm": True,
                "phone_confirm": True
            })
        except Exception as exc:
            raise ProviderError(str(exc) or "Auth service unavailable", 500) from exc

        if not result.user:
            raise ProviderError("Registration failed at Auth stage", 400)

        account_id = result.user.id

        # --- STEP 3: DATABASE INSERT (With Rollback) ---
        try:
            self._service.table("account").insert(
                {
                    "id": account_id,
                    "username": username,
                    "email": email,
                    "mobile": mobile,
                }
            ).execute()
        except Exception as db_exc:
            # If the database fails now, it's a true unexpected error (like a timeout)
            # because we already checked for unique constraints in Step 1.
            try:
                self._service.auth.admin.delete_user(account_id)
            except Exception as rollback_exc:
                print(f"CRITICAL: Failed to rollback user {account_id}: {rollback_exc}")
            
            raise ProviderError("Database error during profile creation. Account rolled back.", 500) from db_exc

        return account_id

    def create_session(self, identifier: str, password: str) -> AuthSession:
        credentials: SignInCredentials = {"password": password}
        if "@" in identifier:
            credentials["email"] = identifier
        else:
            credentials["phone"] = identifier

        try:
            result = self._public.auth.sign_in_with_password(credentials)
        except AuthApiError as exc:
            raise ProviderError(exc.message or "Invalid credentials", 401) from exc

        if not result.user or not result.session:
            raise ProviderError("Invalid credentials", 401)

        return AuthSession(
            account_id=result.user.id,
            token=result.session.access_token,
            expires_at=result.session.expires_at or 0,
        )

    def update_push_token(self, account_id: str, expo_push_token: str) -> None:
        self._service.table("account").update({"expo_push_token": expo_push_token}).eq(
            "id", account_id
        ).execute()

    def update_notif_prefs(self, account_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        current = (
            self._service.table("account")
            .select("notif_prefs")
            .eq("id", account_id)
            .single()
            .execute()
            .data
            or {}
        )
        current_dict = cast(dict[str, Any], current)
        current_prefs = cast(dict[str, Any], current_dict.get("notif_prefs") or {})
        current_prefs.update(updates)

        self._service.table("account").update({"notif_prefs": current_prefs}).eq(
            "id", account_id
        ).execute()

        return current_prefs

    def ensure_profile_access(self, account_id: str, profile_id: str) -> None:
        link = (
            self._service.table("account_profile")
            .select("account_id")
            .eq("account_id", account_id)
            .eq("profile_id", profile_id)
            .limit(1)
            .execute()
            .data
        )
        if not link:
            raise ProviderError("Not linked to profile", 403)

    def create_profile(self, account_id: str, profile_data: dict[str, Any], relation: str) -> dict:
        profile_insert = self._service.table("profile").insert(profile_data).execute()
        if not profile_insert.data:
            raise ProviderError("Create failed", 400)

        profile = cast(dict[str, Any], profile_insert.data[0])
        self._service.table("account_profile").insert(
            {
                "account_id": account_id,
                "profile_id": profile["id"],
                "relation": relation,
            }
        ).execute()

        return profile

    def link_profile(self, account_id: str, profile_id: str, relation: str) -> dict:
        profile_result = (
            self._service.table("profile")
            .select("*")
            .eq("id", profile_id)
            .limit(1)
            .execute()
            .data
        )
        if not profile_result:
            raise ProviderError("Profile not found", 404)

        self._service.table("account_profile").upsert(
            {
                "account_id": account_id,
                "profile_id": profile_id,
                "relation": relation,
            },
            on_conflict="account_id,profile_id",
        ).execute()

        return cast(dict[str, Any], profile_result[0])

    def list_profiles(self, account_id: str) -> list[dict]:
        links = (
            self._service.table("account_profile")
            .select("profile_id, relation")
            .eq("account_id", account_id)
            .execute()
            .data
            or []
        )

        links_list = cast(list[dict[str, Any]], links)
        profile_ids = [link["profile_id"] for link in links_list]
        if not profile_ids:
            return []

        profiles = (
            self._service.table("profile")
            .select("id, name, dob")
            .in_("id", profile_ids)
            .execute()
            .data
            or []
        )

        linked_rows = (
            self._service.table("account_profile")
            .select("profile_id")
            .in_("profile_id", profile_ids)
            .execute()
            .data
            or []
        )

        counts: dict[str, int] = {}
        for row in cast(list[dict[str, Any]], linked_rows):
            pid = row["profile_id"]
            counts[pid] = counts.get(pid, 0) + 1

        relation_by_profile = {
            link["profile_id"]: link["relation"] for link in links_list
        }
        profiles_by_id = {
            profile["id"]: profile for profile in cast(list[dict[str, Any]], profiles)
        }

        result: list[dict] = []
        for profile_id in profile_ids:
            profile = profiles_by_id.get(profile_id)
            if not profile:
                continue
            result.append(
                {
                    "profile_id": profile_id,
                    "name": profile["name"],
                    "dob": profile["dob"],
                    "relation": relation_by_profile.get(profile_id, ""),
                    "linked_accounts_count": counts.get(profile_id, 0),
                }
            )

        return result

    def get_profile(self, profile_id: str) -> tuple[dict, list[dict]]:
        profile = (
            self._service.table("profile")
            .select("*")
            .eq("id", profile_id)
            .single()
            .execute()
            .data
        )
        if not profile:
            raise ProviderError("Profile not found", 404)

        linked_accounts = (
            self._service.table("account_profile")
            .select("account_id, relation, account:account_id(username)")
            .eq("profile_id", profile_id)
            .execute()
            .data
            or []
        )

        formatted_accounts: list[dict] = []
        for row in cast(list[dict[str, Any]], linked_accounts):
            account = row.get("account") or {}
            formatted_accounts.append(
                {
                    "account_id": row.get("account_id"),
                    "relation": row.get("relation"),
                    "username": account.get("username"),
                }
            )

        return cast(dict[str, Any], profile), formatted_accounts

    def update_profile(self, profile_id: str, updates: dict[str, Any]) -> dict:
        if updates:
            self._service.table("profile").update(updates).eq("id", profile_id).execute()

        profile = (
            self._service.table("profile")
            .select("*")
            .eq("id", profile_id)
            .single()
            .execute()
            .data
        )
        if not profile:
            raise ProviderError("Profile not found", 404)

        return cast(dict[str, Any], profile)


_provider: SupabaseProvider | None = None


def get_data_provider() -> SupabaseProvider:
    settings = get_settings()
    provider_name = os.getenv("DATA_PROVIDER", "supabase")
    if provider_name != "supabase":
        raise RuntimeError(f"Unsupported DATA_PROVIDER: {provider_name}")

    global _provider
    if _provider is None:
        _provider = SupabaseProvider()
    return _provider
