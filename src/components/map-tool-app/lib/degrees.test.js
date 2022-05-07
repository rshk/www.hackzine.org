import each from "jest-each";
import Degrees, { Latitude, Longitude, normalizeLonMilliseconds } from "./degrees";

describe("Degrees", () => {

    describe("Construct from degrees", () => {
        const d = Degrees.fromDegrees(123.456);
        expect(d.toDegrees()).toBeCloseTo(123.456, 3);
    });

    describe("Construct from degrees, minutes, seconds", () => {

        test("Positive, no overflow", ()=> {
            const d = Degrees.fromDMS(12, 34, 56);
            expect(d.milliseconds).toEqual(12 * 3600 * 1000 + 34 * 60000 + 56 * 1000);
            expect(d.toDMS()).toEqual({
                sign: 1,
                degrees: 12,
                minutes: 34,
                seconds: 56,
            });
        });

        test("Negative, no overflow", ()=> {
            const d = Degrees.fromDMS(12, 34, 56, -1);
            expect(d.milliseconds).toEqual(-(12 * 3600 * 1000 + 34 * 60000 + 56 * 1000));
            expect(d.toDMS()).toEqual({
                sign: -1,
                degrees: 12,
                minutes: 34,
                seconds: 56,
            });
        });

        test("Minutes overflow upper", ()=> {
            const d = Degrees.fromDMS(12, 70, 0);
            expect(d.toDMS()).toEqual({
                sign: 1,
                degrees: 13,
                minutes: 10,
                seconds: 0,
            });
        });

        test("Minutes overflow lower", ()=> {
            const d = Degrees.fromDMS(12, -10, 0);
            expect(d.toDMS()).toEqual({
                sign: 1,
                degrees: 11,
                minutes: 50,
                seconds: 0,
            });
        });
    });

    describe("Convert from DMS to degrees and back", () => {
        test("12° 33’ 45”", () => {
            const d = Degrees.fromDMS(12, 33, 45);
            expect(d.toDegrees()).toEqual(12.5625);
            const d1 = Degrees.fromDegrees(12.5625);
            expect(d1.toDMS()).toEqual({
                sign: 1,
                degrees: 12,
                minutes: 33,
                seconds: 45,
            });
        });
    });
});


describe("Latitude", () => {

    test("Positive latitude works", () => {
        const lat = Latitude.fromDMS(45, 10, 30);
        expect(lat.toDMS()).toEqual({
            sign: 1,
            degrees: 45,
            minutes: 10,
            seconds: 30,
        });
    });

    test("Negative latitude works", () => {
        const lat = Latitude.fromDMS(45, 10, 30, -1);
        expect(lat.toDMS()).toEqual({
            sign: -1,
            degrees: 45,
            minutes: 10,
            seconds: 30,
        });
    });

    test("Positive overflow is limited", () => {
        const lat = Latitude.fromDMS(120, 10, 30);
        expect(lat.toDMS()).toEqual({
            sign: 1,
            degrees: 90,
            minutes: 0,
            seconds: 0,
        });
    });

    test("Negative overflow is limited", () => {
        const lat = Latitude.fromDMS(120, 10, 30, -1);
        expect(lat.toDMS()).toEqual({
            sign: -1,
            degrees: 90,
            minutes: 0,
            seconds: 0,
        });
    });

});


describe("Longitude", () => {

    each([

        ["Within limit positive",
         [45, 20, 40, 1],
         { sign: 1, degrees: 45, minutes: 20, seconds: 40 }],

        ["Within limit negative",
         [45, 20, 40, -1],
         { sign: -1, degrees: 45, minutes: 20, seconds: 40 }],

        ["Antimeridian positive",
         [180, 0, 0, 1],
         { sign: 1, degrees: 180, minutes: 0, seconds: 0 }],

        ["Antimeridian negative",
         [180, 0, 0, -1],
         { sign: 1, degrees: 180, minutes: 0, seconds: 0 }],

        ["Overflow positive",
         [200, 0, 0, 1],
         { sign: -1, degrees: 160, minutes: 0, seconds: 0 }],

        ["Overflow negative",
         [200, 0, 0, -1],
         { sign: 1, degrees: 160, minutes: 0, seconds: 0 }],

        ["Overflow positive",
         [180, 0, 1, 1],
         { sign: -1, degrees: 179, minutes: 59, seconds: 59 }],

        ["Overflow negative",
         [180, 0, 1, -1],
         { sign: 1, degrees: 179, minutes: 59, seconds: 59 }],

        ["Overflow positive",
         [200, 10, 30, 1],
         { sign: -1, degrees: 159, minutes: 49, seconds: 30 }],

        ["Overflow negative",
         [200, 10, 30, -1],
         { sign: 1, degrees: 159, minutes: 49, seconds: 30 }],

        ["Overflow 2x positive",
         [560, 10, 30, 1],
         { sign: -1, degrees: 159, minutes: 49, seconds: 30 }],

        ["Overflow 2x negative",
         [560, 10, 30, -1],
         { sign: 1, degrees: 159, minutes: 49, seconds: 30 }],

    ]).test("%s: %p -> %p", (_, args, expected) => {
        const lat = Longitude.fromDMS(...args);
        expect(lat.toDMS()).toEqual(expected);
    });

});



describe("normalizeLonMilliseconds()", () => {
    each([
        [20 * 3600000, 20 * 3600000],
        [-20 * 3600000, -20 * 3600000],
        [180 * 3600000, 180 * 3600000],
        [-180 * 3600000, 180 * 3600000],
        [200 * 3600000, -160 * 3600000],
        [-200 * 3600000, 160 * 3600000],
    ]).test("normalizeLonMilliseconds(%d) = %d", (value, expected) => {
        expect(normalizeLonMilliseconds(value)).toEqual(expected);
    });
});
