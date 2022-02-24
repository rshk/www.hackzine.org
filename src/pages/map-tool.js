import * as React from "react";
import { Link } from "gatsby";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, ButtonGroup, Input, Label } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faPencilAlt, faLocationArrow, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import Layout from "ui/layout";
import "ui/map/default-icon";
import GeodesicLine from "ui/map/geodesic-line";
import GeodesicCircle from "ui/map/geodesic-circle";
import OsmTileLayer from "ui/map/osm-tile-layer";


const DEFAULT_RESOLUTION = 180;


export default function MapToolPage() {
    return (
        <div style={{ height: '100vh' }} className="d-flex flex-column">
            <div className="d-flex flex-row align-items-center">
                <div className="flex-grow-1 p-2">
                    <h1>Map tool</h1>
                </div>
                <div className="p-2">
                    by <Link to="/">Hackzine.org</Link>
                </div>
            </div>
            <MapTool />
        </div>
    );
}

function MapTool() {
    const [selectedTab, selectTab] = React.useState("map");

    // Points of interest to show on the map
    const [points, setPoints] = React.useState([
        {location: [51.5, -6.5], radius: 200000, showRadius: true},
        {location: [55.5, -9.2], radius: 200000, showRadius: true},
        {location: [34.2, -80.3], radius: 200000, showRadius: true},
    ]);

    const locations = points.map(point => point.location);

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
        <div className="flex-grow-1 d-flex flex-column position-relative">

            <div className="d-flex flex-row align-items-center bg-dark justify-content-center">
                <div className="p-1">
                    <ButtonGroup>
                        <Button
                            active={selectedTab === "map"}
                            onClick={() => selectTab("map")}>
                            Map
                        </Button>
                        <Button
                            active={selectedTab === "points"}
                            onClick={() => selectTab("points")}>
                            POIs
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {selectedTab === "map" &&
             <MapContainer
                 center={center} zoom={zoomLevel}
                 style={{}}
                 className="flex-grow-1"
             >

                 <MapEventHandler onClick={onMapClick} />
                 <OsmTileLayer />

                 {points.map((point, idx) =>
                     <Marker key={idx} position={point.location} />)}

                 {points.map((point, idx) => {
                     if (!point.showRadius) {
                         return null;
                     }
                     return (
                         <GeodesicCircle
                             key={idx}
                             center={point.location}
                             radius={point.radius}
                             steps={DEFAULT_RESOLUTION}
                         />);
                 })}

                 {locations.length > 1 &&
                  <GeodesicLine
                      positions={locations}
                      steps={DEFAULT_RESOLUTION}
                  />
                 }
             </MapContainer>}

            {selectedTab === "points" &&
             <PointsConfigurationPane
                 points={points}
                 setPoints={setPoints}
             />}
        </div>
    );
}


function PointsConfigurationPane({ points, setPoints }) {
    return (
        <div>
            {points.map((point, idx) => (
                <PointConfigurationRow
                    key={idx}
                    point={point}
                    idx={idx}
                />
            ))}
            <div>
                <Button title="Add from map" color="success" className="m-1">
                    Add from map
                </Button>
                <Button title="Enter coordinates" color="success" className="m-1">
                    Enter coordinates
                </Button>
            </div>
        </div>
    );
}


function PointConfigurationRow({ point, idx, onChange }) {
    return (
        <div className="d-flex flex-row align-items-center">
            <div className="p-1">{idx + 1}</div>
            <div className="p-1" style={{ minWidth: 300 }}>
                <LocationDisplay location={point.location} />
            </div>
            <div className="p-1">
                <ButtonGroup>
                    <Button title="Enter coordinates">
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button title="Pick from map">
                        <FontAwesomeIcon icon={faCrosshairs} />
                    </Button>
                    <Button title="Use current location">
                        <FontAwesomeIcon icon={faLocationArrow} />
                    </Button>
                </ButtonGroup>
            </div>
            <div className="flex-grow-1" />
            <div className="p-1">
                <Button title="Use current location" color="danger">
                    <FontAwesomeIcon icon={faTrashAlt} />{" "}
                    Remove
                </Button>
            </div>
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


function formatLatLonPlain([lat, lon]) {
    const fmt = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
    });
    return `${fmt.format(lat)},${fmt.format(lon)}`;
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
    formatLatLonDMS,
    formatLatLonPlain,
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
