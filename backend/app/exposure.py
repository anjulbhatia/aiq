"""Personal pollution-exposure model: dose, feels-like, verdict.

Pipeline: ambient PM2.5 -> inhaled dose (breathing rate x hours x masks x
indoor infiltration) -> risk vs thresholds -> verdict. Smog perception from
visibility (Koschmieder) + humidity + wind. Full derivation: Thesis.md 4-5.

Verdicts: outdoor-okay | smooth | indoor-only, plus day_ahead:
steady | rough-day-ahead (tomorrow >= 1 level worse).
"""

from . import protocol

# Inhalation rates m3/h by age band and activity (EPA Exposure Factors + CSP).
BREATHING = {
    "child": {"rest": 0.35, "light": 0.9, "exercise": 1.5},
    "adult": {"rest": 0.5, "light": 1.1, "exercise": 2.0},
}
MASK_EFF = {"none": 0.0, "cloth": 0.3, "surgical": 0.5, "n95": 0.9}
INFILTRATION = {"open": 0.7, "closed": 0.45, "purified": 0.2}
# Reference daily inhaled load (ug): ~WHO 24h guideline expressed as dose for
# a child at light activity over a school day. Hours cap derives from it.
REF_DAILY_UG = 150.0


def visibility_km(pm25: float, humidity: float) -> float:
    """Koschmieder V=3.912/extinction; extinction from PM2.5 with hygroscopic
    growth (particles swell past ~60% RH, haze thickens faster than PM)."""
    growth = 1 + 2.5 * (humidity / 100.0) ** 2
    beta = 0.0035 * max(pm25, 1.0) * growth
    return round(float(min(30.0, max(0.2, 3.912 / beta))), 2)


def breathing_rate(age_years: int, activity: str) -> float:
    band = "child" if age_years < 14 else "adult"
    return BREATHING[band][activity]


def inhaled_dose_ug(pm25: float, hours: float, rate_m3h: float,
                    mask: str = "none", indoor: bool = False,
                    windows: str = "closed") -> float:
    conc = pm25 * (INFILTRATION[windows] if indoor else 1.0) * (1 - MASK_EFF[mask])
    return round(conc * rate_m3h * hours, 1)


def max_outdoor_hours(pm25: float, age_years: int, activity: str = "light",
                      sensitive: bool = False) -> float:
    rate = breathing_rate(age_years, activity)
    budget = REF_DAILY_UG * (0.5 if sensitive else 1.0)
    return round(float(min(8.0, max(0.0, budget / (max(pm25, 1.0) * rate)))), 1)


def feels_like(pm25: float, temp_c: float, humidity: float, wind_kph: float) -> str:
    vis = visibility_km(pm25, humidity)
    sky = ("Clear" if vis > 10 else "Hazy" if vis > 4 else "Smoggy" if vis > 1.5 else "Whiteout")
    air = "still, smog-trapping air" if wind_kph < 8 else "breezy, some dispersion"
    damp = "humid haze" if humidity >= 60 else "dry haze" if humidity < 40 else "light haze"
    sting = " Eyes may sting; faint smoke taste possible." if pm25 >= 150 else ""
    return (f"{sky} — {vis} km visibility, {damp}, {air} at {temp_c}C.{sting}").strip()


def assess(briefing: dict, age_years: int = 10, sensitive: bool = False,
           hours_outdoor: float = 2.0, activity: str = "light") -> dict:
    """Verdict for one person-day. Sensitive halves every dose threshold."""
    pm25 = float(briefing["pm25"])
    rate = breathing_rate(age_years, activity)
    dose = inhaled_dose_ug(pm25, hours_outdoor, rate)
    budget = REF_DAILY_UG * (0.5 if sensitive else 1.0)
    ratio = dose / budget

    if ratio < 0.5 and briefing["level"] in ("Good", "Moderate"):
        verdict = "outdoor-okay"
    elif ratio < 1.0 and briefing["level"] in ("Good", "Moderate", "Poor"):
        verdict = "smooth"
    else:
        verdict = "indoor-only"

    order = protocol.LEVELS
    rough = (order.index(briefing["forecastTomorrow"]["level"])
             > order.index(briefing["level"]))
    guidance = [
        f"Cap outdoor time near {max_outdoor_hours(pm25, age_years, activity, sensitive)} h today.",
        "N95 outdoors cuts inhaled dose ~10x; cloth barely helps.",
        "Keep windows closed; indoor air runs ~half of outdoor PM.",
    ]
    if sensitive:
        guidance.insert(0, "Sensitive lungs: halve every limit, keep reliever handy.")
    return {
        "verdict": verdict,
        "day_ahead": "rough-day-ahead" if rough else "steady",
        "dose_ug": dose,
        "visibility_km": visibility_km(pm25, float(briefing.get("humidity", 50))),
        "feels_like": feels_like(pm25, float(briefing.get("tempC", 30)),
                                 float(briefing.get("humidity", 50)),
                                 float(briefing.get("windKph", 10))),
        "guidance": guidance,
    }
