import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
import {
    MapContainer,
    Marker,
    useMapEvents,
    Popup,
    ZoomControl,
    ScaleControl,
    LayersControl,
    LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCrosshairs,
    faGlobe,
    faTrashAlt,
    faArrowAltCircleUp,
    faMapMarkerAlt,
    faCog,
    faPlusCircle,
    faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faMap } from '@fortawesome/free-regular-svg-icons';
import Div100vh from 'react-div-100vh';
import { useSelector, useDispatch } from "react-redux";

import * as GeoMath from "./lib/geo-math";

import "./map/icons/default";
import makeCustomIcon from "./map/icons/custom";
import GeodesicLine from "./map/geodesic-line";
import GeodesicCircle from "./map/geodesic-circle";
import OsmTileLayer from "./map/layers/osm";
import {
    formatLatLonDMS,
    formatDistance,
    formatBearing,
} from "./lib/formatting";
import Provider from "./storage/provider";
import * as actions from "./storage/actions";
import PointsConfigurationPane from "./ui/points-pane";
import SettingsPane from "./ui/settings-pane";
import createPoint from "./lib/create-point";
import CoordinatesInputModal from "./ui/coordinates-input-modal";

const DEFAULT_RESOLUTION = 180;
const ROUTE_LINE_STYLE = {
    color: "#3f51b5",
};
const RADIUS_CIRCLE_STYLE = {
    color: "#3f51b5",
    opacity: 0.5,
    stroke: true,
    weight: 3,
    fill: true,
    fillColor: "#3f51b5",
    fillOpacity: .1,
};

const PICKER_TOOL_ADD_ONE = "add";
const PICKER_TOOL_ADD_MANY = "addMany";
// const PICKER_TOOL_UPDATE_LOCATION = ""; // FIXME
const TAB_MAP = "map";
const TAB_POINTS = "points";
const TAB_SETTINGS = "settings";
const TAB_INPUT_COORDINATES = "input-coordinates";


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

    return <MapToolApp />;
}


function MapToolApp() {

    const [selectedTab, selectTab] = React.useState(TAB_MAP);
    // const [mapCenter, setMapCenter] = React.useState([45, 0]);
    // const [mapZoom, setMapZoom] = React.useState(6);
    const uiState = useSelector(({ uiState = {} }) => uiState);
    const {
        map: {
            zoom: mapZoom = 6,
            center: mapCenter = [45, 0],
        } = {}
    } = uiState;
    const setMapCenter = center => dispatch(actions.uiState.map.setCenter(center));
    const setMapZoom = zoom => dispatch(actions.uiState.map.setZoom(zoom));

    // Points of interest to show on the map
    // const [points, setPoints] = React.useState(DEFAULT_POINTS);
    const dispatch = useDispatch();
    const points = useSelector(({ points = [] }) => points);

    const locations = points.map(point => point.location);

    // Configuration for the picker tool
    const pickerTool = usePickerTool(() => selectTab(TAB_MAP));

    // ---------------------------------------------------------------

    const onMapClick = event => {
        const { lat, lng } = event.latlng;
        pickerTool.onPickLocation({ lat, lng });
    };

    const renderTabSwitcher = () => {
        const ITEMS = [
            {
                id: TAB_MAP,
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faMap} />{" "}
                    <span className="d-none d-md-inline">Map</span>
                </>,
            },
            {
                id: TAB_POINTS,
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faMapMarkerAlt} />{" "}
                    <span className="d-none d-md-inline">Points</span>
                </>,
            },
            {
                id: TAB_SETTINGS,
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faCog} />{" "}
                    <span className="d-none d-md-inline">Settings</span>
                </>,
            },
        ];
        return (
            <ButtonGroup>
                {ITEMS.map(({ id, label }) =>
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

    const renderPickerMessage = () => {
        const className = [
            "bg-white", "text-black", "p-2",
            "d-flex", "justify-content-between", "align-items-center",
            "position-absolute", "top-0", "start-0", "end-0",
        ].join(" ");
        return (
            <div className={className} style={{ zIndex: 2000 }}>
                <div>{pickerTool.label}</div>
                <Button onClick={pickerTool.deactivate}>
                    Cancel
                </Button>
            </div>
        );
    };

    const renderPOIs = () => {
        return points.map((point, idx) =>
            <Marker
                key={idx}
                position={point.location}
                icon={makeCustomIcon({
                    text: (idx + 1),
                    color: "indigo",
                    size: 26,
                })}
            >
                <Popup>
                    <PointPopupContent
                        idx={idx}
                        point={point}
                        nextPoint={points[idx + 1] || null}
                        onDelete={() => dispatch(actions.points.remove(idx))}
                    />
                </Popup>
            </Marker>
        );
    };

    const renderPlottedRoutes = () => {
        if (locations.length <= 1) {
            return null;
        }
        return (
            <GeodesicLine
                positions={locations}
                steps={DEFAULT_RESOLUTION}
                style={ROUTE_LINE_STYLE}
            />
        )
    };

    const renderPlottedRadiuses = () => {
        return points.map((point, idx) => {
            if (!point.showRadius) {
                return null;
            }
            return (
                <GeodesicCircle
                    key={idx}
                    center={point.location}
                    radius={point.radius}
                    steps={DEFAULT_RESOLUTION}
                    style={RADIUS_CIRCLE_STYLE}
                />);
        });
    };

    const renderMap = () => {
        return (
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="flex-grow-1"
                zoomControl={false}
                attributionControl={false}
                style={{ cursor: 'crosshair' }}
            >

                <MapEventHandler
                    onClick={onMapClick}
                    onZoomEnd={(e, map) => setMapZoom(map.getZoom())}
                    onMoveEnd={(e, map) => setMapCenter(map.getCenter())}
                />

                <ZoomControl position="bottomleft" />
                <ScaleControl position="topright" />

                <LayersControl position="bottomright">

                    <LayersControl.Overlay name="POIs" checked >
                        <LayerGroup>
                            {renderPOIs()}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="POIs: radius" checked >
                        <LayerGroup>
                            {renderPlottedRadiuses()}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name="POIs: route" checked >
                        <LayerGroup>
                            {renderPlottedRoutes()}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.BaseLayer name="Open Street Map" checked>
                        <OsmTileLayer />
                    </LayersControl.BaseLayer>

                </LayersControl>

            </MapContainer>
        );
    };

    return (
        <div className="flex-grow-1 d-flex flex-column position-relative">

            <div className="d-flex flex-row align-items-center bg-dark justify-content-center my-1">
                <div className="ms-1">
                    {renderTabSwitcher()}
                </div>
                <div className="flex-grow-1 d-flex">
                    {(selectedTab === TAB_MAP) && <>
                        <div className="ms-1">
                            <CreatePointMenu
                                pickerTool={pickerTool}
                                selectedTab={selectedTab}
                                selectTab={selectTab}
                            />
                        </div>
                    </>}
                </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column position-relative">
                <div className="flex-grow-1 d-flex flex-column position-relative">
                    {pickerTool.isActive && renderPickerMessage()}
                    {renderMap()}
                </div>

                {selectedTab === TAB_POINTS &&
                    <PointsConfigurationPane
                        points={points}
                        dispatch={dispatch}
                        pickerTool={pickerTool}
                    />}

                {selectedTab === TAB_SETTINGS &&
                    <SettingsPane />}

                {selectedTab === TAB_INPUT_COORDINATES &&
                    <CoordinatesInputModal
                        onClose={() => selectTab(TAB_MAP)}
                    />}
            </div>

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
                        style={{ transform: `rotate(${nextPointDistance.initialBearing}deg)` }}
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


function CreatePointMenu({
    pickerTool,
    selectedTab,
    selectTab,
}) {

    const [isOpen, setOpen] = React.useState(false);
    const dispatch = useDispatch();

    const renderPickerToolAddOne = () => {
        const isActive = pickerTool.isActive && pickerTool.name === PICKER_TOOL_ADD_ONE;
        const onClick = () => {
            if (isActive) {
                return pickerTool.deactivate();
            }
            pickerTool.activate(
                (location, tool) => {
                    const newPoint = createPoint({ location });
                    dispatch(actions.points.append(newPoint));
                    tool.deactivate();
                },
                { name: PICKER_TOOL_ADD_ONE },
            );
        };
        return (
            <DropdownItem onClick={onClick} active={isActive}>
                <FontAwesomeIcon icon={faPlusCircle} />{" "}
                Pick location from map
            </DropdownItem>
        );
    };

    const renderMultiPickerTool = () => {
        const isActive = pickerTool.isActive && pickerTool.name === PICKER_TOOL_ADD_MANY;
        const onClick = () => {
            if (isActive) {
                return pickerTool.deactivate();
            }
            pickerTool.activate(
                location => {
                    const newPoint = createPoint({ location });
                    dispatch(actions.points.append(newPoint));
                },
                { name: PICKER_TOOL_ADD_MANY, multi: true },
            );
        };
        return (
            <DropdownItem onClick={onClick} active={isActive}>
                <FontAwesomeIcon icon={faPlusCircle} />{" "}
                Pick multiple locations from map
            </DropdownItem>
        );
    };

    const doAddCurrentLocation = () => {
        const currentDate = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(new Date());

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const newPoint = createPoint({
                location: [latitude, longitude],
                label: `Location on ${currentDate}`,
            });
            dispatch(actions.points.append(newPoint));
        });
    };

    const renderAddCurrentLocationTool = () => {
        const onClick = () => doAddCurrentLocation();
        return (
            <DropdownItem onClick={onClick}>
                <FontAwesomeIcon icon={faGlobe} />{" "}
                Add current location
            </DropdownItem>
        );
    };

    const renderEnterCoordinatesTool = () => {
        return (
            <DropdownItem
                onClick={() => selectTab(TAB_INPUT_COORDINATES)}
                active={selectedTab == TAB_INPUT_COORDINATES}
            >
                <FontAwesomeIcon icon={faPencilAlt} />{" "}
                Enter coordinates
            </DropdownItem>
        );
    };

    return (
        <Dropdown
            isOpen={isOpen}
            toggle={() => setOpen(state => !state)}
        >
            <DropdownToggle color="success">
                <FontAwesomeIcon icon={faPlusCircle} />{" "}
                <span className="d-none d-md-inline">Add</span>
            </DropdownToggle>

            <DropdownMenu>
                {renderPickerToolAddOne()}
                {renderMultiPickerTool()}
                {renderAddCurrentLocationTool()}
                {renderEnterCoordinatesTool()}
            </DropdownMenu>
        </Dropdown>
    );
}


function usePickerTool(selectMap) {

    // Configuration for the picker tool
    const [pickerTool, setPickerTool] = React.useState({
        isActive: false,
        callback: null,
    });

    // ---------------------------------------------------------------

    // Function to activate the picker tool
    const activate = (callback, options) => {
        setPickerTool({
            isActive: true,
            callback,
            label: "Pick a location on the map",

            // Allow picking multiple times
            multi: false,

            ...options,
        });

        // Switch to the map tab
        selectMap && selectMap();
    };

    const deactivate = () => {
        setPickerTool({
            isActive: false,
        });
    };

    const onPickLocation = ({ lat, lng }) => {
        if (pickerTool.isActive) {
            if (pickerTool.callback) {
                pickerTool.callback([lat, lng], { deactivate });
            }
            if (!pickerTool.multi) {
                deactivate();
            }
        }
    };

    return {
        ...pickerTool,
        activate,
        deactivate,
        onPickLocation,
    };
}
