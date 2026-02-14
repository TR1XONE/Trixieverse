from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from memory_store import UserProfile, load_profile, save_profile
from trend_analyzer import analyze_trends


@dataclass(frozen=True)
class CoachConfig:
    name: str
    accent: str
    personality: str
    response_length: str
    celebration_level: str


def _extract_themes_from_trend(trend: dict[str, Any]) -> list[str]:
    out: list[str] = []

    avgs = trend.get("averages", {}) or {}
    gpm = float(avgs.get("gpm", 0.0) or 0.0)
    kp = float(avgs.get("kill_participation", 0.0) or 0.0)

    if gpm and gpm < 600:
        out.append("low_gpm")
    if kp and kp < 0.45:
        out.append("low_kp")

    signals = trend.get("signals", {}) or {}
    death_spike = signals.get("death_spike", {}) or {}
    if death_spike.get("present"):
        out.append("mid_game_death_spike")

    return out


def _increment_themes(existing: dict[str, int], new_themes: list[str]) -> dict[str, int]:
    out = dict(existing)
    for t in new_themes:
        out[t] = int(out.get(t, 0)) + 1
    return out


def _recent_advice_snippet(profile: UserProfile) -> str:
    history = profile.advice_history or []
    if not history:
        return ""

    last = history[-1]
    msg = str(last.get("message", "")).strip()
    if not msg:
        return ""
    return msg[:180]


def _top_recurring_themes(profile: UserProfile, limit: int = 3) -> list[str]:
    themes = profile.recurring_themes or {}
    if not themes:
        return []
    ordered = sorted(themes.items(), key=lambda kv: (-int(kv[1]), kv[0]))
    return [k for k, _ in ordered[:limit]]


def coach_from_ocr(
    *,
    ocr_text: str,
    coach: CoachConfig | None,
    matches: list[dict[str, Any]] | None,
    discord_user_id: str | None = None,
) -> dict[str, Any]:
    coach_name = coach.name if coach else "Sage"
    coach_personality = coach.personality if coach else "supportive"

    profile: UserProfile | None = None
    if discord_user_id:
        profile = load_profile(discord_user_id)
        coach_personality = profile.preferred_tone or coach_personality

    trend = analyze_trends(matches or [])

    context_bits: list[str] = []
    if profile is not None:
        recent = _recent_advice_snippet(profile)
        if recent:
            context_bits.append(f"Last time I told you: {recent}")
        recurring = _top_recurring_themes(profile)
        if recurring:
            context_bits.append("Recurring themes: " + ", ".join(recurring))

    signals = trend.get("signals", {})
    death_spike = signals.get("death_spike", {})

    intro_by_persona = {
        "Sage": "Let me break this down clearly.",
        "Blaze": "LET'S GO — quick read:",
        "Echo": "I see patterns in the noise...",
        "Nova": "Okay okay, here's the vibe:",
    }

    spike_note = ""
    if death_spike.get("present"):
        share = death_spike.get("mid_game_death_share", 0.0)
        spike_note = f" Mid-game deaths look spiky ({share:.0%} between 8–15m). Play safer around objectives and avoid solo facechecks."

    ocr_hint = ""
    if ocr_text:
        ocr_hint = f" I read: '{ocr_text[:200]}'"

    memory_hint = ""
    if context_bits:
        memory_hint = " Context: " + " | ".join(context_bits)

    tone_hint = ""
    if coach_personality and coach_personality != "supportive":
        tone_hint = f" Tone={coach_personality}."

    msg = f"{intro_by_persona.get(coach_name, intro_by_persona['Sage'])}{tone_hint}{spike_note}{memory_hint}{ocr_hint}"

    if profile is not None:
        themes_now = _extract_themes_from_trend(trend)
        profile.recurring_themes = _increment_themes(profile.recurring_themes or {}, themes_now)
        profile.advice_history = (profile.advice_history or []) + [
            {
                "message": msg,
                "themes": themes_now,
                "trend": trend,
            }
        ]
        if len(profile.advice_history) > 20:
            profile.advice_history = profile.advice_history[-20:]
        profile.preferred_tone = coach_personality or profile.preferred_tone
        save_profile(profile)

    return {
        "coach": coach_name,
        "tone": coach_personality,
        "message": msg,
        "trend": trend,
        "memory": {
            "discord_user_id": discord_user_id,
            "recurring_themes": _top_recurring_themes(profile) if profile is not None else [],
        },
    }
