"""Vision classifier on a synthetic thirds image. No network."""

import unittest

import numpy as np

from app.vision.urban import CLASS_NAMES, IGNORE, classify, summarize


def thirds() -> np.ndarray:
    img = np.zeros((120, 300, 3), np.uint8)
    img[:, 0:75] = (20, 100, 25)      # canopy -> trees
    img[:, 75:150] = (30, 170, 40)    # park grass -> green
    img[:, 150:225] = (70, 100, 150)  # soil -> fields
    img[:, 225:300] = (215, 215, 215)  # rooftops -> buildings
    for y in range(0, 120, 10):
        img[y, 225:300] = (40, 40, 40)
    for x in range(225, 300, 10):
        img[:, x] = (40, 40, 40)
    return img


class Vision(unittest.TestCase):
    def test_thirds_classify(self):
        s = summarize(classify(thirds()))
        for k, want in (("trees", 0.25), ("green", 0.25), ("fields", 0.25)):
            self.assertAlmostEqual(s[k], want, delta=0.03, msg=k)
        self.assertGreater(s["buildings"], 0.15)
        self.assertLess(s["unknown"], 0.10)

    def test_fractions_sum_and_trap_bounds(self):
        s = summarize(classify(thirds()))
        total = sum(s[k] for k in CLASS_NAMES if k != "ignore")
        self.assertAlmostEqual(total, 1.0, places=6)
        self.assertGreaterEqual(s["smogTrapIndex"], 0.0)
        self.assertLessEqual(s["smogTrapIndex"], 1.0)

    def test_empty_area_raises(self):
        with self.assertRaises(ValueError):
            summarize(np.full((4, 4), IGNORE, dtype=np.uint8))


if __name__ == "__main__":
    unittest.main()
