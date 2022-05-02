import * as uuid from "uuid";


export default function createPoint(data) {
    return {
        id: uuid.v4(),
        location: [0, 0],
        label: "",
        radius: 0,
        showRadius: false,
        ...data,
    };
}
