import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fromUrl } from 'geotiff';
import { Div, Text } from 'atomize';

const GeoTiffViewer = () => {
    const viewerRef = useRef(null); // D3 그래프를 위한 ref
    const [filename, setFilename] = useState('GRACE_LWE_M_2017-01-07_rgb_720x360.TIFF');
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        async function loadAndRenderTiff() {
            // GeoTIFF 파일 로드
            const tiff = await fromUrl(filename);
            const image = await tiff.getImage();
            const raster = await image.readRasters();
            const colorMap = image.fileDirectory.ColorMap;

            const width = raster.width;
            const height = raster.height;
            setDimensions({ width, height });

            let canvas = d3.select(viewerRef.current).select("canvas").node();
            if (!canvas) {
                canvas = d3.select(viewerRef.current)
                    .append('canvas')
                    .attr('width', width)
                    .attr('height', height)
                    .node();
            } else {
                canvas.width = width;
                canvas.height = height;
            }

            const context = canvas.getContext('2d');
            const imageData = context.createImageData(width, height);

            // for (let i = 0, n = width * height, j = 0; i < n; ++i, j += 4) {
            //     const value = raster[0][i]; // 첫 번째 밴드의 i번째 픽셀
            //     imageData.data[j] = value; // R
            //     imageData.data[j + 1] = value; // G
            //     imageData.data[j + 2] = value; // B
            //     imageData.data[j + 3] = 255; // Alpha
            // }

            for (let i = 0, j = 0; i < raster[0].length; i++, j += 4) {
                const index = raster[0][i]; // 컬러맵 인덱스
                imageData.data[j] = colorMap[index] >> 8; // R
                imageData.data[j + 1] = colorMap[index + 256] >> 8; // G
                imageData.data[j + 2] = colorMap[index + 256 * 2] >> 8; // B
                imageData.data[j + 3] = 255; // Alpha
            }

            context.putImageData(imageData, 0, 0);
        }

        loadAndRenderTiff();
    }, []);

    return (
        <Div pos="relative" d="flex" flexDir="column" align="center" justify="flex-start">
            <Div pos="absolute" top="0" left="0" p="1rem" bg="info200" rounded="xl">
                <Text textSize="body" textColor="dark">
                    {`File Name: ${filename}`}
                </Text>
                <Text textSize="body" textColor="dark">
                    {`Dimensions: ${dimensions.width} x ${dimensions.height}`}
                </Text>
            </Div>
            <Div d="flex" align="center" justify="center" h="80vh" pos="relative">
                <Div pos="relative" ref={viewerRef} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            </Div>
        </Div>
    );
};

export default GeoTiffViewer;
