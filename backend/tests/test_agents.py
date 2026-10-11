"""Role agents, day-log, query, scopes, Cedar file validity."""

import tempfile
import unittest
from pathlib import Path

from app import service
from app.agents import daylog, query, roles
from app.authz.scopes import scopes_for
from app.config import settings


def P(role, **kw):
    base = {"id": "t", "role": role, "schoolId": "anand-vihar",
            "children": [], "class": None}
    base.update(kw)
    return base


class Scopes(unittest.TestCase):
    def test_teacher_cannot_see_school_detail(self):
        self.assertNotIn("view-briefing", scopes_for("teacher")["actions"])
        self.assertIn("run-briefing", scopes_for("teacher")["actions"])
        self.assertIn("publish-protocol", scopes_for("principal")["actions"])
        self.assertNotIn("publish-protocol", scopes_for("parent")["actions"])

    def test_auth_context_shape(self):
        ctx = service.auth_context(P("teacher", **{"class": "5-B"}))
        self.assertEqual(ctx["user"]["role"], "teacher")
        self.assertIn("class_roster", ctx["scopes"]["surfaces"])


class RoleContexts(unittest.TestCase):
    def test_teacher_class_scoped(self):
        ctx = roles.build_context(P("teacher", **{"class": "5-B"}), "anand-vihar")
        self.assertEqual(ctx["class"], "5-B")
        self.assertTrue(ctx["students"])
        self.assertTrue(all(s["class"] == "5-B" for s in ctx["students"]))
        self.assertIn("max_outdoor_h", ctx["students"][0])

    def test_parent_own_children_only(self):
        ctx = roles.build_context(P("parent", children=["st-01"]), "anand-vihar")
        self.assertEqual([c["id"] for c in ctx["children"]], ["st-01"])

    def test_student_card_simplified(self):
        ctx = roles.build_context(P("student", children=["st-01"]), "anand-vihar")
        card = ctx["children"][0]
        self.assertNotIn("flags", card)
        self.assertNotIn("max_outdoor_h", card)
        self.assertIn("verdict", card)

    def test_cross_school_denied(self):
        with self.assertRaises(PermissionError):
            roles.build_context(P("principal", schoolId="rk-puram"), "anand-vihar")
        with self.assertRaises(PermissionError):
            roles.build_context(P("parent", children=["st-01"]), "rk-puram")


class RoleNotes(unittest.TestCase):
    def test_fallback_notes_carry_scope(self):
        pr = service.run_briefing(P("principal"), "anand-vihar", day="2026-10-11")
        self.assertIn("anand-vihar", pr["note"])
        te = service.run_briefing(P("teacher", **{"class": "5-B"}), "anand-vihar",
                                  day="2026-10-11")
        self.assertIn("5-B", te["note"])
        pa = service.run_briefing(P("parent", children=["st-01"]), "anand-vihar",
                                  day="2026-10-11")
        self.assertIn("Aarav", pa["note"])


class Daylog(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old = settings.data_dir
        settings.data_dir = Path(self.tmp.name)

    def tearDown(self):
        settings.data_dir = self.old
        self.tmp.cleanup()

    def test_teacher_and_parent_scoping(self):
        te = P("teacher", **{"class": "5-B"})
        self.assertTrue(service.log_day(te, "st-01", ["normal day"])["ok"])
        with self.assertRaises(PermissionError):
            service.log_day(te, "st-03", ["x"])
        pa = P("parent", children=["st-01"])
        self.assertTrue(service.log_day(pa, "st-01", ["good evening"])["ok"])
        with self.assertRaises(PermissionError):
            service.log_day(pa, "st-02", ["x"])
        with self.assertRaises(PermissionError):
            service.log_day(P("student", children=["st-01"]), "st-01", ["x"])
        entries = service.read_daylog(pa, "st-01")["entries"]
        self.assertEqual(len(entries), 2)
        with self.assertRaises(PermissionError):
            service.read_daylog(pa, "st-02")
        summ = service.summarize_day(te, "st-01")["summary"]
        self.assertIn("st-01", summ)


class Query(unittest.TestCase):
    def test_fallback_answers_from_scope(self):
        pa = P("parent", children=["st-01"])
        a = service.ask(pa, "what is the aqi today", "anand-vihar")["answer"]
        self.assertIn("342", a)
        self.assertEqual(service.ask(pa, "should we worry", "anand-vihar")["scoped_as"], "parent")
        with self.assertRaises(PermissionError):
            service.ask({"id": "x", "role": "ghost"}, "hi", "anand-vihar")


class CedarFile(unittest.TestCase):
    def test_agent_policies_parse(self):
        from strands.vended_interventions.cedar import CedarAuthorization
        cedar = CedarAuthorization(
            policies=str(Path(settings.data_dir).parent / "app" / "authz" / "agent.cedar"),
            tools=[{"name": n, "inputSchema": {"type": "object"}} for n in
                   ("read_briefing", "read_class_roster", "read_child",
                    "write_daylog", "publish_protocol", "ask_question")],
            principal_resolver=lambda s: {"type": "User", "id": "t"},
            context_enricher=lambda c: {"role": "teacher"},
        )
        self.assertIsNotNone(cedar)


if __name__ == "__main__":
    unittest.main()
