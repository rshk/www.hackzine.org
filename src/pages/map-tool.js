import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
import { MapContainer, Marker, useMapEvents, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button, ButtonGroup, Input, Label, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faPencilAlt, faLocationArrow, faTrashAlt, faArrowAltCircleUp, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Div100vh from 'react-div-100vh'

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
        <>
            <Helmet>
                <title>Hackzine.org - Map tool</title>
            </Helmet>
            <Div100vh className="d-flex flex-column">
                <div className="d-flex flex-row align-items-center">
                    <div className="flex-grow-1 p-2">
                        <h1>Map tool</h1>
                    </div>
                    <div className="p-2">
                        by <Link to="/">Hackzine.org</Link>
                    </div>
                </div>
                <MapToolWrapper />
            </Div100vh>
        </>
    );
}


function MapToolWrapper() {
    // Skip rendering the map entirely during SSR

    if (typeof window === 'undefined') {
        console.warn("Cannot find window object. Not rendering during SSR.");
        return null;
    }

    return <MapTool />;
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

    const activatePickNewPointTool = () => {
        activatePickerTool(
            location => {
                setPoints(points => [ ...points, { location } ]);
            },
            { name: 'add' },
        );
    };


    const deactivatePickerTool = () => {
        setPickerTool({
            isActive: false,
        });
    };

    // ---------------------------------------------------------------

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

    // ---------------------------------------------------------------

    const exportState = () => {
        return {
            version: 1,
            timestamp: (new Date()).toISOString(),
            mapCenter,
            mapZoom,
            points,
        };
    };

    const importState = (state) => {
        if (state.version !== 1) {
            console.error(`Unsupported state version: ${state.version}`);
            return;
        }
        setPoints(state.points);
        setMapZoom(state.mapZoom);
        setMapCenter(state.mapCenter);
    };

    // ---------------------------------------------------------------

    const renderTabSwitcher = () => {
        const ITEMS = [
            {id: "map", label: "Map"},
            {id: "points", label: "Points"},
            {id: "export", label: "Save"},
        ];
        return (
            <ButtonGroup>
                {ITEMS.map(({id, label}) =>
                    <Button
                        key={id}
                        active={selectedTab === id}
                        onClick={() => selectTab(id)}
                    >
                        {label}
                    </Button>
                )}
            </ButtonGroup>
        );
    };

    const renderPickerTool = () => {
        const isActive = pickerTool.isActive && pickerTool.name === "add";
        const onClick = () => {
            if (isActive) {
                deactivatePickerTool();
            }
            else {
                activatePickNewPointTool();
            }
        };
        return (
            <Button active={isActive} onClick={onClick} title="Add from map">
                <FontAwesomeIcon icon={faCrosshairs} />
            </Button>
        );
    };

    const renderAddCurrentLocationTool = () => {
        const onClick = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const newPoint = { location: [latitude, longitude] };
                setPoints(points => [ ...points, newPoint ]);
            });
        };
        return (
            <Button onClick={onClick} title="Add current location">
                <FontAwesomeIcon icon={faLocationArrow} />
            </Button>
        );
    };

    const renderPickerMessage = () => {
        return (
            <div className="bg-white text-black p-2 d-flex justify-content-between align-items-center position-absolute top-0 start-0 end-0" style={{zIndex: 2000}}>
                <div>{pickerTool.label}</div>
                <Button onClick={deactivatePickerTool}>
                    Cancel
                </Button>
            </div>
        );
    };

    // ---------------------------------------------------------------

    const renderExportTab = () => {

        const LOCALSTORAGE_KEY = "map-tool-state";

        const onSave = () => {
            const state = exportState();
            console.log("Exported state", state);
            if (!checkStorage()) {
                return;
            }
            window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
        };

        const onLoad = () => {
            if (!checkStorage()) {
                return;
            }
            const state = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_KEY));
            console.log("Importing state", state);
            importState(state);
            selectTab("map");
        };

        const checkStorage = () => {
            if (!(window && window.localStorage)) {
                console.error("LocalStorage is not available");
                return false;
            }
            return true;
        };

        return (
            <div>
                <h2>Import / Export</h2>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onLoad}>Load</Button>
            </div>
        );
    };

    return (
        <div className="flex-grow-1 d-flex flex-column position-relative">

            <div className="d-flex flex-row align-items-center bg-dark justify-content-center">
                <div className="p-1">
                    {renderTabSwitcher()}
                </div>
                <div className="p-1 flex-grow-1">
                    {(selectedTab === "map") && <ButtonGroup>
                        {renderPickerTool()}
                        {renderAddCurrentLocationTool()}
                    </ButtonGroup>}
                </div>
            </div>

            {selectedTab === "map" &&
             <div className="flex-grow-1 d-flex flex-column position-relative">

                 {pickerTool.isActive && renderPickerMessage()}

                 <MapContainer
                     center={mapCenter}
                     zoom={mapZoom}
                     className="flex-grow-1"
                     style={{cursor: pickerTool.isActive ? "crosshair" : "pointer"}}
                     zoomControl={false}
                 >

                     <MapEventHandler
                         onClick={onMapClick}
                         onZoomEnd={(e, map) => setMapZoom(map.getZoom())}
                         onMoveEnd={(e, map) => setMapCenter(map.getCenter())}
                     />

                     <ZoomControl position="bottomleft" />

                     <OsmTileLayer />

                     {points.map((point, idx) =>
                         <Marker key={idx} position={point.location}>
                             <Popup>
                                 <PointPopupContent
                                     idx={idx}
                                     point={point}
                                     nextPoint={points[idx + 1] || null}
                                     onDelete={() => setPoints(points => [
                                         ...points.slice(0, idx),
                                         ...points.slice(idx + 1),
                                     ])}
                                 />
                             </Popup>
                         </Marker>
                     )}

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

            {selectedTab === "export" && renderExportTab()}
        </div>
    );
}


function PointPopupContent({ idx, point, nextPoint, onDelete }) {

    const renderDestination = () => {
        if (!nextPoint) {
            return null;
        }
        const nextPointDistance = GeoMath.inverse(point.location, nextPoint.location);
        return (
            <div className="d-flex flex-row align-items-center mt-3">
                <span className="me-1">
                    <FontAwesomeIcon
                        style={{transform: `rotate(${nextPointDistance.initialBearing}deg)`}}
                        size="2x"
                        icon={faArrowAltCircleUp}
                    />
                </span>
                <code className="me-1">
                    {formatBearing(nextPointDistance.initialBearing)}
                </code>{" "}
                <code className="me-1">
                    {formatDistance(nextPointDistance.distance)}
                </code>
            </div>
        );
    };

    return (
        <>
            <div>Point {idx + 1}</div>
            <div className="fs-6">
                <code>{formatLatLonDMS(point.location)}</code>
            </div>
            {!!point.radius && <div>Radius: {formatDistance(point.radius)}</div>}
            {renderDestination()}
            <div className="my-3">
                <Button color="danger" size="sm" onClick={onDelete}>
                    <FontAwesomeIcon icon={faTrashAlt} />{" "}Delete
                </Button>
            </div>
        </>
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
        }, {name: 'add'});
    };

    const onPointMoveUp = (idx) => {
        setPoints(points => {
            console.log("Move point up", points, idx);
            if (idx <= 0) {
                return points;
            }
            return [
                ...points.slice(0, idx - 1),
                points[idx],
                points[idx - 1],
                ...points.slice(idx + 1),
            ];
        });
    };

    const onPointMoveDown = (idx) => {
        setPoints(points => {
            console.log("Move point down", points, idx);
            if (idx >= (points.length - 1)) {
                return points;
            }
            return [
                ...points.slice(0, idx),
                points[idx + 1],
                points[idx],
                ...points.slice(idx + 2),
            ];
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
                    onMoveUp={onPointMoveUp.bind(this, idx)}
                    onMoveDown={onPointMoveDown.bind(this, idx)}
                    isFirst={idx === 0}
                    isLast={idx === points.length - 1}
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
    point, nextPoint, idx, onChange, onDelete, onMoveUp, onMoveDown, activatePickerTool,
    isFirst, isLast,
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

    const renderDestination = () => {
        if (!nextPoint) {
            return null;
        }
        const nextPointDistance = GeoMath.inverse(point.location, nextPoint.location);
        return (
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
            </div>
        );
    };

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
                    </ButtonGroup>{" "}
                    <ButtonGroup>
                        <Button onClick={onMoveUp} disabled={isFirst}>
                            <FontAwesomeIcon icon={faArrowUp} />
                        </Button>
                        <Button onClick={onMoveDown} disabled={isLast}>
                            <FontAwesomeIcon icon={faArrowDown} />
                        </Button>
                    </ButtonGroup>{" "}
                    <Button title="Use current location" color="danger" onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrashAlt} />{" "}
                        Delete
                    </Button>
                </div>

            </div>

            {renderDestination()}

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
    const number_abs = Math.abs(number);
    const degrees = Math.abs(Math.floor(number_abs));
    const minutes = Math.floor((number_abs * 60) % 60);
    const seconds = (number_abs * 3600) % 60;
    return { sign, degrees, minutes, seconds };
}


function formatDMS(dms, pos, neg) {
    const fmtD = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        // Hacky way to show three digits for longitude
        minimumIntegerDigits: (pos === 'E' && neg === 'W') ? 3 : 2,
    });
    const fmtS = new Intl.NumberFormat("en-US", {
        // maximumFractionDigits: 1,
        maximumFractionDigits: 0,
        minimumIntegerDigits: 2,
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
