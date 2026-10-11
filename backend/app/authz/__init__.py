"""Cedar authorization: principals, teachers, students, parents.

Rules (user-locked):
- Teachers/students/parents may NOT view school-level details
  (briefing publish surface, full student roster) outside their scope.
- Parents may view ONLY their own children — never other parents/students.
- Teachers see their class; principals see their school; authority sees all.

Prod path: Amazon Verified Permissions with the schema + policies below.
Local path (this file): pure-python mirror of policies.cedar, zero new deps,
imported by service.py. Any drift fails tests/test_authz.py — fix policy AND
mirror together.
"""

from enum import Enum

ROLES = ("principal", "teacher", "parent", "student", "authority")


class Decision(Enum):
    ALLOW = "Allow"
    DENY = "Deny"


def authorize(principal: dict, action: str, resource: str, context: dict | None = None) -> Decision:
    """principal {id, role, schoolId, children[], class}; resource school:<id> | student:<id>."""
    ctx = context or {}
    role = principal.get("role")
    kind, _, rid = resource.partition(":")

    if role == "authority":
        return Decision.ALLOW
    if role == "principal":
        if action == "view-briefing" and kind == "school":
            return Decision.ALLOW if principal.get("schoolId") == rid else Decision.DENY
        if action == "publish-protocol" and kind == "school":
            return Decision.ALLOW if principal.get("schoolId") == rid else Decision.DENY
        return Decision.DENY
    if role == "teacher":
        if action == "view-briefing":
            return Decision.DENY  # school-level detail: principals only
        if action == "report-uneasy" and kind == "student":
            st = ctx.get("student", {})
            if st.get("schoolId") == principal.get("schoolId") and st.get("class") == principal.get("class"):
                return Decision.ALLOW
            return Decision.DENY
        return Decision.DENY
    if role in ("parent", "student"):
        if action == "view-briefing":
            return Decision.DENY
        if action == "report-uneasy" and kind == "student":
            if rid in (principal.get("children") or []):
                return Decision.ALLOW
            return Decision.DENY
        return Decision.DENY
    return Decision.DENY
