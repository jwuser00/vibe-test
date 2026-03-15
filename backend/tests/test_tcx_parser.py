"""Unit tests for tcx_parser.py — TCX XML parsing functions."""

import pytest
from lxml import etree

import tcx_parser
from tests.fixtures.sample_tcx import make_tcx


class TestParseTcx:
    def test_single_lap(self):
        content = make_tcx(laps=[{"distance": 1000, "time": 300, "hr": 150, "max_hr": 165, "cadence": 88}])
        result = tcx_parser.parse_tcx(content)
        assert len(result) == 1
        activity = result[0]
        assert activity["total_distance"] == 1000
        assert activity["total_time"] == 300
        assert activity["avg_hr"] == 150
        assert activity["avg_cadence"] == 88
        assert len(activity["laps"]) == 1

    def test_multiple_laps(self):
        content = make_tcx(laps=[
            {"distance": 1000, "time": 300, "hr": 140, "max_hr": 155, "cadence": 86},
            {"distance": 1000, "time": 310, "hr": 155, "max_hr": 170, "cadence": 90},
        ])
        result = tcx_parser.parse_tcx(content)
        activity = result[0]
        assert len(activity["laps"]) == 2
        assert activity["total_distance"] == 2000
        assert activity["total_time"] == 610
        assert activity["avg_hr"] == pytest.approx((140 + 155) / 2)

    def test_no_hr_data(self):
        content = make_tcx(laps=[{"distance": 1000, "time": 300}])
        result = tcx_parser.parse_tcx(content)
        assert result[0]["avg_hr"] is None

    def test_zero_distance_lap_no_division_error(self):
        content = make_tcx(laps=[{"distance": 0, "time": 60}])
        result = tcx_parser.parse_tcx(content)
        assert result[0]["laps"][0]["pace"] == 0

    def test_invalid_xml_raises(self):
        with pytest.raises(etree.XMLSyntaxError):
            tcx_parser.parse_tcx(b"not xml")

    def test_no_activity_returns_empty(self):
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities/>
</TrainingCenterDatabase>"""
        result = tcx_parser.parse_tcx(xml)
        assert result == []

    def test_no_id_element_skips_activity(self):
        xml = b"""<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Lap StartTime="2024-01-15T10:00:00Z">
        <TotalTimeSeconds>300</TotalTimeSeconds>
        <DistanceMeters>1000</DistanceMeters>
        <Track><Trackpoint><Time>2024-01-15T10:00:00Z</Time></Trackpoint></Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>"""
        result = tcx_parser.parse_tcx(xml)
        assert result == []


class TestDetectTreadmill:
    def test_no_positions_is_treadmill(self):
        content = make_tcx(has_position=False)
        assert tcx_parser.detect_treadmill(content) is True

    def test_has_positions_is_outdoor(self):
        content = make_tcx(has_position=True)
        assert tcx_parser.detect_treadmill(content) is False


class TestCreateLightweightTcx:
    def test_removes_position_elements(self):
        content = make_tcx(has_position=True)
        result = tcx_parser.create_lightweight_tcx(content)
        tree = etree.fromstring(result.encode("utf-8"))
        positions = tree.xpath(
            "//ns:Position",
            namespaces={"ns": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"},
        )
        assert len(positions) == 0

    def test_preserves_lap_summary(self):
        content = make_tcx(laps=[{"distance": 1000, "time": 300, "hr": 150, "max_hr": 165}])
        result = tcx_parser.create_lightweight_tcx(content)
        ns = {"ns": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"}
        tree = etree.fromstring(result.encode("utf-8"))
        time_elems = tree.xpath("//ns:Lap/ns:TotalTimeSeconds", namespaces=ns)
        assert len(time_elems) == 1
        assert float(time_elems[0].text) == 300


class TestParseLapsFromTcx:
    def test_empty_string_returns_empty(self):
        assert tcx_parser.parse_laps_from_tcx("") == []

    def test_none_returns_empty(self):
        assert tcx_parser.parse_laps_from_tcx(None) == []

    def test_valid_lightweight_tcx(self):
        content = make_tcx(laps=[
            {"distance": 1000, "time": 300, "hr": 150, "max_hr": 165, "cadence": 88},
        ])
        lightweight = tcx_parser.create_lightweight_tcx(content)
        laps = tcx_parser.parse_laps_from_tcx(lightweight)
        assert len(laps) == 1
        assert laps[0]["distance"] == 1000
        assert laps[0]["time"] == 300
