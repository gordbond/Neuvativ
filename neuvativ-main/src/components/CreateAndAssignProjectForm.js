import React, { useState, useEffect } from "react";
import { API, Auth, graphqlOperation } from 'aws-amplify';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import utils from "../utils";

/**
 * Form for creating a 
 * @returns 
 */
function CreateAndAssignProjectForm() {

    let [projectId, setProjectId] = useState("");
    let [projectCreationDate, setProjectCreationDate] = useState("");
    let [projectEC, setProjectEC] = useState("");
    let [projectBM, setProjectBM] = useState("");
    let [typePM, setTypePM] = useState("");
    let [users, setUsers] = useState([]);
    let [feedback, setFeedback] = useState('');
    let [success, setSuccess] = useState(false);
    let projectDetails = useState([]);
    /**
     * Handles actions upon form submit
     * @param {*} e 
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback('')
        setSuccess(false)
        
        try{
            if (typePM === "ElevatorCompany") {
                if (projectEC === "" || projectEC === "Select elevator company...") {
                    throw new Error('No Elevator company selected');
                }else{
                    projectDetails = {
                        projectId: projectId,
                        projectCreationDate: projectCreationDate,
                        projectEC: projectEC,
                    }
                }
            }
            if (typePM === "BuildingManager") {
                if (projectBM === "" || projectBM === "Select building manager...") {
                    throw new Error('No Building manager selected');
                }else{
                    projectDetails = {
                        projectId: projectId,
                        projectCreationDate: projectCreationDate,
                        projectBM: projectBM,
                    }
                }
            }

   
            const newProject = await API.graphql(graphqlOperation(mutations.createProject, { input: projectDetails }));
            console.log("Success! New project created: ", newProject)
            setSuccess(true)
            setFeedback('Project created and assigned.')
            // setProjectId('')
            getProjects()
            setProjectCreationDate('')
            setTypePM('')
            if (typePM === "ElevatorCompany") {
                setProjectEC('')
            }
            if (typePM === "BuildingManager") {
                setProjectEC('')
            }
        } catch (e) {
            console.log("Error creating new project:", e);
            setSuccess(false)
            setFeedback("")
            if(typePM === "" || typePM === "Select type of project manager..." || typePM === undefined){
                setFeedback("Must select a Project Manager type.")
            }else if(e.message === "No Elevator company selected" || projectEC === "Select elevator company..."){
                setFeedback("Must select an elevator company.")
            }else if(e.message === "No Building manager selected" || projectBM === "Select building manager..."){
                setFeedback("Must select a building manager.")
            }
            else{
                setFeedback("Error creating project.")
            }
            
        }
        console.log("SUBMITING...", projectDetails)
    };

    const selectTypePM = async({ target: { value } }) => {
        setTypePM(value)
        let typePM = value;
        console.log("typePM:",typePM)
        if (typePM === "ElevatorCompany") {
            try {
                const userData = await API.graphql(graphqlOperation(queries.userByGroup,{group: "ElevatorCompany"}));
                const listOfUsers = userData?.data?.userByGroup?.items
                console.log("ELEVATOR COMPANIES: ", listOfUsers)
                listOfUsers.sort((a,b)=>utils.compareProjectIds(a,b,"userName"))
                setUsers(listOfUsers)
            } catch (e) {
                console.log("Error: ", e)
            }
        }
        if (typePM === "BuildingManager") {
            try {
                const userData = await API.graphql(graphqlOperation(queries.userByGroup,{group: "BuildingManager"}));
                const listOfUsers = userData?.data?.userByGroup?.items
                console.log("BuildingManager: ", listOfUsers)
                listOfUsers.sort((a,b)=>utils.compareProjectIds(a,b,"userName"))
                setUsers(listOfUsers)
            } catch (e) {
                console.log("Error: ", e)
            }
        }
        }

    const  handleChangeSelectUserEC = ({ target: { value } }) => {
        setProjectEC(value)
    }

    const  handleChangeSelectUserBM = ({ target: { value } }) => {
        setProjectBM(value)
    }

    const getProjects = async () => {
        try {
            const projects = await API.graphql(graphqlOperation(queries.listProjects));
            //Need to increment the project id counter
            //Get latest project (probably by created_at)
            
            const listOfProjects = projects?.data?.listProjects?.items
            let highestNumber = 0
            listOfProjects.forEach(p => {
                let num = p.projectId.split("_")[1]
                num = +num
                if( num > highestNumber){
                    highestNumber = num
                }
            })

            // coerce the previous variable as a number and add 1
            var incrementvalue = highestNumber + 1;

            // insert leading zeroes with a negative slice
            incrementvalue = ("0000" + incrementvalue).slice(-4); // -> result: "0126"
            const latestProjectId = "PID_"+incrementvalue;
            setProjectId(latestProjectId)
            console.log("latestProjectId: ", latestProjectId)
        } catch (e) {
            console.log("Error testing lambda: ", e)
        }
    }

    useEffect(() => {
        getProjects()
    },[])

    return (
        <div className={`form-container-sm`}>
            <legend className="caption">Create and Assign Project</legend>
            <h3 className="caption-wo-size">(All fields required)</h3>
            <form className="create-project-form " onSubmit={handleSubmit}>
                <label className="form-label">Project Id :</label>
                <br />
                <input
                    type="text"
                    name="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Enter project id"
                    className="form-control"
                    autoComplete="off"
                    required
                    readOnly
                />
                <br />
                <label className="form-label">Creation Date:</label>
                <input
                    type="date"
                    name="projectCreationDate"
                    value={projectCreationDate}
                    onChange={(e) => setProjectCreationDate(e.target.value)}
                    className="form-control"
                    autoComplete="off"
                    required
                />
                <br />       
                <label className="form-label">Type of Project Manager:</label>
                <br />
                <select className="form-control" value={typePM} id="typeProjectManager" onChange={selectTypePM} required>
                    <option defaultValue>Select type of project manager...</option>
                    <option value="ElevatorCompany">Elevator Company</option>
                    <option value="BuildingManager">Building Manager</option>
                </select>
                <br />     
                {(typePM === 'ElevatorCompany') &&      
                <>           
                    <label className="form-label">Elevator Company:</label>
                    <select className="form-control"  value={projectEC} onChange={handleChangeSelectUserEC} required>
                    <option defaultValue>Select elevator company...</option>
                    {
                       users.map(user => {
                            return <option key={user.id} value={user.preferred_username} >{user.preferred_username}</option> //project.id is the id from the database
                        })
                    }
                    </select>
                </>
                }
                {(typePM === 'BuildingManager') &&      
                <>           
                    <label className="form-label">Building Manager:</label>
                    <select className="form-control"  value={projectBM} onChange={handleChangeSelectUserBM} required>
                    <option defaultValue>Select building manager...</option>
                    {
                       users.map(user => {
                            return <option key={user.id} value={user.preferred_username} >{user.preferred_username}</option> //project.id is the id from the database
                        })
                    }
                    </select>
                </>
                }
                <br />
                <br />
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
    );
}

export default CreateAndAssignProjectForm;