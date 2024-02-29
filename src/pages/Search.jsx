import React from 'react';
import { Div, Text, Button, Input, Icon } from 'atomize';
import SearchResultCard from '../components/Card/Card';
import searchData from '../assets/sample_search';

const Search = () => {
    return (
        <Div
            d="flex"
            flexDir="column"
            align="center"
            justify="flex-start"
            pos="relative"
            w="100%"
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

            <Div pos="relative" zIndex="5" p={{ x: "1rem", y: "2rem" }} align="center" w="35vw" overflowY="auto">
                {searchData.map(data => (
                    <SearchResultCard
                        key={data.id}
                        title={data.title}
                        variables={data.variables}
                        period={data.period}
                        organization={data.organization}
                    />
                ))}
            </Div>
        </Div>
    );
}


export default Search;