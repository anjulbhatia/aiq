"""Offline suite: stdlib unittest, no installs. Run: python -m unittest discover -s tests."""

import unittest

from app import protocol, service
from app.authz import Decision, authorize
from app.data import load_regions, load_schools, load_users
from app.pipeline import build_briefing
from app.sources import xkdr


def P(role, **kw):
    base = {"id": "t", "role": role, "schoolId": "anand-vihar", "children": [], "class": None}
    base.update(kw)
    return base


class Seeds(unittest.TestCase):
    def test_ids_match_frontend(self):
        schools = load_schools()
        # Original three match frontend mocks; Delhi AOIs extend the set.
        for sid in ("anand-vihar", "lodhi-road", "rk-puram"):
            self.assertIn(sid, schools)
        for sid in ("st-angels-rohini", "vspk-rohini", "du-campus"):
            self.assertIn(sid, schools)
        ids = [st["id"] for s in schools.values() for st in s["students"]]
        for i in range(1, 7):
            self.assertIn(f"st-0{i}", ids)
        regions = load_regions()
        self.assertEqual(set(regions["2026-10-11"]), set(schools))

    def test_every_student_has_parent(self):
        for s in load_schools().values():
            for st in s["students"]:
                self.assertTrue(st["parents"], st["id"])


class Aqi(unittest.TestCase):
    def test_breakpoints(self):
        self.assertEqual(xkdr.aqi_from_pm(12, 20), 20)
        self.assertTrue(300 < xkdr.aqi_from_pm(218, 305) <= 400)  # seed day ~342
        self.assertTrue(xkdr.aqi_from_pm(500, 600) > 400)

    def test_levels_lockstep_with_frontend(self):
        self.assertEqual([protocol.get_level(a) for a in (50, 128, 250, 342, 450)],
                         ["Good", "Moderate", "Poor", "VeryPoor", "Severe"])


class Briefing(unittest.TestCase):
    def test_join_shape(self):
        b = build_briefing("anand-vihar", day="2026-10-11")
        for k in ("aqi", "pm25", "tempC", "windKph", "canopyDensity",
                  "schoolId", "level", "actions", "reasons", "forecastTomorrow"):
            self.assertIn(k, b)
        self.assertEqual(b["level"], "VeryPoor")
        self.assertEqual(len(b["reasons"]), 3)


class Authz(unittest.TestCase):
    def test_principal_own_school_only(self):
        me = P("principal")
        self.assertEqual(authorize(me, "view-briefing", "school:anand-vihar"), Decision.ALLOW)
        self.assertEqual(authorize(me, "publish-protocol", "school:anand-vihar"), Decision.ALLOW)
        self.assertEqual(authorize(me, "view-briefing", "school:rk-puram"), Decision.DENY)

    def test_teacher_class_scoped_no_school_view(self):
        me = P("teacher", **{"class": "5-B"})
        st = {"id": "st-01", "schoolId": "anand-vihar", "class": "5-B"}
        other = {"id": "st-03", "schoolId": "anand-vihar", "class": "3-A"}
        self.assertEqual(authorize(me, "view-briefing", "school:anand-vihar"), Decision.DENY)
        self.assertEqual(authorize(me, "report-uneasy", "student:st-01",
                                   {"student": st}), Decision.ALLOW)
        self.assertEqual(authorize(me, "report-uneasy", "student:st-03",
                                   {"student": other}), Decision.DENY)

    def test_parent_own_children_only(self):
        me = P("parent", children=["st-01"])
        self.assertEqual(authorize(me, "view-briefing", "school:anand-vihar"), Decision.DENY)
        self.assertEqual(authorize(me, "report-uneasy", "student:st-01"), Decision.ALLOW)
        self.assertEqual(authorize(me, "report-uneasy", "student:st-02"), Decision.DENY)

    def test_service_flows(self):
        me = service.principal_from_email("principal@vidyamandir.edu")
        b = service.get_briefing(me, "anand-vihar")
        self.assertEqual(b["schoolId"], "anand-vihar")
        with self.assertRaises(PermissionError):
            service.get_briefing(service.principal_from_email("parent@example.com"), "anand-vihar")
        self.assertTrue(service.report_uneasy(
            service.principal_from_email("parent@example.com"), "st-01")["ok"])
        with self.assertRaises(PermissionError):
            service.report_uneasy(service.principal_from_email("parent@example.com"), "st-02")
        pub = service.publish_protocol(me, "anand-vihar", "VeryPoor", [])
        self.assertTrue(pub["ok"] and pub["publishedAt"])


if __name__ == "__main__":
    unittest.main()
