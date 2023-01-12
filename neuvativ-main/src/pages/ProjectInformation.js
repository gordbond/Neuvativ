import React, {useEffect, useState} from 'react';
import Amplify, {API, graphqlOperation} from 'aws-amplify';
import ProjectInformationForm from '../components/ProjectInformationForm';
import awsExports from '../aws-exports';
Amplify.configure(awsExports);
/**
 * Home page
 * - Landing page for the app
 * @returns 
 */
export function ProjectInformation(){
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
                  <ProjectInformationForm/>
              </div>
            </div>
          </>
    );
    };
export default ProjectInformation;