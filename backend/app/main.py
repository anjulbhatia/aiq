"""FastAPI service. Thin transport over app/service.py. Run: uvicorn app.main:app."""

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import service
from .schemas import Briefing, PublishRequest, UneasyReport

app = FastAPI(title="AIQ backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


class Ok(BaseModel):
    ok: bool = True


def _principal(authorization: str = "") -> dict:
    # Demo auth: `Authorization: Bearer <email>` resolvable in users.json.
    # Amplify/Lambda prod swaps this for Cognito/JWT -> same principal shape.
    email = authorization.removeprefix("Bearer ").strip()
    try:
        return service.principal_from_email(email)
    except KeyError:
        raise HTTPException(status_code=401, detail="unknown user")


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/briefing/{school_id}", response_model=Briefing)
def briefing(school_id: str, authorization: str = Header(default="")) -> dict:
    me = _principal(authorization)
    try:
        return service.get_briefing(me, school_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="unknown school")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.post("/api/report-uneasy", response_model=Ok)
def report_uneasy(body: UneasyReport, authorization: str = Header(default="")) -> dict:
    me = _principal(authorization)
    try:
        return service.report_uneasy(me, body.studentId, body.note)
    except (KeyError, PermissionError) as e:
        raise HTTPException(status_code=403, detail=str(e))


@app.post("/api/publish")
def publish(body: PublishRequest, authorization: str = Header(default="")) -> dict:
    me = _principal(authorization)
    try:
        return service.publish_protocol(me, body.schoolId, body.level,
                                        [a.model_dump() for a in body.actions])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
