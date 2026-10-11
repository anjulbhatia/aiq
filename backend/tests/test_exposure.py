"""Exposure + feels-like: monotonicity, sane visibility, verdict bands."""

import unittest

from app import exposure


class Exposure(unittest.TestCase):
    def test_visibility_falls_with_pm(self):
        clear = exposure.visibility_km(20, 40)
        smog = exposure.visibility_km(250, 65)
        self.assertGreater(clear, 8)
        self.assertLess(smog, 4)
        self.assertGreater(smog, 0.2)

    def test_dose_scales(self):
        low = exposure.inhaled_dose_ug(50, 2, 0.9)
        high = exposure.inhaled_dose_ug(300, 2, 0.9)
        self.assertAlmostEqual(high / low, 6.0, places=5)
        masked = exposure.inhaled_dose_ug(300, 2, 0.9, mask="n95")
        self.assertAlmostEqual(masked / high, 0.1, places=5)
        indoor = exposure.inhaled_dose_ug(300, 2, 0.9, indoor=True)
        self.assertLess(indoor, high)

    def test_verdict_bands_and_sensitive(self):
        def brief(aqi, level, pm25, tmr):
            return {"aqi": aqi, "level": level, "pm25": pm25, "tempC": 29,
                    "humidity": 55, "windKph": 7,
                    "forecastTomorrow": {"aqi": aqi, "level": tmr}}
        self.assertEqual(exposure.assess(brief(60, "Good", 35, "Good"))["verdict"], "outdoor-okay")
        self.assertEqual(exposure.assess(brief(342, "VeryPoor", 218, "VeryPoor"))["verdict"], "indoor-only")
        rough = exposure.assess(brief(180, "Moderate", 110, "Poor"))
        self.assertEqual(rough["day_ahead"], "rough-day-ahead")
        steady = exposure.assess(brief(180, "Moderate", 110, "Moderate"))
        self.assertEqual(steady["day_ahead"], "steady")
        sens = exposure.assess(brief(180, "Moderate", 110, "Moderate"), sensitive=True)
        self.assertLessEqual(
            exposure.max_outdoor_hours(110, 10, sensitive=True),
            exposure.max_outdoor_hours(110, 10, sensitive=False))

    def test_feels_like_words(self):
        self.assertIn("Smoggy", exposure.feels_like(220, 29, 60, 6))
        self.assertIn("Clear", exposure.feels_like(25, 29, 40, 14))


if __name__ == "__main__":
    unittest.main()
