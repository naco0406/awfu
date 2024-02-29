import React from 'react';
import { Div, Text } from 'atomize';

const SearchResultCard = ({ title, variables, period, organization }) => {
  return (
    <Div m={{ y: "1rem" }} p="1rem" shadow="3" rounded="xl" border="1px solid" borderColor="gray200" bg="white">
      <Text textSize="title" textWeight="500">{title}</Text>
      <Text textSize="body" m={{ y: "0.5rem" }}>Variables: {variables.join(", ")}</Text>
      <Text textSize="body">Period: {period}</Text>
      <Text textSize="body">Organization: {organization}</Text>
    </Div>
  );
};

export default SearchResultCard;