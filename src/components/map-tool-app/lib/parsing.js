export function parseDistance(rawValue) {
    const m = /^(\d+)\s*(.*)$/.exec(rawValue);

    if (!m) {
        throw new Error(`Invalid distance: ${rawValue}`);
    }

    const intValue = parseInt(m[1], 10);
    const suffix = m[2];

    if (["", "m"].includes(suffix)) {
        return intValue;
    }
    if (["k", "km"].includes(suffix)) {
        return intValue * 1000;
    }
    if (suffix === "mi") {
        // Land miles
        return intValue * 1609.34;
    }
    if (["M", "NM", "nm", "nmi"].includes(suffix)) {
        // Nautical miles
        return intValue * 1852;
    }
    if (suffix === "ft") {
        // Feet
        return intValue * 0.3048;
    }
    throw new Error(`Invalid distance units: ${suffix}`);
}
