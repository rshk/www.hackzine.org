import * as React from "react";


export default function DemoComponent() {
    return <div>
        This is a component
        <button type="button" onClick={() => alert("clicked")}>Click me</button>
    </div>;
}
