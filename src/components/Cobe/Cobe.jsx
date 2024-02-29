import React, { useEffect, useRef } from 'react';
import createGlobe from "cobe";

function Cobe() {
    const canvasRef = useRef(null);

    useEffect(() => {
        let phi = 0;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0.1,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 24000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [1, 1, 1],
            glowColor: [1, 1, 1],
            markers: [
                // longitude latitude
                { location: [37.7595, -122.4367], size: 0.05 },
                { location: [37.5642, 127.0016], size: 0.05 }
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            }
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return <canvas ref={canvasRef} style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}></canvas>;
}

export default Cobe;
