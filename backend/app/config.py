"""Env + paths. Everything runs offline on seeds when keys/network missing."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # repo root (aiq/)
EXAMPLES = ROOT / "examples"


class Settings:
    xkdr_api_key: str = os.getenv("XKDR_API_KEY", "")
    xkdr_base: str = os.getenv("XKDR_BASE", "https://airquality.xkdr.org")
    openmeteo_base: str = os.getenv("OPENMETEO_BASE", "https://api.open-meteo.com/v1/forecast")
    timezone: str = os.getenv("AIQ_TZ", "Asia/Kolkata")
    schools_file: Path = Path(os.getenv("AIQ_SCHOOLS", EXAMPLES / "schools.json"))
    users_file: Path = Path(os.getenv("AIQ_USERS", EXAMPLES / "users.json"))
    seed_regions_file: Path = Path(os.getenv("AIQ_SEED_REGIONS", EXAMPLES / "regions_daily.json"))
    data_dir: Path = Path(os.getenv("AIQ_DATA_DIR", Path(__file__).resolve().parents[1] / "data"))
    aws_region: str = os.getenv("AWS_REGION", "us-west-2")
    # Agent model: bedrock (default, needs AWS creds + model access) or
    # ollama (local, needs `ollama serve` + pulled model, no keys).
    model_provider: str = os.getenv("AIQ_MODEL_PROVIDER", "bedrock")
    ollama_host: str = os.getenv("AIQ_OLLAMA_HOST", "http://localhost:11434")
    ollama_model: str = os.getenv("AIQ_OLLAMA_MODEL", "qwen2.5:3b")
    bedrock_model_id: str = os.getenv(
        "AIQ_BEDROCK_MODEL", "global.anthropic.claude-sonnet-4-6")
    # Impact Observatory 10m LULC, Registry of Open Data on AWS (no-sign-request)
    lulc_bucket: str = os.getenv("AIQ_LULC_BUCKET", "s3://io-10m-annual-lulc")
    lulc_stac: str = os.getenv(
        "AIQ_LULC_STAC", "https://api.impactobservatory.com/stac-aws/collections/io-10m-annual-lulc/items"
    )


settings = Settings()
