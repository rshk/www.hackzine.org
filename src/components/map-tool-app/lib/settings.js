import { useSelector } from "react-redux";


export const DEFAULT_SETTINGS = {
    degreesFormat: "dms",
    distanceUnits: "m",
    speedUnits: "m/s",
};


export const DEGREES_FORMAT_OPTIONS = [
    { id: "dms", label: "DMS", title: "Degrees, Minutes, Seconds" },
    { id: "dm", label: "DM", title: "Degrees, Minutes" },
    { id: "deg", label: "Deg", title: "Degrees (decimal)" },
];


export const DISTANCE_UNITS_OPTIONS = [
    { id: "m", label: "m", title: "Metres" },
    { id: "nautical-miles", label: "NM", title: "Nautical miles" },
];


export const SPEED_UNITS_OPTIONS = [
    { id: "m/s", label: "m/s", title: "Metres per second" },
    { id: "km/h", label: "km/h", title: "Kilometers per hour" },
    { id: "knots", label: "knots", title: "Knots" },
];


export const useSettings = () => useSelector(({ settings = {} }) => ({
    ...DEFAULT_SETTINGS,
    ...settings,
}));
