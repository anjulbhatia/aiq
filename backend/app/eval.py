"""Eval harness: the 90% gate. Seeded, deterministic, stdlib only.

What 'clear rate' means here (honest definition, Thesis.md 6):
  level accuracy  = pipeline level == CPCB reference level on noisy samples
  verdict stability = assess() verdict unchanged under sensor noise
Reference labels come from CPCB breakpoints on TRUE pm; the pipeline sees
NOISY pm (sensor error +-10%, dropout -> seed fallback path). Boundary
samples flip under noise — that is exactly what the gate measures.

Run: python -m app.eval  (also asserted in tests/test_eval.py, N=500).
"""

import random

from . import exposure, protocol
from .sources import xkdr

ORDER = protocol.LEVELS


def sample_day(rng: random.Random) -> dict:
    pm25 = round(rng.uniform(8, 420), 1)
    pm10 = round(pm25 * rng.uniform(1.2, 1.8), 1)
    return {
        "pm25": pm25, "pm10": pm10,
        "tempC": round(rng.uniform(22, 38), 1),
        "windKph": round(rng.uniform(2, 22), 1),
        "windDir": rng.choice(["N", "NW", "W", "SW"]),
        "precipProb": round(rng.uniform(0, 30), 1),
        "humidity": round(rng.uniform(30, 85), 1),
        "canopyDensity": round(rng.uniform(0.1, 0.5), 2),
        "builtUpRatio": round(rng.uniform(0.4, 0.9), 2),
        "smogTrapIndex": round(rng.uniform(0.2, 0.85), 2),
    }


def predict(day: dict) -> tuple[str, dict]:
    aqi = xkdr.aqi_from_pm(day["pm25"], day["pm10"])
    level = protocol.predict_level({**day, "aqi": aqi})
    briefing = {**day, "aqi": aqi, "level": level,
                "forecastTomorrow": {"aqi": aqi, "level": level}}
    verdict = exposure.assess(briefing)["verdict"]
    return level, {"verdict": verdict}


def run(n: int = 2000, noise: float = 0.10, seed: int = 7) -> dict:
    rng = random.Random(seed)
    correct = stable = 0
    confusion = {t: {p: 0 for p in ORDER} for t in ORDER}
    for _ in range(n):
        true = sample_day(rng)
        ref = protocol.get_level(xkdr.aqi_from_pm(true["pm25"], true["pm10"]))
        noisy = dict(true,
                     pm25=true["pm25"] * rng.uniform(1 - noise, 1 + noise),
                     pm10=true["pm10"] * rng.uniform(1 - noise, 1 + noise))
        pred, pinfo = predict(noisy)
        confusion[ref][pred] += 1
        correct += pred == ref
        _, sinfo = predict({**noisy,
                            "pm25": noisy["pm25"] * rng.uniform(1 - noise, 1 + noise)})
        stable += pinfo["verdict"] == sinfo["verdict"]
    return {
        "n": n, "noise": noise, "seed": seed,
        "level_accuracy": round(correct / n, 4),
        "verdict_stability": round(stable / n, 4),
        "confusion": confusion,
        "gate": "level_accuracy >= 0.90 and verdict_stability >= 0.90",
    }


if __name__ == "__main__":
    import json
    print(json.dumps(run(), indent=2))
