import { getDMS, getDM } from "./math";

const LOCALE = "en-US";
const SYMBOL_DEGREES = "°";
const SYMBOL_MINUTES = "’";
const SYMBOL_SECONDS = "”";


export function formatLatLonPlain([lat, lon]) {
    const fmt = new Intl.NumberFormat(LOCALE, {
        maximumFractionDigits: 6,
    });
    return `${fmt.format(lat)},${fmt.format(lon)}`;
}


export function formatLatLonDMS([lat, lon]) {
    const latDMS = getDMS(lat);
    const lonDMS = getDMS(lon);
    return `${formatDMS(latDMS, 'N', 'S')},${formatDMS(lonDMS, 'E', 'W')}`;
}


export function formatLatLonDM([lat, lon]) {
    const latDM = getDM(lat);
    const lonDM = getDM(lon);
    return `${formatDM(latDM, 'N', 'S')},${formatDM(lonDM, 'E', 'W')}`;
}


export function formatDMS(dms, pos, neg) {
    const fmtD = new Intl.NumberFormat(LOCALE, {
        maximumFractionDigits: 0,
        // Hacky way to show three digits for longitude
        minimumIntegerDigits: (pos === 'E' && neg === 'W') ? 3 : 2,
    });
    const fmtS = new Intl.NumberFormat(LOCALE, {
        // maximumFractionDigits: 1,
        maximumFractionDigits: 0,
        minimumIntegerDigits: 2,
    });
    const {degrees, minutes, seconds} = dms;
    const sign = dms.sign < 0 ? neg : pos;
    return (
        `${fmtD.format(degrees)}${SYMBOL_DEGREES}` +
        `${fmtD.format(minutes)}${SYMBOL_MINUTES}` +
        `${fmtS.format(seconds)}${SYMBOL_SECONDS}` +
        `${sign}`);
}


export function formatDM(dm, pos, neg) {
    const fmtD = new Intl.NumberFormat(LOCALE, {
        maximumFractionDigits: 0,
        // Hacky way to show three digits for longitude
        minimumIntegerDigits: (pos === 'E' && neg === 'W') ? 3 : 2,
    });
    const fmtM = new Intl.NumberFormat(LOCALE, {
        // maximumFractionDigits: 1,
        maximumFractionDigits: 2,
        minimumIntegerDigits: 2,
    });
    const { degrees, minutes } = dm;
    const sign = dm.sign < 0 ? neg : pos;
    return (
        `${fmtD.format(degrees)}${SYMBOL_DEGREES}` +
        `${fmtM.format(minutes)}${SYMBOL_MINUTES}` +
        `${sign}`);
}


export function formatDistance(distance) {
    // TODO: use formatter with units?
    const formatter = new Intl.NumberFormat(LOCALE, {
        maximumFractionDigits: 0,
    });
    if (distance > 1000) {
        return `${formatter.format(distance / 1000)} km`;
    }
    return `${formatter.format(distance)} m`;
}


export function formatBearing(bearing) {
    const formatter = new Intl.NumberFormat(LOCALE, {
        maximumFractionDigits: 0,
    });
    return `${formatter.format(bearing)}${SYMBOL_DEGREES}`;
}
