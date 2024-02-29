import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as d3 from 'd3';
import { Div, Text } from 'atomize';

const MainGlobe = () => {
    const globeEl = useRef();
    const [popData, setPopData] = useState([]);
    const [dataset, setDataset] = useState('world_population.csv');

    useEffect(() => {
        // load data
        fetch('/world_population.csv').then(res => res.text())
            .then(csv => d3.csvParse(csv, ({ lat, lng, pop }) => ({ lat: +lat, lng: +lng, pop: +pop })))
            .then(setPopData);
    }, []);

    useEffect(() => {
        // Auto-rotate
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.1;
    }, []);

    const weightColor = d3.scaleSequentialSqrt(d3.interpolateYlOrRd)
        .domain([0, 1e7]);

    return (
        // <Globe
        //     globeImageUrl="/earth_texture_10k.jpg"
        //     backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        //     pointLat="lat"
        //     pointLng="lng"
        //     pointColor="color"
        //     pointAltitude="size"
        //     pointRadius="size"
        //     pointsMerge={false}
        //     pointsTransitionDuration={0}
        // />
        <>
            <Div pos="absolute" top="0" left="0" p="1rem" bg="transparent" rounded="xl" zIndex="10">
                <Text textSize="body" textColor="white">
                    {`Dataset: ${dataset}`}
                </Text>
            </Div>
            <Globe
                ref={globeEl}
                // globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                globeImageUrl="/earth_texture_10k.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                hexBinPointsData={popData}
                hexBinPointWeight="pop"
                hexAltitude={d => d.sumWeight * 4e-8}
                hexBinResolution={4}
                hexTopColor={d => weightColor(d.sumWeight)}
                hexSideColor={d => weightColor(d.sumWeight)}
                hexBinMerge={true}
                enablePointerInteraction={false}
            />
        </>
    );
};


export default MainGlobe;
