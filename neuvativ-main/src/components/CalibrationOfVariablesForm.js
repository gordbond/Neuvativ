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

function CalibrationOfVariablesForm() {

    let navigate = useNavigate();

    //Message to be displayed for user
    let [feedback, setFeedback] = useState('');
    let [success, setSuccess] = useState(false);
    let [active, setActive] = useState(false);
    let [counter, setCounter] = useState(0);

    let [id, setId] = useState('');
    let [projectId, setProjectId] = useState('');
    let [elevatorId, setElevatorId] = useState('');
    let [maxFloor, setMaxFloor] = useState('');
    let [minFloor, setMinFloor] = useState('');
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
    let [elevatorInfo, setElevatorInfo] = useState([{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '', max_floor: '', min_floor:'', floor_initial:'',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5'}]);

    let [projects, setProjects] = useState([]);
    let [userConnected, setUserConnected] = useState([]);
    let [userGroup, setUserGroup] = useState([]);

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
                console.log("print if")
            }else{
                console.log("print else")
                elevatorInfo = [{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '', max_floor: '', min_floor:'', floor_initial:'',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5' }]
            }
            setElevatorInfo(elevatorInfo)
            console.log("elevatorInfo 1:",elevatorInfo)
            setProjectId(project.projectId)
            console.log("elevatorInfo 1:",elevatorInfo,project.projectId)
        } catch (e) {
            console.log("Error in fetch project: ", e)
        }
    }

    useEffect(() => {
        fetchProject(id)
        console.log("elevatorInfo",elevatorInfo)
    }, [id])

    /**
     * Handles actions upon form submit
     * @param {*} e 
     */

    const handleSubmit = async (e) => {
        console.log("Submit form")
        e.preventDefault()
        setFeedback('')
        setSuccess(false)
        
        // console.log('projectId:',projectId)
        // console.log('elevatorId:',elevatorId)
        // console.log('!active:',!active)
        if(projectId === "" || projectId === "Select project id..." || projectId === undefined){
            setFeedback("Must select a Project Id.")
        }else if(elevatorId === "" || elevatorId === "Select elevator id..." || elevatorId === undefined){
            setFeedback("Must select a elevator Id.")
        }else{
            setFeedback("")
        }
        try{
            if ((!active === true) && (projectId !== "" && projectId !== "Select project id..." && projectId !== undefined) && (elevatorId !== "" && elevatorId !== "Select elevator id..." && elevatorId !== undefined)){
                // console.log('!active = true', !active)
                // console.log('print projectId:',projectId)
                // console.log('print elevatorInfo:',elevatorInfo)
                counter = counter+1;
                console.log('counter:',counter);
                setCounter(counter)
                let CalVarPubSubMsg = await API.graphql(graphqlOperation(mutations.createCalVarPubSubMsg, { projectId: projectId, elevatorId: elevatorId, calibrationValue: "1"}));
                console.log("Success! CalVarPubSubMsg: ", CalVarPubSubMsg)

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
                // console.log("Project Details: ", projectDetails)

                const update2Project = await API.graphql(graphqlOperation(mutations.updateProject, { input: projectDetails }));
                console.log("Success! Project Updated: ", update2Project)

                setSuccess(true)
                setFeedback('The process of calibrating variables can start now. Please follow the instructions given by Tsaro to calibrate variables.')          
                console.log("SUBMITING...")
                setActive(!active)
            }else if ((!active === false) && (projectId!=='') && (elevatorId!=='')){
                console.log('!active = false', !active)
                counter = counter+1;
                console.log('counter:',counter);
                setCounter(counter)
                if (counter===2){
                    setId("")
                    setProjectId("")
                    setElevatorId("")
                    setMaxFloor("")
                    setMinFloor("")
                    setElevatorInfo([{ elevatingDeviceNo: '', deviceClass: 'Elevator', deviceType: '', deviceStatus: '', max_floor: '', min_floor:'', floor_initial:'',pressure_cut_mov:'0',data_cut_mov:'0',acc_threshold_alarm:'0.022',deltaP:'0.5' }])
                    setCounter(0)
                }
                let CalVarPubSubMsg = await API.graphql(graphqlOperation(mutations.createCalVarPubSubMsg, { projectId: projectId, elevatorId: elevatorId, calibrationValue: "0"}));
                console.log("Success! CalVarPubSubMsg: ", CalVarPubSubMsg)
                setSuccess(true)
                console.log("SUBMITING...")
                setActive(!active)
            }
        } catch (e) {
            console.log("Error in starting or stopping the calibration variables process:", e);
            setSuccess(false)
            setFeedback("")            
        }
        
    };

    let handleElevatorId = (e) => {  
        setElevatorId(e.target.value)
        elevatorInfo.map((elevator,index) =>{
            if (elevator.elevatingDeviceNo === e.target.value){ 
                let data = [...elevatorInfo];
                setMaxFloor(data[index]['max_floor'])
                setMinFloor(data[index]['min_floor'])
                // console.log("data[index]['max_floor']:",data[index]['max_floor'])
                // console.log("data[index]['min_floor']:",data[index]['min_floor'])
            }
        })     
      }

    let handleMaxFloor = (e) => {       
        elevatorInfo.map((elevator,index) =>{
            if (elevator.elevatingDeviceNo === elevatorId){ 
                let data = [...elevatorInfo];
                data[index]['max_floor'] = e.nativeEvent.data;
                setMaxFloor(e.nativeEvent.data)
                console.log("data after change:",data)
                elevatorInfo = data
                setElevatorInfo(data);
            }
        })
      }
      let handleMinFloor = (e) => {       
        elevatorInfo.map((elevator,index) =>{
            if (elevator.elevatingDeviceNo === elevatorId){ 
                console.log("elevatorInfo before change:",elevatorInfo)
                let data = [...elevatorInfo];
                data[index]['min_floor'] = e.nativeEvent.data;
                data[index]['floor_initial'] = "1";
                setMinFloor(e.nativeEvent.data)
                console.log("data after change:",data)
                elevatorInfo = data
                setElevatorInfo(data);
            }
        })
      }
      let handleInitialFloor = (e) => {       
        elevatorInfo.map((elevator,index) =>{
            if (elevator.elevatingDeviceNo === elevatorId){ 
                let data = [...elevatorInfo];
                data[index]['floor_initial'] = 1;
                console.log("data after change:",data)
                elevatorInfo = data
                setElevatorInfo(data);
            }
        })
      }
    return (
        <>
        <div className={`form-container`}>
            <legend className="caption">Calibration of Variables</legend>
            <form className="create-project-form " onSubmit={handleSubmit}>
                <div className="column">
                    <label className="form-label">Project Id :</label>
                    <select className="form-control" value={id} onChange={(e) => setId(e.target.value)} disabled={counter === 1}>
                        <option defaultValue>Select project id...</option>
                        {
                            projects.map(project => {
                                return <option key={project.projectId} value={project.id} >{project.projectId}</option> //project.id is the id from the database, projectId is the one for PV tech
                            })
                        }
                    </select>
                </div>
                {(id !== '') && 
                    <div className="column">
                        <label className="form-label">Elevator Id :</label>
                        <select className="form-control" value={elevatorId} onChange={(e) => handleElevatorId(e)} disabled={counter === 1}>
                            <option defaultValue>Select elevator id...</option>
                            {
                                elevatorInfo.map(elevator => {
                                    return <option key={elevator.elevatingDeviceNo} value={elevator.elevatingDeviceNo} >{elevator.elevatingDeviceNo}</option> 
                                })
                            }
                        </select>
                    </div>
                }
                {(id !== '') && (elevatorId !== '') &&
                <>
                    <div className="column">
                        <label className="form-label">Total number of floors associated with the elevator:</label>
                        <input
                            type="text"
                            name="maxFloor"
                            value={maxFloor}
                            onChange={e => handleMaxFloor(e)}
                            placeholder="Total number of floors associated with the elevator"
                            autoComplete="off"
                            className="form-control"
                            disabled={counter === 1}
                            required
                        />
                    </div>
                    <div className="column">
                        <label className="form-label">Lower floor associated with the elevator:</label>
                        <input
                            type="text"
                            name="min_floor"
                            value={minFloor}
                            onChange={e => handleMinFloor(e)}
                            placeholder="Lower floor associated with the elevator"
                            autoComplete="off"
                            className="form-control"
                            disabled={counter === 1}
                            required
                        />
                    </div>
                    <div className="column">
                        <label className="form-label">Floor to start the variables calibration process:</label>
                        <input
                            type="text"
                            name="floor_initial"
                            value={1}
                            onChange={e => handleInitialFloor(e)}
                            placeholder="Floor to start the variables calibration process"
                            autoComplete="off"
                            className="form-control"
                            disabled="disabled"
                        />
                    </div>
                </>
                }
                <button
                    type="submit"
                    className= { active ? "form-btn-red":"form-btn"}
                    name="Save"                  
                >
                    { active ? "Stop" : "Start"}
                </button>
                <br />
                <legend className={success ? 'feedback-success' : 'feedback-fail'}>{feedback}</legend>
            </form>           
        </div>
        </>
    );
}

export default CalibrationOfVariablesForm;