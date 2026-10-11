"""Day-log agent: the child's day at school, unease, specifics for the teacher.

Writes go through service authorize (log-day) AND the Strands Cedar gate on
the write_daylog tool — teacher own class, parent own child, principal own
school, students never write. Store: backend/data/daylog.json (gitignored),
seeded from examples/daylog.json so new AOI schools open with history.
"""

import json

from ..authz import Decision, authorize
from ..config import settings
from ..data import load_schools

SEED = settings.data_dir.parent.parent / "examples" / "daylog.json"


def _store() -> dict:
    path = settings.data_dir / "daylog.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    if SEED.exists():
        return json.loads(SEED.read_text(encoding="utf-8"))
    return {}


def _save(store: dict) -> None:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    path = settings.data_dir / "daylog.json"
    path.write_text(json.dumps(store, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _student(school_id: str, student_id: str) -> dict:
    for sid, school in load_schools().items():
        if school_id and sid != school_id:
            continue
        for st in school["students"]:
            if st["id"] == student_id:
                return {**st, "schoolId": sid}
    raise KeyError(f"unknown student {student_id}")


def log_child_day(principal: dict, student_id: str, entries: list[str],
                  unease: bool = False, note: str = "", date: str | None = None) -> dict:
    st = _student(principal.get("schoolId") or "", student_id)
    if authorize(principal, "log-day", f"student:{student_id}",
                 context={"student": st}) != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not log {student_id}")
    from datetime import date as _d
    day = date or _d.today().isoformat()
    store = _store()
    store.setdefault(student_id, []).append(
        {"date": day, "entries": entries, "unease": unease,
         "note": note, "by": principal.get("id")})
    _save(store)
    return {"ok": True, "studentId": student_id, "date": day}


def read_day_log(principal: dict, student_id: str) -> list[dict]:
    st = _student("", student_id)
    if authorize(principal, "read-daylog", f"student:{student_id}",
                 context={"student": st}) != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not read {student_id}")
    return _store().get(student_id, [])


def latest(student_id: str) -> dict | None:
    logs = _store().get(student_id, [])
    return logs[-1] if logs else None


SYSTEM = ("You summarize a child's school day for their teacher in 3 sentences: "
          "what happened, any unease or specifics raised, what to watch tomorrow.")


def summarize_day(principal: dict, student_id: str) -> dict:
    logs = read_day_log(principal, student_id)
    if not logs:
        return {"studentId": student_id, "summary": "No entries yet this term."}
    last = logs[-1]
    prompt = f"Summarize {student_id}'s day {last['date']}: {last['entries']}. Unease: {last['unease']}. Note: {last['note']}"
    try:
        from .briefing_agent import run_with_tools
        from strands import tool as _tool

        @_tool
        def write_daylog(student_id: str, class_: str = "") -> str:
            """Re-read the scoped day log for a student."""
            return json.dumps(read_day_log(principal, student_id))

        summary = run_with_tools(
            SYSTEM, prompt, [write_daylog],
            {"user_id": principal.get("id"), "role": principal.get("role"),
             "school_id": principal.get("schoolId"), "class": principal.get("class"),
             "children": principal.get("children") or [], "environment": "prod"})
    except Exception:
        summary = (f"{student_id} on {last['date']}: "
                   f"{'; '.join(last['entries']) or 'routine day'}. "
                   f"{'Unease flagged — ' + last['note'] if last['unease'] else 'No unease. '}"
                   f"Logged by {last['by']}.")
    return {"studentId": student_id, "summary": summary}
