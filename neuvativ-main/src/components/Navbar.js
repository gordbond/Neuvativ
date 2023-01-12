import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import awsExports from '../aws-exports';

Amplify.configure(awsExports);
/**
 * Navbar for the app. 
 * @param {*} navClass  - class for the navbar
 * @returns 
 */

export default function Navbar({ navClass, setNavClass, handleClick ,logout }) {

    let navigate = useNavigate(); 

    let [id, setId] = useState([]);
    let [userGroup, setUserGroup] = useState([]);

    let fetchUserGroup = async () => {
        try {
            let userGroup = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']
            setUserGroup(userGroup[0])
            let id = Auth?.user?.signInUserSession?.idToken?.payload['cognito:username']
            setId(id)
            console.log("userId: ", id)
            console.log("userGroup: ", userGroup[0])
        } catch (e) {
            console.log("Error: ", e)
        }
    }
    
    const closeNav = () => {
        setNavClass('nav-hide');
    }

    useEffect(() => {
        fetchUserGroup()
    }, [])

    if (userGroup=== "Admin"){
    return (
        <nav className={navClass} role="navigation" aria-label="main navigation">
            {/* <button className="sm-btn" onClick={() => navigate("/")}>Main Menu</button>
            <button className="sm-btn" onClick={() => navigate(-1)}>Previous Page</button> */}
            <div className="nav-container">
                {/* <NavLink to="/" activeclassname='active' onClick={() => handleClick()}>Menu</NavLink> */}
                <NavLink to="/" activeclassname='active' onClick={() => handleClick()}>Projects</NavLink>
                <NavLink to="/iot-devices-create-and-assign-project" activeclassname='active' onClick={() => handleClick()}>Create Project</NavLink>            
                <NavLink to="/iot-devices-project-information" activeclassname='active' onClick={() => handleClick()}>Edit Project</NavLink>
                <NavLink to="/iot-devices-calibration-of-variables" activeclassname='active' onClick={() => handleClick()}>Calibration</NavLink>
                {/* <NavLink to="/iot-devices-guest-assignment" activeclassname='active' onClick={() => handleClick()}>Guest Assignment</NavLink>   */}
                <NavLink to="/admin" activeclassname='active' onClick={() => handleClick()}>Administration</NavLink> 
                <button className="button-is-primary logout" onClick={logout}>Sign out</button>            
            </div>
        </nav>
    )
    } else if ((userGroup==='ElevatorCompany')|| (userGroup === 'BuildingManager')) {
        return (
            <nav className={navClass} role="navigation" aria-label="main navigation">
                {/* <button className="sm-btn" onClick={() => navigate(-1)}>Previous page</button> */}
                <div>
                    <NavLink to="/" activeclassname='active' onClick={() => handleClick()}>Projects</NavLink>
                    <NavLink to="/iot-devices-project-information" activeclassname='active' onClick={() => handleClick()}>Edit Project</NavLink>
                    <NavLink to="/iot-devices-calibration-of-variables" activeclassname='active' onClick={() => handleClick()}>Calibration</NavLink>
                    {/* <NavLink to="/iot-devices-guest-assignment" activeclassname='active' onClick={() => handleClick()}>Guest Assignment</NavLink>   */}
                    <NavLink to="/admin" activeclassname='active' onClick={() => handleClick()}>Administration</NavLink>    
                    <button className="button-is-primary logout" onClick={logout}>Sign out</button>
                </div>
            </nav>
    
        );
    } else {
        return (
            <nav className={navClass} role="navigation" aria-label="main navigation">
                {/* <button className="sm-btn" onClick={() => navigate(-1)}>Previous page</button> */}
                <div>
                    <NavLink to="/" activeclassname='active' onClick={() => handleClick()}>Projects</NavLink>
                    <button className="button-is-primary logout" onClick={logout}>Sign out</button>
                </div>
            </nav>
    
        );
    }
}