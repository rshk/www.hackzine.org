import each from "jest-each";
import { getDMS } from "./math";

describe("getDMS()", () => {
    each([

        [15, {sign: 1, degrees: 15, minutes: 0, seconds: 0}],
        [12.582222222222222, {sign: 1, degrees: 12, minutes: 34, seconds: 56}],
        [-4.38, {sign: -1, degrees: 4, minutes: 22, seconds: 48}],

    ]).test("Returns a correct value for %d: %p", (number, expected) => {
        expect(getDMS(number)).toEqual(expected);
    });
});
