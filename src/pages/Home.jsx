import React from 'react';
import { Div, Text, Button, Input, Icon } from 'atomize';
import Cobe from '../components/Cobe/Cobe';

const Home = () => {
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

            <Div d="flex" justify="center" align="center" m={{ b: "1rem" }} w="80%" pos="relative" zIndex="10">
                <Cobe />
            </Div>

            <Div pos="relative" zIndex="5" p={{ x: "1rem", y: "2rem" }}align="center" >
                <Input
                    placeholder="Search"
                    p={{ x: "1rem" }}
                    rounded="circle"
                    w="25rem"
                    suffix={
                        <Icon
                            name="Search"
                            size="20px"
                            cursor="pointer"
                            onClick={() => console.log("clicked")}
                            pos="absolute"
                            top="50%"
                            right="1rem"
                            transform="translateY(-50%)"
                        />
                    }
                />
            </Div>
        </Div>
    );
}

export default Home;