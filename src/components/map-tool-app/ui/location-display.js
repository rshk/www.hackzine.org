import * as React from "react";
import PropTypes from "prop-types";
import {
    Button,
    ButtonGroup,
} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { formatLatLonDMS, formatLatLonPlain } from "../lib/formatting";


export default function LocationDisplay({ location }) {
    const [fmtId, setFmtId] = React.useState(0);
    const formatter = LOCATION_FORMATTERS[fmtId].formatter;

    const onCopy = () => {
        const value = formatter(location);
        navigator.permissions.query({name: "clipboard-write"}).then(result => {
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
            <div className="me-1">
                <code className="bg-dark text-white">
                    {formatter(location)}
                </code>
            </div>
            <ButtonGroup>
                {LOCATION_FORMATTERS.map(({ label, title }, idx) =>
                    <Button
                        key={idx}
                        onClick={() => setFmtId(idx)}
                        size="sm"
                        active={idx === fmtId}
                        title={title}
                    >
                        {label}
                    </Button>
                )}
            </ButtonGroup>{" "}
            <Button onClick={onCopy} size="sm" className="ms-1">
                <FontAwesomeIcon icon={faClipboard} />
            </Button>
        </div>
    );
}


LocationDisplay.propTypes = {
    location: PropTypes.arrayOf(PropTypes.number).isRequired,
};


const LOCATION_FORMATTERS = [
    { label: "DMS", title: "Degrees, Minutes, Seconds", formatter: formatLatLonDMS },
    { label: "Dec", title: "Decimal", formatter: formatLatLonPlain },
];
