"""Shared request logic for FastAPI (main.py) and Lambda (lambda_handler.py).

Both transports are thin wrappers here — plain dicts in/out, stdlib only.
"""

from datetime import datetime, timezone

from .authz import Decision, authorize
from .authz.scopes import scopes_for
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


def auth_context(principal: dict) -> dict:
    """UI boot payload: identity + Cedar-derived surfaces and actions."""
    return {"user": {k: principal.get(k) for k in ("id", "role", "schoolId", "class", "children")},
            "scopes": scopes_for(principal.get("role", ""))}


def run_briefing(principal: dict, school_id: str, day: str | None = None) -> dict:
    from .agents import roles
    return roles.run_morning_briefing(principal, school_id, day)


def log_day(principal: dict, student_id: str, entries: list,
            unease: bool = False, note: str = "", date: str | None = None) -> dict:
    from .agents import daylog
    return daylog.log_child_day(principal, student_id, entries, unease, note, date)


def read_daylog(principal: dict, student_id: str) -> dict:
    from .agents import daylog
    return {"studentId": student_id, "entries": daylog.read_day_log(principal, student_id)}


def summarize_day(principal: dict, student_id: str) -> dict:
    from .agents import daylog
    return daylog.summarize_day(principal, student_id)


def ask(principal: dict, question: str, school_id: str | None = None) -> dict:
    from .agents import query
    return query.answer(principal, question, school_id)


def run_analysis(principal: dict, school_id: str, day: str | None = None) -> dict:
    """One-click ML analysis for a school: briefing + urban form + exposure
    verdicts + v0/v1 model read + live eval snapshot. Principal-only
    (school-level detail); everyone else gets 403 and the UI mock fallback."""
    from datetime import date
    from . import exposure, protocol
    from .data import load_regions, load_schools
    from .sources import lulc
    schools = load_schools()
    if school_id not in schools:
        raise KeyError(f"unknown school {school_id}")
    if authorize(principal, "view-briefing", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not analyze {school_id}")
    briefing = build_briefing(school_id, day)
    urban = lulc.for_school(schools[school_id])
    typical = exposure.assess(briefing)
    sensitive = exposure.assess(briefing, sensitive=True)
    regions = load_regions()
    day_key = day or max(regions)
    prev_days = sorted(d for d in regions if d < day_key)
    prev_aqi = (regions[prev_days[-1]].get(school_id, {}).get("aqi")
                if prev_days else briefing["aqi"])
    try:
        from . import model_v1 as _v1
        v1_level = _v1.predict_level_v1({"aqi": briefing["aqi"]}, float(prev_aqi))
        v1_on = True
    except RuntimeError:
        v1_level, v1_on = briefing["level"], False
    from . import eval as _eval
    snap = _eval.run(n=300, seed=7)
    return {
        "schoolId": school_id,
        "day": day_key,
        "briefing": briefing,
        "urbanForm": {**urban, "source": "curated"},
        "exposure": {
            "typical": {"verdict": typical["verdict"], "day_ahead": typical["day_ahead"],
                        "dose_ug": typical["dose_ug"],
                        "max_outdoor_h": exposure.max_outdoor_hours(
                            float(briefing["pm25"]), 10)},
            "sensitive": {"verdict": sensitive["verdict"],
                          "max_outdoor_h": exposure.max_outdoor_hours(
                              float(briefing["pm25"]), 10, sensitive=True)},
            "feels_like": typical["feels_like"],
            "visibility_km": typical["visibility_km"],
            "guidance": typical["guidance"],
        },
        "model": {"v0": briefing["level"], "v1": v1_level, "v1_trained": v1_on,
                  "agree": v1_level == briefing["level"]},
        "eval": {"n": snap["n"], "seed": snap["seed"],
                 "level_accuracy": snap["level_accuracy"],
                 "verdict_stability": snap["verdict_stability"]},
        "generatedAt": date.today().isoformat(),
    }


def get_history(principal: dict, school_id: str, days: int = 7) -> dict:
    """Trailing daily AQI + child-dose series for the 7-day exposure view.

    Reads the regions store (pipeline output or seed); returns whatever is
    stored up to `days`, oldest first. Frontend falls back to seeded mocks
    when the store is shorter than requested.
    """
    from . import exposure, protocol
    from .data import load_regions, load_schools
    if school_id not in load_schools():
        raise KeyError(f"unknown school {school_id}")
    if authorize(principal, "view-briefing", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not view {school_id}")
    regions = load_regions()
    keys = sorted(regions)[-max(1, days):]
    out = []
    for day in keys:
        entry = regions.get(day, {}).get(school_id)
        if not entry:
            continue
        out.append({
            "date": day,
            "aqi": entry["aqi"],
            "pm25": entry["pm25"],
            "pm10": entry["pm10"],
            "level": protocol.get_level(int(entry["aqi"])),
            "doseUg": exposure.inhaled_dose_ug(
                float(entry["pm25"]), hours=6.0,
                rate_m3h=exposure.BREATHING["child"]["light"]),
        })
    return {"schoolId": school_id, "days": out}


def get_attendance(principal: dict, school_id: str) -> dict:
    """Demo roster attendance: trailing 7-day present flags per person.

    Deterministic per id (hash-derived) so both transports agree; the daily
    job will replace this with the real register post-hackathon.
    """
    import hashlib
    from datetime import date, timedelta
    from .data import load_schools
    schools = load_schools()
    if school_id not in schools:
        raise KeyError(f"unknown school {school_id}")
    if authorize(principal, "view-briefing", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not view {school_id}")

    def week(seed: str) -> list[bool]:
        h = int(hashlib.md5(seed.encode()).hexdigest(), 16)
        # ~1 absent day in 7; bit-derived so stable per id.
        return [((h >> (3 * i)) % 7) != 0 for i in range(7)]

    school = schools[school_id]
    today = date.today()
    dates = [(today - timedelta(days=6 - i)).isoformat() for i in range(7)]
    teachers = [{"id": t["id"], "name": t["name"],
                 "className": t.get("class", ""),
                 "week": week(f"te:{t['id']}")}
                for t in school.get("teachers", [])]
    students = [{"id": s["id"], "name": s["name"],
                 "className": s.get("class", s.get("className", "")),
                 "week": week(f"st:{s['id']}")}
                for s in school.get("students", [])]
    return {"schoolId": school_id, "dates": dates,
            "teachers": teachers, "students": students}


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
