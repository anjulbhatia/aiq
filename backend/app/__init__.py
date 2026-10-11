"""AIQ backend: data pipeline (xkdr + Open-Meteo + LULC) -> protocol -> FastAPI/Lambda."""

from .config import settings

__all__ = ["settings"]
