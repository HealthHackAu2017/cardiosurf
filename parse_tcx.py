from xml.etree import ElementTree
import json
import math
from datetime import datetime

ns = {
    'tcd': 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'
}
R = 6.371e6 # radius of earth in metres

def distance(p1, p2):
    lon1 = math.radians(p1['lon'])
    lat1 = math.radians(p1['lat'])
    lon2 = math.radians(p2['lon'])
    lat2 = math.radians(p2['lat'])

    dlon = lon2 - lon1
    dlat = lat2 -lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def convert_yz(track):
    total_z = 0
    smooth_y = track[0]['altitude']
    yz_track = []
    for p1, p2 in zip(track[:1] + track, track):
        z = total_z + distance(p1, p2)
        total_z = z
        y = p2['altitude']*0.1 + smooth_y*0.9
        smooth_y = y
        yz_track.append({
            'timeCurr': p2['time'],
            'timePrev': p1['time'],
            'x': 0.0,
            'y': y,
            'z': z,
            'bpm': p2['bpm']
        })
    return yz_track

def parse_tcx(filename):
    'Parse a TCX file, extracting lat, lon, elevation, time and heart rate into a JSON format'
    e = ElementTree.parse(filename).getroot()
    track = [];
    for tp in e.findall('.//tcd:Trackpoint', ns):
        time = tp.find('./tcd:Time', ns).text
        lat = float(tp.find('./tcd:Position/tcd:LatitudeDegrees', ns).text)
        lon = float(tp.find('./tcd:Position/tcd:LongitudeDegrees', ns).text)
        altitude = float(tp.find('./tcd:AltitudeMeters', ns).text)
        bpm = int(tp.find('./tcd:HeartRateBpm/tcd:Value', ns).text)
        track.append({
            'time': time,
            'lat': lat,
            'lon': lon,
            'altitude': altitude,
            'bpm': bpm,
        })

    return json.dumps(convert_yz(track), indent='  ')

if __name__ == '__main__':
    s = parse_tcx('data/9809411562.tcx')
    with open('out.json', 'w') as f:
        f.write(s)

