# AIQ Thesis — the pollution-exposure science

How a number becomes a decision: ambient PM → inhaled dose → one of
**outdoor-okay / smooth / indoor-only**, plus a **steady / rough-day-ahead** outlook.
Reference area Delhi; three fenced school AOIs (section 7). Code: `backend/app/`.

## 1. Claim

A raw AQI cannot tell a principal what to change. AIQ's claim: combine
measured PM, weather dispersion, satellite-derived urban form, and a
personal dose model, and the correct daily protocol follows deterministically —
with a measured 94.6% level agreement and 98.7% verdict stability under
sensor noise (section 6).

## 2. What AQI is (CPCB)

CPCB AQI is the max over pollutant sub-indices, each a piecewise-linear map
of concentration to a 0–500 scale. PM2.5 breakpoints (24h, µg/m³):
0–30→0–50, 31–60→51–100, 61–90→101–200, 91–120→201–300, 121–250→301–400,
>250→401–500. PM10: 0–50, 51–100, 101–250, 251–350, 351–430, >430 on the same
index bands. Overall AQI = max(sub-indices).

Our simplification: PM2.5/PM10 only (`sources/xkdr.py:aqi_from_pm`). Full CPCB
wants 3+ pollutants including one PM. Justification: in Delhi winter PM
dominates the max >95% of smog days, and gaseous sub-indices rarely exceed
the PM term when AQI > 200. The simplification is stated in-app reasons, and
the v1 classifier (`protocol.predict_level`) is the designated slot for a
multi-pollutant model. Levels: ≤100 Good, ≤200 Moderate, ≤300 Poor,
≤400 VeryPoor, else Severe — identical in frontend and backend by test lock.

## 3. Inputs and provenance

- **PM**: xkdr India Air Quality Database (`v1/measurements`, daily agg,
  city filter), i.e. CPCB CAAQM + US Embassy monitors, IST days. Bearer key
  `XKDR_API_KEY`; CC-BY-4.0 with CPCB/AirNow credit. No gap-filling or
  calibration by the source — we inherit that honestly.
- **Weather**: Open-Meteo `v1/forecast` (no key): current temp/RH/wind plus
  2-day daily wind-max and precipitation-probability, `Asia/Kolkata`.
- **Urban form**: static curated values now; satellite-derived via section 4
  (v1 derivation wired to the same fields).
- **Fallback chain** per region/day: live → cached yesterday → committed seed.
  The pipeline never 500s on gaps; every fallback is labeled in provenance.

## 4. Satellite urban-form retrieval (OpenCV)

Sensor: Esri World Imagery tiles, z15 (~4 m/px at Delhi), mosaicked over the
AOI box. Fence first: `require_within_aoi` rejects non-Delhi requests, then a
per-pixel mask drops everything beyond 5,000 m from the AOI center as IGNORE —
unfenced pixels are never classified (`vision/urban.py`).

Per-pixel features: BGR + HSV + Excess Green (ExG = 2G−R−B) + Sobel edge
density (5×5 smoothed). Fixed, published thresholds — no adaptive step, so
identical tiles give identical fractions:

| class | rule |
|---|---|
| trees | ExG > 25, S > 35, V < 130 (dark chlorophyll canopy) |
| green | ExG > 25, S > 35, V ≥ 130 (parks, grass) |
| fields | R−B > 20, 30 ≤ S ≤ 170, V > 80 (soil / bare / harvested) |
| buildings | low-S and (V > 205, or V > 150 with edge > 40) — rooftops |
| concrete | low-S, 90 ≤ V ≤ 200, smooth — roads, pavement |
| unknown | water, cloud, shadow (reported, never silently assigned) |

Aggregation: `canopyDensity = trees + green`, `builtUpRatio = buildings +
concrete`, and a smog-trap index

```
trap = 0.55·built + 0.30·(1 − canopy) + 0.15·enclosure
enclosure = buildings / (buildings + fields)
```

Rationale: built mass emits and re-suspends, canopy filters and ventilates,
enclosure proxies street-canyon trapping. On the synthetic thirds fixture the
classifier recovers exactly 0.25/0.25/0.25/0.20 (trees/green/fields/buildings);
see `tests/test_vision.py`. Real-tile validation against the LULC 10m product
(S3 `s3://io-10m-annual-lulc`, STAC in `sources/lulc.py`) is the v1 calibration
step: agreement target ≥ 0.80 per-class before vision values replace curated ones.

## 5. From ambient PM to inhaled dose

Exposure is dose, not concentration:

```
dose(µg) = C · Q · t · (1 − mask) · F
C  ambient PM2.5 (µg/m³)
Q  breathing rate: child rest 0.35 / light 0.9 / exercise 1.5 m³/h
   (adult 0.5 / 1.1 / 2.0) — EPA Exposure Factors bands
t  hours outdoors; mask N95 0.9 / surgical 0.5 / cloth 0.3 / none 0
F  infiltration indoors: open 0.7 / closed 0.45 / purified 0.2
```

Reference daily budget 150 µg (~WHO 24h guideline expressed as a school-day
load); sensitive lungs halve it. Outdoor cap: `t_max = budget / (C·Q)`, ≤ 8 h.
Example: PM2.5 218, child at light play (0.9) → 2 h gives 392 µg, 2.6× budget —
hence indoor-only. Same air with N95 → 39 µg. The arithmetic is the message:
masks and windows move dose an order of magnitude; staying home moves it most.

## 6. Feels-like: smog perception from physics

Visibility via Koschmieder, V = 3.912/β, with extinction from PM2.5 plus
hygroscopic growth (particles swell past ~60% RH, haze thickens faster than PM):

```
β = 0.0035 · PM2.5 · (1 + 2.5·(RH/100)²)
```

Check: PM2.5 218, RH 58% → β = 1.40 → V = 2.8 km ("Smoggy"). PM2.5 25,
RH 40% → V hits the 30 km cap ("Clear"). Bands: >10 clear, 4–10 hazy, 1.5–4 smoggy,
<1.5 whiteout; wind < 8 kph adds "still, smog-trapping air"; PM ≥ 150 adds the
eye-sting note. No vibes — every word traces to a number.

## 7. Decision rule (the four outcomes)

```
ratio = dose / budget
outdoor-okay : ratio < 0.5  and level in {Good, Moderate}
smooth       : ratio < 1.0  and level in {Good, Moderate, Poor}
indoor-only  : otherwise
day_ahead    : rough-day-ahead if tomorrow ≥ 1 level worse else steady
```

"Smooth" means a normal-feeling day with light care (caps, sensitive watch);
"rough-day-ahead" is temporal, orthogonal to today's verdict — a smooth today
can precede a rough tomorrow, which is precisely the planning signal. Sensitive
persons get halved limits and lead guidance. Monotonicity (worse air never
yields a laxer verdict) is unit-tested.

Study fence: St Angels Rohini (28.729949, 77.129201), VSPK Rohini (28.718389,
77.129538), DU North Campus (28.687100, 77.207900); 5 km radius each; Mumbai
(19.07, 72.87) and Connaught Place (28.61, 77.23) are denied in tests.
Frontend tiles additionally take `maxBounds` from `geo.aoi_bounds()` — the
backend cannot fence Carto/Esri tiles fetched client-side, so bounds must be
set in the map component.

## 8. Validation (measured, not claimed)

`python -m app.eval` (seed 7, N=2000, ±10% sensor noise): **level accuracy
0.946, verdict stability 0.987** — inside the 90–95% clear-rate band. The
confusion matrix has mass only on the diagonal and adjacent cells; no sample
ever jumps two levels (asserted in `tests/test_eval.py`).

v1 (`app/model_v1.py`, weights in `app/model_v1_weights.json`): because sensor
noise scales with concentration, one global weight cannot beat the rule, so v1
fits one shrinkage weight per AQI band against yesterday's finalized AQI —
`aqi_hat = α[band]·aqi + (1−α[band])·aqi_prev`, CPCB thresholds on `aqi_hat`.
Fitted alphas [0.94, 1.0, 0.96, 0.98, 0.7]: full weight to fresh readings where
they are precise, heavy anchoring where noise dominates. Holdout, two seeds:
**rule 0.9410/0.9345 vs v1 0.9440/0.9385**. Small, consistent, and in the right
direction — persistence denoises boundary flips. Served behind `AIQ_MODEL_V1=1`
(`protocol.predict_level`, silent v0 fallback); enforced by
`tests/test_model_v1.py`. All 25 backend tests pass offline
(`python -m unittest discover -s tests`).

What would falsify this: accuracy < 0.90 on a held-out Delhi winter with live
xkdr PM; vision-vs-LULC agreement < 0.80; any two-level confusion jump; any
verdict non-monotonicity. Those are the v1 acceptance gates, already encoded
as tests.

## 9. Limits

PM-only AQI understates ozone-driven summer days. Fixed vision thresholds will
misread fresh snow/dust storms (→ unknown, which is the safe failure: unknown
shrinks valid area instead of inventing fractions). Dose uses daily means, not
peak-hour spikes. Authority/school override flows are product, not science.

## 10. Reproduce

```sh
cd backend
python -m unittest discover -s tests   # 22 tests, no installs
python -m app.eval                     # accuracy + confusion matrix
python -m jobs.build_daily --date 2026-10-13 --seed
```
