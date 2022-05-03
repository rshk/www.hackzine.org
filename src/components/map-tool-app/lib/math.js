/**
 * Convert a number to degrees, minutes, seconds
 */
export function getDMS(number) {
    const {
        sign,
        degreesTrunc: degrees,
        minutesTrunc: minutes,
        seconds,
    } = getDMSAll(number);
    return { sign, degrees, minutes, seconds };
}


/**
 * Convert a number to degrees, minutes
 */
export function getDM(number) {
    const {
        sign,
        degreesTrunc: degrees,
        minutes,
    } = getDMSAll(number);
    return { sign, degrees, minutes };
}


export function getDMSAll(number) {
    const sign = number < 0 ? -1 : 1;
    const degrees = Math.abs(number);
    const minutes = (degrees * 60) % 60;
    const seconds = (degrees * 3600) % 60;
    return {
        sign,
        degrees,
        degreesTrunc: Math.floor(degrees),
        minutes,
        minutesTrunc: Math.floor(minutes),
        seconds,
        secondsTrunc: Math.floor(seconds),
    };
}
