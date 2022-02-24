import * as React from "react";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, Input, Label } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import Layout from "ui/layout";
import "ui/map/default-icon";
// import GeodesicLine from "ui/map/geodesic-line";
import GeodesicCircle from "ui/map/geodesic-circle";
import OsmTileLayer from "ui/map/osm-tile-layer";


export default function MapToolPage() {
    return (
        <Layout>
            <MapTool />
        </Layout>
    );
}

function MapTool() {
    const [center, setCenter] = React.useState([50, -6]);
    const [isPickerActive, setPickerActive] = React.useState(false);

    const [circleRadius, setCircleRadius] = React.useState(200 * 1000);
    const [showCircle, setShowCircle] = React.useState(false);

    const setCurrentLocation = ()=> {
        navigator.geolocation.getCurrentPosition((position) => {
            setCenter([position.coords.latitude, position.coords.longitude]);
        });
    };

    const onMapClick = event => {
        const {lat, lng} = event.latlng;
        if (isPickerActive) {
            setCenter([lat, lng]);
            setPickerActive(false);
        }
    };

    const zoomLevel = 6;

    if (typeof window === 'undefined') {
        console.warn("Cannot find window object. Not rendering during SSR.");
        return null;
    }

    return (
        <div>
            <h1>Map tool</h1>

            <div className="d-flex flex-row align-items-center bg-dark">
                <div><strong>A:</strong></div>
                <LocationDisplay location={center} />
                <Button onClick={() => setCurrentLocation()}>
                    <FontAwesomeIcon icon={faCrosshairs} />
                </Button>
                <Button
                    onClick={() => setPickerActive(prev => !prev)}
                    active={isPickerActive}
                    title="Pick location from the map"
                >
                    <FontAwesomeIcon icon={faPencilAlt} />
                </Button>
                <Label className="mx-3">Radius (m):</Label>
                <Input type="number" value={circleRadius}
                       onChange={evt => setCircleRadius(parseInt(evt.target.value, 10))}
                       style={{maxWidth: 100}} />
                <Button active={showCircle} onClick={() => setShowCircle(x => !x)}>
                    Show
                </Button>
            </div>

            <MapContainer
                center={center} zoom={zoomLevel}
                style={{ width: "100%", height: "calc(100vh - 250px)" }}
            >

                <MapEventHandler onClick={onMapClick} />
                <OsmTileLayer />

                <Marker position={center} />

                {showCircle && <GeodesicCircle
                    center={center}
                    pathOptions={{ fillColor: "blue", color: "blue" }}
                    radius={circleRadius}
                    steps={64}
                />}

            </MapContainer>
        </div>
    );
}


function LocationDisplay({ location }) {
    const [fmtId, setFmtId] = React.useState(0);
    const formatter = LOCATION_FORMATTERS[fmtId];
    const setNextFmtId = () => setFmtId((fmtId + 1) % LOCATION_FORMATTERS.length);

    return (
        <div onClick={() => setNextFmtId()} className="mx-3">
            <code>{formatter(location)}</code>
        </div>
    );
}



function formatLatLonDMS([lat, lon]) {
    const latDMS = getDMS(lat);
    const lonDMS = getDMS(lon);
    return `${formatDMS(latDMS, 'N', 'S')}, ${formatDMS(lonDMS, 'E', 'W')}`;
}


function getDMS(number) {
    const sign = number < 0 ? -1 : 1;
    const degrees = Math.abs(Math.floor(number));
    const minutes = Math.floor((number * 60) % 60);
    const seconds = (number * 3600) % 60;
    return { sign, degrees, minutes, seconds };
}


function formatDMS(dms, pos, neg) {
    const fmtD = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    const fmtS = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 1,
    });
    const {degrees, minutes, seconds} = dms;
    const sign = dms.sign < 0 ? neg : pos;
    return `${fmtD.format(degrees)}° ${fmtD.format(minutes)}' ${fmtS.format(seconds)}" ${sign}`;
}


const LOCATION_FORMATTERS = [
    ([lat, lon]) => {
        const fmt = new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 6,
        });
        return `${fmt.format(lat)},${fmt.format(lon)}`;
    },
    formatLatLonDMS,
];


function MapEventHandler({ onClick }) {
    const map = useMapEvents({
        click(event) {
            if (onClick) {
                onClick(event, map);
            }
        },
    })
    return null;
}
