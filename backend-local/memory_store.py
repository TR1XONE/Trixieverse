from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


_DB_PATH = Path(__file__).resolve().parent / "ares_memory.sqlite3"


@dataclass
class UserProfile:
    discord_user_id: str
    preferred_tone: str = "supportive"
    advice_history: list[dict[str, Any]] | None = None
    recurring_themes: dict[str, int] | None = None

    def to_row(self) -> tuple[str, str, str, str, str]:
        return (
            self.discord_user_id,
            self.preferred_tone,
            json.dumps(self.advice_history or [], ensure_ascii=False),
            json.dumps(self.recurring_themes or {}, ensure_ascii=False),
            datetime.now(tz=timezone.utc).isoformat(),
        )


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_profile (
                discord_user_id TEXT PRIMARY KEY,
                preferred_tone TEXT NOT NULL,
                advice_history_json TEXT NOT NULL,
                recurring_themes_json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def load_profile(discord_user_id: str) -> UserProfile:
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT discord_user_id, preferred_tone, advice_history_json, recurring_themes_json FROM user_profile WHERE discord_user_id = ?",
            (discord_user_id,),
        ).fetchone()

    if row is None:
        return UserProfile(discord_user_id=discord_user_id, advice_history=[], recurring_themes={})

    advice = json.loads(row["advice_history_json"] or "[]")
    themes = json.loads(row["recurring_themes_json"] or "{}")
    return UserProfile(
        discord_user_id=row["discord_user_id"],
        preferred_tone=row["preferred_tone"] or "supportive",
        advice_history=advice,
        recurring_themes=themes,
    )


def save_profile(profile: UserProfile) -> None:
    init_db()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO user_profile (discord_user_id, preferred_tone, advice_history_json, recurring_themes_json, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(discord_user_id) DO UPDATE SET
                preferred_tone=excluded.preferred_tone,
                advice_history_json=excluded.advice_history_json,
                recurring_themes_json=excluded.recurring_themes_json,
                updated_at=excluded.updated_at
            """,
            profile.to_row(),
        )
        conn.commit()
