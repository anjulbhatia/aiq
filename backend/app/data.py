"""Seed + store loaders. stdlib only so offline verify needs no installs."""

import json
from functools import lru_cache
from pathlib import Path

from .config import settings


def _read_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_schools() -> dict:
    return _read_json(settings.schools_file)["schools"]


@lru_cache(maxsize=1)
def load_users() -> list[dict]:
    return _read_json(settings.users_file)["users"]


def load_seed_regions() -> dict:
    return _read_json(settings.seed_regions_file)


def store_path() -> Path:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    return settings.data_dir / "regions_daily.json"


def load_regions() -> dict:
    """Pipeline output if a job ran, else the committed seed."""
    p = settings.data_dir / "regions_daily.json"
    if p.exists():
        return _read_json(p)
    return load_seed_regions()


def save_regions(regions: dict) -> Path:
    p = store_path()
    with open(p, "w", encoding="utf-8") as f:
        json.dump(regions, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return p
