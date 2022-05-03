import * as React from "react";
import { useMap, LayerGroup } from "react-leaflet";


export default function CustomLayerGroup({ minZoom = 0, children, ...props }) {
    const map = useMap();
    const currentZoom = map.getZoom();
    const isVisible = currentZoom >= minZoom;
    return (
        <LayerGroup {...props}>
            {isVisible ? children : null}
        </LayerGroup>
    )
}
