import type { ProtocolAction, ProtocolLevel } from "./types";

// Placeholder rule engine. Backend ML will replace with
// AQI + weather + urban-form classifier. Keep contract stable.
export function getLevel(aqi: number): ProtocolLevel {
  if (aqi <= 100) return "Good";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "VeryPoor";
  return "Severe";
}

export const LEVEL_META: Record<
  ProtocolLevel,
  { label: string; headline: string; classes: string; dot: string }
> = {
  Good: {
    label: "Good",
    headline: "Normal Protocol",
    classes: "bg-emerald-600",
    dot: "bg-emerald-500",
  },
  Moderate: {
    label: "Moderate",
    headline: "Watch Protocol",
    classes: "bg-yellow-500",
    dot: "bg-yellow-500",
  },
  Poor: {
    label: "Poor",
    headline: "Restricted Protocol",
    classes: "bg-orange-500",
    dot: "bg-orange-500",
  },
  VeryPoor: {
    label: "Very Poor",
    headline: "Indoor Protocol",
    classes: "bg-red-600",
    dot: "bg-red-500",
  },
  Severe: {
    label: "Severe",
    headline: "Lockdown Protocol",
    classes: "bg-rose-950",
    dot: "bg-rose-900",
  },
};

export function defaultActions(level: ProtocolLevel): ProtocolAction[] {
  switch (level) {
    case "Good":
      return [
        { key: "pe", label: "Normal outdoor PE", state: "do" },
        { key: "windows", label: "Ventilate classrooms", state: "do" },
      ];
    case "Moderate":
      return [
        { key: "pe", label: "Normal PE, reduce exertion", state: "optional" },
        { key: "windows", label: "Ventilate classrooms", state: "do" },
      ];
    case "Poor":
      return [
        { key: "pe", label: "Shortened outdoor PE", state: "optional" },
        { key: "mask", label: "Masks for sensitive kids", state: "do" },
      ];
    default:
      return [
        { key: "pe", label: "Indoor PE only", state: "do" },
        { key: "mask", label: "N95 masks outdoors", state: "do" },
        { key: "windows", label: "Keep windows closed", state: "do" },
      ];
  }
}
