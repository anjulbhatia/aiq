"""Analysis endpoint: principal-only bundle, live eval snapshot."""

import unittest

from app import service


def P(role, **kw):
    base = {"id": "t", "role": role, "schoolId": "anand-vihar",
            "children": [], "class": None}
    base.update(kw)
    return base


class Analysis(unittest.TestCase):
    def test_bundle_shape(self):
        a = service.run_analysis(P("principal"), "anand-vihar", day="2026-10-12")
        for k in ("schoolId", "day", "briefing", "urbanForm", "exposure",
                  "model", "eval", "generatedAt"):
            self.assertIn(k, a)
        self.assertEqual(a["urbanForm"]["source"], "curated")
        self.assertIn(a["exposure"]["typical"]["verdict"],
                      ("outdoor-okay", "smooth", "indoor-only"))
        self.assertIn("feels_like", a["exposure"])
        self.assertGreaterEqual(a["eval"]["level_accuracy"], 0.90)
        self.assertTrue(a["model"]["v1_trained"])
        self.assertEqual(a["model"]["v0"], a["briefing"]["level"])

    def test_gated(self):
        with self.assertRaises(PermissionError):
            service.run_analysis(P("teacher", **{"class": "5-B"}), "anand-vihar")
        with self.assertRaises(PermissionError):
            service.run_analysis(P("parent", children=["st-01"]), "anand-vihar")
        with self.assertRaises(KeyError):
            service.run_analysis(P("principal"), "nope")


if __name__ == "__main__":
    unittest.main()
