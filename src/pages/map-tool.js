import * as React from "react";
import Layout from "ui/layout";
import { Button } from "reactstrap";


const TARGET_URL = "https://zengis.xk0.org";


export default function MapToolPage() {
    const [counter, setCounter] = React.useState(5);

    React.useEffect(() => {
        setTimeout(() => {
            if (counter <= 0) {
                window.location.href = TARGET_URL;
            }
            setCounter(x => Math.max(0, x - 1));
        }, 1000);
    }, [counter]);

    return <Layout>
        <div className="text-center">
            <h1>Map tool is now ZenGIS</h1>
            <div>It is now a stand-alone app, called ZenGIS.</div>
            <div className="my-3">
                <Button color="success" size="lg" tag="a" href={TARGET_URL}>
                    Go to ZenGIS
                </Button>
            </div>
            <div>You will be redirected in {counter} seconds...</div>
        </div>
    </Layout>;
}
