"""Role morning-briefing agents (Strands SDK, Bedrock default).

One agent per role, each seeing ONLY its Cedar-scoped context:
- principal: whole school (briefing, per-class risk, publish state)
- teacher: her class, with dedicated per-student context (conditions, status,
  dose guidance, latest day-log)
- parent: own children cards (status, verdict, guidance, feels-like)
- student: own simplified card
- authority: all-schools summary

Enforcement is two-deep: service.authorize() gates the call AND the Strands
CedarAuthorization intervention gates every tool call inside the loop
(policies in app/authz/agent.cedar, role/session forwarded via
invocation_state). Tools are closures over already-scoped data, so even a
misbehaving model cannot reach outside. Without AWS creds every runner falls
back to a deterministic template over the same scoped facts.
"""

from . import briefing_agent
from .. import exposure
from ..authz import Decision, authorize
from ..data import load_schools
from ..pipeline import build_briefing
from .daylog import latest as daylog_latest

SYSTEM = {
    "principal": ("You brief a school principal in 4 sentences: protocol + why, "
                  "highest-risk class, publish reminder. Calm, decisive."),
    "teacher": ("You brief a teacher about HER class only, student by student: "
                "who needs watching and the one action per child. Warm, concrete."),
    "parent": ("You brief a parent about THEIR children only: status, today's "
               "verdict, what to pack/do. Reassuring, specific."),
    "student": ("You tell a student in 2 simple sentences whether outdoor play "
                "is okay today and one thing to remember."),
    "authority": ("You summarize all schools in 4 sentences for an official: "
                  "worst areas, trend, actions taken."),
}


def build_context(principal: dict, school_id: str, day: str | None = None) -> dict:
    """Cedar-checked scoped facts. Raises PermissionError outside scope."""
    if authorize(principal, "run-briefing", f"school:{school_id}") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not brief {school_id}")
    role = principal["role"]
    schools = load_schools()
    if role == "authority":
        out = {}
        for sid in schools:
            try:
                out[sid] = _school_card(schools[sid], day)
            except KeyError:
                continue
        return {"role": role, "schools": out}
    school = schools[school_id]
    briefing = build_briefing(school_id, day)
    if role == "principal":
        return {"role": role, "briefing": briefing, "classes": _classes(school, briefing)}
    if role == "teacher":
        roster = [s for s in school["students"] if s["class"] == principal.get("class")]
        return {"role": role, "class": principal.get("class"),
                "briefing": _briefing_public(briefing),
                "students": [_student_card(s, school_id, briefing) for s in roster]}
    kids = [s for s in school["students"] if s["id"] in (principal.get("children") or [])]
    cards = [_student_card(s, school_id, briefing) for s in kids]
    if role == "student":
        cards = [{k: c[k] for k in ("name", "status", "verdict", "remember") if k in c}
                 for c in cards]
    return {"role": role, "children": cards,
            "briefing": _briefing_public(briefing)}


def _briefing_public(b: dict) -> dict:
    return {k: b[k] for k in ("aqi", "level", "tempC", "windKph", "windDir",
                              "forecastTomorrow")}


def _school_card(school: dict, day: str | None) -> dict:
    b = build_briefing(school["id"], day)
    return {"aqi": b["aqi"], "level": b["level"], "students": len(school["students"]),
            "uneasy": sum(1 for s in school["students"] if s["status"] == "uneasy")}


def _classes(school: dict, briefing: dict) -> dict:
    out: dict[str, dict] = {}
    for s in school["students"]:
        c = out.setdefault(s["class"], {"count": 0, "uneasy": 0, "sensitive": 0})
        c["count"] += 1
        c["uneasy"] += s["status"] == "uneasy"
        c["sensitive"] += bool(s["flags"] if "flags" in s else s.get("conditions"))
    for c in out.values():
        c["verdict"] = exposure.assess(
            briefing, sensitive=c["sensitive"] > 0)["verdict"]
    return out


def _student_card(s: dict, school_id: str, briefing: dict) -> dict:
    flags = s.get("flags", s.get("conditions", []))
    sensitive = bool(flags)
    a = exposure.assess(briefing, sensitive=sensitive)
    return {"id": s["id"], "name": s["name"], "class": s["class"],
            "status": s["status"], "flags": flags,
            "verdict": a["verdict"], "day_ahead": a["day_ahead"],
            "max_outdoor_h": exposure.max_outdoor_hours(
                float(briefing["pm25"]), 10, sensitive=sensitive),
            "remember": a["guidance"][0] if a["guidance"] else "",
            "latest_log": daylog_latest(s["id"])}


def run_morning_briefing(principal: dict, school_id: str, day: str | None = None) -> dict:
    ctx = build_context(principal, school_id, day)
    role = principal["role"]
    prompt = (f"Morning briefing for {role} "
              f"({principal.get('id')}) at {school_id}. Facts: {ctx}")
    try:
        note = briefing_agent.run_with_tools(
            system=SYSTEM[role], prompt=prompt, extra_tools=_ctx_tools(ctx),
            state=_invocation_state(principal))
    except Exception:
        note = _template(ctx, school_id)
    return {"role": role, "schoolId": school_id, "note": note}


def _invocation_state(principal: dict) -> dict:
    return {"user_id": principal.get("id"), "role": principal.get("role"),
            "school_id": principal.get("schoolId"), "class": principal.get("class"),
            "children": principal.get("children") or [], "environment": "prod"}


def _ctx_tools(ctx: dict) -> list:
    from strands import tool as _tool

    @_tool
    def read_briefing(school_id: str) -> dict:
        """Return the scoped briefing facts for a school."""
        return ctx.get("briefing", ctx.get("schools", {}).get(school_id, {}))

    @_tool
    def read_class_roster(class_: str) -> list:
        """Return students of one class (teacher's own class only)."""
        return [s for s in ctx.get("students", []) if s.get("class") == class_]

    @_tool
    def read_child(student_id: str) -> dict:
        """Return one scoped student card."""
        pool = ctx.get("students", []) + ctx.get("children", [])
        return next((s for s in pool if s.get("id") == student_id), {})

    return [read_briefing, read_class_roster, read_child]


def _template(ctx: dict, school_id: str) -> str:
    role = ctx["role"]
    if role == "authority":
        worst = sorted(ctx["schools"].items(), key=lambda kv: kv[1]["aqi"], reverse=True)[:2]
        return ("Region check: " + "; ".join(f"{sid} {v['level']} ({v['aqi']})" for sid, v in worst)
                + ". Watchlist set for tomorrow's briefing.")
    b = ctx.get("briefing", {})
    if role == "principal":
        hot = sorted(ctx["classes"].items(), key=lambda kv: -kv[1]["uneasy"])
        top = hot[0][0] if hot else "-"
        return (f"{school_id}: {b.get('level')} at AQI {b.get('aqi')}. "
                f"Highest watch: class {top}. Publish today's protocol before assembly.")
    if role == "teacher":
        names = ", ".join(f"{s['name']} ({s['verdict']})" for s in ctx.get("students", []))
        return (f"Class {ctx.get('class')}: AQI {b.get('aqi')}. {names}. "
                "Keep sensitive kids in for exertion; log anything odd.")
    kids = "; ".join(f"{c.get('name', 'you')}: {c.get('verdict', 'smooth')}"
                     for c in ctx.get("children", [])) or "steady day"
    if role == "student":
        return f"Today: {kids}. {b.get('level', '')} air — play smart, tell teacher if wheezy."
    return (f"Your children: {kids}. AQI {b.get('aqi')} ({b.get('level')}); "
            f"tomorrow {b.get('forecastTomorrow', {}).get('level', '')}. Pack masks if advised.")
