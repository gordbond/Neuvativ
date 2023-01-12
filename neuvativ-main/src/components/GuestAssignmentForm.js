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

function GuestAssignmentForm() {

    let [userConnected, setUserConnected] = useState([]);
    let [userGroup, setUserGroup] = useState([]);
    let [projects, setProjects] = useState([]);
    let [dataGuest, setDataGuest] = useState('');
    let [id, setId] = useState('');
    let [projectId, setProjectId] = useState('');
    let [guestCodeList, setGuestCodeList] =  useState([{ code: ''}]);
    let [dataGuestInput, setdataGuestInput] =  useState([{ code: ''}]);
    let [dataCode, setDataCode]=  useState([]);
    let [elementToRemove, setElementToRemove]=  useState([]);

    const [feedback, setFeedback] = useState('');
    const [success, setSuccess] = useState(false);

    /**
     * Handles actions upon form submit
     * @param {*} e 
     */

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
            console.log("Error in fetchProjects: ", e)
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
            console.log("project try:",project)
            console.log("project?.projectGuest?.items:",project?.projectGuest?.items)
            console.log("project?.projectGuest?.items.length:",project?.projectGuest?.items.length)
            if (project?.projectGuest?.items.length>0){
                console.log("print if",project)
                try{  
                    await API.graphql(graphqlOperation(queries.getProject,{id: id})).then((project)=>{
                        console.log('project details are',project.data.getProject);
                        const list= project.data.getProject.projectGuest.items;
                        list.map(async(element)=>(
                        await API.graphql(graphqlOperation(queries.getGuestCode,{id: element.guestCodeID})).then(data=>{
                            let dataCodeTemp = {code:data?.data?.getGuestCode?.code};
                            dataCode = [...dataCode, dataCodeTemp];
                            console.log("print dataCode",dataCode)
                            setDataCode(dataCode)
                            setGuestCodeList(dataCode)
                        })))})
                        guestCodeList = dataCode;
                        setGuestCodeList(dataCode)
                        console.log("guestCodeList if",guestCodeList)
                        dataCode = [];
                        setDataCode([])
                }
                catch(err){
                    console.log('err',err )
                }
            }else{
                console.log("guestCodeList else",guestCodeList)
                guestCodeList = [{ code: ''}];
                setGuestCodeList(guestCodeList);
            }
        } catch (e) {
            console.log("Error in fetch project: ", e)
        }  
    }

    useEffect(() => {
        fetchProject(id)
    }, [id])

    const handleChangeSelect = ({ target: { value } }) => {
        console.log("id:",value)
        setId(value)
    }

    let handleFormChange = (event, index) => {       
        dataGuest = [...guestCodeList];
        console.log("data:", dataGuest)
        dataGuest[index][event.target.name] = event.target.value;
        console.log("dataGuest:",dataGuest)
        guestCodeList = dataGuest;
        setGuestCodeList(dataGuest);
    }
        
      let addFields = () => {
        let object = { code: ''}
        console.log("print object:",object)
        console.log("print add fields:",[...guestCodeList, object])
        setGuestCodeList([...guestCodeList, object])
      }
    
      let removeFields = (index) => {
        //Prevent deleting the default fields
        if((index + 1) !== guestCodeList.length){
                let dataRemove = guestCodeList;
                elementToRemove = [...elementToRemove,guestCodeList[index].code]
                console.log("element to be removed",elementToRemove)
                dataRemove.splice(index, 1);
                setGuestCodeList([...dataRemove]);
                setElementToRemove(elementToRemove)
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
        console.log("guestCodeList submit",guestCodeList);
        try{

            {elementToRemove?.map(async(elementR) => {
                let getJoinId = await API.graphql(graphqlOperation(queries.getGuestCode,{id:id.concat(elementR)}));
                let joinId = getJoinId?.data?.getGuestCode?.guestCode?.items[0].id;
                console.log("joinId",joinId)
                let removeGC = await API.graphql(graphqlOperation(mutations.deleteGuestCode,{input:{id:id.concat(elementR)}})).then(await API.graphql(graphqlOperation(mutations.deleteProjectGuestGuestCode,{input:{id:joinId}})))
                console.log("removeGC",removeGC)
            })}
        }catch(error) {
            console.log("Error removin code", error);
        }
        try {
            {guestCodeList?.map(async(element, indexC) => 
                {
                    let checkGuestCode = await API.graphql(graphqlOperation(queries.getGuestCode, { id: id.concat(element.code)}));
                    console.log("checkGuestCode",checkGuestCode,id.concat(element.code),indexC);
                    if (checkGuestCode?.data?.getGuestCode){
                    }else{
                        let creGuestCode = await API.graphql(graphqlOperation(mutations.createGuestCode,{input:{ id: id.concat(element.code), code: element.code}}));
                        console.log("creGuestCode else",creGuestCode);
                        let jointCreate =  await API.graphql(graphqlOperation(mutations.createProjectGuestGuestCode,{input:{projectID: id, guestCodeID: id.concat(element.code)}}));
                        console.log("jointCreate else",jointCreate);
                    }
                }
            )}
            console.log("Success! codes Updated: ")
            setSuccess(true)
            setFeedback('Codes successfully submitted.')          
        } catch (error1) {
            console.log("Error adding codes", error1);
            setSuccess(false)
            setFeedback("Error: guestCode and joint table information not submitted.")
        }
        console.log("SUBMITING...")
        setId("");
        setGuestCodeList([{ code: ''}]);
        setGuestCodeList([]);
        setElementToRemove([]);
        setdataGuestInput([{ code: ''}]);
    };

    return (
        <div className={`form-container-sm`}>
            <legend className="caption">Guest Assignment</legend>
            <form className="create-project-form " onSubmit={handleSubmit}>
            <div className="column">
                <label className="form-label">Project Id :</label>
                <select className="form-control" value={id} onChange={handleChangeSelect}>
                    <option defaultValue>Select project id...</option>
                    {
                        projects.map(project => {
                            return <option key={project.projectId} value={project.id} >{project.projectId}</option> //project.id is the id from the database, projectId is the one for PV tech
                        })
                    }
                </select>
            </div>  
            <label className="form-label">Guest Codes:</label>
            {guestCodeList?.map((element,index) => {
                console.log("element.code",element.code)
                return (
                    <div key={index} className="form_row-multiple-cols group-border"> 
                        <div className="column">
                        {(element.code.length>=9)&& (
                            <input
                                type="text"
                                name="code"
                                onChange={event => handleFormChange(event, index)}
                                value={element.code}
                                className="form-control"
                                placeholder="Guest Code"
                                autoComplete="off"
                                disabled="true"
                            />
                        )}
                        {(element.code.length<9)&& (
                            <input
                                type="text"
                                name="code"
                                onChange={event => handleFormChange(event, index)}
                                value={element.code}
                                className="form-control"
                                placeholder="Guest Code"
                                autoComplete="off"
                                required = "true"
                            />
                        )}
                        </div>
                        <div className="column">
                            <button type="button" onClick={() => removeFields(index)} className="sm-btn-remove">Remove</button> 
                        </div>
                    </div>
                )
            }
            )
            }
            <button onClick={addFields} type="button" className="underline-btn">+ Add Guest Code...</button>
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
export default GuestAssignmentForm;