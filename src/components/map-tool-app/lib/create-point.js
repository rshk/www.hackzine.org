import * as uuid from "uuid";


export default function createPoint(data) {
    const { location } = data;
    return {
        id: uuid.v4(),
        label: "",
        radius: 0,
        showRadius: false,
        ...data,
        location: location ? normalizeLatLon(location) : [0, 0],
    };
}


const normalizeLatLon = ([lat, lon]) => {
    return [normalizeLat(lat), normalizeLon(lon)];
};


const normalizeLat = lat => Math.max(-90, Math.min(lat, 90));
const normalizeLon = lon => (lon % 360 + 540) % 360 - 180;
