export function formatLatLonPlain([lat, lon]) {
    const fmt = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
    });
    return `${fmt.format(lat)},${fmt.format(lon)}`;
}


/**
 * Format a latitude / longitude pair as degres, minutes, seconds
 */
export function formatLatLonDMS([lat, lon]) {
    const latDMS = getDMS(lat);
    const lonDMS = getDMS(lon);
    return `${formatDMS(latDMS, 'N', 'S')}, ${formatDMS(lonDMS, 'E', 'W')}`;
}


/**
 * Convert a number to degrees/minutes/seconds
 *
 * Returns:
 *     Object: { sign, degrees, minutes, seconds }
 */
function getDMS(number) {
    const sign = number < 0 ? -1 : 1;
    const number_abs = Math.abs(number);
    const degrees = Math.abs(Math.floor(number_abs));
    const minutes = Math.floor((number_abs * 60) % 60);
    const seconds = (number_abs * 3600) % 60;
    return { sign, degrees, minutes, seconds };
}


/**
 * Format a value returned by getDMS()
 *
 * Args:
 *     dms:
 *         Value returned by getDMS().
 *         Object: { sign, degrees, minutes, seconds }
 *     pos:
 *         Symbol for positive values. Usually "N" for latitude,
 *         "E" for longitude
 *     neg:
 *         Symbol for negative values. Usually "S" for latitude,
 *         "W" for longitude
 *
 * Returns:
 *     Formatted string
 */
export function formatDMS(dms, pos, neg) {
    const fmtD = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        // Hacky way to show three digits for longitude
        minimumIntegerDigits: (pos === 'E' && neg === 'W') ? 3 : 2,
    });
    const fmtS = new Intl.NumberFormat("en-US", {
        // maximumFractionDigits: 1,
        maximumFractionDigits: 0,
        minimumIntegerDigits: 2,
    });
    const {degrees, minutes, seconds} = dms;
    const sign = dms.sign < 0 ? neg : pos;
    return `${fmtD.format(degrees)}° ${fmtD.format(minutes)}' ${fmtS.format(seconds)}" ${sign}`;
}


/**
 * Args:
 *     distance: in meters
 */
export function formatDistance(distance) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    if (distance > 1000) {
        return `${formatter.format(distance / 1000)} km`;
    }
    return `${formatter.format(distance)} m`;
}


/**
 * Args:
 *     bearing: in degrees
 */
export function formatBearing(bearing) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    return `${formatter.format(bearing)}°`;
}
