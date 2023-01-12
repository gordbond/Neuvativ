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

function ProjectInformationForm() {

    let navigate = useNavigate();

    //Message to be displayed for user
    const [feedback, setFeedback] = useState('');
    const [success, setSuccess] = useState(false)

    const [id, setId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerStNo, setOwnerStNo] = useState('');
    const [ownerStName, setOwnerStName] = useState('');
    const [ownerCity, setOwnerCity] = useState('');
    const [ownerState, setOwnerState] = useState('');
    const [ownerPostalCode, setOwnerPostalCode] = useState('');
    const [ownerAccountNo, setOwnerAccountNo] = useState('');
    const [locationofElevatingDevice, setLocationofElevatingDevice] = useState('');
    const [elevatorContractor, setElevatorContractor] = useState('');
    const [elevatorConsultant, setElevatorConsultant] = useState('');
    // const [elevatorInfo, setElevatorInfo] = useState([]);
    let [elevatorInfo, setElevatorInfo] = useState([{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '',max_floor: '', min_floor:'1', floor_initial:'1',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5' }]);

    let [projects, setProjects] = useState([]);
    const [userConnected, setUserConnected] = useState([]);
    const [userGroup, setUserGroup] = useState([]);

    let fetchProjects = async () => {
        try {
            const tempUserConnected = Auth?.user?.signInUserSession?.idToken?.payload?.sub
            let userData = await API.graphql(graphqlOperation(queries.getUser, { id: tempUserConnected }));
            let pref_username = userData?.data?.getUser?.preferred_username;
            console.log("pref_username",pref_username)
            setUserConnected(pref_username)
            let tempUserGroup = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']     
            setUserGroup(tempUserGroup[0])             
            if (tempUserGroup[0]==="Admin"){
                const projectData = await API.graphql({ query: queries.listProjects });
                const listOfProjects = projectData?.data?.listProjects?.items
                console.log("listOfProjects: ", listOfProjects)
                listOfProjects.sort((a,b)=>utils.compareProjectIds(a,b,"projectId"))
                setProjects(listOfProjects)
            }
            if (tempUserGroup[0]==="ElevatorCompany"){
                const projectData = await API.graphql(graphqlOperation(queries.projectByEC,{projectEC: pref_username}));
                const listOfProjects = projectData?.data?.projectByEC?.items
                console.log("listOfProjects: ", listOfProjects)
                listOfProjects.sort((a,b)=>utils.compareProjectIds(a,b,"projectId"))
                setProjects(listOfProjects)
            }
            if (tempUserGroup[0]==="BuildingManager"){
                const projectData = await API.graphql(graphqlOperation(queries.projectByBM,{projectBM: pref_username}));
                const listOfProjects = projectData?.data?.projectByBM?.items
                console.log("listOfProjects: ", listOfProjects)
                listOfProjects.sort((a,b)=>utils.compareProjectIds(a,b,"projectId"))
                setProjects(listOfProjects)
            }
        } catch (e) {
            console.log("Error: ", e)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    let fetchProject = async(id) => {
        try {
            let projectData = await API.graphql(graphqlOperation(queries.getProject, { id: id }));
            let project = projectData?.data?.getProject
            setProjectId(project?.projectId)
            setCreationDate(project?.projectCreationDate)
            setOwnerName(project?.projectOwnerName ? project?.projectOwnerName : "")
            setOwnerStNo(project?.projectOwnerStNo ? project?.projectOwnerStNo : "")
            setOwnerStName(project?.projectOwnerStName ? project?.projectOwnerStName : "")
            setOwnerCity(project?.projectOwnerCity ? project?.projectOwnerCity : "")
            setOwnerState(project?.projectOwnerState ? project?.projectOwnerState : "")
            setOwnerPostalCode(project?.projectOwnerPostalCode ? project?.projectOwnerPostalCode : "")
            setOwnerAccountNo(project?.projectOwnerAccountNo ? project?.projectOwnerAccountNo : "")
            setLocationofElevatingDevice(project?.projectLocationofElevatingDevice ? project?.projectLocationofElevatingDevice : "")
            setElevatorContractor(project?.projectElevatorContractor ? project?.projectElevatorContractor : "")
            setElevatorConsultant(project?.projectElevatorConsultant ? project?.projectElevatorConsultant : "")
            
            if (project?.projectElevatorInfo){
                elevatorInfo = JSON.parse(project?.projectElevatorInfo);
            }else{
                console.log("elevatorInfo.length: ", elevatorInfo.length)
                const newElevatorNum = "EID_0001"
                elevatorInfo = [{ elevatingDeviceNo: newElevatorNum, deviceClass: 'Elevator', deviceType: '', deviceStatus: '',max_floor: '', min_floor:'1', floor_initial:'1',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5' }]
            }
            setElevatorInfo(elevatorInfo)
            console.log("elevatorInfo 1:",elevatorInfo)
        } catch (e) {
            console.log("Error in fetch project: ", e)
        }
    }

    useEffect(() => {
        fetchProject(id)
        console.log("elevatorInfo",elevatorInfo)
    }, [id])

    let handleFormChange = (event, index) => {       
        let data = [...elevatorInfo];
        data[index][event.target.name] = event.target.value;
        setElevatorInfo(data);
        console.log("elevatorInfo:",elevatorInfo)
      }
        
      let addFields = () => {
        let newElevatorNum = elevatorInfo.length + 1
        newElevatorNum = ("0000" + newElevatorNum).slice(-4);
        newElevatorNum = "EID_" + newElevatorNum
        let object = { elevatingDeviceNo: newElevatorNum, deviceClass: 'Elevator', deviceType: '', deviceStatus: '',max_floor: '', min_floor:'1', floor_initial:'1',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5' }
        console.log("print add fields:",[...elevatorInfo, object])
        setElevatorInfo([...elevatorInfo, object])
      }
    
      let removeFields = (index) => {
        //Prevent deleting the default fields
        if(index !== 0){
            let dataRemove = elevatorInfo;
            dataRemove.splice(index, 1);
            setElevatorInfo([...dataRemove]);
        }
      }

    /**
     * Handles actions upon form submit
     * @param {*} e 
     */

    const handleSubmit = async (e) => {
        console.log("Submit form")
        e.preventDefault();
        setFeedback('')
        setSuccess(false)

        const projectDetails = {
            id: id,
            projectOwnerName: ownerName,
            projectOwnerStNo: ownerStNo,
            projectOwnerStName: ownerStName,
            projectOwnerCity: ownerCity,
            projectOwnerState: ownerState,
            projectOwnerPostalCode: ownerPostalCode,
            projectOwnerAccountNo: ownerAccountNo,
            projectLocationofElevatingDevice: locationofElevatingDevice,
            projectElevatorContractor:elevatorContractor,
            projectElevatorConsultant:elevatorConsultant,
            projectElevatorInfo:JSON.stringify(elevatorInfo)
        }
        console.log("Project Details: ", projectDetails)
        try {
            let validInputs = true;
            let userFeedback = '';
            //Check to see that each elevator has a corresponding value for the status and type that isn't the default
            elevatorInfo.forEach(elevator=>{
                if(elevator.elevatingDeviceNo !== ''){
                    if (elevator.deviceType !== "Select type of elevator..." && elevator.deviceStatus !== "Select device status..." && elevator.deviceType !== "" && elevator.deviceStatus !== ""){
                        console.log("All good. Status: ", elevator.deviceType, " status: ", elevator.deviceStatus)
                    }else{
                        console.log("NOT All good.")
                        userFeedback = "Error: Project information not submitted. Elevator status and type required."
                        validInputs = false
                    }
                }else{
                    console.log("Elevator not good.")
                    userFeedback = "Error: Project information not submitted. Elevator number required."
                    validInputs = false
                }
            })
            if(validInputs){
                const update2Project = await API.graphql(graphqlOperation(mutations.updateProject, { input: projectDetails }));
                console.log("Success! Project Updated: ", update2Project)
                console.log("SUBMITING...", projectDetails)

                setSuccess(true)
                setFeedback('Project information successfully submitted.')  
                //If successfully submitted reset form
                setId("")
                setOwnerName("")
                setOwnerStNo("")
                setOwnerStName("")
                setOwnerCity("")
                setOwnerState("")
                setOwnerPostalCode("")
                setOwnerAccountNo("")
                setLocationofElevatingDevice("")
                setElevatorContractor("")
                setElevatorConsultant("")
                setElevatorInfo([{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '' }])
            }else{
                //Add error message
                console.log("Failure to submit")
                setSuccess(false)
                setFeedback(userFeedback)
            }
            console.log("validInputs: ", validInputs)
        
        } catch (e) {
            console.log("Error adding information of a project", e);
            setSuccess(false)
            setFeedback("Error: Project information not submitted.")
        }
        console.log("SUBMITING...", projectDetails)
        setId("")
        setOwnerName("")
        setOwnerStNo("")
        setOwnerStName("")
        setOwnerCity("")
        setOwnerState("")
        setOwnerPostalCode("")
        setOwnerAccountNo("")
        setLocationofElevatingDevice("")
        setElevatorContractor("")
        setElevatorConsultant("")
        setElevatorInfo([{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '',max_floor: '', min_floor:'1', floor_initial:'1',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5'}])
    };
     
    return (
        <>
        <div className={`form-container`}>
            <legend className="caption">Project Information Input Form</legend>
            <form className="create-project-form " onSubmit={handleSubmit}>
                <div className="column">
                    <label className="form-label">Project Id :</label>
                    <select className="form-control" value={id} onChange={(e) => setId(e.target.value)}>
                        <option defaultValue>Select project id...</option>
                        {
                            projects.map(project => {
                                return <option key={project.projectId} value={project.id} >{project.projectId}</option> //project.id is the id from the database, projectId is the one for PV tech
                            })
                        }
                    </select>
                </div>
                <label className="form-label">Owner Name:</label>
                <div className="column">
                    <input
                        type="text"
                        name="projectOwnerName"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Owner Name"
                        autoComplete="off"
                        className="form-control"
                    />
                </div>
                <label className="form-label">Project Address : (required)</label>
                <div className="form_row-multiple-cols">
                    <div className="column">
                        <input
                            type="text"
                            name="projectOwnerStNo"
                            value={ownerStNo}
                            onChange={(e) => setOwnerStNo(e.target.value)}
                            placeholder="Street No."
                            className="form-control"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="column">
                        <input
                            type="text"
                            name="projectOwnerStName"
                            value={ownerStName}
                            onChange={(e) => setOwnerStName(e.target.value)}
                            placeholder="Street Name"
                            className="form-control"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="column">
                        <input
                            type="text"
                            name="projectOwnerCity"
                            value={ownerCity}
                            onChange={(e) => setOwnerCity(e.target.value)}
                            placeholder="City"
                            className="form-control"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="column">
                    <input
                            type="text"
                            name="projectOwnerState"
                            value={ownerState}
                            onChange={(e) => setOwnerState(e.target.value)}
                            placeholder="Province/State"
                            className="form-control"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="column">
                        <input
                            type="text"
                            name="projectOwnerPostalCode"
                            value={ownerPostalCode}
                            onChange={(e) => setOwnerPostalCode(e.target.value)}
                            placeholder="Postal Code"
                            autoComplete="off"
                            className="form-control"
                            required
                        />
                    </div>
                </div>
                <label className="form-label">Account No:</label>
                <div className="column">
                    <input
                        type="text"
                        name="projectOwnerAccountNo"
                        value={ownerAccountNo}
                        onChange={(e) => setOwnerAccountNo(e.target.value)}
                        placeholder="Account No"
                        autoComplete="off"
                        className="form-control"
                    />
                </div>
                <label className="form-label">Location of Elevating Device:</label>
                <div className="column">
                    <input
                        type="text"
                        name="locationofElevatingDevice"
                        value={locationofElevatingDevice}
                        onChange={(e) => setLocationofElevatingDevice(e.target.value)}
                        placeholder="Location of Elevating Device"
                        autoComplete="off"
                        className="form-control"
                    />
                </div>
                <label className="form-label">Elevator Contractor:</label>
                <div className="column">
                    <input
                        type="text"
                        name="elevatorContractor"
                        value={elevatorContractor}
                        onChange={(e) => setElevatorContractor(e.target.value)}
                        placeholder="Elevator Contractor"
                        autoComplete="off"
                        className="form-control"
                    />
                </div>   
                <label className="form-label">Elevator Consultant:</label>
                <div className="column">
                    <input
                        type="text"
                        name="elevatorConsultant"
                        value={elevatorConsultant}
                        onChange={(e) => setElevatorConsultant(e.target.value)}
                        placeholder="Elevator Consultant"
                        autoComplete="off"
                        className="form-control"
                    />
                </div>
                <label className="form-label">Elevators Information:</label>
                {/* <div>
                    {(elevatorInfo.length != 0) && ( */}
                            {elevatorInfo?.map((elevator,index) => {
                                return (
                                        <div key={index} className="form_row-multiple-cols group-border"> 
                                            <div className="column">
                                                <input
                                                    type="text"
                                                    name="elevatingDeviceNo"
                                                    onChange={event => handleFormChange(event, index)}
                                                    value={elevator.elevatingDeviceNo}
                                                    className="form-control"
                                                    placeholder="Elevating Device No"
                                                    autoComplete="off"
                                                    required
                                                    readOnly
                                                />
                                            </div>
                                            <div className="column">
                                                <input
                                                    type="text"
                                                    name="deviceClass"
                                                    onChange={event => handleFormChange(event, index)}
                                                    value={elevator.deviceClass}
                                                    placeholder="Device Class: Elevator"
                                                    autoComplete="off"
                                                    className="form-control"
                                                    disabled
                                                />
                                            </div>
                                            <div className="column">
                                                <select className="form-control" value={elevator.deviceType} id="deviceType" name='deviceType'  onChange={event => handleFormChange(event, index)}>
                                                    <option defaultValue>Select type of elevator...</option>
                                                    <option value="Passenger">Passenger</option>
                                                    <option value="Freight">Freight</option>
                                                </select>
                                            </div>
                                            <div className="column">
                                                <select className="form-control" value={elevator.deviceStatus} id="deviceStatus"  name='deviceStatus' onChange={event => handleFormChange(event, index)} >
                                                    <option defaultValue>Select device status...</option>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="CustomerShutDown">Customer Shut Down</option>
                                                </select>
                                            </div> 
                                            <div className="column">
                                                <input
                                                    type="number"
                                                    name="max_floor"
                                                    onChange={event => handleFormChange(event, index)}
                                                    value={elevator.max_floor}
                                                    placeholder="Total No. of floors"
                                                    autoComplete="off"
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                            <div className="column">
                                                <button type="button" onClick={() => removeFields(index)} className="remove-btn">Remove</button> 
                                            </div>
                                        </div>
                                ) 
                            })
                            }
                            <button onClick={addFields} type="button" className="underline-btn">+ Add another elevator...</button>
                            <br />
                {/* //     )}
                // </div> */}
                <button
                    type="submit"
                    className="form-btn"
                    name="Save"                  
                >
                    Submit
                </button>
                <br />
                <legend className={success ? 'feedback-success' : 'feedback-fail'}>{feedback}</legend>
            </form>           
        </div>
        </>
    );
}

export default ProjectInformationForm;