"""Pydantic schemas. Mirror of frontend lib/types.ts — do not drift."""

from typing import Literal

from pydantic import BaseModel

ProtocolLevel = Literal["Good", "Moderate", "Poor", "VeryPoor", "Severe"]
ActionState = Literal["do", "avoid", "optional"]
StudentStatus = Literal["ok", "uneasy", "absent"]
Role = Literal["principal", "teacher", "parent", "student", "authority"]


class UrbanForm(BaseModel):
    canopyDensity: float
    builtUpRatio: float
    smogTrapIndex: float


class RegionDay(BaseModel):
    """One regions_daily.json entry: normalized AQI + weather for a region/day."""

    aqi: int
    pm25: float
    pm10: float
    tempC: float
    windKph: float
    windDir: str
    precipProb: float
    humidity: float


class ProtocolAction(BaseModel):
    key: str
    label: str
    state: ActionState


class ForecastTomorrow(BaseModel):
    aqi: int
    level: ProtocolLevel


class Briefing(RegionDay, UrbanForm):
    schoolId: str
    level: ProtocolLevel
    actions: list[ProtocolAction]
    reasons: list[str]
    forecastTomorrow: ForecastTomorrow
    generatedAt: str


class UneasyReport(BaseModel):
    studentId: str
    note: str = ""


class PublishRequest(BaseModel):
    schoolId: str
    level: ProtocolLevel
    actions: list[ProtocolAction] = []
