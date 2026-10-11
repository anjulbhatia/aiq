"""Morning-briefing agent (Strands Agents SDK, Bedrock default).

Prod: pip install strands-agents, AWS creds + Bedrock model access, then
generate_briefing_note() calls the agent with two tools (read briefing data,
publish draft). Local/demo without creds: deterministic template fallback —
same inputs, same shape, zero network.

Deploy: same module runs on Lambda (see lambda_handler.py) per the Strands
Lambda deploy guide; agent constructed per-invocation, no shared state.
"""

from pathlib import Path

from ..pipeline import build_briefing

AGENT_POLICIES = str(Path(__file__).resolve().parent.parent / "authz" / "agent.cedar")


def run_with_tools(system: str, prompt: str, extra_tools: list, state: dict) -> str:
    """One Strands loop with the Cedar tool-gate. Raises without creds (caller falls back).

    Identity + role flow: principal_resolver turns invocation_state into the
    Cedar principal; context_enricher forwards role/school/class/children so
    agent.cedar permits exactly the caller's scope. Fail-closed throughout.
    """
    from strands import Agent
    from strands.vended_interventions.cedar import CedarAuthorization

    defs = [{"name": getattr(t, "__name__", "tool"),
             "inputSchema": {"type": "object"}} for t in extra_tools]
    cedar = CedarAuthorization(
        policies=AGENT_POLICIES,
        tools=defs,
        principal_resolver=lambda s: ({"type": "User", "id": str(s["user_id"])}
                                      if s.get("user_id") else None),
        context_enricher=lambda c: {
            "role": c["invocation_state"].get("role", "none"),
            "school_id": c["invocation_state"].get("school_id", ""),
            "class": c["invocation_state"].get("class") or "",
            "children": c["invocation_state"].get("children") or [],
            "environment": c["invocation_state"].get("environment", "unknown"),
        },
    )
    agent = Agent(system_prompt=system, tools=extra_tools, interventions=[cedar])
    return str(agent(prompt, invocation_state=state))

SYSTEM = (
    "You write the principal's 3-sentence morning air-quality note. "
    "Sentence 1: AQI + level + key pollutant. Sentence 2: what changes today "
    "(PE, masks, windows). Sentence 3: when to reassess. Calm, no jargon."
)


def generate_briefing_note(school_id: str, day: str | None = None) -> str:
    briefing = build_briefing(school_id, day)
    try:
        return _agent_note(briefing)
    except Exception:
        return _template_note(briefing)


def _agent_note(briefing: dict) -> str:
    from strands import Agent, tool  # pip install strands-agents (optional dep)

    @tool
    def briefing_data() -> dict:
        """Return the computed briefing (AQI, weather, urban form, protocol)."""
        return briefing

    agent = Agent(system_prompt=SYSTEM, tools=[briefing_data])
    result = agent(
        f"Write the morning note for {briefing['schoolId']}: "
        f"AQI {briefing['aqi']}, {briefing['level']}, "
        f"wind {briefing['windKph']} kph {briefing['windDir']}, "
        f"actions {briefing['actions']}."
    )
    return str(result)


def _template_note(b: dict) -> str:
    return (
        f"AQI {b['aqi']} ({b['level']}) with {b['windKph']} kph {b['windDir']} wind "
        f"is trapping PM2.5 near ground level. "
        f"Today: {', '.join(a['label'] for a in b['actions'][:3])}. "
        f"Reassess after 2pm; tomorrow reads {b['forecastTomorrow']['aqi']} AQI."
    )
