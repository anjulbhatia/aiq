"""Daily builder. 6am cron shape: python -m jobs.build_daily --date YYYY-MM-DD [--live|--seed].

--live (default): xkdr + Open-Meteo per school, fallback chain per region.
--seed: copy committed example day (offline, deterministic demo).
Output: backend/data/regions_daily.json (upsert one day key).
"""

import argparse
from datetime import date

from app.data import load_seed_regions, save_regions
from app.pipeline import build_day


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=date.today().isoformat())
    ap.add_argument("--live", dest="live", action="store_true", default=True)
    ap.add_argument("--seed", dest="live", action="store_false")
    args = ap.parse_args()

    if args.live:
        day = build_day(args.date, live=True)
    else:
        seed = load_seed_regions()
        src = max(seed)
        day = seed[src]
        print(f"[seed] copied example day {src} -> {args.date}")

    regions = load_seed_regions()
    try:
        from app.data import load_regions as _load
        regions = _load()
    except Exception:
        pass
    regions[args.date] = day
    path = save_regions(regions)
    print(f"[build] {args.date}: {sorted(day)} -> {path}")


if __name__ == "__main__":
    main()
