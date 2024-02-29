import React from 'react';
import { Div, Text, Container, Anchor } from 'atomize';

const Footer = () => {
    return (
        <Div tag="footer" bg="black" p={{ y: "1rem" }} d="flex" justify="center" align="center">
            <Text textSize="body" textColor="white">
                © 2024 AWFU. All rights reserved.
            </Text>
        </Div>
    );
};

export default Footer;
