import { getDMS } from "./math";


export function formatLatLonPlain([lat, lon]) {
    const fmt = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
    });
    return `${fmt.format(lat)},${fmt.format(lon)}`;
}


export function formatLatLonDMS([lat, lon]) {
    const latDMS = getDMS(lat);
    const lonDMS = getDMS(lon);
    return `${formatDMS(latDMS, 'N', 'S')},${formatDMS(lonDMS, 'E', 'W')}`;
}


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
    return `${fmtD.format(degrees)}°${fmtD.format(minutes)}'${fmtS.format(seconds)}"${sign}`;
}


export function formatDistance(distance) {
    // TODO: use formatter with units?
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    if (distance > 1000) {
        return `${formatter.format(distance / 1000)} km`;
    }
    return `${formatter.format(distance)} m`;
}


export function formatBearing(bearing) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    return `${formatter.format(bearing)}°`;
}
