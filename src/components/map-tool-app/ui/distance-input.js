import * as React from "react";
import PropTypes from "prop-types";
import { Input, FormFeedback } from "reactstrap";


export default function DistanceInput({ value, onValueChange, ...props }) {

    const parseValue = rawValue => {
        const m = /^(\d+)\s*(.*)$/.exec(rawValue);

        if (!m) {
            throw new Error(`Invalid distance: ${rawValue}`);
        }

        const intValue = parseInt(m[1], 10);
        const suffix = m[2];

        if (["", "m"].includes(suffix)) {
            return intValue;
        }
        if (["k", "km"].includes(suffix)) {
            return intValue * 1000;
        }
        if (suffix === "mi") {
            // Land miles
            return intValue * 1609.34;
        }
        if (["M", "NM", "nm", "nmi"].includes(suffix)) {
            // Nautical miles
            return intValue * 1852;
        }
        if (suffix === "ft") {
            // Feet
            return intValue * 0.3048;
        }
        throw new Error(`Invalid distance units: ${suffix}`);
    };

    const normalizeValue = value => {
        if (value >= 1000) {
            return `${value / 1000} km`;
        }
        return `${value} m`;
    };

    const [rawValue, setRawValue] = React.useState(normalizeValue(value));
    const [errorMessage, setErrorMessage] = React.useState(false);
    const [isFocused, setFocused] = React.useState(false);

    const onChange = event => {
        const newValue = event.target.value;
        console.log("Changed", newValue);
        setRawValue(newValue);
        let parsedValue = null;
        try {
            parsedValue = parseValue(newValue);
        }
        catch (e) {
            setErrorMessage(e.message || "Invalid value");
            return;
        }
        setErrorMessage(null);
        onValueChange(parsedValue);
    };

    const onFocus = (event) => {
        // Select all on focus
        event.target.select();

        setFocused(true);
        setRawValue(normalizeValue(value));
    };

    const onBlur = () => {
        setFocused(false);
        let parsedValue;
        try {
            parsedValue = parseValue(rawValue);
        }
        catch (e) {
            setErrorMessage(e.message || "Invalid value");
            return;
        }
        setErrorMessage(null);
        setRawValue(normalizeValue(parsedValue));
    };

    return (
        <>
            <Input
                invalid={!!errorMessage}
                value={isFocused ? rawValue : normalizeValue(value)}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                {...props}
            />
            {errorMessage && <FormFeedback>{errorMessage}</FormFeedback>}
        </>
    );
}


DistanceInput.propTypes = {
    value: PropTypes.number.isRequired,
    onValueChange: PropTypes.func.isRequired,
};
