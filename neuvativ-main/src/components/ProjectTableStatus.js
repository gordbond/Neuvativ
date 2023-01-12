import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Amplify, {Auth, API,graphqlOperation} from 'aws-amplify';
import awsExports from '../aws-exports';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import warningIcon from '../img/warning.png'
import up from "../img/arrow-up.png";
import down from "../img/arrow-down.png";
import utils from "../utils";
import awsConfig from '../aws-exports';
Amplify.configure(awsConfig);

function ProjectTableStatus() {
    // Amplify.configure(awsExports);
   
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    let [projects, setProjects] = useState();


    const [userConnected, setUserConnected] = useState([]);
    const [userGroup, setUserGroup] = useState([]);
    let [listOfProjects,setListOfProjects] = useState([]);
    let [idGuestCodes, setIdGuestCodes] = useState([]);


    let fetchProjects = async () => {
        try {
            const tempUserConnected = Auth?.user?.signInUserSession?.idToken?.payload?.sub
            let userData = await API.graphql(graphqlOperation(queries.getUser, { id: tempUserConnected }));
            let pref_username = userData?.data?.getUser?.preferred_username;
            let reg_code = userData?.data?.getUser?.registration_code;
            console.log("reg_code",reg_code)
            const tempUserGroup = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']
            console.log("tempUserGroup:",tempUserGroup[0])
            setUserConnected(pref_username)

            if (tempUserGroup[0]==="Admin"){
                const projectData = await API.graphql({ query: queries.listProjects });
                listOfProjects = projectData?.data?.listProjects?.items
                listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
                setProjects(listOfProjects)
                setUserGroup('Admin')
            }else{
                if (tempUserGroup[0]==='ElevatorCompany'){
                    let projectData = await API.graphql(graphqlOperation(queries.projectByEC,{projectEC: pref_username}));
                    listOfProjects = projectData?.data?.projectByEC?.items
                    console.log("listOfProjects: ", listOfProjects)
                    listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
                    // setProjects(listOfProjects)
                    setUserGroup('ElevatorCompany')
                    let CodeData = await API.graphql(graphqlOperation(queries.guestCodeByCode,{code: reg_code}));
                    idGuestCodes = CodeData?.data?.guestCodeByCode?.items;
                    console.log("idGuestCodes",idGuestCodes,listOfProjects);
                    idGuestCodes.map(async(gcId, indexTest) => {
                        let info = await API.graphql(graphqlOperation(queries.getGuestCode,{id: gcId.id}));
                        let list= info.data.getGuestCode.guestCode.items;
                        console.log("print list",list,indexTest)
                        let info2 = await API.graphql(graphqlOperation(queries.getProject,{id: list[0].projectID}));
                        let newObject = info2?.data?.getProject;
                        console.log("newObject:",newObject)
                        console.log("listOfProjects before joint: ", listOfProjects)
                        listOfProjects=[...listOfProjects,newObject];
                        console.log("listOfProjects after join: ", listOfProjects)
                        setProjects(listOfProjects)
                    })    
                } else {
                    if (tempUserGroup[0]==='BuildingManager'){
                        
                        let projectData = await API.graphql(graphqlOperation(queries.projectByBM,{projectBM: pref_username}));
                        listOfProjects = projectData?.data?.projectByBM?.items
                        console.log("listOfProjects: ", listOfProjects)
                        listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
                        // setProjects(listOfProjects)
                        setUserGroup('BuildingManager')
                        idGuestCodes.map(async(gcId, indexTest) => {
                            let info = await API.graphql(graphqlOperation(queries.getGuestCode,{id: gcId.id}));
                            let list= info.data.getGuestCode.guestCode.items;
                            console.log("print list",list,indexTest)
                            let info2 = await API.graphql(graphqlOperation(queries.getProject,{id: list[0].projectID}));
                            let newObject = info2?.data?.getProject;
                            console.log("newObject:",newObject)
                            console.log("listOfProjects before joint: ", listOfProjects)
                            listOfProjects=[...listOfProjects,newObject];
                            console.log("listOfProjects after join: ", listOfProjects)
                            setProjects(listOfProjects)
                        })    
                    } else {
                        if (tempUserGroup[0]==='Guest'){  
                            listOfProjects = []
                            try{     
                                let CodeData = await API.graphql(graphqlOperation(queries.guestCodeByCode,{code: reg_code}));
                                idGuestCodes = CodeData?.data?.guestCodeByCode?.items;
                                console.log("idGuestCodes",idGuestCodes,listOfProjects);
                                idGuestCodes.map(async(gcId, indexTest) => {
                                    let info = await API.graphql(graphqlOperation(queries.getGuestCode,{id: gcId.id}));
                                    let list= info.data.getGuestCode.guestCode.items;
                                    console.log("print list",list,indexTest)
                                    let info2 = await API.graphql(graphqlOperation(queries.getProject,{id: list[0].projectID}));
                                    let newObject = info2?.data?.getProject;
                                    console.log("newObject:",newObject)
                                    console.log("listOfProjects before joint: ", listOfProjects)
                                    listOfProjects=[...listOfProjects,newObject];
                                    console.log("listOfProjects after join: ", listOfProjects)
                                    setProjects(listOfProjects)
                                })    
                                setProjects([])
                                                                  
                                
                                
                                listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
                                setUserGroup('Guest')
                            }catch(error){
                                console.log('err',error )
                            }

                        }

                    }
                }

                }
            
            //Get critical alerts
            let alertsReturned = await API.graphql(graphqlOperation(queries.listAlerts,{filter: {
                status: {
                    contains: "CRITICAL",
                },
            }}));

            const listOfAlerts = alertsReturned?.data?.listAlerts?.items
            console.log("listOfAlerts: ", listOfAlerts)

            //Set notifications for projects with a critical alert
            listOfProjects.forEach((project,i)=>{
                if(listOfAlerts.some(alert=>alert.project_id === project.projectId)){
                    listOfProjects[i]['alert']= true
                }else{
                    listOfProjects[i]['alert']= false
                }
            })
            //Sort by newest when first loaded
            // listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
            // setProjects(listOfProjects)
        } catch (e) {
            console.log("Error fetching project: ", e)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (projects === undefined ) {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [projects])

    let handleViewDetails = (e, data) => {
        navigate('/iot-devices-current-iot-projects/projects-details', {
            state: JSON.stringify(data)
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //Sorts projects by category - ASCENDING
    const handleSortAsc = (sortCat) =>{
        const tempProjects = [...projects]
        if(sortCat === "projectCreationDate"){
            tempProjects.sort((a, b) => new Date(a[sortCat]) - new Date(b[sortCat]))
        // }else if(sortCat === "projectId"){
        //     console.log("asc: ", sortCat, " tempProjects: ", tempProjects)
        //     tempProjects.sort((a, b) => {
        //         console.log("a: ", parseInt(a[sortCat]), " b: ", parseInt(b[sortCat]))
        //         return parseInt(a[sortCat]) - parseInt(b[sortCat])
        //     })
        }else if(sortCat === "numOfElev"){
            tempProjects.sort((a, b) => {
                return (JSON.parse(a["projectElevatorInfo"]?.length >= 0) && (JSON.parse(a["projectElevatorInfo"])?.length)) - (JSON.parse(b["projectElevatorInfo"]?.length >= 0) && (JSON.parse(b["projectElevatorInfo"])?.length))
            })
        }
        else if(sortCat === "numOfActiveElev"){
            tempProjects.sort((a, b) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Active") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Active") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        else if(sortCat === "numOfInactiveElev"){
            console.log("Inactive")
            tempProjects.sort((a, b) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Inactive") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Inactive") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        
        else if(sortCat === "numOfShutDownElev"){
            tempProjects.sort((a, b) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Customer Shut Down") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Customer Shut Down") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        else{
            tempProjects.sort(function(a, b){
                if (a[sortCat] === null){ return 1; }
                if (b[sortCat] === null){ return -1; }
                if(capitalizeFirstLetter(a[sortCat]) < capitalizeFirstLetter(b[sortCat])) { return -1; }
                if(capitalizeFirstLetter(a[sortCat]) > capitalizeFirstLetter(b[sortCat])) { return 1; }
                return 0;
            })
        }
        setProjects(tempProjects)
    }

    //Sorts projects by category - DESCENDING
    const handleSortDesc = (sortCat) =>{
        const tempProjects = [...projects]
        if(sortCat === "projectCreationDate"){
            tempProjects.sort((a, b) => new Date(b[sortCat]) - new Date(a[sortCat]))
        // }else if(sortCat === "projectId"){
        //     tempProjects.sort((a, b) => {
        //         return parseInt(b[sortCat]) - parseInt(a[sortCat])
        //     })
        }else if(sortCat === "numOfElev"){
            tempProjects.sort((a, b) => {
                return (JSON.parse(b["projectElevatorInfo"]?.length >= 0) && (JSON.parse(b["projectElevatorInfo"])?.length)) - (JSON.parse(a["projectElevatorInfo"]?.length >= 0) && (JSON.parse(a["projectElevatorInfo"])?.length))
            })
        }
        else if(sortCat === "numOfActiveElev"){
            tempProjects.sort((b, a) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Active") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Active") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        else if(sortCat === "numOfInactiveElev"){
            console.log("Inactive desc")
            tempProjects.sort((b, a) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Inactive") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Inactive") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        else if(sortCat === "numOfShutDownElev"){
            tempProjects.sort((b, a) => {
                return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Customer Shut Down") {
                            return true;
                        }
                        return false;
                    }).length                            
                )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                    JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                        if (obj.deviceStatus === "Customer Shut Down") {
                            return true;
                        }
                        return false;
                    }).length                            
                ))
            })
        }
        else{
            tempProjects.sort(function(a, b){
                if (a[sortCat] === null){ return -1; }
                if (b[sortCat] === null){ return 1; }
                if(capitalizeFirstLetter(b[sortCat]) < capitalizeFirstLetter(a[sortCat])) { return -1; }
                if(capitalizeFirstLetter(b[sortCat]) > capitalizeFirstLetter(a[sortCat])) { return 1; }
                return 0;
            })
        }
        setProjects(tempProjects)
    }

    return (
        <>
        {!loading ?
        <>
        <div className="table-sub-container">
                <table className="query-table">
                    <tbody>
                        <tr>
                            <th></th>
                            <th>Project Id <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("projectId")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("projectId")} alt="sort down"></input>
                            </th>
                            <th>Owner Name <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("projectOwnerName")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("projectOwnerName")} alt="sort down"></input>
                            </th>
                            <th>Address<br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("projectOwnerStNo")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("projectOwnerStNo")} alt="sort down"></input>
                            </th>
                            <th>No. of Elevators <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("numOfElev")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("numOfElev")} alt="sort down"></input>
                            </th>
                            <th>No. Active Elevators <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("numOfActiveElev")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("numOfActiveElev")} alt="sort down"></input>
                            </th>
                            <th>No. Inactive Elevators <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("numOfInactiveElev")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("numOfInactiveElev")} alt="sort down"></input>
                            </th>
                            <th>No. Customer Shut Down Elevators <br />
                                <input className="sort-icon" type="image" src={up}  onClick={(e) => handleSortAsc("numOfShutDownElev")} alt="sort up"></input>
                                <input className="sort-icon" type="image" src={down} onClick={(e) => handleSortDesc("numOfShutDownElev")} alt="sort down"></input>
                            </th>
                            {/* <th>Notifications</th> */}
                        </tr>
                        {
                            projects.map(project => {
                                return <tr key={project.id}>
                                    <td><button className="sm-btn-blue" onClick={(e)=>{handleViewDetails(e, project)}}>View Details</button></td>
                                    <td>{project?.projectId}</td>
                                    <td>{project?.projectOwnerName}</td>
                                    <>{project?.projectOwnerStNo && project?.projectOwnerStName ?
                                        <td> {project?.projectOwnerStNo} {project?.projectOwnerStName}, {project?.projectOwnerCity}, {project?.projectOwnerState}, {project?.projectOwnerPostalCode}</td>
                                        : 
                                        <td></td>}
                                    </>
                                    <td>{ (JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (JSON.parse(project?.projectElevatorInfo)?.length)}
                                    </td>
                                    <td>{ (JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                        JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                            if (obj.deviceStatus === "Active") {
                                                return true;
                                            }
                                            return false;
                                        }).length                            
                                    )}
                                    </td>
                                    <td>{ (JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                        JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                            if (obj.deviceStatus === "Inactive") {
                                                return true;
                                            }
                                            return false;
                                        }).length                            
                                    )}
                                    </td>
                                    <td>{ (JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                        JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                            if (obj.deviceStatus === "Customer Shut Down") {
                                                return true;
                                            }
                                            return false;
                                        }).length                            
                                    )}
                                    </td>
                                    {/* <td>{project?.alert ? <img src={warningIcon} alt="Warning" className='warningIcon'></img> : ""}</td> */}
                                </tr>
                            }).sort(function(a, b){
                                if(a.projectId < b.projectId) { return -1; }
                                if(a.projectId > b.projectId) { return 1; }
                                return 0;
                            })
                        }
                    </tbody>     
                </table>
        </div>
        <div className="table-sub-container">
            <div className = "definitions">
                <br/>
                <p><b>Definitions:</b></p>
                <p><b>Active Elevators:</b> Elevator that are working properly.</p>
                <p><b>Inactive Elevators:</b> Elevator that are not working properly.</p>
                <p><b>Customer Shut Down Elevators:</b> Elevator that have been shut down on purpose by the client.</p>
            </div>
        </div>
        </>
        :
            <legend className="caption loading-color">Loading please wait...</legend>
        }
        </>
    );
}

export default ProjectTableStatus;