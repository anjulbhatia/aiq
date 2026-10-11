"""AWS Lambda entrypoint (API Gateway HTTP API, payload 2.0).

Same service.py logic as FastAPI — no FastAPI import here, stdlib only.
Amplify hosts the Next.js frontend; this module is the backend function.
Deploy: zip backend/, handler lambda_handler.handler, env AIQ_* paths.
"""

import json

from app import service


def _resp(status: int, body: dict) -> dict:
    return {"statusCode": status, "headers": {"Content-Type": "application/json"},
            "body": json.dumps(body)}


def _me(event: dict) -> dict:
    email = event.get("headers", {}).get("authorization", "").removeprefix("Bearer ").strip()
    return service.principal_from_email(email)


def handler(event: dict, context=None) -> dict:  # noqa: ARG001
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("requestContext", {}).get("http", {}).get("path", "")
    try:
        if method == "GET" and path == "/health":
            return _resp(200, {"ok": True})
        me = _me(event)
        if method == "GET" and path.startswith("/api/briefing/"):
            school_id = path.rsplit("/", 1)[-1]
            return _resp(200, service.get_briefing(me, school_id))
        body = json.loads(event.get("body") or "{}")
        if method == "POST" and path == "/api/report-uneasy":
            return _resp(200, service.report_uneasy(me, body["studentId"], body.get("note", "")))
        if method == "POST" and path == "/api/publish":
            return _resp(200, service.publish_protocol(
                me, body["schoolId"], body["level"], body.get("actions", [])))
        return _resp(404, {"detail": "not found"})
    except KeyError as e:
        return _resp(404 if "unknown" in str(e) else 401, {"detail": str(e)})
    except PermissionError as e:
        return _resp(403, {"detail": str(e)})
