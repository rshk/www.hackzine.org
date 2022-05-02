import { createPathComponent } from "@react-leaflet/core";
import { GeodesicCircleClass as LeafletGeodesicCircle } from 'leaflet.geodesic'
import PropTypes from "prop-types";


const GeodesicCircle = createPathComponent(

    function createGeodesicCircle({ center, children, style, ...options }, ctx) {
        const instance = new LeafletGeodesicCircle(center, {
            ...options,
            ...style,
        });
        return { instance, context: { ...ctx, overlayContainer: instance } }
    },

    function updateGeodesicCircle(instance, props, prevProps) {
        const { center, radius, style } = props;
        instance.setLatLng(center);
        instance.setRadius(radius);
        instance.setStyle(style);
    },

);

export default GeodesicCircle;


GeodesicCircle.propTypes = {
    radius: PropTypes.number,
    steps: PropTypes.number,
    style: PropTypes.shape({
        // https://leafletjs.com/reference.html#path-option
        stroke: PropTypes.bool,
        color: PropTypes.string,
        weight: PropTypes.number,
        opacity: PropTypes.number,
        dashArray: PropTypes.string,
        dashOffset: PropTypes.string,
        fill: PropTypes.bool,
        fillColor: PropTypes.string,
        fillOpacity: PropTypes.number,
        fillRule: PropTypes.string,
    }),
};


GeodesicCircle.defaultProps = {
    radius: 1000*1000,
    steps: 24,
    style: {
        stroke: true,
        color: "#3388ff",
        weight: 3,
        opacity: 1.0,
        dashArray: null,
        dashOffset: null,
        fill: true,
        fillColor: null,
        fillOpacity: 0.2,
        fillRule: "evenodd",
    },
};
