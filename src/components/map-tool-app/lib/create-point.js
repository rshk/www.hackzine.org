import * as uuid from "uuid";
import { normalizeLatLon } from "./math";


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
