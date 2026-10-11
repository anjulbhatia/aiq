"""Delhi reference AOIs + 5km geofence. Single source of truth for map access.

Sites (reference area: Delhi, nothing outside it is served):
- St Angels School, Rohini ......... 28.729949, 77.129201
- VSPK International School, Rohini  28.718389, 77.129538
- Delhi University, North Campus .... 28.687100, 77.207900

Every lat/lng entering our stack (vision fetches, briefings by coord, future
tile proxy) must pass require_within_aoi(). Frontend tiles come straight from
Carto/Esri so the backend cannot fence those — frontend must set maxBounds
from aoi_bounds() (see Thesis.md section 7). Radius 5000 m per site.
"""

import math

RADIUS_M = 5000
TILE_ZOOM = 16  # ~2.4 m/px at Delhi latitude: buildings resolve, tiles stay few

AOIS = [
    {"id": "st-angels-rohini", "name": "St Angels School", "lat": 28.729949, "lng": 77.129201},
    {"id": "vspk-rohini", "name": "VSPK International School", "lat": 28.718389, "lng": 77.129538},
    {"id": "du-campus", "name": "Delhi University, North Campus", "lat": 28.687100, "lng": 77.207900},
]


def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def nearest_aoi(lat: float, lng: float) -> tuple[dict, float]:
    ranked = sorted(((a, haversine_m(lat, lng, a["lat"], a["lng"])) for a in AOIS),
                    key=lambda t: t[1])
    return ranked[0]


def within_aoi(lat: float, lng: float) -> bool:
    return nearest_aoi(lat, lng)[1] <= RADIUS_M


def require_within_aoi(lat: float, lng: float) -> dict:
    """Gate for map/vision access. Raises outside Delhi AOIs."""
    aoi, dist = nearest_aoi(lat, lng)
    if dist > RADIUS_M:
        raise PermissionError(
            f"({lat}, {lng}) is {dist / 1000:.1f} km from {aoi['id']} — "
            f"outside the {RADIUS_M / 1000:.0f} km Delhi fence"
        )
    return aoi


def aoi_bounds(aoi_id: str) -> list[list[float]]:
    """[[minLng, minLat], [maxLng, maxLat]] box for frontend maxBounds."""
    aoi = next(a for a in AOIS if a["id"] == aoi_id)
    d_lat = RADIUS_M / 111320.0
    d_lng = RADIUS_M / (111320.0 * math.cos(math.radians(aoi["lat"])))
    return [[aoi["lng"] - d_lng, aoi["lat"] - d_lat],
            [aoi["lng"] + d_lng, aoi["lat"] + d_lat]]
