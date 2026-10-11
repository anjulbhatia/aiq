"""v1 protocol classifier: per-band shrinkage + CPCB thresholds (numpy only).

Why it beats the rule: Delhi PM persists day to day, so yesterday's finalized
AQI (known exactly at briefing time) denoises today's noisy sensor reading.
Sensor noise scales with concentration, so one global weight cannot win —
v1 fits one shrinkage weight per AQI band:

    aqi_hat = alpha[band(aqi_noisy)] * aqi_noisy + (1 - alpha[..]) * aqi_prev

then applies the standard CPCB thresholds to aqi_hat. Alphas are fit on
labeled training episodes (jobs/train_v1.py); weights file is bytes.
Serve: AIQ_MODEL_V1=1 in protocol.predict_level, silent fallback to v0.
"""

import json
import os
from pathlib import Path

import numpy as np

from . import protocol

WEIGHTS = Path(__file__).with_name("model_v1_weights.json")
BANDS = (100, 200, 300, 400)  # -> 5 bands, same cuts as CPCB levels


def band(aqi: float) -> int:
    for i, cut in enumerate(BANDS):
        if aqi <= cut:
            return i
    return len(BANDS)


def train(noisy_aqi: np.ndarray, prev_aqi: np.ndarray, labels: np.ndarray) -> dict:
    """Grid-search one alpha per noisy-AQI band on training episodes."""
    lv = np.array(protocol.LEVELS)
    b = np.array([band(a) for a in noisy_aqi])
    alphas, accs = [], []
    for i in range(len(BANDS) + 1):
        idx = np.nonzero(b == i)[0]
        best_a, best_c = 1.0, -1.0
        for alpha in np.arange(0.30, 1.001, 0.02):
            hat = np.rint(alpha * noisy_aqi[idx] + (1 - alpha) * prev_aqi[idx]).astype(int)
            pred = np.array([protocol.get_level(int(a)) for a in hat])
            acc = float((pred == lv[labels[idx]]).mean()) if len(idx) else 1.0
            if acc > best_c:
                best_a, best_c = round(float(alpha), 3), acc
        alphas.append(best_a)
        accs.append(round(best_c, 4))
    hat = np.rint(np.array([alphas[band(a)] for a in noisy_aqi]) * noisy_aqi
                  + (1 - np.array([alphas[band(a)] for a in noisy_aqi])) * prev_aqi).astype(int)
    overall = float((np.array([protocol.get_level(int(a)) for a in hat]) == lv[labels]).mean())
    return {"alphas": alphas, "band_acc": accs, "acc": round(overall, 4)}


def load() -> dict | None:
    try:
        return json.loads(WEIGHTS.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def predict_level_v1(day: dict, aqi_prev: float) -> str:
    m = load()
    if m is None:
        raise RuntimeError("v1 weights missing — run jobs/train_v1.py")
    a = float(day.get("aqi", 0))
    alpha = m["alphas"][band(a)]
    hat = int(round(alpha * a + (1 - alpha) * aqi_prev))
    return protocol.get_level(hat)


def active() -> bool:
    return os.getenv("AIQ_MODEL_V1", "") == "1" and WEIGHTS.exists()
