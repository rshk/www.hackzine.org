import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
import * as _ from "lodash";
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
    InputGroup,
    InputGroupText,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
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
import SettingsPane from "./ui/settings-pane";
import createPoint from "./lib/create-point";
import { getDMS, normalizeLat, normalizeLon } from "./lib/math";
import { LatitudeInput, LongitudeInput } from "./ui/coordinates-input";

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

            // Allow picking multiple times
            multi: false,

            ...options,
        });
        selectTab("map");
    };

    const activatePickNewPointTool = () => {
        activatePickerTool(
            (location, tool) => {
                const newPoint = createPoint({ location });
                dispatch(actions.points.append(newPoint));
                tool.deactivate();
            },
            { name: 'add' },
        );
    };

    const activatePickManyPointsTool = () => {
        activatePickerTool(
            location => {
                const newPoint = createPoint({ location });
                dispatch(actions.points.append(newPoint));
            },
            { name: 'addMany', multi: true },
        );
    };

    const deactivatePickerTool = () => {
        setPickerTool({
            isActive: false,
        });
    };

    // ---------------------------------------------------------------

    const onMapClick = event => {
        const { lat, lng } = event.latlng;
        if (pickerTool.isActive) {

            if (pickerTool.callback) {
                pickerTool.callback([lat, lng], {
                    deactivate: deactivatePickerTool,
                });
            }

            if (!pickerTool.multi) {
                deactivatePickerTool();
            }
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
            {
                id: "input-coordinates",
                label: <>
                    <FontAwesomeIcon className="d-md-none" icon={faCog} />{" "}
                    <span className="d-none d-md-inline">Input coordinates</span>
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

    const renderMultiPickerTool = () => {
        const isActive = pickerTool.isActive && pickerTool.name === "addMany";
        const onClick = () => {
            if (isActive) {
                deactivatePickerTool();
            }
            else {
                activatePickManyPointsTool();
            }
        };
        return (
            <Button active={isActive} onClick={onClick} title="Add many from map">
                <FontAwesomeIcon icon={faCrosshairs} />
            </Button>
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
            <Button onClick={onClick} title="Add current location">
                <FontAwesomeIcon icon={faGlobe} />
            </Button>
        );
    };

    const renderPickerMessage = () => {
        return (
            <div className="bg-white text-black p-2 d-flex justify-content-between align-items-center position-absolute top-0 start-0 end-0" style={{ zIndex: 2000 }}>
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
                        {renderMultiPickerTool()}
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
                        doAddCurrentLocation={doAddCurrentLocation}
                    />}

                {selectedTab === "settings" &&
                    <SettingsPane />}

                {selectedTab === "input-coordinates" &&
                    <CoordinatesInputModal
                        onClose={() => selectTab("map")}
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


function CoordinatesInputModal({ onClose }) {
    const dispatch = useDispatch();
    const [latitude, setLatitude] = React.useState();
    const [longitude, setLongitude] = React.useState();

    const isSubmitEnabled = !!(latitude && longitude);

    const onSubmit = () => {
        if (!(latitude && longitude)) {
            // Nothing to do here
            return;
        }
        const coords = [
            latitude.toDegrees(),
            longitude.toDegrees(),
        ];
        const newPoint = createPoint({ location: coords });
        dispatch(actions.points.append(newPoint));
        onClose();
    };

    return (
        <Modal isOpen toggle={onClose} size="lg">
            <ModalHeader toggle={onClose}>
                Insert coordinates
            </ModalHeader>
            <ModalBody>
                <Label>Latitude:</Label>
                <LatitudeInput value={latitude} onChange={value => setLatitude(value)} />
                <Label>Longitude:</Label>
                <LongitudeInput value={longitude} onChange={value => setLongitude(value)} />
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={onSubmit} disabled={!isSubmitEnabled}>
                    Create point
                </Button>
                {' '}
                <Button onClick={onClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}
