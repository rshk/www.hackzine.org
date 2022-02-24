import * as React from "react";
import { TileLayer } from "react-leaflet";


const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';


export default function OsmTileLayer() {
    return (
        <TileLayer
            attribution={ATTRIBUTION}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

    );
}
