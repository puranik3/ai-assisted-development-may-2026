import React from 'react';

const Example = (props) => {
    const renderData = (status) => {
        switch (status) {
            case "Loading": return <p>Loading data...</p>;
            case "Error": return <p>Failed to fetch data...</p>;
            case "Success": return <p>Data fetched successfully...</p>;
            default: return <p>Unknown status</p>;
        }
    };

    return (
        <div>
            {renderData(props.status)}
        </div>
    );
};

export default Example;