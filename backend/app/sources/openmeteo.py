"""Open-Meteo forecast API: weather, rain/precip, wind. No key (non-commercial).

Docs: https://open-meteo.com/en/docs — GET /v1/forecast.
We take current conditions + 2-day daily slice per school lat/lng,
timezone Asia/Kolkata, and normalize to the RegionDay shape.
"""

import json
import urllib.parse
import urllib.request

from ..config import settings

CURRENT = "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m"
DAILY = "precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant"


def _get(params: dict, timeout: int = 30) -> dict:
    url = f"{settings.openmeteo_base}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=timeout) as res:
        return json.load(res)


def fetch(lat: float, lng: float, forecast_days: int = 2) -> dict:
    return _get({
        "latitude": lat, "longitude": lng,
        "current": CURRENT, "daily": DAILY,
        "timezone": settings.timezone, "forecast_days": forecast_days,
    })


def normalize(payload: dict, day_index: int = 0) -> dict:
    """Pick day_index (0=today, 1=tomorrow) out of a forecast payload."""
    cur = payload.get("current", {})
    daily = payload.get("daily", {})
    return {
        "tempC": round(float(cur.get("temperature_2m", 0)), 1),
        "windKph": round(float((daily.get("wind_speed_10m_max") or [cur.get("wind_speed_10m", 0)])[day_index]), 1),
        "windDir": _compass(float((daily.get("wind_direction_10m_dominant") or [cur.get("wind_direction_10m", 0)])[day_index])),
        "precipProb": float((daily.get("precipitation_probability_max") or [0])[day_index] or 0),
        "humidity": float(cur.get("relative_humidity_2m", 50) if day_index == 0 else 50),
    }


def _compass(deg: float) -> str:
    return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][int((deg % 360) / 45)]
