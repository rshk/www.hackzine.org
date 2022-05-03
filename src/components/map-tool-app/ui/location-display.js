import * as React from "react";
import PropTypes from "prop-types";
import {
    Button,
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { formatLatLonDMS, formatLatLonDM, formatLatLonPlain } from "../lib/formatting";
import { useSettings } from "../lib/settings";


export default function LocationDisplay({ location }) {
    const settings = useSettings();
    const formatter = LOCATION_FORMATTERS[settings.degreesFormat] || formatLatLonDMS;

    const onCopy = () => {
        const value = formatter(location);
        navigator.permissions.query({ name: "clipboard-write" }).then(result => {
            if (result.state == "granted" || result.state == "prompt") {
                navigator.clipboard.writeText(value).then(function() {
                    /* clipboard successfully set */
                }, function() {
                    /* clipboard write failed */
                });
            }
        });
    };

    return (
        <div className="d-md-flex align-items-center">
            <code className="bg-dark text-white">
                {formatter(location)}
            </code>
            <Button onClick={onCopy} size="sm" className="ms-1" color="link">
                <FontAwesomeIcon icon={faClipboard} />
            </Button>
        </div>
    );
}


LocationDisplay.propTypes = {
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
};


const LOCATION_FORMATTERS = {
    dms: formatLatLonDMS,
    dm: formatLatLonDM,
    deg: formatLatLonPlain,
};
