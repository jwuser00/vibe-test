"""Minimal valid TCX XML factories for testing."""


def make_tcx(
    laps: list[dict] | None = None,
    has_position: bool = True,
    start_time: str = "2024-01-15T10:00:00.000Z",
) -> bytes:
    """Build a minimal valid TCX XML byte string.

    Args:
        laps: List of lap dicts with keys: distance, time, hr, max_hr, cadence.
              Defaults to a single 1km/5min lap.
        has_position: Whether to include GPS Position elements (False = treadmill).
        start_time: ISO 8601 start time for the activity.
    """
    if laps is None:
        laps = [{"distance": 1000, "time": 300, "hr": 150, "max_hr": 165, "cadence": 88}]

    lap_xml_parts = []
    for lap in laps:
        distance = lap.get("distance", 1000)
        time = lap.get("time", 300)
        hr = lap.get("hr")
        max_hr = lap.get("max_hr")
        cadence = lap.get("cadence")

        hr_xml = ""
        if hr is not None:
            hr_xml = f"""
        <AverageHeartRateBpm><Value>{hr}</Value></AverageHeartRateBpm>"""
        if max_hr is not None:
            hr_xml += f"""
        <MaximumHeartRateBpm><Value>{max_hr}</Value></MaximumHeartRateBpm>"""

        cadence_xml = ""
        if cadence is not None:
            cadence_xml = f"""
        <Extensions>
          <ns3:LX>
            <ns3:AvgRunCadence>{cadence}</ns3:AvgRunCadence>
          </ns3:LX>
        </Extensions>"""

        position_xml = ""
        if has_position:
            position_xml = """
            <Position>
              <LatitudeDegrees>37.5</LatitudeDegrees>
              <LongitudeDegrees>127.0</LongitudeDegrees>
            </Position>"""

        lap_xml = f"""
      <Lap StartTime="{start_time}">
        <TotalTimeSeconds>{time}</TotalTimeSeconds>
        <DistanceMeters>{distance}</DistanceMeters>{hr_xml}{cadence_xml}
        <Track>
          <Trackpoint>
            <Time>{start_time}</Time>{position_xml}
          </Trackpoint>
        </Track>
      </Lap>"""
        lap_xml_parts.append(lap_xml)

    laps_str = "".join(lap_xml_parts)

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>{start_time}</Id>{laps_str}
    </Activity>
  </Activities>
</TrainingCenterDatabase>"""
    return xml.encode("utf-8")
