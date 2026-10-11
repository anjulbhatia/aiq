"""The 90% gate, enforced. Also guards the adjacent-only confusion property."""

import unittest

from app import eval as ev


class Gate(unittest.TestCase):
    def test_clear_rate(self):
        r = ev.run(n=500, seed=7)
        self.assertGreaterEqual(r["level_accuracy"], 0.90)
        self.assertGreaterEqual(r["verdict_stability"], 0.90)

    def test_no_level_jumps(self):
        r = ev.run(n=500, seed=7)
        order = ["Good", "Moderate", "Poor", "VeryPoor", "Severe"]
        for t, row in r["confusion"].items():
            for p, c in row.items():
                if c:
                    self.assertLessEqual(abs(order.index(t) - order.index(p)), 1,
                                         f"{t}->{p} jump")


if __name__ == "__main__":
    unittest.main()
