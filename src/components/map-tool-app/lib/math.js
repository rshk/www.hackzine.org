/**
 * Convert a number to degrees, minutes, seconds
 */
export function getDMS(number) {
    const sign = number < 0 ? -1 : 1;
    const number_abs = Math.abs(number);
    const degrees = Math.abs(Math.floor(number_abs));
    const minutes = Math.floor((number_abs * 60) % 60);
    const seconds = (number_abs * 3600) % 60;
    return { sign, degrees, minutes, seconds };
}
