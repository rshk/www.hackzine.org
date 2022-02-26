import * as React from "react";
import PropTypes from "prop-types";
import { Input, FormFeedback } from "reactstrap";
import { parseDistance } from "./parsing";
import { formatDistance } from "./formatting";


export default function DistanceInput({ value, onValueChange, ...props }) {
    const parseValue = parseDistance;
    const normalizeValue = formatDistance;

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

    const onFocus = () => {
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
    value: PropTypes.any.isRequired,
    onValueChange: PropTypes.func.isRequired,
};
