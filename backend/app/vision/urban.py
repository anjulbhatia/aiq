"""Satellite urban-form classifier (OpenCV, Esri World Imagery, Delhi AOIs only).

Method (full derivation in Thesis.md section 3):
- Fetch z15 Esri tiles over the 5 km AOI box, mosaic, then hard-mask every
  pixel beyond RADIUS_M from the AOI center as IGNORE. Nothing outside the
  fence is ever classified.
- Per-pixel classes from BGR + HSV + Excess Green + Sobel edge density:
    trees      ExG > 25, S > 35, V < 130        (dark chlorophyll canopy)
    green      ExG > 25, S > 35, V >= 130       (parks, grass, fields-green)
    fields     R-B > 20, 30 <= S <= 170, V > 80 (soil / bare / harvested)
    buildings  low-S bright pixels with high edge density (rooftops)
    concrete   low-S mid-gray smooth pixels     (roads, pavement)
    unknown    everything else (water, cloud, shadow)
- Fractions over non-IGNORE pixels:
    canopyDensity = trees + green
    builtUpRatio  = buildings + concrete
    smogTrapIndex = 0.55*built + 0.30*(1-canopy) + 0.15*enclosure
    enclosure     = buildings / (buildings + fields + eps)  (canyon proxy)

Thresholds are fixed constants (documented, reproducible) — deliberately not
Otsu/data-adaptive, so the same tile always yields the same fractions.
"""

import math
import urllib.request

import cv2
import numpy as np

from ..geo import RADIUS_M, TILE_ZOOM, haversine_m, require_within_aoi

ESRI_TILE = ("https://server.arcgisonline.com/ArcGIS/rest/services/"
             "World_Imagery/MapServer/tile/{z}/{y}/{x}")

# --- fixed thresholds (see Thesis.md 3.2 for calibration notes) ---
EXG_VEG = 25
SAT_VEG = 35
VAL_TREE = 130
SOIL_RB = 20
SOIL_SAT = (30, 170)
SOIL_VAL = 80
GRAY_SAT = 45
CONCRETE_VAL = (90, 200)
ROOF_VAL = 150
EDGE_MAG = 40

IGNORE, TREES, GREEN, FIELDS, BUILDINGS, CONCRETE, UNKNOWN = range(7)
CLASS_NAMES = ["ignore", "trees", "green", "fields", "buildings", "concrete", "unknown"]


def classify(bgr: np.ndarray) -> np.ndarray:
    """BGR uint8 HxWx3 -> uint8 HxW class ids. Pure function, no network."""
    b, g, r = (bgr[:, :, i].astype(np.int16) for i in (0, 1, 2))
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    s = hsv[:, :, 1].astype(np.int16)
    v = hsv[:, :, 2].astype(np.int16)
    exg = 2 * g - r - b

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    sob = cv2.Sobel(gray, cv2.CV_32F, 1, 1, ksize=3)
    edge = cv2.GaussianBlur(np.abs(sob), (5, 5), 0)

    out = np.full(bgr.shape[:2], UNKNOWN, dtype=np.uint8)
    veg = (exg > EXG_VEG) & (s > SAT_VEG)
    out[veg & (v < VAL_TREE)] = TREES
    out[veg & (v >= VAL_TREE)] = GREEN

    soil = ((r - b) > SOIL_RB) & (s >= SOIL_SAT[0]) & (s <= SOIL_SAT[1]) & (v > SOIL_VAL)
    out[soil & (out == UNKNOWN)] = FIELDS

    grayish = s < GRAY_SAT
    # Near-white low-saturation pixels are rooftops/metal even when smooth;
    # mid-bright gray needs edge density (roof texture, parcel lines).
    roof = grayish & ((v > 205) | ((v > ROOF_VAL) & (edge > EDGE_MAG)))
    out[roof] = BUILDINGS
    pave = grayish & (v >= CONCRETE_VAL[0]) & (v <= CONCRETE_VAL[1]) & (out == UNKNOWN)
    out[pave] = CONCRETE
    return out


def summarize(classes: np.ndarray) -> dict:
    """Class-id map -> urban-form fractions. Raises on empty valid area."""
    valid = classes != IGNORE
    n = int(valid.sum())
    if n == 0:
        raise ValueError("no pixels inside the AOI fence")
    frac = {name: float((classes[valid] == i).sum()) / n
            for i, name in enumerate(CLASS_NAMES) if i != IGNORE}
    canopy = frac["trees"] + frac["green"]
    built = frac["buildings"] + frac["concrete"]
    enclosure = frac["buildings"] / (frac["buildings"] + frac["fields"] + 1e-9)
    trap = 0.55 * built + 0.30 * (1 - canopy) + 0.15 * enclosure
    return {
        "trees": frac["trees"], "green": frac["green"], "fields": frac["fields"],
        "buildings": frac["buildings"], "concrete": frac["concrete"],
        "unknown": frac["unknown"], "pixelCount": n,
        "canopyDensity": round(canopy, 4),
        "builtUpRatio": round(built, 4),
        "smogTrapIndex": round(float(min(1.0, max(0.0, trap))), 4),
    }


# --- tile fetch + mosaic (network; geofenced) -----------------------------

def _tile_xy(lat: float, lng: float, z: int) -> tuple[int, int]:
    n = 2 ** z
    x = int((lng + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def _tile_bbox(x: int, y: int, z: int) -> tuple[float, float, float, float]:
    n = 2 ** z
    lng0, lng1 = x / n * 360.0 - 180.0, (x + 1) / n * 360.0 - 180.0
    lat1 = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    lat0 = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))
    return lng0, lat0, lng1, lat1


def fetch_mosaic(lat: float, lng: float, z: int = TILE_ZOOM,
                 timeout: int = 30) -> tuple[np.ndarray, dict]:
    """Mosaic Esri tiles over the AOI box. Pixels outside RADIUS_M -> IGNORE mask.

    Returns (bgr mosaic, meta {classes-ready mask, px_per_m}). Raises
    PermissionError outside the Delhi fence.
    """
    aoi = require_within_aoi(lat, lng)
    d_lat = RADIUS_M / 111320.0
    d_lng = RADIUS_M / (111320.0 * math.cos(math.radians(lat)))
    x0, y0 = _tile_xy(lat + d_lat, lng - d_lng, z)
    x1, y1 = _tile_xy(lat - d_lat, lng + d_lng, z)
    rows = []
    for y in range(y0, y1 + 1):
        row = []
        for x in range(x0, x1 + 1):
            req = urllib.request.Request(
                ESRI_TILE.format(z=z, y=y, x=x),
                headers={"User-Agent": "AIQ-hackathon/0.1", "Referer": "https://localhost/"})
            with urllib.request.urlopen(req, timeout=timeout) as res:
                img = cv2.imdecode(np.frombuffer(res.read(), np.uint8), cv2.IMREAD_COLOR)
            if img is None:
                raise RuntimeError(f"tile z{z}/{x}/{y} undecodable")
            row.append(img)
        rows.append(np.hstack(row))
    mosaic = np.vstack(rows)

    # Per-pixel fence: map mosaic pixels back to lng/lat via corner tiles.
    h, w = mosaic.shape[:2]
    west = _tile_bbox(x0, y0, z)[0]
    north = _tile_bbox(x0, y0, z)[3]
    east = _tile_bbox(x1, y1, z)[2]
    south = _tile_bbox(x0, y1, z)[1]
    lngs = np.linspace(west, east, w)
    lats = np.linspace(north, south, h)
    glng, glat = np.meshgrid(lngs, lats)
    dist = np.vectorize(lambda la, ln: haversine_m(la, ln, lat, lng))(glat, glng)
    ignore = dist > RADIUS_M
    px_per_m = w / ((east - west) * 111320.0 * math.cos(math.radians(lat)))
    return mosaic, {"ignore": ignore, "px_per_m": float(px_per_m), "aoi": aoi["id"],
                    "tiles": f"z{z} x{x0}-{x1} y{y0}-{y1}"}


def analyze_aoi(lat: float, lng: float) -> dict:
    """End to end: fence -> fetch -> classify -> urban-form fractions."""
    mosaic, meta = fetch_mosaic(lat, lng)
    classes = classify(mosaic)
    classes[meta["ignore"]] = IGNORE
    out = summarize(classes)
    out.update({"aoi": meta["aoi"], "tiles": meta["tiles"]})
    return out
