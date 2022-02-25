import { GeodesicLine } from "leaflet.geodesic";
import * as L from "leaflet";


export function getGeodeiscCore() {
    // This is not exported apparently, so we have to force it out...
    return (new GeodesicLine()).geom.geodesic;
}


/**
 * Calculate a position given start, bearing, and distance.
 *
 * Args:
 *     start:
 *         [lat, lng]
 *     bearing:
 *         Bearing, in degrees
 *     distance:
 *         Distance, in meters
 * Returns:
 *     { lat, lng, bearing }
 */
export function direct(start, bearing, distance) {
    const geo = getGeodeiscCore();
    return geo.direct(
        new L.LatLng(start[0], geo.wrap(start[1], 180)),
        bearing,
        distance,
    );
}


/**
 * Args:
 *     start: [lat, lng]
 *     dest: [lat, lng]
 * Returns:
 *     { distance, initialBearing, finalBearing }
 */
export function inverse(start, dest) {
    const geo = getGeodeiscCore();
    const [start_lat, start_lng] = start;
    const [dest_lat, dest_lng] = dest;
    return geo.inverse(
        new L.LatLng(start_lat, geo.wrap(start_lng, 180)),
        new L.LatLng(dest_lat, geo.wrap(dest_lng, 180))
    );
}
