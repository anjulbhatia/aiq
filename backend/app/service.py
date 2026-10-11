"""Shared request logic for FastAPI (main.py) and Lambda (lambda_handler.py).

Both transports are thin wrappers here — plain dicts in/out, stdlib only.
"""

from datetime import datetime, timezone

from .authz import Decision, authorize
from .data import load_schools, load_users
from .pipeline import build_briefing

UNEASY_LOG: list[dict] = []
PUBLISH_LOG: list[dict] = []


def get_briefing(principal: dict, school_id: str) -> dict:
    if school_id not in load_schools():
        raise KeyError(f"unknown school {school_id}")
    if authorize(principal, "view-briefing", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not view {school_id}")
    return build_briefing(school_id)


def report_uneasy(principal: dict, student_id: str, note: str = "") -> dict:
    student = _find_student(student_id)
    if authorize(principal, "report-uneasy", f"student:{student_id}",
                 context={"student": student}) != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not report {student_id}")
    entry = {"studentId": student_id, "note": note,
             "by": principal.get("id"), "at": _now()}
    UNEASY_LOG.append(entry)
    return {"ok": True}


def publish_protocol(principal: dict, school_id: str, level: str, actions: list) -> dict:
    if authorize(principal, "publish-protocol", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not publish for {school_id}")
    entry = {"schoolId": school_id, "level": level, "actions": actions,
             "by": principal.get("id"), "publishedAt": _now()}
    PUBLISH_LOG.append(entry)
    # Mock parent push: real fan-out (SNS) lands here post-hackathon.
    print(f"[publish] {school_id} {level} -> parents (mock push)")
    return {"ok": True, "publishedAt": entry["publishedAt"]}


def _find_student(student_id: str) -> dict:
    for school in load_schools().values():
        for st in school["students"]:
            if st["id"] == student_id:
                return {**st, "schoolId": school["id"]}
    raise KeyError(f"unknown student {student_id}")


def principal_from_email(email: str) -> dict:
    for u in load_users():
        if u["email"] == email:
            return {"id": u["id"], "role": u["role"], "schoolId": u.get("schoolId"),
                    "children": u.get("children", []), "class": u.get("class")}
    raise KeyError(f"unknown user {email}")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
