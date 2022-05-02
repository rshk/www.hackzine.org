import { createPathComponent } from "@react-leaflet/core";
import { GeodesicLine as LeafletGeodesicLine } from "leaflet.geodesic";
import PropTypes from "prop-types";


const GeodesicLine = createPathComponent(

    function createGeodesicLine({ positions, children, style, ...options }, ctx) {
        const instance = new LeafletGeodesicLine(positions, {
            ...options,
            ...style,
        });
        return { instance, context: { ...ctx, overlayContainer: instance } }
    },

    function updateGeodesicLine(instance, props, prevProps) {
        const { positions, style } = props;
        instance.setLatLngs(positions);
        instance.setStyle(style);
    },

);

export default GeodesicLine;


GeodesicLine.propTypes = {
    positions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
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


GeodesicLine.defaultProps = {
    positions: [],
    steps: 3,
    style: {
        stroke: true,
        color: "#3388ff",
        weight: 3,
        opacity: 1.0,
        dashArray: null,
        dashOffset: null,
        fill: false,
        fillColor: null,
        fillOpacity: 0.2,
        fillRule: "evenodd",
    },
};
