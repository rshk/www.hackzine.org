import { createPathComponent } from "@react-leaflet/core";
import { GeodesicLine as LeafletGeodesicLine } from "leaflet.geodesic";


const GeodesicLine = createPathComponent(

    function createGeodesicLine({ positions, children, ...options }, ctx) {
        const instance = new LeafletGeodesicLine(positions, options);
        return { instance, context: { ...ctx, overlayContainer: instance } }
    },

    function updateGeodesicLine(instance, props, prevProps) {
        instance.setLatLngs(props.positions);
    },

);

export default GeodesicLine;
