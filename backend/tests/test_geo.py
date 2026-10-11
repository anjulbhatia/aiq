"""Delhi geofence: AOI gates open, everything else denied."""

import unittest

from app import geo


class Fence(unittest.TestCase):
    def test_reference_schools_inside(self):
        for a in geo.AOIS:
            self.assertTrue(geo.within_aoi(a["lat"], a["lng"]), a["id"])

    def test_outside_denied(self):
        for lat, lng in ((19.0760, 72.8777), (28.6139, 77.2090), (28.72, 77.35)):
            self.assertFalse(geo.within_aoi(lat, lng), (lat, lng))
            with self.assertRaises(PermissionError):
                geo.require_within_aoi(lat, lng)

    def test_mid_rohini_resolves(self):
        self.assertEqual(geo.require_within_aoi(28.72, 77.15)["id"], "vspk-rohini")

    def test_bounds_shape(self):
        (sw, ne) = geo.aoi_bounds("st-angels-rohini")
        self.assertLess(sw[0], ne[0])
        self.assertLess(sw[1], ne[1])


if __name__ == "__main__":
    unittest.main()
