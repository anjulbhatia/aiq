"""xkdr India Air Quality API: realtime + historical CPCB/embassy readings.

Docs: https://airquality.xkdr.org — GET /v1/measurements with bearer key.
Demo key (10k rows/query, 2024 files only): aqi_demo_wbf92Qx21zX-Wa_Tg8Dx1nXe.
Real key: signup at airquality.xkdr.org/signup, set XKDR_API_KEY.
Attribution: India Air Quality Database, XKDR Forum + CPCB CAAQM + US DoS/AirNow.
Times are IST; aggregations use IST days.
"""

import json
import urllib.parse
import urllib.request

from ..config import settings

PARAMETERS = ["PM2.5", "PM10"]


def _get(path: str, params: dict, timeout: int = 60) -> list[dict]:
    if not settings.xkdr_api_key:
        raise RuntimeError("XKDR_API_KEY missing — caller falls back to seed")
    url = f"{settings.xkdr_base}{path}?{urllib.parse.urlencode(params, doseq=True)}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {settings.xkdr_api_key}"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.load(res)


def daily_city_pm(city: str, start: str, end: str) -> list[dict]:
    """Daily mean PM2.5/PM10 rows for a city over [start, end] (YYYY-MM-DD)."""
    return _get(
        "/v1/measurements",
        {"city": city, "parameter": PARAMETERS, "start": start, "end": end,
         "agg": "daily", "format": "json"},
    )


def stations(city: str) -> list[dict]:
    """Station list (coords, pollutants) — used to pin nearest station per school."""
    return _get("/v1/stations", {"city": city})


# --- CPCB AQI sub-index (simplified) -------------------------------------
# Piecewise-linear breakpoints for 24h PM averages. Overall AQI = max of
# sub-indices. Full CPCB method wants 3+ pollutants incl. one PM; we run on
# PM2.5/PM10 only and say so in reasons. Good enough for demo + v0 model.
_PM25_BP = [(0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
            (91, 120, 201, 300), (121, 250, 301, 400), (251, 500, 401, 500)]
_PM10_BP = [(0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
            (251, 350, 201, 300), (351, 430, 301, 400), (431, 600, 401, 500)]


def _sub_index(conc: float, bp: list[tuple]) -> int:
    for low_c, high_c, low_i, high_i in bp:
        if conc <= high_c:
            return round(low_i + (high_i - low_i) / (high_c - low_c) * (conc - low_c))
    lo_c, hi_c, lo_i, hi_i = bp[-1]
    return round(hi_i + (conc - hi_c) / (hi_c - lo_c) * (hi_i - lo_i))


def aqi_from_pm(pm25: float, pm10: float) -> int:
    return max(_sub_index(pm25, _PM25_BP), _sub_index(pm10, _PM10_BP))
