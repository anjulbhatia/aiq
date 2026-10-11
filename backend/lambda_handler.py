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
        if method == "GET" and path == "/api/auth/context":
            return _resp(200, service.auth_context(me))
        if method == "POST" and path == "/api/briefing/role":
            return _resp(200, service.run_briefing(me, body["schoolId"], body.get("day")))
        if method == "POST" and path == "/api/daylog":
            return _resp(200, service.log_day(
                me, body["studentId"], body.get("entries", []),
                body.get("unease", False), body.get("note", ""), body.get("date")))
        if method == "GET" and path.startswith("/api/daylog/"):
            sid = path.rsplit("/", 1)[-1]
            out = service.read_daylog(me, sid)
            out["summary"] = service.summarize_day(me, sid)["summary"]
            return _resp(200, out)
        if method == "POST" and path == "/api/query":
            return _resp(200, service.ask(me, body["question"], body.get("schoolId")))
        if method == "GET" and path.startswith("/api/analysis/"):
            school_id = path.rsplit("/", 1)[-1]
            qs = event.get("queryStringParameters") or {}
            return _resp(200, service.run_analysis(me, school_id, qs.get("day")))
        if method == "GET" and path.startswith("/api/history/"):
            school_id = path.rsplit("/", 1)[-1]
            qs = event.get("queryStringParameters") or {}
            return _resp(200, service.get_history(me, school_id, int(qs.get("days", 7))))
        if method == "GET" and path.startswith("/api/attendance/"):
            school_id = path.rsplit("/", 1)[-1]
            return _resp(200, service.get_attendance(me, school_id))
        return _resp(404, {"detail": "not found"})
    except KeyError as e:
        return _resp(404 if "unknown" in str(e) else 401, {"detail": str(e)})
    except PermissionError as e:
        return _resp(403, {"detail": str(e)})
