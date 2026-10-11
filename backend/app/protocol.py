"""Protocol rule engine v0. Port of frontend lib/protocol.ts.

Kept in lockstep with the frontend stub until the v1 ML classifier
(Phase 2) drops behind predict_level(). Contract: AQI -> level."""

LEVELS = ["Good", "Moderate", "Poor", "VeryPoor", "Severe"]

HEADLINES = {
    "Good": "Normal Protocol",
    "Moderate": "Watch Protocol",
    "Poor": "Restricted Protocol",
    "VeryPoor": "Indoor Protocol",
    "Severe": "Lockdown Protocol",
}


def get_level(aqi: int) -> str:
    if aqi <= 100:
        return "Good"
    if aqi <= 200:
        return "Moderate"
    if aqi <= 300:
        return "Poor"
    if aqi <= 400:
        return "VeryPoor"
    return "Severe"


def predict_level(features: dict) -> str:
    """v1 ML hook. features: aqi, pm25, pm10, tempC, windKph, precipProb,
    humidity, canopyDensity, builtUpRatio, smogTrapIndex. Today: rule model."""
    return get_level(int(features["aqi"]))


def default_actions(level: str) -> list[dict]:
    if level == "Good":
        return [
            {"key": "pe", "label": "Normal outdoor PE", "state": "do"},
            {"key": "windows", "label": "Ventilate classrooms", "state": "do"},
        ]
    if level == "Moderate":
        return [
            {"key": "pe", "label": "Normal PE, reduce exertion", "state": "optional"},
            {"key": "windows", "label": "Ventilate classrooms", "state": "do"},
        ]
    if level == "Poor":
        return [
            {"key": "pe", "label": "Shortened outdoor PE", "state": "optional"},
            {"key": "mask", "label": "Masks for sensitive kids", "state": "do"},
        ]
    return [
        {"key": "pe", "label": "Indoor PE only", "state": "do"},
        {"key": "mask", "label": "N95 masks outdoors", "state": "do"},
        {"key": "windows", "label": "Keep windows closed", "state": "do"},
    ]


def build_reasons(day: dict, urban: dict) -> list[str]:
    """Top-3 human strings from the same features the model sees."""
    level = get_level(int(day["aqi"]))
    label = {"Good": "Good", "Moderate": "Moderate", "Poor": "Poor",
             "VeryPoor": "Very Poor", "Severe": "Severe"}[level]
    reasons = [f"AQI {day['aqi']} ({label}) — PM2.5 {day['pm25']} µg/m³"]
    if day["windKph"] < 10:
        reasons.append(f"Low wind {day['windKph']} kph traps pollutants near ground")
    else:
        reasons.append(f"Ventilation from {day['windKph']} kph {day['windDir']} wind")
    reasons.append(
        f"Built-up {round(urban['builtUpRatio'] * 100)}% + canopy "
        f"{round(urban['canopyDensity'] * 100)}% shape local exposure"
    )
    return reasons
