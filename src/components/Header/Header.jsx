import React from 'react';
import { Div, Text, Input, Icon } from 'atomize';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    return (
        <Div tag="header" bg="black" p={{ y: "1rem" }} d="flex" justify="space-between" align="center" w="100%" pos="relative">
            <Text textSize="title" textWeight="500" textColor="white" m={{ l: "1.5rem" }}>
                AWFU
            </Text>

            {location.pathname === '/search' && (
                <Div pos="absolute" left="50%" transform="translateX(-50%)" d="flex" justify="center" w="auto">
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
            )}

            <Div d="flex" justify="flex-end" flexGrow="1" m={{ r: "1.5rem" }}>
                <Link to="/" style={{ color: 'white', margin: '0 1.5rem' }}>Home</Link>
                <Link to="/search" style={{ color: 'white', margin: '0 1.5rem' }}>Search</Link>
                <Link to="/globe" style={{ color: 'white', margin: '0 1.5rem' }}>Globe</Link>
                <Link to="/geotiff" style={{ color: 'white', margin: '0 1.5rem' }}>GeoTIFF</Link>
                <Link to="/netcdf" style={{ color: 'white', margin: '0 1.5rem' }}>netCDF</Link>
            </Div>
        </Div>
    );
};

export default Header;
