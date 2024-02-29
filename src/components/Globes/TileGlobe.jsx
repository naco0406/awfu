import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';

const TileGlobe = () => {
  const globeEl = useRef();
  const [tilesData, setTilesData] = useState([]);

  useEffect(() => {
    // 타일 데이터 생성
    const GRID_SIZE = [60, 20]; // 격자 크기 정의
    const COLORS = ['red', 'green', 'yellow', 'blue', 'orange', 'pink', 'brown', 'purple', 'magenta'];
    const tileWidth = 360 / GRID_SIZE[0];
    const tileHeight = 180 / GRID_SIZE[1];
    const generatedTilesData = [];

    for (let lngIdx = 0; lngIdx < GRID_SIZE[0]; lngIdx++) {
      for (let latIdx = 0; latIdx < GRID_SIZE[1]; latIdx++) {
        generatedTilesData.push({
          lng: -180 + lngIdx * tileWidth + tileWidth / 2, // 타일 중심 경도
          lat: -90 + latIdx * tileHeight + tileHeight / 2, // 타일 중심 위도
          color: COLORS[Math.floor(Math.random() * COLORS.length)], // 무작위 색상 선택
          size: 0.5, // 타일 크기
        });
      }
    }

    setTilesData(generatedTilesData);
  }, []);

  useEffect(() => {
    // Auto-rotate 설정
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.5;
  }, []);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={tilesData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0}
      pointRadius="size"
      pointsMerge={true}
      pointsTransitionDuration={0}
    />
  );
};

export default TileGlobe;
