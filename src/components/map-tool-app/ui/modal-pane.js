import * as React from "react";


export default function ModalPane({ children }) {
    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // FIXME check max z-index in leaflet
        zIndex: 999999,
        overflow: 'auto',
    };
    const classes = [
        "position-absolute",
        "bg-dark",  // TODO: can we make this like 80% transparent?
        "m-md-3",
        "p-md-2",
        "shadow",
    ];
    return (
        <div className={classes.join(" ")} style={style}>
            {children}
        </div>
    );
}
