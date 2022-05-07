import * as React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import {
    Button,
    // ButtonGroup,
    Input,
    Label,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
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
    faEdit,
    faBars,
} from '@fortawesome/free-solid-svg-icons';

// import * as LeafletGeodesic from "leaflet.geodesic";
import * as GeoMath from "../lib/geo-math";
import {
    formatDistance,
    formatBearing,
} from "../lib/formatting";
import * as actions from "../storage/actions";
import createPoint from "../lib/create-point";
import LocationDisplay from "./location-display";
import DistanceInput from "./distance-input";
import ModalPane from "./modal-pane";

const ENABLE_COORDINATE_INPUT = false;


export default function PointsConfigurationPane({
    pickerTool,
}) {

    const dispatch = useDispatch();
    const points = useSelector(({ points = [] }) => points);

    const onPointChange = (idx, changes) => {
        dispatch(actions.points.update(idx, changes));
    };

    const onPointDelete = (idx) => {
        dispatch(actions.points.remove(idx));
    };

    const onAddPickFromMap = () => {
        pickerTool.activate(location => {
            const newPoint = createPoint({ location });
            dispatch(actions.points.append(newPoint));
        }, {name: 'add'});
    };

    const onPointMoveUp = (idx) => {
        dispatch(actions.points.moveUp(idx));
    };

    const onPointMoveDown = (idx) => {
        dispatch(actions.points.moveDown(idx));
    };

    return (
        <ModalPane>
            {points.map((point, idx) => (
                <PointConfigurationRow
                    key={point.id || `point-${idx}`}
                    point={point}
                    nextPoint={points[idx + 1] || null}
                    idx={idx}
                    pickerTool={pickerTool}
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

                {ENABLE_COORDINATE_INPUT &&
                 <Button title="Enter coordinates" color="success" className="m-1">
                     Enter coordinates
                 </Button>}

            </div>
        </ModalPane>
    );
}


function PointConfigurationRow({
    point,
    nextPoint,
    idx,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    pickerTool,
    isFirst,
    isLast,
}) {

    const [menuOpen, setMenuOpen] = React.useState(false);
    const [selectedTool, setSelectedTool] = React.useState(null);

    const onPickFromMap = () => {
        pickerTool.activate(location => {
            onChange({ ...point, location });
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

    const onRename = () => {
        const label = prompt("New label", point.label || "");
        if (label === null) {
            return;  // dismissed
        }
        onChange({ ...point, label });
    }

    const getToolSwitchProps = toolName => {
        const isActive = toolName === selectedTool;
        return {
            active: isActive,
            onClick: () => {
                setSelectedTool(isActive ? null : toolName);
            },
        };
    };

    const renderMenuDropdown = () => {
        return (
            <Dropdown
                isOpen={menuOpen}
                toggle={() => setMenuOpen(state => !state)}
            >
                <DropdownToggle color="primary">
                    <FontAwesomeIcon icon={faBars} />
                </DropdownToggle>

                <DropdownMenu>

                    <DropdownItem header>
                        Details
                    </DropdownItem>

                    <DropdownItem onClick={onRename}>
                        <FontAwesomeIcon icon={faPencilAlt} />{" "}
                        Rename
                    </DropdownItem>

                    <DropdownItem header>
                        Move point
                    </DropdownItem>

                    <DropdownItem {...getToolSwitchProps('edit')}>
                        <FontAwesomeIcon icon={faEdit} />{" "}
                        Edit coordinates
                    </DropdownItem>

                    <DropdownItem onClick={onPickFromMap}>
                        <FontAwesomeIcon icon={faCrosshairs} />{" "}
                        Pick from map
                    </DropdownItem>

                    <DropdownItem onClick={onPickCurrentLocation}>
                        <FontAwesomeIcon icon={faGlobe} />{" "}
                        Use current location
                    </DropdownItem>

                    <DropdownItem header>
                        Add point
                    </DropdownItem>

                    <DropdownItem {...getToolSwitchProps('add-relative')}>
                        <FontAwesomeIcon icon={faLocationArrow} />{" "}
                        From distance / bearing
                    </DropdownItem>

                    <DropdownItem header>
                        Arrange
                    </DropdownItem>

                    <DropdownItem onClick={onMoveUp} disabled={isFirst}>
                        <FontAwesomeIcon icon={faArrowUp} />{" "}
                        Move up
                    </DropdownItem>

                    <DropdownItem onClick={onMoveDown} disabled={isLast}>
                        <FontAwesomeIcon icon={faArrowDown} />{" "}
                        Move down
                    </DropdownItem>

                    <DropdownItem header>
                        Delete
                    </DropdownItem>

                    <DropdownItem onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrashAlt} />{" "}
                        Delete
                    </DropdownItem>

                </DropdownMenu>
            </Dropdown>
        );
    };

//     const renderTools = () => {
//         return (
//             <>
//                 <ButtonGroup>
//                     <Button
//                         title="Edit coordinates"
//                         {...getToolSwitchProps('edit')}>
//                         <FontAwesomeIcon icon={faPencilAlt} />
//                     </Button>
//                     <Button title="Pick from map" onClick={onPickFromMap}>
//                         <FontAwesomeIcon icon={faCrosshairs} />
//                     </Button>
//                     <Button title="Use current location" onClick={onPickCurrentLocation}>
//                         <FontAwesomeIcon icon={faGlobe} />
//                     </Button>
//                 </ButtonGroup>{" "}
//                 <ButtonGroup>
//                     <Button
//                         title="Add next point from coordinates"
//                         {...getToolSwitchProps('add-absolute')}
//                     >
//                         <FontAwesomeIcon icon={faPlusCircle} />
//                     </Button>
//                     <Button
//                         title="Navigate to"
//                         {...getToolSwitchProps('add-relative')}
//                     >
//                         <FontAwesomeIcon icon={faLocationArrow} />
//                     </Button>
//                 </ButtonGroup>{" "}
//                 <ButtonGroup>
//                     <Button onClick={onMoveUp} disabled={isFirst}>
//                         <FontAwesomeIcon icon={faArrowUp} />
//                     </Button>
//                     <Button onClick={onMoveDown} disabled={isLast}>
//                         <FontAwesomeIcon icon={faArrowDown} />
//                     </Button>
//                 </ButtonGroup>{" "}
//             </>
//         );
//     };

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
        <div className="p-1">
            <div className="d-flex w-100">
                <div>
                    <MarkerNumberBubble>
                        {idx + 1}
                    </MarkerNumberBubble>
                </div>
                <div className="flex-grow-1 mx-2">
                    <span className="fs-5 me-2">
                        {point.label || <span className="text-muted">Unnamed point</span>}
                    </span>
                    <LocationDisplay location={point.location} />
                </div>
                <div>
                    {renderMenuDropdown()}
                </div>
            </div>

            <div>

                <div>
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
                            {" "}Show distance
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

            </div>

            {selectedTool === "edit" && renderEditToolPane()}
            {renderDestination()}
            {selectedTool === "add-absolute" && renderAddAbsoluteToolPane()}
            {selectedTool === "add-relative" && renderAddRelativeToolPane()}

        </div>
    );
}


function MarkerNumberBubble({ children }) {
    const style = {
        background: "#3f51b5",
        width: 40,
        height: 40,
        borderRadius: '50%',
        color: "#fff",
    };
    return (
        <div className="d-flex flex-column align-items-center justify-content-center"
             style={style}>
            {children}
        </div>
    );
}
