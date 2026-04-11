from __future__ import annotations

import os
from pathlib import Path
import sys

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import connection as Connection


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


def _connect(db_url: str) -> Connection:
    return psycopg2.connect(db_url)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    load_dotenv(repo_root / "backend" / ".env")
    sql_path = repo_root / "001_initial.sql"
    if not sql_path.exists():
        raise FileNotFoundError(f"Could not find {sql_path}")

    db_url = _require("SUPABASE_DB_URL")
    sql = sql_path.read_text(encoding="utf-8")

    conn = _connect(db_url)
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql)
    finally:
        conn.close()

    print("Migration applied successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
