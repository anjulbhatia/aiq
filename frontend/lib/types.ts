export type ProtocolLevel = "Good" | "Moderate" | "Poor" | "VeryPoor" | "Severe";

export type Role = "principal" | "teacher" | "parent";

export interface UrbanForm {
  canopyDensity: number; // 0-1 tree cover
  builtUpRatio: number; // 0-1 impervious
  smogTrapIndex: number; // 0-1 trapping potential
}

export interface School extends UrbanForm {
  id: string;
  name: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
}

export interface WeatherNow {
  tempC: number;
  windKph: number;
  windDir: string;
  precipProb: number; // 0-100
  humidity: number;
}

export interface AirNow {
  aqi: number;
  pm25: number;
  pm10: number;
}

export interface ProtocolAction {
  key: string;
  label: string;
  state: "do" | "avoid" | "optional";
  icon?: string;
}

export interface Briefing extends AirNow, WeatherNow, UrbanForm {
  schoolId: string;
  level: ProtocolLevel;
  actions: ProtocolAction[];
  reasons: string[];
  forecastTomorrow: { aqi: number; level: ProtocolLevel };
  generatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  schoolId: string;
  flags: string[]; // e.g. ["asthma"]
  status: "ok" | "uneasy" | "absent";
}

export interface HistoryDay {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  level: ProtocolLevel;
  doseUg: number;
}

export interface AttendancePerson {
  id: string;
  name: string;
  className: string;
  week: boolean[]; // last 7 days, oldest first
}

export interface AnalysisResult {
  schoolId: string;
  day: string;
  briefing: Briefing;
  urbanForm: UrbanForm & { source: string };
  exposure: {
    typical: { verdict: string; day_ahead: string; dose_ug: number; max_outdoor_h: number };
    sensitive: { verdict: string; max_outdoor_h: number };
    feels_like: string;
    visibility_km: number;
    guidance: string[];
  };
  model: { v0: ProtocolLevel; v1: ProtocolLevel; v1_trained: boolean; agree: boolean };
  eval: { n: number; seed: number; level_accuracy: number; verdict_stability: number };
  generatedAt: string;
  live?: boolean;
}
