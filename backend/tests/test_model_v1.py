"""v1 gate: fitted per-band shrinkage beats the rule on two holdout seeds."""

import os
import unittest

from app import model_v1, protocol
from jobs import train_v1


class V1(unittest.TestCase):
    def test_weights_shape(self):
        m = model_v1.load()
        self.assertIsNotNone(m)
        assert m is not None
        self.assertEqual(len(m["alphas"]), 5)
        self.assertTrue(all(0.3 <= a <= 1.0 for a in m["alphas"]))

    def test_beats_rule_two_seeds(self):
        m = model_v1.load()
        assert m is not None
        for seed in (7, 8):
            _, _, _, hold = train_v1.dataset(2000, seed=seed, noise=0.10)
            rule = train_v1.accuracy(hold, use_v1=False)
            v1 = train_v1.accuracy(hold, use_v1=True, alphas=m["alphas"])
            self.assertGreater(v1, rule, f"seed {seed}: v1={v1} rule={rule}")

    def test_flag_path_sane(self):
        os.environ["AIQ_MODEL_V1"] = "1"
        try:
            self.assertTrue(model_v1.active())
            lvl = protocol.predict_level({"aqi": 342, "aqi_prev": 318})
            self.assertIn(lvl, protocol.LEVELS)
        finally:
            del os.environ["AIQ_MODEL_V1"]
        self.assertEqual(protocol.predict_level({"aqi": 342}), "VeryPoor")


if __name__ == "__main__":
    unittest.main()
