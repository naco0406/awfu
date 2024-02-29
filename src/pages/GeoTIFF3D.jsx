import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { fromUrl } from 'geotiff';

const GeoTiffViewer = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer();
        async function loadAndDisplayGeoTiff() {
            // GeoTIFF 파일 로드
            const tiff = await fromUrl('/GRACE_LWE_M_2017-01-07_rgb_720x360.TIFF');
            const image = await tiff.getImage();
            const raster = await image.readRasters();
            console.log(raster);

            // Canvas에 래스터 데이터 그리기
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.getWidth();
            canvas.height = image.getHeight();

            const imageData = context.createImageData(canvas.width, canvas.height);
            for (let i = 0, len = canvas.width * canvas.height; i < len; i++) {
                imageData.data[i * 4] = raster[0][i] >> 8; // Red
                imageData.data[i * 4 + 1] = raster[0][i] >> 8; // Green
                imageData.data[i * 4 + 2] = raster[0][i] >> 8; // Blue
                imageData.data[i * 4 + 3] = 255; // Alpha
            }
            context.putImageData(imageData, 0, 0);

            // Three.js 렌더링 로직
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            // const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current.appendChild(renderer.domElement);

            // 텍스처로 Canvas 사용
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            const geometry = new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const plane = new THREE.Mesh(geometry, material);
            scene.add(plane);

            camera.position.z = Math.max(canvas.width, canvas.height) / 10;;
            const animate = function () {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            };
            animate();
        }

        loadAndDisplayGeoTiff();

        // 컴포넌트 언마운트 시 클린업
        return () => {
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef}></div>;
};

export default GeoTiffViewer;
