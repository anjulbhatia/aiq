"""End-to-end demo: boots uvicorn, runs the three happy paths over HTTP.

Flows (mirrors ignore/Todo.md 3.7):
  principal: briefing -> publish -> 200 + publishedAt
  teacher:   own-class uneasy -> ok; other-class -> 403
  parent:    briefing -> 403 (no school-level reads); own child -> ok;
             other child -> 403
Also asserts the briefing JSON matches the frozen frontend contract keys.

Run: python -m jobs.demo_e2e [--port 8099]
Needs: pip install -e . (fastapi, uvicorn). stdlib HTTP client.
"""

import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request

CONTRACT = {"schoolId", "aqi", "pm25", "pm10", "tempC", "windKph", "windDir",
            "precipProb", "humidity", "canopyDensity", "builtUpRatio",
            "smogTrapIndex", "level", "actions", "reasons",
            "forecastTomorrow", "generatedAt"}
PRINCIPAL = "principal@vidyamandir.edu"
TEACHER = "teacher@vidyamandir.edu"  # class 5-B
PARENT = "parent@example.com"        # child st-01 (5-B)


def call(base, method, path, email="", body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base + path, data=data, method=method,
                                 headers={"Authorization": f"Bearer {email}",
                                          "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, json.loads(res.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, {}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", default="8099")
    port = ap.parse_args().port
    base = f"http://localhost:{port}"
    srv = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--port", port],
        cwd=".", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    checks: list[tuple[str, bool]] = []
    try:
        for _ in range(100):
            s, _ = call(base, "GET", "/health")
            if s == 200:
                break
            time.sleep(0.2)
        else:
            return fail("server never healthy", checks, srv)

        s, b = call(base, "GET", "/api/briefing/anand-vihar", PRINCIPAL)
        checks.append(("principal briefing 200", s == 200))
        checks.append(("briefing matches contract", s == 200 and CONTRACT <= set(b)))
        print(f"  briefing: {b.get('level')} AQI {b.get('aqi')}")
        s, p = call(base, "POST", "/api/publish", PRINCIPAL,
                    {"schoolId": "anand-vihar", "level": b.get("level", "VeryPoor"), "actions": []})
        checks.append(("principal publish 200+ts", s == 200 and "publishedAt" in p))

        s, _ = call(base, "POST", "/api/report-uneasy", TEACHER,
                    {"studentId": "st-01", "note": "coughing after break"})
        checks.append(("teacher own-class uneasy ok", s == 200))
        s, _ = call(base, "POST", "/api/report-uneasy", TEACHER, {"studentId": "st-03"})
        checks.append(("teacher other-class 403", s == 403))

        s, _ = call(base, "GET", "/api/briefing/anand-vihar", PARENT)
        checks.append(("parent briefing denied 403", s == 403))
        s, _ = call(base, "POST", "/api/report-uneasy", PARENT, {"studentId": "st-01"})
        checks.append(("parent own-child ok", s == 200))
        s, _ = call(base, "POST", "/api/report-uneasy", PARENT, {"studentId": "st-02"})
        checks.append(("parent other-child 403", s == 403))

        s, _ = call(base, "GET", "/api/briefing/nope", PRINCIPAL)
        checks.append(("unknown school 404", s == 404))

        s, c = call(base, "GET", "/api/auth/context", TEACHER)
        checks.append(("scopes omit view-briefing", s == 200
                       and "view-briefing" not in c["scopes"]["actions"]))
        s, rb = call(base, "POST", "/api/briefing/role", PRINCIPAL,
                     {"schoolId": "anand-vihar"})
        checks.append(("principal role briefing", s == 200 and "anand-vihar" in rb["note"]))
        s, rb = call(base, "POST", "/api/briefing/role", TEACHER, {"schoolId": "anand-vihar"})
        checks.append(("teacher role briefing class-scoped", s == 200 and "5-B" in rb["note"]))
        s, _ = call(base, "POST", "/api/briefing/role", PARENT, {"schoolId": "rk-puram"})
        checks.append(("parent cross-school denied", s == 403))

        s, _ = call(base, "POST", "/api/daylog", TEACHER,
                    {"studentId": "st-01", "entries": ["demo day"], "unease": False})
        checks.append(("teacher daylog write", s == 200))
        s, dl = call(base, "GET", "/api/daylog/st-01", PARENT)
        checks.append(("parent daylog read+summary", s == 200 and "st-01" in dl["summary"]))
        s, _ = call(base, "GET", "/api/daylog/st-02", PARENT)
        checks.append(("parent other-child log denied", s == 403))

        s, q = call(base, "POST", "/api/query", PARENT,
                    {"question": "what is the aqi today", "schoolId": "anand-vihar"})
        checks.append(("parent query scoped answer", s == 200 and "AQI" in q["answer"]))
    finally:
        srv.terminate()
    bad = [name for name, ok in checks if not ok]
    for name, ok in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    print("E2E " + ("PASS" if not bad else f"FAIL: {bad}"))
    return 0 if not bad else 1


def fail(msg, checks, srv):
    srv.terminate()
    print("E2E FAIL:", msg)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
