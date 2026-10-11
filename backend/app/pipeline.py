"""Daily pipeline: schools x sources -> regions_daily shape.

Fallback chain per region/day (never 500 on gaps):
live xkdr+openmeteo -> cached yesterday -> committed seed.
AQI comes from xkdr PM via CPCB sub-index; weather from Open-Meteo.
"""

from datetime import date, datetime, timedelta, timezone

from . import protocol
from .config import settings
from .data import load_regions, load_schools, load_seed_regions
from .sources import lulc, openmeteo, xkdr


def _live_day(school: dict, day: str) -> dict | None:
    try:
        rows = xkdr.daily_city_pm(school["city"], start=day, end=day)
        pm25 = _mean(rows, "PM2.5")
        pm10 = _mean(rows, "PM10")
        if pm25 is None or pm10 is None:
            return None
        wx = openmeteo.normalize(openmeteo.fetch(school["lat"], school["lng"]), day_index=0)
        return {
            "aqi": xkdr.aqi_from_pm(pm25, pm10),
            "pm25": round(pm25, 1), "pm10": round(pm10, 1),
            "tempC": wx["tempC"], "windKph": wx["windKph"], "windDir": wx["windDir"],
            "precipProb": wx["precipProb"], "humidity": wx["humidity"],
        }
    except Exception:
        return None


def _mean(rows: list[dict], param: str) -> float | None:
    vals = [float(r.get("mean", r.get("value", 0))) for r in rows
            if r.get("parameter_name", r.get("parameter")) == param]
    return sum(vals) / len(vals) if vals else None


def build_day(day: str, live: bool = True) -> dict[str, dict]:
    schools = load_schools()
    seed = load_seed_regions()
    prev = (date.fromisoformat(day) - timedelta(days=1)).isoformat()
    cached = load_regions()
    out: dict[str, dict] = {}
    for sid, school in schools.items():
        entry = _live_day(school, day) if live else None
        if entry is None:
            entry = (cached.get(prev, {}).get(sid)
                     or seed.get(day, {}).get(sid)
                     or seed.get(prev, {}).get(sid))
        if entry is None:
            raise RuntimeError(f"No data for {sid} on {day}: live, cache and seed all empty")
        out[sid] = entry
    return out


def build_briefing(school_id: str, day: str | None = None) -> dict:
    """Join school + region day + urban form + protocol -> Briefing dict."""
    schools = load_schools()
    school = schools[school_id]
    day = day or datetime.now(timezone.utc).astimezone().date().isoformat()
    regions = load_regions()
    today = regions.get(day) or regions[max(regions)]
    entry = today[school_id]
    urban = lulc.for_school(school)
    level = protocol.predict_level({**entry, **urban})
    tomorrow_key = min((d for d in regions if d > day), default=None)
    tmr = (regions.get(tomorrow_key, {}).get(school_id) if tomorrow_key
           else seed_tomorrow(entry))
    return {
        **entry, **urban,
        "schoolId": school_id,
        "level": level,
        "actions": protocol.default_actions(level),
        "reasons": protocol.build_reasons(entry, urban),
        "forecastTomorrow": {
            "aqi": tmr["aqi"],
            "level": protocol.get_level(int(tmr["aqi"])),
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }


def seed_tomorrow(entry: dict) -> dict:
    seed = load_seed_regions()
    days = sorted(seed)
    if len(days) >= 2:
        first_region = next(iter(seed[days[1]].values()))
        return first_region
    return entry
