"""Train v1 shrinkage alpha on autocorrelated 2-day episodes.

Run: python -m jobs.train_v1  (writes app/model_v1_weights.json + metrics)
"""

import json

import numpy as np

from app import eval as ev
from app import model_v1, protocol
from app.sources import xkdr

RHO = 0.85  # day-to-day PM persistence (Delhi winter)


def episode(rng: np.random.Generator) -> tuple[dict, dict, str]:
    base = float(rng.uniform(8, 420))
    pm = [base, float(np.clip(RHO * base + (1 - RHO) * rng.uniform(8, 420)
                              + rng.normal(0, 12), 5, 500))]
    days = []
    for p in pm:
        d = ev.sample_day(rng)
        d["pm25"] = round(p, 1)
        d["pm10"] = round(p * float(rng.uniform(1.2, 1.8)), 1)
        d["aqi"] = xkdr.aqi_from_pm(d["pm25"], d["pm10"])
        days.append(d)
    label = protocol.get_level(xkdr.aqi_from_pm(days[1]["pm25"], days[1]["pm10"]))
    return days[0], days[1], label


def dataset(n: int, seed: int, noise: float) -> tuple[np.ndarray, np.ndarray, np.ndarray, list]:
    rng = np.random.default_rng(seed)
    noisy_a, prev_a, y, keep = [], [], [], []
    for _ in range(n):
        prev, today, label = episode(rng)
        noisy = dict(today, pm25=today["pm25"] * float(rng.uniform(1 - noise, 1 + noise)),
                     pm10=today["pm10"] * float(rng.uniform(1 - noise, 1 + noise)))
        noisy["aqi"] = xkdr.aqi_from_pm(noisy["pm25"], noisy["pm10"])
        noisy_a.append(noisy["aqi"])
        prev_a.append(xkdr.aqi_from_pm(prev["pm25"], prev["pm10"]))
        y.append(protocol.LEVELS.index(label))
        keep.append((dict(noisy), prev_a[-1], label))
    return np.array(noisy_a), np.array(prev_a), np.array(y, dtype=int), keep


def accuracy(keep: list, use_v1: bool, alphas: list | None = None) -> float:
    hits = 0
    for noisy, prev, label in keep:
        if use_v1:
            assert alphas is not None
            a = float(noisy["aqi"])
            alpha = alphas[model_v1.band(a)]
            pred = protocol.get_level(int(round(alpha * a + (1 - alpha) * prev)))
        else:
            pred = protocol.get_level(int(noisy["aqi"]))
        hits += pred == label
    return hits / len(keep)


def main() -> None:
    na, pa, y, _ = dataset(4000, seed=11, noise=0.10)
    best = model_v1.train(na, pa, y)
    model_v1.WEIGHTS.write_text(json.dumps(best, indent=1), encoding="utf-8")
    _, _, _, hold = dataset(2000, seed=7, noise=0.10)
    _, _, _, hold2 = dataset(2000, seed=8, noise=0.10)
    rule = accuracy(hold, use_v1=False)
    v1 = accuracy(hold, use_v1=True, alphas=best["alphas"])
    v1b = accuracy(hold2, use_v1=True, alphas=best["alphas"])
    ruleb = accuracy(hold2, use_v1=False)
    print(f"alphas={best['alphas']} rule={rule:.4f}/{ruleb:.4f} v1={v1:.4f}/{v1b:.4f}")


if __name__ == "__main__":
    main()
