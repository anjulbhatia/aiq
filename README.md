# AIQ — Air Intelligence Quotient

Live AQI + weather + satellite urban form → a daily school safety protocol,
so principals know exactly what to change and parents of vulnerable children
get guidance instead of a raw number. WeMakeDevs × AWS env hackathon, Air track.

## Run it (2 minutes)

```sh
cp .examples.env .env   # base URLs + keys (empty = offline seed mode)
bun dev                 # backend :8000 + frontend :3000 together
```

Backend alone needs `pip install -e ./backend` (uvicorn). Without installs the
whole backend suite still runs on stdlib: `cd backend && python -m unittest
discover -s tests`.

## Layout

- `frontend/` — Next.js SPA: mapcn map, status card, briefing/students/uneasy
  sheets, role tabs on mobile. Offline-capable via mock data.
- `backend/app/` — pipeline (xkdr + Open-Meteo + LULC), OpenCV urban classifier,
  v0/v1 protocol models, exposure science, Cedar authz, Strands agent,
  FastAPI + Lambda transports.
- `backend/jobs/` — `build_daily`, `train_v1`, `demo_e2e` (live HTTP, 9/9 PASS).
- `examples/` — seed schools, users, regions_daily. IDs match frontend mocks.
- `run.ts` — local runner. `Thesis.md` — the exposure science.
  `Architecture.md` — system picture. `ignore/` — working notes (gitignored).

## Docs

Start with `Architecture.md`, then `Thesis.md` for the pollution-exposure model,
then `backend/README.md` for pipeline/API/auth details.

Data: India Air Quality Database, XKDR Forum (CPCB CAAQM + US DoS/AirNow),
CC-BY-4.0. Weather: Open-Meteo. Land cover: Impact Observatory / Esri.
