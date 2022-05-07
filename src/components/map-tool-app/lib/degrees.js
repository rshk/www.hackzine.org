export default class Degrees {
    constructor(milliseconds) {
        this.milliseconds = milliseconds;
    }

    static fromDegrees(degrees) {
        return this.fromDMS(degrees, 0, 0);
    }

    static fromDMS(degrees, minutes, seconds, sign = 1) {
        return this.fromMilliSeconds(
            sign *
            ((degrees * 60 * 60 * 1000) +
             (minutes * 60 * 1000) +
             (seconds * 1000))
        )
    }

    static fromMilliSeconds(milliseconds) {
        return new this(milliseconds);
    }

    toDegrees() {
        return this.milliseconds / (60 * 60 * 1000);
    }

    toDM() {
        const dms = this._getDMSAll();
        return {
            sign: dms.sign,
            degrees: dms.degreesTrunc,
            minutes: dms.minutes,
        }
    }

    toDMS() {
        const dms = this._getDMSAll();
        return {
            sign: dms.sign,
            degrees: dms.degreesTrunc,
            minutes: dms.minutesTrunc,
            seconds: dms.seconds,
        }
    }

    _getDMSAll() {
        const sign = this.milliseconds < 0 ? -1 : 1;
        const msAbs = Math.abs(this.milliseconds);
        const degrees = msAbs / (60 * 60 * 1000);
        const minutes = (msAbs / (60 * 1000)) % 60;
        const seconds = (msAbs / 1000) % 60;
        return {
            sign,
            degrees,
            degreesTrunc: Math.trunc(degrees),
            minutes,
            minutesTrunc: Math.trunc(minutes),
            seconds,
            secondsTrunc: Math.trunc(seconds),
        };
    }
}

export class Latitude extends Degrees {
    constructor(milliseconds) {
        super(normalizeLatMilliseconds(milliseconds));
    }
}

export class Longitude extends Degrees {
    constructor(milliseconds) {
        super(normalizeLonMilliseconds(milliseconds));
    }
}


export const normalizeLatMilliseconds =
    lat => Math.max(-90 * 3600000, Math.min(lat, 90 * 3600000));

const DEGREE_IN_MS = 60 * 60 * 1000;
const TURN_IN_MS = 360 * DEGREE_IN_MS;
const HALF_TURN_IN_MS = TURN_IN_MS / 2;
const TURN_AND_HALF_IN_MS = TURN_IN_MS + HALF_TURN_IN_MS;

export const normalizeLonMilliseconds =
    lon => (lon % TURN_IN_MS - TURN_AND_HALF_IN_MS) % TURN_IN_MS + HALF_TURN_IN_MS;
