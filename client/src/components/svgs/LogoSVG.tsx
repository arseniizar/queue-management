import React from 'react';

const LogoSVG = () => {
    return (
        <svg className="logo"
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 150 50"
             width="150"
             height="50"
             fill="none"
        >
            {/* Background */}
            <rect width="150" height="50" fill="#001529" rx="5"/>

            {/* Queue Circles */}
            <circle cx="20" cy="25" r="5" fill="#1890ff"/>
            <circle cx="40" cy="25" r="5" fill="#1890ff"/>
            <circle cx="60" cy="25" r="5" fill="#1890ff"/>
            <circle cx="80" cy="25" r="5" fill="#1890ff"/>

            {/* Connecting Lines */}
            <line x1="25" y1="25" x2="35" y2="25" stroke="#1890ff" strokeWidth="2"/>
            <line x1="45" y1="25" x2="55" y2="25" stroke="#1890ff" strokeWidth="2"/>
            <line x1="65" y1="25" x2="75" y2="25" stroke="#1890ff" strokeWidth="2"/>

            {/* Text Box */}
            <rect x="100" y="15" width="40" height="20" fill="#1890ff" rx="3" ry="3"/>

            {/* Text Inside Box */}
            <text
                x="120"
                y="28"
                fontSize="10"
                textAnchor="middle"
                fill="white"
                fontFamily="Arial, Helvetica, sans-serif"
            >
                Queue
            </text>
        </svg>
    );
};

export default LogoSVG;
