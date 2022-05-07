import * as React from "react";
import {
    Input,
    InputGroup,
    InputGroupText,
} from "reactstrap";
import Degrees, { Latitude, Longitude } from "../lib/degrees";
import {
    SYMBOL_DEGREES,
    SYMBOL_MINUTES,
    SYMBOL_SECONDS,
    SYMBOL_NORTH,
    SYMBOL_SOUTH,
    SYMBOL_EAST,
    SYMBOL_WEST,
} from "../lib/formatting";


export function LatitudeInput({ value, onChange }) {
    return <BaseCoordinatesInput
               value={value}
               onChange={onChange}
               stateFromPropValue={latitudeStateFromValue}
               degreesClass={Latitude}
               positiveSignSymbol={SYMBOL_NORTH}
               negativeSignSymbol={SYMBOL_SOUTH}
    />;
}


export function LongitudeInput({ value, onChange }) {
    return <BaseCoordinatesInput
               value={value}
               onChange={onChange}
               stateFromPropValue={longitudeStateFromValue}
               degreesClass={Longitude}
               positiveSignSymbol={SYMBOL_EAST}
               negativeSignSymbol={SYMBOL_WEST}
    />;
}


function BaseCoordinatesInput({
    value,
    onChange,
    stateFromPropValue,
    degreesClass,
    positiveSignSymbol,
    negativeSignSymbol,
}) {

    const [rawValue, setRawValue] = React.useState(stateFromPropValue(value));

    const stateToDegrees = state => {
        const { sign, degrees, minutes, seconds } = state;
        return degreesClass.fromDMS(
            parseFloatOrZero(degrees),
            parseFloatOrZero(minutes),
            parseFloatOrZero(seconds),
            sign === negativeSignSymbol ? -1 : 1,
        );
    };

    const onFieldChange = (name, event) => {
        const { target: { value } } = event;
        setRawValue(state => ({ ...state, [name]: value }));
    };

    const onFieldBlur = () => {
        const parsedValue = stateToDegrees(rawValue);

        // Normalize field value
        const normalized = stateFromPropValue(parsedValue);
        setRawValue(normalized);

        // Notify caller that we have a new value
        onChange(parsedValue);
    };

    const getFieldProps = name => {
        return ({
            value: rawValue[name],
            onChange: onFieldChange.bind(this, name),
            onBlur: onFieldBlur.bind(this, name),
        });
    };

    return (
        <div className="d-flex flex-row">
            <InputGroup>
                <Input
                    type="number"
                    placeholder="degrees"
                    {...getFieldProps("degrees")}
                />
                <InputGroupText>{SYMBOL_DEGREES}</InputGroupText>
                <Input
                    type="number"
                    placeholder="minutes"
                    {...getFieldProps("minutes")}
                />
                <InputGroupText>{SYMBOL_MINUTES}</InputGroupText>
                <Input
                    type="number"
                    placeholder="seconds"
                    {...getFieldProps("seconds")}
                />
                <InputGroupText>{SYMBOL_SECONDS}</InputGroupText>
            </InputGroup>
            <Input
                type="select"
                className="ms-1"
                style={{ width: 80 }}
                {...getFieldProps("sign")}>
                <option>{positiveSignSymbol}</option>
                <option>{negativeSignSymbol}</option>
            </Input>
        </div>
    );
}


function latitudeStateFromValue(value) {
    return _coordinateStateFromValue(value, Latitude, SYMBOL_NORTH, SYMBOL_SOUTH);
}


function longitudeStateFromValue(value) {
    return _coordinateStateFromValue(value, Longitude, SYMBOL_EAST, SYMBOL_WEST);
}


function _coordinateStateFromValue(value, degreesClass, posSymbol, negSymbol) {
    if (value === null) {
        return ({
            degrees: "",
            minutes: "",
            seconds: "",
            sign: posSymbol,
        });
    }
    if (!(value instanceof Degrees)) {
        value = degreesClass.fromDegrees(value);
    }
    const { sign, degrees, minutes, seconds } = value.toDMS();
    return ({
        degrees: degrees.toString(),
        minutes: minutes.toString(),
        seconds: seconds.toString(),
        sign: sign < 0 ? negSymbol : posSymbol,
    });
}


function parseFloatOrZero(rawValue) {
    if (!rawValue) {
        return 0;
    }
    const value = parseFloat(rawValue);
    if ((!isFinite(value)) || isNaN(value)) {
        return 0;
    }
    return value;
}
