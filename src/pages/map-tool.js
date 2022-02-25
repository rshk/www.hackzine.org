import * as React from "react";
import { Link } from "gatsby";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, ButtonGroup, Input, Label, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faPencilAlt, faLocationArrow, faTrashAlt, faArrowAltCircleUp } from '@fortawesome/free-solid-svg-icons';

// import * as LeafletGeodesic from "leaflet.geodesic";
import * as GeoMath from "ui/map/geo-math";

import "ui/map/default-icon";
import GeodesicLine from "ui/map/geodesic-line";
import GeodesicCircle from "ui/map/geodesic-circle";
import OsmTileLayer from "ui/map/osm-tile-layer";


const DEFAULT_RESOLUTION = 180;
const ENABLE_COORDINATE_INPUT = false;
const DEFAULT_POINTS = [
    {location: [52.3, -6.6], radius: 200000, showRadius: true},
    {location: [25.3,-80.7], radius: 200000, showRadius: true},
];


export default function MapToolPage() {
    return (
        <div style={{ height: 'calc(100vh - 40px)' }} className="d-flex flex-column">
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
    const [mapCenter, setMapCenter] = React.useState([45, 0]);
    const [mapZoom, setMapZoom] = React.useState(6);

    // Points of interest to show on the map
    const [points, setPoints] = React.useState(DEFAULT_POINTS);

    const locations = points.map(point => point.location);

    // Configuration for the picker tool
    const [pickerTool, setPickerTool] = React.useState({
        isActive: false,
        callback: null,
    });

    // ---------------------------------------------------------------

    // Function to activate the picker tool
    const activatePickerTool = (callback, options) => {
        setPickerTool({
            isActive: true,
            callback,
            label: "Pick a location on the map",
            ...options,
        });
        selectTab("map");
    };

    const deactivatePickerTool = () => {
        setPickerTool({
            isActive: false,
        });
    };

    const onMapClick = event => {
        const {lat, lng} = event.latlng;
        if (pickerTool.isActive) {
            if (pickerTool.callback) {
                pickerTool.callback([lat, lng]);
            }
            setPickerTool({
                isActive: false,
                callback: null,
            });
        }
    };

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
             <div className="flex-grow-1 d-flex flex-column">

                 {pickerTool.isActive &&
                  <div className="bg-white text-black p-2 d-flex justify-content-between align-items-center">
                      <div>{pickerTool.label}</div>
                      <Button onClick={deactivatePickerTool}>
                          Cancel
                      </Button>
                  </div>}

                 <MapContainer
                     center={mapCenter}
                     zoom={mapZoom}
                     style={{}}
                     className="flex-grow-1"
                 >

                     <MapEventHandler
                         onClick={onMapClick}
                         onZoomEnd={(e, map) => setMapZoom(map.getZoom())}
                         onMoveEnd={(e, map) => setMapCenter(map.getCenter())}
                     />

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
                 </MapContainer>
             </div>}

            {selectedTab === "points" &&
             <PointsConfigurationPane
                 points={points}
                 setPoints={setPoints}
                 activatePickerTool={activatePickerTool}
             />}
        </div>
    );
}


function PointsConfigurationPane({ points, setPoints, activatePickerTool }) {

    const onPointChange = (idx, changes) => {
        setPoints([
            ...points.slice(0, idx),
            changes,
            ...points.slice(idx + 1),
        ]);
    };

    const onPointDelete = (idx) => {
        setPoints([
            ...points.slice(0, idx),
            ...points.slice(idx + 1),
        ]);
    };

    const onPointAdd = (point) => {
        setPoints([ ...points, point ]);
    };

    const onAddPickFromMap = () => {
        activatePickerTool(location => {
            onPointAdd({ location });
        });
    };

    return (
        <div>
            {points.map((point, idx) => (
                <PointConfigurationRow
                    key={idx}
                    point={point}
                    nextPoint={points[idx + 1] || null}
                    idx={idx}
                    activatePickerTool={activatePickerTool}
                    onChange={onPointChange.bind(this, idx)}
                    onDelete={onPointDelete.bind(this, idx)}
                />
            ))}
            <div>

                <Button
                    title="Add from map"
                    color="success"
                    className="m-1"
                    onClick={onAddPickFromMap}
                >
                    Add from map
                </Button>

                {ENABLE_COORDINATE_INPUT &&
                 <Button title="Enter coordinates" color="success" className="m-1">
                     Enter coordinates
                 </Button>}

            </div>
        </div>
    );
}


function PointConfigurationRow({
    point, nextPoint, idx, onChange, onDelete, activatePickerTool,
}) {

    const onPickFromMap = () => {
        activatePickerTool(location => {
            onChange({
                ...point,
                location,
            });
        });
    };

    const onPickCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            onChange({
                ...point,
                location: [latitude, longitude],
            });
        });

    };

    const nextPointDistance =
        nextPoint ?
        GeoMath.inverse(point.location, nextPoint.location) :
        null;

    return (
        <div>
            <div className="d-flex flex-column flex-md-row align-items-center my-4 md-my-0">

                <div className="d-flex">
                    <div className="p-1 bg-light text-dark text-center" style={{width: '3em'}}>
                        {idx + 1}
                    </div>
                    <div className="p-1" style={{ minWidth: 300 }}>
                        <LocationDisplay location={point.location} />
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    <div className="p-1">
                        <Label check>
                            <Input
                                type="checkbox"
                                checked={point.showRadius}
                                onChange={event => onChange({
                                    ...point,
                                    showRadius: event.target.checked,
                                })}
                            />
                            {" "}Show radius
                        </Label>
                    </div>
                    <div className="p-1">
                        <InputGroup>
                            <Input
                                type="number"
                                value={point.radius}
                                onChange={event => onChange({
                                    ...point,
                                    radius: event.target.value,
                                })}
                                style={{maxWidth: 120, textAlign: 'right'}}
                            />
                            <InputGroupText className="text-white bg-dark">
                                m
                            </InputGroupText>
                        </InputGroup>
                    </div>
                </div>

                <div className="flex-grow-1" />

                <div className="d-flex align-items-center">
                    <div className="p-1">
                        <ButtonGroup>
                            {ENABLE_COORDINATE_INPUT &&
                             <Button title="Enter coordinates">
                                 <FontAwesomeIcon icon={faPencilAlt} />
                             </Button>}
                            <Button title="Pick from map" onClick={onPickFromMap}>
                                <FontAwesomeIcon icon={faCrosshairs} />
                            </Button>
                            <Button title="Use current location" onClick={onPickCurrentLocation}>
                                <FontAwesomeIcon icon={faLocationArrow} />
                            </Button>
                        </ButtonGroup>
                    </div>
                    <div className="p-1">
                        <Button title="Use current location" color="danger" onClick={onDelete}>
                            <FontAwesomeIcon icon={faTrashAlt} />{" "}
                            Remove
                        </Button>
                    </div>
                </div>

            </div>

            {nextPoint &&
             <div className="m-3 p-3 border border-info d-flex flex-row align-items-center">
                 <FontAwesomeIcon
                     style={{transform: `rotate(${nextPointDistance.initialBearing}deg)`}}
                     size="2x"
                     icon={faArrowAltCircleUp}
                 />
                 <div className="ms-3">
                     <span className="text-muted">Bearing:</span>{" "}
                     <code>{formatBearing(nextPointDistance.initialBearing)}</code>
                 </div>
                 <div className="ms-3">
                     <span className="text-muted">Distance:</span>{" "}
                     <code>{formatDistance(nextPointDistance.distance)}</code>
                 </div>
             </div>}

        </div>
    );
}


function LocationDisplay({ location }) {
    const [fmtId, setFmtId] = React.useState(0);
    const formatter = LOCATION_FORMATTERS[fmtId];
    const setNextFmtId = () => setFmtId((fmtId + 1) % LOCATION_FORMATTERS.length);

    return (
        <div onClick={() => setNextFmtId()} className="mx-3">
            <code className="bg-dark text-white">
                {formatter(location)}
            </code>
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


function MapEventHandler({ onClick, onZoomEnd, onMoveEnd }) {
    const map = useMapEvents({
        click(event) {
            if (onClick) {
                onClick(event, map);
            }
        },
        zoomend(event) {
            if (onZoomEnd) {
                onZoomEnd(event, map);
            }
        },
        moveend(event) {
            if (onMoveEnd) {
                onMoveEnd(event, map);
            }
        }
    })
    return null;
}


function formatDistance(distance) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    if (distance > 1000) {
        return `${formatter.format(distance / 1000)} km`;
    }
    return `${formatter.format(distance)} m`;
}


function formatBearing(bearing) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });
    return `${formatter.format(bearing)}°`;
}
