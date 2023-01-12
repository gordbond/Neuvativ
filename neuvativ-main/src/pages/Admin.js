import React, {useEffect, useState} from 'react';
import Amplify, {Auth} from 'aws-amplify';
import AdminForm from '../components/AdminForm';
import GuestAssignmentForm from '../components/GuestAssignmentForm';
import awsExports from '../aws-exports';
Amplify.configure(awsExports);
/**
 * Admin page
 * - Can send codes to users
 * @returns 
 */
export function Admin(){


    // This works... apply this to a new component. 
    let testMail = () => {
        window.open('mailto:test@example.com?subject="subject"&body="body"');
    }

    const [userGroup, setUserGroup] = useState();

    const fetchUserGroup = () => {
        try {
            const userGroupArray = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']
            setUserGroup(userGroupArray[0])
            console.log("USER: ", Auth?.user)
            console.log("userGroup: ", userGroupArray[0])
        } catch (e) {
            console.log("Error: ", e)
            console.log("User Group with error: ",userGroup)
        }  
    };

    useEffect(() => {
      fetchUserGroup()
    },[])

    return (
          <>
            
            <div className="main-container">

            {userGroup ==='Admin' &&
                <div className="content-container">
                  <AdminForm />
              </div>
            }
              <div className="content-container">
                <GuestAssignmentForm/>
              </div>
            </div>
          </>
    );
    };
export default Admin;