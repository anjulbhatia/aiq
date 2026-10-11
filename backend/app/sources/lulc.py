"""Urban form: canopy / built-up / smog-trap per school.

Sources (WeMakeDevs x AWS env hackathon):
- Satellite tiles for display: Esri World Imagery
  https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
- Impact Observatory 10m LULC (9-class, Sentinel-2, 2017-2024), Registry of
  Open Data on AWS: s3://io-10m-annual-lulc (us-west-2, --no-sign-request),
  STAC https://api.impactobservatory.com/stac-aws/collections/io-10m-annual-lulc/items
  Classes: 1 water, 2 trees, 3 flooded veg, 4 crops, 5 built, 6 bare,
  7 snow/ice, 8 clouds, 9 rangeland.

v0: static urban_form from examples/schools.json (curated per locality).
v1: windowed read of the LULC COG intersecting school lat/lng
    (rasterio + s3fs) -> canopy = trees/(land), builtUp = built/(land).
    Scaffold below raises NotImplementedError until raster deps land.
"""

from ..config import settings

ESRI_WORLD_IMAGERY = (
    "https://server.arcgisonline.com/ArcGIS/rest/services/"
    "World_Imagery/MapServer/tile/{z}/{y}/{x}"
)


def for_school(school: dict) -> dict:
    """v0 static values. v1 swaps the body for the LULC derivation."""
    return dict(school["urban_form"])


def derive_from_lulc(lat: float, lng: float, year: int = 2024) -> dict:  # noqa: ARG001
    """v1: find intersecting LULC supercell via STAC, windowed COG read.

    Needs: rasterio, s3fs, pystac-client. Not in pyproject yet — added with v1.
    """
    raise NotImplementedError(
        f"LULC derivation not wired. Query {settings.lulc_stac} for "
        f"bbox around ({lat}, {lng}), read {settings.lulc_bucket} COG window."
    )
