"""UI scopes: what each role may see and do in the frontend.

Served by GET /api/auth/context. The UI gates surfaces on `surfaces` and
buttons on `actions`; the backend re-enforces every action in service.py, so
a tampered client gains nothing. Mirror of policies.cedar, same drift rule.
"""

UI_SCOPES: dict[str, dict[str, list[str]]] = {
    "principal": {
        "surfaces": ["briefing_sheet", "publish", "roster", "map", "exposure",
                      "daylog_read", "query"],
        "actions": ["view-briefing", "run-briefing", "publish-protocol",
                    "report-uneasy", "log-day", "read-daylog", "query"],
    },
    "teacher": {
        "surfaces": ["class_roster", "uneasy", "daylog_write", "daylog_read",
                      "map", "exposure", "query"],
        "actions": ["run-briefing", "report-uneasy", "log-day",
                    "read-daylog", "query"],
    },
    "parent": {
        "surfaces": ["child_card", "uneasy", "daylog_read", "map",
                      "exposure", "query"],
        "actions": ["run-briefing", "report-uneasy", "log-day",
                    "read-daylog", "query"],
    },
    "student": {
        "surfaces": ["my_card", "map", "query"],
        "actions": ["run-briefing", "report-uneasy", "read-daylog", "query"],
    },
    "authority": {
        "surfaces": ["all"],
        "actions": ["view-briefing", "run-briefing", "publish-protocol",
                    "report-uneasy", "log-day", "read-daylog", "query"],
    },
}


def scopes_for(role: str) -> dict[str, list[str]]:
    return UI_SCOPES.get(role, {"surfaces": [], "actions": []})
