import React, {useState} from 'react';
import Amplify from 'aws-amplify';
import CreateAndAssignProjectForm from '../components/CreateAndAssignProjectForm';
import awsExports from '../aws-exports';
Amplify.configure(awsExports);
/**
 * @returns 
 */
export function CreateAndAssignProject() {

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
                  <CreateAndAssignProjectForm/>
              </div>
            </div>
          </>
    );
    };
export default CreateAndAssignProject;