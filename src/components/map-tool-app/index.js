import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
// import PropTypes from "prop-types";
import {
    MapContainer,
    Marker,
    useMap,
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
    faMapMarkerAlt,
    faCog,
} from '@fortawesome/free-solid-svg-icons';
import { faMap } from '@fortawesome/free-regular-svg-icons';
import Div100vh from 'react-div-100vh';
import * as uuid from "uuid";
import { useSelector, useDispatch } from "react-redux";

// import * as LeafletGeodesic from "leaflet.geodesic";
import * as GeoMath from "./lib/geo-math";

import "./map/icons/default";
import makeCustomIcon from "./map/icons/custom";
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
import ModalPane from "./ui/modal-pane";
import PointsConfigurationPane from "./ui/points-pane";


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
                id: "settings",
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faCog} />{" "}
                    <span className="d-none d-md-inline">Settings</span>
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

    const renderDummyMarkers = () => {
        const DUMMY_MARKERS = [
            { position: [46, -10], color: "indigo", text: "1" },
            { position: [46, -9], color: "indigo", text: "2" },
            { position: [46, -8], color: "indigo", text: "3" },
            { position: [46, -7], color: "indigo", text: "4" },
            { position: [46, -6], color: "indigo", text: "5" },
            { position: [46, -5], color: "indigo", text: "6" },
            { position: [46, -4], color: "indigo", text: "7" },
            { position: [46, -3], color: "indigo", text: "8" },
            { position: [46, -2], color: "indigo", text: "9" },
            { position: [46, -1], color: "indigo", text: "10" },
            { position: [46, 0], color: "indigo", text: "11" },
            { position: [46, 1], color: "indigo", text: "12" },
            { position: [46, 2], color: "indigo", text: "13" },
            { position: [46, 3], color: "indigo", text: "14" },
            { position: [46, 4], color: "indigo", text: "15" },
            { position: [46, 5], color: "indigo", text: "16" },
            { position: [46, 6], color: "indigo", text: "17" },
            { position: [46, 7], color: "indigo", text: "18" },
            { position: [46, 8], color: "indigo", text: "..." },
            { position: [46, 9], color: "indigo", text: "999" },

            { position: [45, -3], color: "purple", icon: "home" },
            { position: [45, -2], color: "deep-purple", icon: "anchor" },
            { position: [45, -1], color: "indigo", icon: "parking" },
            { position: [45, 0], color: "blue", icon: "car" },
            { position: [45, 1], color: "light-blue", icon: "gas-pump" },
            { position: [45, 2], color: "cyan", icon: "info" },
            { position: [45, 3], color: "teal", icon: "clinic" },
            { position: [45, 4], color: "green", icon: "farm" },
            { position: [45, 5], color: "light-green", icon: "globe" },
            { position: [45, 6], color: "lime", icon: "soccer" },
            { position: [45, 7], color: "yellow", icon: "star" },
            { position: [45, 8], color: "amber", icon: "american-football" },
            { position: [45, 9], color: "orange", icon: "info" },
            { position: [45, 10], color: "deep-orange", icon: "warning" },
            { position: [45, 11], color: "red", icon: "pizza" },
            { position: [45, 12], color: "pink", icon: "globe" },
            { position: [45, 13], color: "brown", icon: "question" },
            { position: [45, 14], color: "gray", icon: "crosshairs" },
            { position: [45, 15], color: "blue-gray", icon: "marker" },
        ];
        return (
            <CustomLayerGroup minZoom={6}>
                {DUMMY_MARKERS.map(({ position, color, icon, text }, idx) =>
                    <Marker
                        key={idx}
                        position={position}
                        icon={makeCustomIcon({ color, icon, text })}
                    />
                )}
            </CustomLayerGroup>
        );
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

            <div className="flex-grow-1 d-flex flex-column position-relative">
                <div className="flex-grow-1 d-flex flex-column position-relative">
                    {pickerTool.isActive && renderPickerMessage()}
                    {renderMap()}
                </div>

                {selectedTab === "points" &&
                    <PointsConfigurationPane
                        points={points}
                        dispatch={dispatch}
                        activatePickerTool={activatePickerTool}
                    />}

                {selectedTab === "settings" && <SettingsPane />}
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


function CustomLayerGroup({ minZoom = 0, children, ...props }) {
    const map = useMap();
    const currentZoom = map.getZoom();
    const isVisible = currentZoom >= minZoom;
    return (
        <LayerGroup {...props}>
            {isVisible ? children : null}
        </LayerGroup>
    )
}


function SettingsPane() {

    function doFullReset() {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <ModalPane>
            <div className="m-2">
                <h1>Settings</h1>
                <Button color="danger" onClick={() => doFullReset()}>Reset all</Button>
            </div>
        </ModalPane>
    );
}
