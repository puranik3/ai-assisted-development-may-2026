import React from "react";
import "./Footer.css";

// Footer component
const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} ThreadHive. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
