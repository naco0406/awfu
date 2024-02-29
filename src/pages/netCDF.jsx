import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { timeParse, timeFormat } from 'd3-time-format';
import { NetCDFReader } from 'netcdfjs';
import { Div, Text, Input, Icon, Button } from 'atomize';

// 데이터 필터링 및 색상 척도 계산 함수
const calculateFilteredColorScale = (data) => {
    // 데이터에서 null, undefined, NaN 값을 제외
    const validData = data.filter(val => val !== null && val !== undefined && !isNaN(val));

    // 데이터의 1% 및 99% 백분위수 계산
    const q1 = d3.quantile(validData.sort(d3.ascending), 0.00);
    const q99 = d3.quantile(validData, 0.27);

    // 데이터를 [q1, q99] 범위로 제한
    const filteredData = validData.map(val => Math.max(q1, Math.min(val, q99)));

    // 필터링된 데이터를 기반으로 색상 척도 생성
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain(d3.extent(filteredData));

    return { colorScale, q1, q99 };
};

// 색상 척도 척도(legend)를 그리는 함수
const drawColorScaleLegend = (svg, colorScale, width, height, heightPosition) => {
    const legendHeight = height; // 척도의 높이
    const legendWidth = width * 0.8; // 척도의 너비는 캔버스 너비의 80%
    const legendMargin = { top: heightPosition, right: width * 0.1, bottom: 30, left: width * 0.1 };

    // 척도 데이터 생성
    const numStops = 10; // 척도에 표시할 색상 수
    const range = colorScale.domain();
    const domain = d3.range(range[0], range[1], (range[1] - range[0]) / numStops);

    // 척도 그리기
    const legend = svg.append("g")
        .attr("transform", `translate(${legendMargin.left}, ${height - legendMargin.bottom})`);

    legend.selectAll("rect")
        .data(domain)
        .enter().append("rect")
        .attr("x", (d, i) => i * (legendWidth / numStops))
        .attr("y", heightPosition + 10)
        .attr("width", legendWidth / numStops)
        .attr("height", legendHeight)
        .style("fill", d => colorScale(d));

    // 척도에 텍스트 레이블 추가
    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 0)
        .attr("y", heightPosition + legendHeight + 30)
        .text(formatNumberToExponential(range[0]));

    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", legendWidth)
        .attr("y", heightPosition + legendHeight + 30)
        .attr("text-anchor", "end")
        .text(formatNumberToExponential(range[1]));
};

// 숫자를 지수 형태로 변환하는 함수
function formatNumberToExponential(num) {
    if (num === 0) return "0";

    const exponent = Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10^${exponent}`;
}


const NetCDFViewer = () => {
    const viewerRef = useRef(null);
    const dimensions = { width: 720, height: 360 }; // 캔버스 크기 설정
    const [timeIndex, setTimeIndex] = useState(0);
    const [tempTimeIndex, setTempTimeIndex] = useState(0);
    const [totalTimeSteps, setTotalTimeSteps] = useState(0);
    const [cacheTimeIndex, setCacheTimeIndex] = useState(0);
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [caching, setCaching] = useState(false); // 로딩 상태
    const stopCaching = useRef(false); // 중지 신호를 위한 ref
    const timePerStep = 0.25; // 각 타임스텝 처리 시간 (초)
    const estimatedTime = (totalTimeSteps - cacheTimeIndex) * timePerStep / 60; // 예상 소요 시간 (분)

    const [isPlaying, setIsPlaying] = useState(false); // 재생 상태를 추적하는 상태 변수
    const [playingInterval, setPlayingInterval] = useState(500);
    const playIntervalRef = useRef(null); // setInterval을 관리하기 위한 ref
    // 재생 함수
    const play = () => {
        if (isPlaying) return; // 이미 재생 중이라면 실행하지 않음
        setIsPlaying(true); // 재생 상태를 true로 설정

        playIntervalRef.current = setInterval(() => {
            setTimeIndex((prevTimeIndex) => {
                const nextTimeIndex = prevTimeIndex + 1;
                if (nextTimeIndex >= totalTimeSteps) { // 마지막 timeIndex에 도달하면 중지
                    clearInterval(playIntervalRef.current);
                    setIsPlaying(false); // 재생 상태를 false로 설정
                    return 0; // 처음부터 다시 시작
                }
                return nextTimeIndex;
            });
            setTempTimeIndex((prevTempTimeIndex) => {
                const nextTempTimeIndex = prevTempTimeIndex + 1;
                return nextTempTimeIndex;
            });
        }, playingInterval); // 1000ms마다 timeIndex 업데이트
    };
    // 중지 함수
    const pause = () => {
        clearInterval(playIntervalRef.current); // setInterval 중지
        setIsPlaying(false); // 재생 상태를 false로 설정
    };
    // 리셋 함수
    const reset = () => {
        clearInterval(playIntervalRef.current); // 재생 중지
        setIsPlaying(false); // 재생 상태를 false로 설정
        setTimeIndex(0); // timeIndex를 0으로 재설정
        setTempTimeIndex(0);
    };

    const dataCache = useRef({}); // 데이터 캐싱을 위한 ref 객체
    const cacheAllData = async () => {
        if (caching) {
            // 이미 캐싱 중이면 중지 요청
            stopCaching.current = true;
            return;
        }
        const confirm = window.confirm(`This might take a long time.\nEstimated time required: ${estimatedTime.toFixed(2)}min\nDo you want to continue?`);
        if (!confirm) {
            return; // 사용자가 취소를 선택한 경우 작업 중단
        }
        setCaching(true);
        setLoading(true);
        stopCaching.current = false;

        const urlpath = "/mrro_v3_reduced.nc";

        try {
            const response = await fetch(urlpath);
            const arrayBuffer = await response.arrayBuffer();
            const reader = new NetCDFReader(arrayBuffer);

            if (!reader.getDataVariable('mrro')) {
                console.error('Data variable "mrro" not found in the file');
                return;
            }

            for (let i = 0; i < totalTimeSteps; i++) {
                if (stopCaching.current) {
                    console.log("Caching stopped");
                    break;
                }
                await cacheTimeStepData(reader, i); // 각 타임스텝 데이터 캐싱을 비동기로 순차 실행
            }
        } catch (error) {
            console.error('Error loading or processing netCDF data:', error);
        } finally {
            setCaching(false);
            setLoading(false);
            if (!stopCaching.current) {
                alert("모든 데이터의 캐싱이 완료되었습니다.");
            }
            stopCaching.current = false; // 중지 신호 초기화
            setCacheTimeIndex(0);
        }
    };

    const cacheTimeStepData = async (reader, timeStepIndex) => {
        console.log(timeStepIndex);

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        setCacheTimeIndex(timeStepIndex);
        await delay(1);

        const mrroData = reader.getDataVariable('mrro')[timeStepIndex];
        const lat = reader.getDataVariable('lat');
        const lon = reader.getDataVariable('lon');

        const { colorScale } = calculateFilteredColorScale(mrroData.flat());

        // 데이터 캐싱
        dataCache.current[timeStepIndex] = { mrroData, lat, lon, colorScale };
    };


    const baseYear = 1850; // 기준 연도
    const baseMonth = 0; // 기준 월 (0부터 시작하는 JavaScript의 월 인덱스를 사용)

    // 한 달 단위의 시간 단계를 실제 날짜로 변환하는 함수
    const convertTimeIndexToDate = (index) => {
        const targetDate = new Date(baseYear, baseMonth);
        targetDate.setMonth(targetDate.getMonth() + index); // 월 단위로 시간 단계를 추가
        return targetDate;
    };

    // 날짜 포맷터
    const dateFormatter = timeFormat("%Y-%m"); // 연-월 형식으로 포맷팅

    // 하루 단위 날짜 변경
    // const baseTime = new Date("1850-01-01"); // 기준 시간
    // // 실제 날짜로 변환하는 함수
    // const convertTimeIndexToDate = (index) => {
    //     const targetDate = new Date(baseTime);
    //     targetDate.setDate(targetDate.getDate() + index);
    //     return targetDate;
    // };
    // // 날짜 포맷터
    // const dateFormatter = timeFormat("%Y-%m-%d");

    useEffect(() => {
        const urlpath = "/mrro_v3_reduced.nc";
        setLoading(true); // 로딩 시작

        fetch(urlpath)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const reader = new NetCDFReader(arrayBuffer);
                setTotalTimeSteps(reader.getDataVariable('mrro').length);
                setLoading(false); // 로딩 완료
            });
    }, []);

    useEffect(() => {
        console.log(timeIndex)
        if (dataCache.current[timeIndex]) {
            // 캐시된 데이터가 있으면 바로 시각화
            visualizeData(dataCache.current[timeIndex]);
        } else {
            // 캐시된 데이터가 없으면 로딩
            loadDataAndVisualize(timeIndex);
        }
    }, [timeIndex]);

    const handlePrev = () => {
        setTimeIndex(Math.max(0, timeIndex - 1));
        setTempTimeIndex(Math.max(0, timeIndex - 1));
    };

    const handleNext = () => {
        setTimeIndex(Math.min(totalTimeSteps - 1, timeIndex + 1));
        setTempTimeIndex(Math.min(totalTimeSteps - 1, timeIndex + 1));
    };

    const loadDataAndVisualize = async (timeIndex) => {
        setLoading(true); // 로딩 시작
        const urlpath = "/mrro_v3_reduced.nc";

        try {
            const response = await fetch(urlpath);
            const arrayBuffer = await response.arrayBuffer();
            const reader = new NetCDFReader(arrayBuffer);

            // 'mrro' 데이터 변수와 위도('lat'), 경도('lon') 변수 읽기
            if (!reader.getDataVariable('mrro')) {
                console.error('Data variable "mrro" not found in the file');
                return;
            }
            const mrroData = reader.getDataVariable('mrro')[timeIndex];
            const lat = reader.getDataVariable('lat');
            const lon = reader.getDataVariable('lon');

            const { colorScale } = calculateFilteredColorScale(mrroData.flat());

            // 데이터 캐싱
            dataCache.current[timeIndex] = { mrroData, lat, lon, colorScale };

            // 시각화 함수 호출
            visualizeData(dataCache.current[timeIndex]);

        } catch (error) {
            console.error('Error loading or processing netCDF data:', error);
        } finally {
            setLoading(false); // 로딩 완료
        }
    };


    // 데이터 시각화 함수
    const visualizeData = ({ mrroData, lat, lon, colorScale }) => { // 파라미터를 { mrroData, lat, lon } 구조 분해 할당으로 변경
        console.log(timeIndex);

        const svgWidth = dimensions.width;
        const svgHeight = dimensions.height;
        const margin = { top: 20, bottom: 60 }; // 색상 척도를 위한 하단 마진 추가
        const width = svgWidth
        const height = svgHeight + margin.top + margin.bottom;

        // SVG 컨테이너 생성
        const svgContainer = d3.select(viewerRef.current);
        svgContainer.selectAll("svg").remove(); // 기존 SVG 제거

        const svg = svgContainer.append('svg')
            .attr('width', width)
            .attr('height', height);

        // 시각화 영역을 위한 'g' 요소 생성
        const chartGroup = svg.append('g')
        // .attr('transform', `translate(0, ${margin.top})`);

        const cellWidth = Math.ceil(svgWidth / lon.length);
        const cellHeight = Math.ceil(svgHeight / lat.length);

        const [minValue, maxValue] = colorScale.domain();

        mrroData.forEach((value, index) => {
            const i = Math.floor(index / lon.length);
            const j = index % lon.length;
            // 사각형을 그리기 위한 x, y 좌표 계산
            const x = Math.floor(j * cellWidth);
            const y = Math.floor((lat.length - i - 1) * cellHeight);

            let fillColor = value < minValue || value > maxValue ? '#000000' : colorScale(value);
            if (y > svgHeight) {
                fillColor = '#ffffff';
            }

            chartGroup.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', cellWidth)
                .attr('height', cellHeight)
                .attr('fill', fillColor);
        });
        // 색상 척도(legend) 그리기
        drawColorScaleLegend(svg, colorScale, dimensions.width, 20, svgHeight + margin.top);
    };


    // 슬라이더 값이 변경될 때 임시 상태를 업데이트합니다.
    const handleSliderChange = (e) => {
        setTempTimeIndex(parseInt(e.target.value, 10));
    };

    // 드래그가 끝났을 때 실제 상태를 업데이트합니다.
    const handleSliderChangeCompleted = () => {
        setTimeIndex(tempTimeIndex);
    };


    return (
        <Div pos="relative" d="flex" flexDir="column" align="center" justify="flex-start">

            <Div pos="absolute" top="0" left="0" p="1rem" bg="info200" rounded="xl">
                <Text textSize="body" textColor="dark">
                    {`Dataset: mrro_Lmon_IPSL-CM6A-LR_historical_r10i1p1f1_gr_185001-201412`}
                </Text>
                <Text textSize="body" textColor="dark">
                    {`Dimensions: ${dimensions.width / 2} x ${dimensions.height / 2}`}
                </Text>
                <Div d="flex" m={{ t: "1rem" }}>
                    <Button onClick={cacheAllData} m={{ r: "1rem" }}>{caching ? "Stop Caching" : "Start Caching"}</Button>
                    {caching &&
                        <Text textSize="caption" d="flex" align="center" justify="center">
                            {`Time Step: ${cacheTimeIndex + 1} / ${totalTimeSteps}`}
                        </Text>
                    }
                </Div>
                {loading && <Icon name="Loading" size="40px" />}
            </Div>
            <Div d="flex" align="center" justify="center" h="60vh" pos="relative" m={{ t: "5vh" }}>
                <Div pos="relative" ref={viewerRef} style={{ maxWidth: '100%', maxHeight: '60vh' }} />
            </Div>
            <Div d="flex" align="center" justify="center" pos="relative">
                <Button onClick={handlePrev} m={{ r: "1rem" }}>Prev</Button>
                <Input
                    type="range"
                    min="0"
                    max={totalTimeSteps - 1}
                    value={tempTimeIndex}
                    onChange={handleSliderChange} // 값이 변경될 때 임시 상태를 업데이트
                    onMouseUp={handleSliderChangeCompleted} // 마우스 버튼을 놓았을 때 실제 상태를 업데이트
                    onTouchEnd={handleSliderChangeCompleted} // 손가락을 뗐을 때 실제 상태를 업데이트
                    m={{ t: "1rem", b: "1rem" }}
                />
                <Button onClick={handleNext} m={{ l: "1rem" }}>Next</Button>
            </Div>

            <Div>
                <Text textSize="title" d="flex" align="center" justify="center">
                    {dateFormatter(convertTimeIndexToDate(tempTimeIndex))}
                </Text>
                <Text textSize="caption" textColor="info700" d="flex" align="center" justify="center">
                    {`Time Step: ${tempTimeIndex + 1} / ${totalTimeSteps}`}
                </Text>
            </Div>

            <Div d="flex" align="center" justify="center" pos="relative">
                <Button onClick={play} disabled={isPlaying} m={{ r: "1rem" }}>Play</Button>
                <Button onClick={pause} disabled={!isPlaying} m={{ r: "1rem" }}>Pause</Button>
                <Button onClick={reset} m={{ r: "1rem" }}>Reset</Button>
                <Input
                    type="range"
                    min="100"
                    max="3000"
                    value={playingInterval}
                    onChange={(e) => setPlayingInterval(parseInt(e.target.value, 10))}
                    step="100"
                    m={{ t: "1rem", b: "1rem", r: "1rem" }}
                    w="100%" // 슬라이더 너비 조정
                />
                <Text textSize="caption" textColor="gray700" d="flex" align="center" justify="center">
                    {`Time Interval: ${playingInterval}ms`}
                </Text>
            </Div>

        </Div>
    );
};

export default NetCDFViewer;
