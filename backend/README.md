# AIQ backend — pipeline, protocol, API

Pipeline: xkdr (AQI) + Open-Meteo (weather) + Impact Observatory LULC (urban form, v1)
-> `regions_daily` -> protocol levels -> FastAPI locally, Lambda in prod (Amplify hosts frontend).

## Zero-install verify

```sh
cd backend
python -m unittest discover -s tests   # seeds, AQI, briefing join, Cedar rules
python -m jobs.build_daily --date 2026-10-13 --seed
```

## Live daily job (needs `XKDR_API_KEY`)

```sh
export XKDR_API_KEY=...
python -m jobs.build_daily --date 2026-10-13 --live
```

Fallback per region: live -> cached yesterday -> committed `examples/` seed. Never 500s on gaps.

## Serve API (needs `pip install -e .`)

```sh
uvicorn app.main:app --port 8000
```

Demo auth: `Authorization: Bearer <email from examples/users.json>`.
Endpoints mirror frontend `lib/api.ts`: `GET /api/briefing/{school}`,
`POST /api/report-uneasy`, `POST /api/publish` (+ mock parent push log).

## AWS layout (WeMakeDevs x AWS env hackathon)

- Frontend: Amplify Hosting from `frontend/`, `NEXT_PUBLIC_API_URL` -> HTTP API URL.
- Backend: `lambda_handler.handler` zipped from `backend/` behind API Gateway
  HTTP API (`/health`, `/api/*`). Same `service.py` as FastAPI — transports thin.
- Agent: Strands SDK (`app/agents/briefing_agent.py`), Bedrock default model,
  per-invocation construction; template fallback without creds.
- Authz: `app/authz/policies.cedar` -> Amazon Verified Permissions in prod;
  local pure-python mirror enforced now, drift covered by tests.
- Tiles: Esri World Imagery for satellite view; LULC S3 `s3://io-10m-annual-lulc`
  (us-west-2, no-sign-request) + STAC for v1 canopy/built-up derivation.

Data credit: India Air Quality Database, XKDR Forum (+ CPCB CAAQM, US DoS/AirNow), CC-BY-4.0.
