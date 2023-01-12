import React, { useState } from 'react';
import Amplify from 'aws-amplify';
import awsExports from '../aws-exports';
import { useNavigate } from 'react-router-dom';

Amplify.configure(awsExports);

export function MainPage() {
    let navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/iot-devices-current-iot-projects`; 
        navigate(path);
    }

    return (
        <div className="main-container">
            <legend className="caption">Tsaro Applications</legend>
            <br/>
            <button
                type="submit"
                className="main-btn"
                name="Cameras"
            >
                Cameras
            </button>
            <button
                type="submit"
                className="main-btn"
                name="IoT Devices"
                onClick={routeChange}
            >
                IoT Devices
            </button>
        </div>
    );
}

export default MainPage;
