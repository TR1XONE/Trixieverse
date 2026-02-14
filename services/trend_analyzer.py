from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Mapping, Protocol, Sequence


class MatchLike(Protocol):
    duration_minutes: float
    gold_earned: float
    kills: int
    deaths: int
    assists: int
    team_kills: int

    death_timestamps_minutes: Sequence[float] | None


@dataclass(frozen=True)
class TrendAnalysisResult:
    average_gpm: float
    average_kp: float
    death_spike: dict[str, Any]
    sample_size: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "sample_size": self.sample_size,
            "averages": {
                "gpm": self.average_gpm,
                "kill_participation": self.average_kp,
            },
            "signals": {
                "death_spike": self.death_spike,
            },
        }


def _get_attr(obj: Any, name: str, default: Any = None) -> Any:
    if hasattr(obj, name):
        return getattr(obj, name)
    if isinstance(obj, Mapping):
        return obj.get(name, default)
    return default


def _safe_div(n: float, d: float) -> float:
    return n / d if d else 0.0


def _extract_death_timestamps_minutes(match: Any) -> list[float]:
    raw = _get_attr(match, "death_timestamps_minutes", None)
    if raw is None:
        raw = _get_attr(match, "deaths_timestamps_minutes", None)

    if raw is not None:
        return [float(x) for x in raw if x is not None]

    timeline = _get_attr(match, "deaths_timeline", None)
    if isinstance(timeline, Mapping):
        out: list[float] = []
        for k, v in timeline.items():
            if not v:
                continue
            try:
                minute = float(k)
            except (TypeError, ValueError):
                continue
            out.extend([minute] * int(v))
        return out

    return []


def _extract_gold_timeline(match: Any) -> dict[int, int] | None:
    raw = _get_attr(match, "gold_timeline", None)
    if raw is None:
        return None
    if isinstance(raw, Mapping):
        out: dict[int, int] = {}
        for k, v in raw.items():
            try:
                minute = int(k)
                gold = int(v)
            except (TypeError, ValueError):
                continue
            out[minute] = gold
        return out
    return None


def _gpm_from_gold_timeline(gold_timeline: Mapping[int, int]) -> float | None:
    if not gold_timeline:
        return None
    minutes = sorted(gold_timeline.keys())
    if not minutes:
        return None
    last_minute = minutes[-1]
    if last_minute <= 0:
        return None
    last_gold = gold_timeline[last_minute]
    return float(last_gold) / float(last_minute)


def analyze_trends(matches: Iterable[Any]) -> dict[str, Any]:
    match_list = list(matches)
    if not match_list:
        return {
            "sample_size": 0,
            "averages": {"gpm": 0.0, "kill_participation": 0.0},
            "signals": {
                "death_spike": {
                    "present": False,
                    "mid_game_death_share": 0.0,
                    "mid_game_window_minutes": [8, 15],
                    "reason": "no_matches",
                }
            },
        }

    gpm_values: list[float] = []
    kp_values: list[float] = []

    total_kills = 0
    total_assists = 0
    total_team_kills = 0

    total_deaths = 0
    mid_game_deaths = 0
    has_death_timestamps = False

    for m in match_list:
        duration_minutes = float(_get_attr(m, "duration_minutes", 0.0) or 0.0)
        gold_earned = float(_get_attr(m, "gold_earned", 0.0) or 0.0)

        kills = int(_get_attr(m, "kills", 0) or 0)
        total_kills += kills
        assists = int(_get_attr(m, "assists", 0) or 0)
        total_assists += assists
        team_kills = int(_get_attr(m, "team_kills", 0) or 0)
        total_team_kills += team_kills

        gold_timeline = _extract_gold_timeline(m)
        gpm_from_timeline = _gpm_from_gold_timeline(gold_timeline) if gold_timeline else None
        if gpm_from_timeline is not None:
            gpm_values.append(gpm_from_timeline)
        elif duration_minutes > 0:
            gpm_values.append(gold_earned / duration_minutes)

        kp_values.append(_safe_div(kills + assists, team_kills))

        death_ts = _extract_death_timestamps_minutes(m)
        if death_ts:
            has_death_timestamps = True
            total_deaths += len(death_ts)
            mid_game_deaths += sum(1 for t in death_ts if 8 <= t <= 15)
        else:
            deaths = int(_get_attr(m, "deaths", 0) or 0)
            total_deaths += deaths

    avg_gpm = sum(gpm_values) / len(gpm_values) if gpm_values else 0.0
    avg_kp = sum(kp_values) / len(kp_values) if kp_values else 0.0

    mid_share = _safe_div(float(mid_game_deaths), float(total_deaths))

    death_spike_present = total_deaths > 0 and mid_share > 0.5

    death_spike_reason = (
        "computed_from_death_timestamps"
        if has_death_timestamps
        else "insufficient_death_timestamps"
    )

    result = TrendAnalysisResult(
        average_gpm=avg_gpm,
        average_kp=avg_kp,
        death_spike={
            "present": death_spike_present,
            "mid_game_window_minutes": [8, 15],
            "mid_game_deaths": mid_game_deaths,
            "total_deaths": total_deaths,
            "mid_game_death_share": mid_share,
            "threshold": 0.5,
            "reason": death_spike_reason,
        },
        sample_size=len(match_list),
    )

    out = result.to_dict()
    out["totals"] = {
        "kills": total_kills,
        "assists": total_assists,
        "team_kills": total_team_kills,
        "deaths": total_deaths,
    }
    return out
