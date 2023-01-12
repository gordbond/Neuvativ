import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotFound } from "./pages/NotFound.js";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import CurrentIotProjects from "./pages/CurrentIotProjects";
import CreateAndAssignProject from "./pages/CreateAndAssignProject";
import ProjectInformation from "./pages/ProjectInformation";
import CalibrationOfVariables from "./pages/CalibrationOfVariables";
import GuestAssignment from "./pages/GuestAssignment";
import ProjectsDetails from "./pages/ProjectsDetails";
import Admin from "./pages/Admin";
import { Authenticator, useAuthenticator, useTheme, View, Image, Text, Heading, Button,CheckboxField} from '@aws-amplify/ui-react';
import Navbar from "./components/Navbar";
import './App.css';
import { FaBars } from 'react-icons/fa';
import { GrClose } from 'react-icons/gr';
import Amplify, { Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

import './fonts/Mulish-Bold.ttf';
import './fonts/OpenSans-Regular.ttf';
import './fonts/OpenSans-SemiBold.ttf';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const components = {
  


  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Neuvativ logo"
          src="logo.png"
          height={'165px'}
        />
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Text color={`${tokens.colors.neutral['80']}`}>
          &copy; Tsaro. The website content was created by EPIC at Mohawk College.
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={5}
        >
          Sign in to your Tsaro account
        </Heading>
      );
    },
    Footer() {
      const { toResetPassword } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toResetPassword}
            size="small"
            variation="link"
          >
            Reset Password
          </Button>
        </View>
      );
    },
  },  
  SignUp: {
    Header() {
      const { tokens } = useTheme();

      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={5}
        >
          Create a new Tsaro account
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toSignIn}
            size="small"
            variation="link"
          >
            Back to Sign In
          </Button>
        </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },

  },
  SetupTOTP: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },

  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },

  },
  ResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },

  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Enter Information:
        </Heading>
      );
    },

  },
};

const formFields = {
  signIn: {
    username: {
      labelHidden: false,
      placeholder: 'Enter your email',
    },
  },
  signUp: {
    email: {
      labelHidden: true,
      label: 'Email',
      order: 1,
    },
    password: {
      labelHidden: true,
      label: 'Password:',
      placeholder: 'Enter your Password',
      isRequired: false,
      order: 2,
    },
    confirm_password: {
      labelHidden: true,
      label: 'Confirm Password',
      order: 3,
    },
    preferred_username: {
      labelHidden: true,
      label: 'Preferred Username',
      isRequired: true,
      order: 4,
    },
    zoneinfo: {
      labelHidden: true,
      label: 'Zone info',
      placeholder: 'Enter your unique code',
      isRequired: true,
      order: 5,
    },
  },
  forceNewPassword: {
    password: {
      labelHidden: false,
      placeholder: 'Enter your Password:',
    },
  },
  resetPassword: {
    username: {
      labelHidden: false,
      placeholder: 'Enter your email:',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      labelHidden: false,
      placeholder: 'Enter your Confirmation Code',
      label: 'Confirmation Code:',
      isRequired: false,
    },
    confirm_password: {
      labelHidden: false,
      placeholder: 'Confirm Password',
    },
  },
  setupTOTP: {
    QR: {
      totpIssuer: 'test issuer',
      totpUsername: 'amplify_qr_test_user',
    },
    confirmation_code: {
      labelHidden: false,
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code:',
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      labelHidden: false,
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code:',
      isRequired: false,
    },
  },
};

export default function App() {
  //Class for the nav - whether it is hidden or not
  const [navClass, setNavClass] = useState('nav-hide')
  //Whether menu icon is visible or not
  const [menuIconVisible, setMenuIconVisible] = useState(true)
  //Whether close icon is visible or not
  const [closeIconVisible, setCloseIconVisible] = useState(false)

  //Handles open/close of hamburger icon
  const handleClick = () => {
    if(window.innerWidth < 1571){
      console.log("clicking...", window.innerWidth)
      setNavClass(v => v === "nav-hide" ? "nav-show" : "nav-hide")
      setMenuIconVisible(v => !v)
      setCloseIconVisible(v => !v)
    }
  }
  
  const [userGroup, setUserGroup] = useState();

  const fetchUserGroup = () => {
      try {
          const userGroupArray = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']
          setUserGroup(userGroupArray[0])
          console.log("USER: ", Auth?.user)
          console.log("userGroup: ", userGroup)
      } catch (e) {
          console.log("Error: ", e)
          console.log("User Group with error: ",userGroup)
      }  
  };
  const logout = () => {
    Auth.signOut().then(() => {window.location.href= (`${window.location.origin}/`);})
  }

  return (
    <Authenticator formFields={formFields} components={components}>
    
    {({ signOut, user }) => (
      <Router forceRefresh={true} getUserConfirmation={fetchUserGroup()} >
        <div className="App" >


          
          <div className="log-btns">
            <div className="logo-top-container">
              <div className="logo-container-sm">
                <img src="logo.png" alt="logo" className="logo-img-w"/>
              </div>
            </div>
            <div className="signout-group-container">
              <div className="signout-group">
                <h3 className="userName">Hello, {user?.attributes?.email}</h3>
                <button className="button-is-primary main-logout" onClick={logout}>Sign out</button>
                <FaBars className={menuIconVisible ? "menuIcon show" : "menuIcon hide"} onClick={handleClick} />
                <GrClose className={closeIconVisible ? "closeIcon show" : "closeIcon hide"} onClick={handleClick} />
              </div>
            </div>
          </div>
          <Navbar navClass={navClass} setNavClass={setNavClass} logout={logout} handleClick={handleClick}/>
            <>
            <Routes>
                {/* <Route path="/" element={<MainPage />} /> Removed for now. */}
                <Route path="/" element={<CurrentIotProjects />} />
                <Route path="/iot-devices-current-iot-projects/projects-details" element={<ProjectsDetails />} />
                {userGroup ==='Admin' &&
                <>
                <Route path="/iot-devices-create-and-assign-project" element={<CreateAndAssignProject />} />
                </>
                }
                {((userGroup ==='Admin') || (userGroup==='ElevatorCompany') || (userGroup==='BuildingManager')) &&  
                <>
                <Route path="/iot-devices-project-information" element={<ProjectInformation />} />
                <Route path="/iot-devices-calibration-of-variables" element={<CalibrationOfVariables />} />
                <Route path="/iot-devices-guest-assignment" element={<GuestAssignment />} />
                <Route path="/admin" element={<Admin />} />
                </>
                }
                <Route path="*" element={<NotFound />} />
                
            </Routes> 
            

            </>
          </div>

          <Footer />
         
        </Router>
        
      )}
     
    </Authenticator>
  );
};


