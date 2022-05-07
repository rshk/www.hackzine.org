import * as React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import { useDispatch } from "react-redux";
import * as actions from "../storage/actions";
import createPoint from "../lib/create-point";
import { LatitudeInput, LongitudeInput } from "./coordinates-input";


export default function CoordinatesInputModal({ onClose }) {
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


CoordinatesInputModal.propTypes = {
    onClose: PropTypes.func.isRequired,
};
