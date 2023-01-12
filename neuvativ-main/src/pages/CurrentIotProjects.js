import React, { useState } from 'react';
import Amplify from 'aws-amplify';
import {  useLocation } from 'react-router-dom';
import ProjectTableStatus from '../components/ProjectTableStatus';
import awsExports from '../aws-exports';
import { useNavigate } from 'react-router-dom';
Amplify.configure(awsExports);
/**
 * @returns 
 */
 export function IotDevicesProjectDetails() {

    //Class for the nav - whether it is hidden or not
    const [navClass, setNavClass] = useState('nav-hide')
    //Whether menu icon is visible or not
    const [menuIconVisible, setMenuIconVisible] = useState(true)
    //Whether close icon is visible or not
    const [closeIconVisible, setCloseIconVisible] = useState(false)
  
    //Handles open/close of hamburger icon
    const handleClick = () => {
      setNavClass(v => v === "nav-hide" ? "nav-show" : "nav-hide")
      setMenuIconVisible(v => !v)
      setCloseIconVisible(v => !v)
    }
  
    return (
          <>
            <div className="main-container">
              <div className="content-container">
                <legend className="caption">Current IoT Projects</legend>            
                <ProjectTableStatus/> 
              </div>
            </div>
          </>
    );
    };

export default IotDevicesProjectDetails;

