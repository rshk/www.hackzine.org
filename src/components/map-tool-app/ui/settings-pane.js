import * as React from "react";
import {
    Button,
    ButtonGroup,
} from "reactstrap";
import ModalPane from "./modal-pane";
import { useDispatch } from "react-redux";
import * as actions from "../storage/actions";
import {
    useSettings,
    DEGREES_FORMAT_OPTIONS,
    DISTANCE_UNITS_OPTIONS,
    SPEED_UNITS_OPTIONS,
} from "../lib/settings";


export default function SettingsPane() {

    const dispatch = useDispatch();
    const settings = useSettings();

    function doFullReset() {
        localStorage.clear();
        window.location.reload();
    }

    return (
        <ModalPane>
            <div className="m-2">
                <h1>Settings</h1>
                <div className="my3">
                    <h2>Units and formatting</h2>
                    <div>Show degrees in:</div>
                    <div className="text-end">
                        <ButtonGroup>
                            {DEGREES_FORMAT_OPTIONS.map(({ id, label, title }) =>
                                <Button
                                    key={id}
                                    onClick={() => dispatch(actions.settings.update({
                                        degreesFormat: id,
                                    }))}
                                    active={settings.degreesFormat === id}
                                    title={title}
                                >
                                    {label}
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                    <div>Measure distance in:</div>
                    <div className="text-end">
                        <ButtonGroup>
                            {DISTANCE_UNITS_OPTIONS.map(({ id, label, title }) =>
                                <Button
                                    key={id}
                                    onClick={() => dispatch(actions.settings.update({
                                        distanceUnits: id,
                                    }))}
                                    active={settings.distanceUnits === id}
                                    title={title}
                                >
                                    {label}
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                    <div>Measure speed in:</div>
                    <div className="text-end">
                        <ButtonGroup>
                            {SPEED_UNITS_OPTIONS.map(({ id, label, title }) =>
                                <Button
                                    key={id}
                                    onClick={() => dispatch(actions.settings.update({
                                        speedUnits: id,
                                    }))}
                                    active={settings.speedUnits === id}
                                    title={title}
                                >
                                    {label}
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                </div>
                <div className="my-3">
                    <h2>Danger zone</h2>
                    <div className="my-2 border border-danger p-2">
                        WARNING: This will permanently delete all the
                        stored data, including POIs and settings.
                        There is no going back!
                    </div>
                    <Button color="danger" onClick={() => doFullReset()}>
                        Reset all data
                    </Button>
                </div>
            </div>
        </ModalPane>
    );
}
