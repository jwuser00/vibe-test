from lxml import etree
from datetime import datetime
import dateutil.parser

NAMESPACES = {
    'ns': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
    'ns3': 'http://www.garmin.com/xmlschemas/ActivityExtension/v2'
}

def parse_tcx(file_content):
    tree = etree.fromstring(file_content)
    activities = tree.xpath('//ns:Activity', namespaces=NAMESPACES)
    
    parsed_data = []

    for activity in activities:
        start_time_elem = activity.find('ns:Id', namespaces=NAMESPACES)
        start_time_str = start_time_elem.text if start_time_elem is not None else None
        if not start_time_str:
             continue
        start_time = dateutil.parser.parse(start_time_str)
        
        total_time = 0.0
        total_distance = 0.0
        
        laps_data = []
        laps = activity.xpath('ns:Lap', namespaces=NAMESPACES)
        
        running_distance = 0.0
        
        for i, lap in enumerate(laps):
            lap_time = float(lap.xpath('ns:TotalTimeSeconds', namespaces=NAMESPACES)[0].text)
            lap_dist = float(lap.xpath('ns:DistanceMeters', namespaces=NAMESPACES)[0].text)
            
            # HR
            avg_hr_elem = lap.xpath('ns:AverageHeartRateBpm/ns:Value', namespaces=NAMESPACES)
            avg_hr = float(avg_hr_elem[0].text) if avg_hr_elem else None
            
            max_hr_elem = lap.xpath('ns:MaximumHeartRateBpm/ns:Value', namespaces=NAMESPACES)
            max_hr = float(max_hr_elem[0].text) if max_hr_elem else None
            
            # Cadence (RunCadence or Cadence)
            # Garmin often uses extensions for RunCadence
            avg_cadence = None
            # Try standard Cadence first
            cadence_elem = lap.xpath('ns:Cadence', namespaces=NAMESPACES)
            if cadence_elem:
                avg_cadence = float(cadence_elem[0].text)
            else:
                # Try extensions
                lx = lap.xpath('ns:Extensions/ns3:LX/ns3:AvgRunCadence', namespaces=NAMESPACES)
                if lx:
                    avg_cadence = float(lx[0].text)

            # Pace (sec/km)
            pace = (lap_time / (lap_dist / 1000)) if lap_dist > 0 else 0
            
            laps_data.append({
                "lap_number": i + 1,
                "time": lap_time,
                "distance": lap_dist,
                "pace": pace,
                "avg_hr": avg_hr,
                "max_hr": max_hr,
                "avg_cadence": avg_cadence
            })
            
            total_time += lap_time
            total_distance += lap_dist

        # Activity Averages
        avg_pace = (total_time / (total_distance / 1000)) if total_distance > 0 else 0
        
        valid_hrs = [l['avg_hr'] for l in laps_data if l['avg_hr'] is not None]
        activity_avg_hr = sum(valid_hrs) / len(valid_hrs) if valid_hrs else None
        
        valid_cadence = [l['avg_cadence'] for l in laps_data if l['avg_cadence'] is not None]
        activity_avg_cadence = sum(valid_cadence) / len(valid_cadence) if valid_cadence else None

        parsed_data.append({
            "start_time": start_time,
            "total_time": total_time,
            "total_distance": total_distance,
            "avg_pace": avg_pace,
            "avg_hr": activity_avg_hr,
            "avg_cadence": activity_avg_cadence,
            "laps": laps_data
        })
        
    return parsed_data
