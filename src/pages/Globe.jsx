import React from 'react';
import { Div, Text, Button, Input, Icon } from 'atomize';
import MainGlobe from '../components/Globes/MainGlobe';
import TileGlobe from '../components/Globes/TileGlobe';

const Globe = () => {
    return (
        <Div
            d="flex"
            flexDir="column"
            align="center"
            justify="center"
            h="calc(100vh - 120px)"
            pos="relative"
            overflow="hidden"
        >
            <Div
                pos="absolute"
                top="0"
                right="0"
                bottom="0"
                left="0"
                bg="black"
                opacity="1"
            />
            <MainGlobe />
            {/* <TileGlobe /> */}
        </Div>
    );
}

export default Globe;