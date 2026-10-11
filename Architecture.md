# AIQ Architecture

One picture, then the parts. Detail lives in `Thesis.md` (science),
`backend/README.md` (run it), `ignore/Todo.md` (build order).

## System

```
                    ┌──────────────┐
  xkdr AQI ─────────▶              │
  Open-Meteo wx ────▶  PIPELINE    │  jobs/build_daily.py, app/pipeline.py
  Esri/LULC ────────▶  (fallback: live → cache → seed)
                    └──────┬───────┘
                           │ regions_daily {aqi,pm,weather}/day/region
                    ┌──────▼───────┐
                    │ MODEL        │  v0 CPCB rule → v1 shrinkage (AIQ_MODEL_V1)
                    │ + EXPOSURE   │  dose, feels-like, verdicts (Thesis.md)
                    └──────┬───────┘
                           │ Briefing {level, actions, reasons, forecast}
              ┌────────────▼────────────┐
              │ SERVICE (authz first)   │  Cedar policies, local mirror enforced
              └──┬──────────────────┬───┘
   FastAPI (local)│                  │ Lambda (prod, API Gateway HTTP API)
                  └────────┬─────────┘
              ┌────────────▼────────────┐
              │ FRONTEND (Next.js)      │  map SPA + sheets; mocks when API down
              │ Amplify (prod)          │
              └─────────────────────────┘
```

## Parts

- **Sources** (`backend/app/sources/`): `xkdr.py` (CPCB/embassy PM, CPCB
  sub-index to AQI), `openmeteo.py` (current + 2-day daily, Asia/Kolkata),
  `lulc.py` (Esri tiles + LULC S3/STAC refs; static urban form until v1 vision
  calibration). All keyless except `XKDR_API_KEY`; all degrade to seed.
- **Vision** (`backend/app/vision/`): OpenCV 5-class satellite classifier over
  fenced AOI mosaics → canopy/built-up/smog-trap. Fixed thresholds, synthetic
  fixture in tests.
- **Model** (`backend/app/protocol.py`, `model_v1.py`): v0 rule mirrors the
  frontend stub exactly; v1 per-band shrinkage on yesterday's AQI beats it
  (0.9440/0.9385 vs 0.9410/0.9345, seeds 7/8). Weights tracked, flag-gated,
  silent v0 fallback.
- **Exposure** (`backend/app/exposure.py`): inhaled dose → outdoor-okay /
  smooth / indoor-only + steady / rough-day-ahead; Koschmieder feels-like.
- **Authz** (`backend/app/authz/`): Cedar policies (prod: Amazon Verified
  Permissions). Teachers/students/parents denied school-level reads; parents
  own-children-only; teachers own-class-only. Enforced in `service.py` before
  any data access — both transports inherit it.
- **Agent** (`backend/app/agents/`): Strands SDK briefing-note agent (Bedrock
  default), template fallback without creds, per-invocation on Lambda.
- **Transports**: `app/main.py` (FastAPI + CORS, Bearer-email demo auth) and
  `lambda_handler.py` (stdlib-only API Gateway adapter). Same `service.py`.
- **Frontend** (`frontend/`): Next 16 SPA — mapcn map background, status card,
  briefing/students/uneasy sheets, role tabs on mobile. Reads
  `NEXT_PUBLIC_API_URL`, falls back to `lib/mock-data.ts` offline. Contract
  frozen in `ignore/Todo.md`; e2e asserts it (`jobs/demo_e2e.py`, 9/9).
- **Data**: `examples/` seeds (schools, users, regions_daily); `backend/data/`
  pipeline output (gitignored). Delhi AOI fence (`app/geo.py`, 3 sites × 5km).

## Decisions

- Rule-first, ML-second: v0 ships the decision while v1 proves itself offline.
- Seed-fallback everywhere: demo never depends on network or keys.
- Authz in service, not transports: one enforcement point, two runtimes.
- Fixed vision thresholds over adaptive: reproducibility beats a few points.
- Frontend owns its pixels; backend owns the numbers; JSON contract is the wall.

## Deploy (hackathon)

Amplify ← `frontend/` (`NEXT_PUBLIC_API_URL` = HTTP API URL). Lambda ←
`backend/` zip, `lambda_handler.handler`. Daily 6am: cron `build_daily --live`.
Strands agent needs Bedrock model access + creds; without them the template
note serves. Verified Permissions consumes `policies.cedar` as-is.
