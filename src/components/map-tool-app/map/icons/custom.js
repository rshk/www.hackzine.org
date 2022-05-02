import * as React from "react";
import * as ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faUtensils,
    faCar,
    faGasPump,
    faParking,
    faStar,
    faClinicMedical,
    faTractor,
    faPizzaSlice,
    faFootballBall,
    faBowlingBall,
    faFutbol,
    faAnchor,
    faAppleAlt,
    faExclamationTriangle,
    faInfoCircle,
    faQuestionCircle,
    faMapMarker,
    faCrosshairs,
    faGlobe,
} from '@fortawesome/free-solid-svg-icons';


const MARKER_THEMES = [
    {
        "name": "red",
        "background": "#f44336",
        "color": "#ffebee",
        "borderColor": "#b71c1c"
    },
    {
        "name": "pink",
        "background": "#e91e63",
        "color": "#fce4ec",
        "borderColor": "#880e4f"
    },
    {
        "name": "purple",
        "background": "#9c27b0",
        "color": "#f3e5f5",
        "borderColor": "#4a148c"
    },
    {
        "name": "deep-purple",
        "background": "#673ab7",
        "color": "#ede7f6",
        "borderColor": "#311b92"
    },
    {
        "name": "indigo",
        "background": "#3f51b5",
        "color": "#e8eaf6",
        "borderColor": "#1a237e"
    },
    {
        "name": "blue",
        "background": "#2196f3",
        "color": "#e3f2fd",
        "borderColor": "#0d47a1"
    },
    {
        "name": "light-blue",
        "background": "#03a9f4",
        "color": "#e1f5fe",
        "borderColor": "#01579b"
    },
    {
        "name": "cyan",
        "background": "#00bcd4",
        "color": "#e0f7fa",
        "borderColor": "#006064"
    },
    {
        "name": "teal",
        "background": "#009688",
        "color": "#e0f2f1",
        "borderColor": "#004d40"
    },
    {
        "name": "green",
        "background": "#4caf50",
        "color": "#e8f5e9",
        "borderColor": "#1b5e20"
    },
    {
        "name": "light-green",
        "background": "#8bc34a",
        "color": "#f1f8e9",
        "borderColor": "#33691e"
    },
    {
        "name": "lime",
        "background": "#cddc39",
        "color": "#f9fbe7",
        "borderColor": "#827717"
    },
    {
        "name": "yellow",
        "background": "#ffeb3b",
        "color": "#fffde7",
        "borderColor": "#f57f17"
    },
    {
        "name": "amber",
        "background": "#ffc107",
        "color": "#fff8e1",
        "borderColor": "#ff6f00"
    },
    {
        "name": "orange",
        "background": "#ff9800",
        "color": "#fff3e0",
        "borderColor": "#e65100"
    },
    {
        "name": "deep-orange",
        "background": "#ff5722",
        "color": "#fbe9e7",
        "borderColor": "#bf360c"
    },
    {
        "name": "brown",
        "background": "#795548",
        "color": "#efebe9",
        "borderColor": "#3e2723"
    },
    {
        "name": "gray",
        "background": "#9e9e9e",
        "color": "#fafafa",
        "borderColor": "#212121"
    },
    {
        "name": "blue-gray",
        "background": "#607d8b",
        "color": "#eceff1",
        "borderColor": "#263238"
    }
];


const MARKER_ICONS = [
    { name: "american-football", icon: faFootballBall },
    { name: "anchor", icon: faAnchor },
    { name: "apple", icon: faAppleAlt },
    { name: "bowling", icon: faBowlingBall },
    { name: "car", icon: faCar },
    { name: "clinic", icon: faClinicMedical },
    { name: "farm", icon: faTractor },
    { name: "gas-pump", icon: faGasPump },
    { name: "home", icon: faHome },
    { name: "parking", icon: faParking },
    { name: "pizza", icon: faPizzaSlice },
    { name: "restaurant", icon: faUtensils },
    { name: "soccer", icon: faFutbol },
    { name: "star", icon: faStar },
    { name: "star", icon: faStar },
    { name: "warning", icon: faExclamationTriangle },
    { name: "info", icon: faInfoCircle },
    { name: "question", icon: faQuestionCircle },
    { name: "marker", icon: faMapMarker },
    { name: "crosshairs", icon: faCrosshairs },
    { name: "globe", icon: faGlobe },
];


const _MARKER_THEMES_BY_NAME = Object.fromEntries(
    MARKER_THEMES.map(x => [x.name, x])
);


const _MARKER_ICONS_BY_NAME = Object.fromEntries(
    MARKER_ICONS.map(x => [x.name, x])
);


export default function makeCustomIcon({
    color = "red",
    icon = null,
    text = null,
    size = 30,
} = {}) {

    const theme = _MARKER_THEMES_BY_NAME[color];

    const renderContent = () => {
        if (icon) {
            const _icon = _MARKER_ICONS_BY_NAME[icon];
            if (_icon) {
                return <FontAwesomeIcon icon={_icon.icon} />;
            }
        }
        return text;
    };

    const markerStyle = {
        background: "#E53935",
        // color: "#FFEBEE",
        // border: "solid 2px #000",

        fontSize: size * 0.5,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,

        ...theme,
        color: "#fff",
    };

    return L.divIcon({
        html: (
            ReactDOMServer.renderToString(
                <div style={markerStyle}>
                    {renderContent()}
                </div>
            )
        ),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -20],
        tooltipAnchor: [0, -20],
        className: "",
    });
}
