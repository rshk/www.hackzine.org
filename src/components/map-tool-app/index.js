import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
// import PropTypes from "prop-types";
import { MapContainer, Marker, useMapEvents, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    Button,
    ButtonGroup,
    Input,
    Label,
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCrosshairs,
    faPencilAlt,
    faGlobe,
    faLocationArrow,
    faPlusCircle,
    faTrashAlt,
    faArrowAltCircleUp,
    faArrowUp,
    faArrowDown,
    faCloudDownloadAlt,
    faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faMap } from '@fortawesome/free-regular-svg-icons';
import Div100vh from 'react-div-100vh';
import * as uuid from "uuid";
import { useSelector, useDispatch } from "react-redux";

// import * as LeafletGeodesic from "leaflet.geodesic";
import * as GeoMath from "./lib/geo-math";

import "./map/icons/default";
import GeodesicLine from "./map/geodesic-line";
import GeodesicCircle from "./map/geodesic-circle";
import OsmTileLayer from "./map/layers/osm";
import LocationDisplay from "./ui/location-display";
import {
    formatLatLonDMS,
    formatDistance,
    formatBearing,
} from "./lib/formatting";
import DistanceInput from "./ui/distance-input";
// import ArrayTool from "./lib/array-tool";
import Provider from "./storage/provider";
import * as actions from "./storage/actions";


const DEFAULT_RESOLUTION = 180;
const ENABLE_COORDINATE_INPUT = false;


function createPoint(data) {
    return {
        id: uuid.v4(),
        location: [0, 0],
        label: "",
        radius: 0,
        showRadius: false,
        ...data,
    };
}


// const DEFAULT_POINTS = [];


export default function MapToolPage() {
    return (
        <>
            <Helmet>
                <title>Hackzine.org - Map tool</title>
            </Helmet>
            <Provider>
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
            </Provider>
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
    // const [points, setPoints] = React.useState(DEFAULT_POINTS);
    const dispatch = useDispatch();
    const points = useSelector(({ points = [] }) => points);

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
                const newPoint = createPoint({ location });
                dispatch(actions.points.append(newPoint));
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
        dispatch(actions.points.assign(state.points));
        setMapZoom(state.mapZoom);
        setMapCenter(state.mapCenter);
    };

    // ---------------------------------------------------------------

    const renderTabSwitcher = () => {
        const ITEMS = [
            {
                id: "map",
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faMap} />{" "}
                    <span className="d-none d-md-inline">Map</span>
                </>,
            },
            {
                id: "points",
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faMapMarkerAlt} />{" "}
                    <span className="d-none d-md-inline">Points</span>
                </>,
            },
            {
                id: "export",
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faCloudDownloadAlt} />{" "}
                    <span className="d-none d-md-inline">Load / Save</span>
                </>,
            },
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
                const newPoint = createPoint({
                    location: [latitude, longitude],
                    label: "Current location",
                });
                dispatch(actions.points.append(newPoint));
            });
        };
        return (
            <Button onClick={onClick} title="Add current location">
                <FontAwesomeIcon icon={faGlobe} />
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
            <div className="p-3">
                <h2>Save to local storage</h2>
                <div>Load and save in the current browser</div>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onLoad}>Load</Button>
                <h2>Export</h2>
                <h2>Import JSON</h2>
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
                     zoomControl={false}
                     style={{cursor: 'crosshair'}}>

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
                                     onDelete={() => dispatch(actions.points.remove(idx))}
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
                 dispatch={dispatch}
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


function PointsConfigurationPane({ points, dispatch, activatePickerTool }) {

    const onPointChange = (idx, changes) => {
        dispatch(actions.points.update(idx, changes));
    };

    const onPointDelete = (idx) => {
        dispatch(actions.points.remove(idx));
    };

    const onAddPickFromMap = () => {
        activatePickerTool(location => {
            const newPoint = createPoint({ location });
            dispatch(actions.points.append(newPoint));
        }, {name: 'add'});
    };

    const onAddCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const newPoint = createPoint({
                location: [latitude, longitude],
                label: "Current location",
            });
            dispatch(actions.points.append(newPoint));
        });
    };

    const onPointMoveUp = (idx) => {
        dispatch(actions.points.moveUp(idx));
    };

    const onPointMoveDown = (idx) => {
        dispatch(actions.points.moveDown(idx));
    };

    return (
        <div>
            {points.map((point, idx) => (
                <PointConfigurationRow
                    key={point.id || `point-${idx}`}
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
            <div className="p-1">

                <Button
                    title="Add from map"
                    color="success"
                    className="m-1"
                    onClick={onAddPickFromMap}
                >
                    <FontAwesomeIcon icon={faCrosshairs} /> Add from map
                </Button>

                <Button
                    title="Add current location"
                    color="success"
                    className="m-1"
                    onClick={onAddCurrentLocation}
                >
                    <FontAwesomeIcon icon={faGlobe} /> Add current location
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

    const [selectedTool, setSelectedTool] = React.useState(null);

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

    const getToolSwitchProps = toolName => {
        const isActive = toolName === selectedTool;
        return {
            active: isActive,
            onClick: () => {
                setSelectedTool(isActive ? null : toolName);
            },
        };
    };

    const renderTools = () => {
        return (
            <>
                <ButtonGroup>
                    <Button
                        title="Edit coordinates"
                        {...getToolSwitchProps('edit')}>
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button title="Pick from map" onClick={onPickFromMap}>
                        <FontAwesomeIcon icon={faCrosshairs} />
                    </Button>
                    <Button title="Use current location" onClick={onPickCurrentLocation}>
                        <FontAwesomeIcon icon={faGlobe} />
                    </Button>
                </ButtonGroup>{" "}
                <ButtonGroup>
                    <Button
                        title="Add next point from coordinates"
                        {...getToolSwitchProps('add-absolute')}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} />
                    </Button>
                    <Button
                        title="Navigate to"
                        {...getToolSwitchProps('add-relative')}
                    >
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
        </>
        );
    };

    const renderEditToolPane = () => {
        return (
            <div className="m-3 p-3 border border-light">
                Edit coordinates
                <div className="text-warning">Coming soon!</div>
            </div>
        );
    };

    const renderAddAbsoluteToolPane = () => {
        return (
            <div className="m-3 p-3 border border-success">
                <h4>Add new point</h4>
                <div>Enter coordinates of the new point</div>
                <div className="text-warning">Coming soon!</div>
                <div>
                    <Button color="success">Add point</Button>{" "}
                    <Button onClick={() => setSelectedTool(null)}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    };

    const renderAddRelativeToolPane = () => {
        return (
            <div className="m-3 p-3 border border-success">
                <h4>Navigate</h4>
                <div>Add a next point from bearing / distance</div>
                <div className="text-warning">Coming soon!</div>
                <div>
                    <Button color="success">Add point</Button>{" "}
                    <Button onClick={() => setSelectedTool(null)}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
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
                    <div className="p-1 bg-light text-dark text-center fs-5" style={{width: '3em'}}>
                        {idx + 1}
                    </div>

                    <div className="p-1 d-md-flex align-items-center" style={{ minWidth: 300 }}>
                        {!!point.label && <span className="fs-5 me-2">{point.label}</span>}
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
                    {!!point.showRadius && <div className="p-1">
                        <DistanceInput
                            value={point.radius || 0}
                            onValueChange={radius => onChange({ ...point, radius })}
                            style={{maxWidth: 120, textAlign: 'right'}}
                        />
                    </div>}
                </div>

                <div className="flex-grow-1" />

                <div className="p-1">
                    {renderTools()}
                </div>

                <div className="p-1">
                    <Button title="Use current location" color="danger" onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrashAlt} />{" "}
                        Delete
                    </Button>
                </div>

            </div>

            {selectedTool === "edit" && renderEditToolPane()}
            {renderDestination()}
            {selectedTool === "add-absolute" && renderAddAbsoluteToolPane()}
            {selectedTool === "add-relative" && renderAddRelativeToolPane()}

        </div>
    );
}


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
