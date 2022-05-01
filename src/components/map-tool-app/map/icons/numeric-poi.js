import * as React from "react";
import * as ReactDOMServer from 'react-dom/server';
import * as L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';


const MARKER_STYLES = [
    {
        name: "red",
        background: "#f44336",
    },
    {
        name: "pink",
        background: "#e91e63",
    },
    {
        name: "purple",
        background: "#9c27b0",
    },
    {
        name: "deep-purple",
        background: "#673ab7",
    },
    {
        name: "indigo",
        background: "#3f51b5",
    },
    {
        name: "blue",
        background: "#2196f3",
    },
    {
        name: "light-blue",
        background: "#03a9f4",
    },
    {
        name: "cyan",
        background: "#00bcd4",
    },
    {
        name: "teal",
        background: "#009688",
    },
    {
        name: "green",
        background: "#4caf50",
    },
    {
        name: "light-green",
        background: "#8bc34a",
    },
    {
        name: "lime",
        background: "#cddc39",
    },
    {
        name: "yellow",
        background: "#ffeb3b",
    },
    {
        name: "amber",
        background: "#ffc107",
    },
    {
        name: "orange",
        background: "#ff9800",
    },
    {
        name: "deep-orange",
        background: "#ff5722",
    },
    {
        name: "brown",
        background: "#607d8b",
    },
];


const MARKER_ICONS = [
    {
        name: "home",
        icon: faHome,
    }
];


export default function makeNumericPOIIcon({
    color = 'red',
    icon = 'home',
} = {}) {

    const size = 30;

    const iconStyle = {
        background: "#E53935",
        color: "#FFEBEE",
        border: "solid 2px #B71C1C",

        fontSize: 14,
        borderRadius: "50%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
    };

    return L.divIcon({
        html: (
            ReactDOMServer.renderToString(
                <div style={iconStyle}>
                    <FontAwesomeIcon icon={faHome} />
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
