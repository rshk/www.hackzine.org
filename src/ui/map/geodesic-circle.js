import { createPathComponent } from "@react-leaflet/core";
import { GeodesicCircleClass as LeafletGeodesicCircle } from 'leaflet.geodesic'


const GeodesicCircle = createPathComponent(

    function createGeodesicCircle({ center, children, ...options }, ctx) {
        const instance = new LeafletGeodesicCircle(center, options);
        return { instance, context: { ...ctx, overlayContainer: instance } }
    },

    function updateGeodesicCircle(instance, props, prevProps) {
        instance.setLatLng(props.center);
        instance.setRadius(props.radius);
    },

);

export default GeodesicCircle;
