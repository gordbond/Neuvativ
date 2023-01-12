import React, { useState, useEffect } from "react";
import Amplify, {Auth, API, graphqlOperation, Storage } from 'aws-amplify';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import awsconfig from '../aws-exports';
import awsExports from "../aws-exports";
import utils from "../utils";
Amplify.configure(awsconfig);
Auth.configure(awsExports);

function AdminForm() {

    let [userConnected, setUserConnected] = useState([]);
    let [userGroup, setUserGroup] = useState([]);
    let [groupType, setGroupType] = useState('');
    let [uniqueCode, setUniqueCode] = useState(""); 
    let [groupId, setGroupId] = useState();
    let [email, setEmail] = useState('');
    let [showCode, setShowCode] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [success, setSuccess] = useState(false);

    //Create a random string to be used for the registration code
    const randomString = (length, chars) => {
        console.log("groupType: ", groupType)
        //Prefix
        let prefix = '';
        if(groupType === 'Admin'){
          prefix = 'AD';
        }else if(groupType === 'ElevatorCompany'){
          prefix = 'EC';
        }else if(groupType === 'BuildingManager'){
          prefix = 'BM';
        }else{
          prefix = 'GU';
        }
        //Random string
        var mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';

        for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];

        //concat prefix to string
        result = prefix.concat(result);
        console.log("Created code: ", result);
        return result;
    }

    //Set unique code to send
    const fetchCodes = async () => {

        try{  
            //Make API call to get list of unique codes
            await API.graphql(graphqlOperation(queries.getSigUpCodeTable,{id: groupId})).then(res=>{
                //List of codes
                let codes = res.data.getSigUpCodeTable.CurrentlyAvailableCodes
                console.log("CODES BEFORE SPLIT: ", codes);
                //As long as there is a code
                if(codes.length > 0) {
                    setUniqueCode(codes[0]);
                }else{
                    setUniqueCode("No code available");
                }
            })
        }
        catch(err){
            console.log('err',err )
        }
    }

    //Updates the available codes and assigned codes table
    const updateCodes = async () => {
        //Remove code from Available
        try{  
            //Get list of codes
            await API.graphql(graphqlOperation(queries.getSigUpCodeTable,{id: groupId})).then(res=>{
                //List of codes
                let codes = res.data.getSigUpCodeTable.CurrentlyAvailableCodes
                //Assigned codes
                let assignedCodes = res.data.getSigUpCodeTable.AssignedCodes
                //As long as there is a code
                if(codes.length > 0) {
                    
                    //Remove first element from list
                    const removedCode = codes.shift();
                    //Add removed code from available codes to assigned codes 
                    assignedCodes.push(removedCode);
                    setUniqueCode(removedCode);

                    //Get a new code for available codes
                    const codeToBeInserted = randomString(16, '#aA!')
                    //Add to available codes
                    codes.push(codeToBeInserted)

                    //Updated available and assigned codes 
                    API.graphql(graphqlOperation(mutations.updateSigUpCodeTable, {input: {
                        id: groupId,
                        CurrentlyAvailableCodes: codes,
                        AssignedCodes: assignedCodes

                    }})).then(res=>{
                        //List of codes
                        let newList = res.data
                        console.log("New List: ", newList)
                        setSuccess(true)
                        // setFeedback("Success: Registration code will open in your email.")
                        setFeedback("Successfully created code.")
                    })
                }else{
                    setUniqueCode("No code available");
                }
                
            })
            
        }
        catch(err){
            console.log('err',err )
            setSuccess(false)
            setFeedback("Error: Registration code could not be created.")
        }
        //Update Assigned Codes 
    }

    //Handle changing Group ID
    const handleChangeSelect = ({ target: { value } }) => {
        
        setGroupId(value)
        const groupNum = parseInt(value)
        //Set name for user Group
        let group = ""
        switch (groupNum) {
            case 1: 
                group = "Admin"
            break;
            case 2:
                group = "ElevatorCompany"
            break;
            case 3:
                group = "BuildingManager"
            break;
            case 4:
                group = "Guest"
            break;
            default: 
                group = ""
        }
        setGroupType(group)
        setShowCode(false)
        setFeedback('')
        
    }



    //Handle change of email field
    const handleFormChange = (event, index) => {       
        setEmail(event.target.value);
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        const subject = `Sign up code`
        const body = encodeURIComponent(`Your registration code is: \n\n ${uniqueCode} \n\n Thanks, \n Tsaro`)
        await fetchCodes()
        await updateCodes()
        setShowCode(true)
        // window.open(`mailto:${email}?subject=${subject}&body=${body}`);

    }

    


    //Get codes when page loads
    // useEffect(() => {
    //     fetchCodes()
    // }, [groupId])

    //Testing purposes
    useEffect(() => {
        console.log("GROUP CHANGED: ", groupType)
    }, [groupType])

    return (
        <div className={`form-container-sm`}>
            <legend className="caption">Generate Registration Code</legend>
            <form className="create-project-form " onSubmit={handleSubmit}>
                <div className="column">
                    <label className="form-label">Account Type :</label>
                    <select className="form-control" value={groupId} onChange={handleChangeSelect}>
                        <option disabled selected value>Select user type...</option>
                        <option value={1}>Admin</option>
                        <option value={2}>Elevator Company</option>
                        <option value={3}>Building Manager</option>
                        <option value={4}>Guest</option>
                    </select>
                </div>  
                {/* <div className="column">
                    <label className="form-label">Email Address:</label>
                    <input
                        type="email"
                        name="deviceClass"
                        onChange={event => handleFormChange(event)}
                        value={email}
                        placeholder="someone@example.com"
                        autoComplete="off"
                        className="form-control"
                    />
                </div> */}
                {showCode?
                <div className="column">
                    <label className="form-label">Single-Use Registration Code (read-only):</label>
                    <input
                        type="text"
                        name="deviceClass"
                        value={uniqueCode}
                        placeholder="ex Ad12345"
                        autoComplete="off"
                        className="form-control"
                        disabled
                    />
                </div>
                :
                <></>
                }
                <br />
                <button
                    type="submit"
                    className="form-btn"
                    name="Send"
                >
                    Get Code
                </button>
                <br />
                <legend className={success ? 'feedback-success' : 'feedback-fail'}>{feedback}</legend>
            </form>
        </div>
    );

}

export default AdminForm;