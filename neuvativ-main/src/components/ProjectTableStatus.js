import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';
import * as queries from '../graphql/queries';
import up from "../img/arrow-up.png";
import down from "../img/arrow-down.png";
import awsConfig from '../aws-exports';

Amplify.configure(awsConfig);
/**
 * 
 * @returns the status of the project
 */
function ProjectTableStatus() {

    // PP : calling the function useNavigate and assigning to variable navigate
    const navigate = useNavigate();

    // PP : Usestates for the loading,projects,userconnected,usergroup,listofProjects,idGuestCodes
    const [loading, setLoading] = useState(true)
    let [projects, setProjects] = useState();
    const [userConnected, setUserConnected] = useState([]);
    const [userGroup, setUserGroup] = useState([]);
    let [listOfProjects, setListOfProjects] = useState([]);
    let [idGuestCodes, setIdGuestCodes] = useState([]);
    /**
     * PP:
     * @param {*} idGuestCodes the id of the guestcodes
     */
    function mapping(idGuestCodes) {
        idGuestCodes.map(async (gcId, indexTest) => {
            // fetching items as per the guestcode
            let info = await API.graphql(graphqlOperation(queries.getGuestCode, { id: gcId.id }));
            let list = info.data.getGuestCode.guestCode.items;
            // fetching projects as per the list
            let info2 = await API.graphql(graphqlOperation(queries.getProject, { id: list[0].projectID }));
            let newObject = info2?.data?.getProject;
            listOfProjects = [...listOfProjects, newObject];
            // setting the projects
            setProjects(listOfProjects)
        })

    }
    /**
     * PP:
     * @param {*} listOfProjects the list of the projects
     * @param {*} userName the name of the user
     */

    function sorting(listOfProjects, userName) {
        listOfProjects.sort((a, b) => new Date(b["projectCreationDate"]) - new Date(a["projectCreationDate"]))
        if (userName === "Admin" || userName === "Guest") {
            setProjects(listOfProjects)
        }

        setUserGroup(userName);
    }
    // PP: fetching the projects
    let fetchProjects = async () => {
        try {

            const tempUserConnected = Auth?.user?.signInUserSession?.idToken?.payload?.sub
            let userData = await API.graphql(graphqlOperation(queries.getUser, { id: tempUserConnected }));
            let pref_username = userData?.data?.getUser?.preferred_username;
            let reg_code = userData?.data?.getUser?.registration_code;
            const tempUserGroup = Auth?.user?.signInUserSession?.idToken?.payload['cognito:groups']
            setUserConnected(pref_username)

            //PP: if the usergroup is Admin
            if (tempUserGroup[0] === "Admin") {
                const projectData = await API.graphql({ query: queries.listProjects });
                listOfProjects = projectData?.data?.listProjects?.items
                sorting(listOfProjects, "Admin");
            } else {
                //PP: if userGroup is ElevatorCompany
                if (tempUserGroup[0] === 'ElevatorCompany') {
                    let projectData = await API.graphql(graphqlOperation(queries.projectByEC, { projectEC: pref_username }));
                    listOfProjects = projectData?.data?.projectByEC?.items
                    sorting(listOfProjects, "ElevatorCompany")
                    //PP: CodeData from graphql
                    let CodeData = await API.graphql(graphqlOperation(queries.guestCodeByCode, { code: reg_code }));
                    idGuestCodes = CodeData?.data?.guestCodeByCode?.items;
                    mapping(idGuestCodes);

                } else {
                    //PP: if userGroup is BuildingManager
                    if (tempUserGroup[0] === 'BuildingManager') {
                        let projectData = await API.graphql(graphqlOperation(queries.projectByBM, { projectBM: pref_username }));
                        listOfProjects = projectData?.data?.projectByBM?.items
                        sorting(listOfProjects, "BuildingManager");
                        mapping(idGuestCodes);
                    } else {
                        if (tempUserGroup[0] === 'Guest') {
                            listOfProjects = []
                            try {
                                let CodeData = await API.graphql(graphqlOperation(queries.guestCodeByCode, { code: reg_code }));
                                idGuestCodes = CodeData?.data?.guestCodeByCode?.items;
                                mapping(idGuestCodes);
                                sorting(listOfProjects, "Guest");
                            } catch (error) {
                                console.log('err', error)
                            }

                        }

                    }
                }

            }

            //PP: Get critical alerts
            let alertsReturned = await API.graphql(graphqlOperation(queries.listAlerts, {
                filter: {
                    status: {
                        contains: "CRITICAL",
                    },
                }
            }));

            const listOfAlerts = alertsReturned?.data?.listAlerts?.items
            console.log("listOfAlerts: ", listOfAlerts)

            // PP: Set notifications for projects with a critical alert
            listOfProjects.forEach((project, i) => {
                if (listOfAlerts.some(alert => alert.project_id === project.projectId)) {
                    listOfProjects[i]['alert'] = true
                } else {
                    listOfProjects[i]['alert'] = false
                }
            })
        } catch (e) {
            console.log("Error fetching project: ", e)
        }
    }
    //PP: defining useEffect as fetchProjects, for the first apperance of the page
    //PP:  it will fetch the projects from graphql and will load the page accordingly
    useEffect(() => {
        fetchProjects()
    }, [])

    //PP:  on changing of project status, it is undefined then loading will be true and viceversa.
    useEffect(() => {
        if (projects === undefined) {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [projects])
    //PP: it will handle the view details
    let handleViewDetails = (e, data) => {
        navigate('/iot-devices-current-iot-projects/projects-details', {
            state: JSON.stringify(data)
        });
    }
    /**
     * PP:
     * @param {*} string 
     * @returns string with first letter capital
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    /**
     * PP:
     * @param {*} tempProjects the temperory projects
     * @param {*} sortcat the sortcat
     * @param {*} status the status of the elevator: Active,Inactive and manymore
     * @param {*} type type of sorting ascending and descending
     */
    function tempprojectSort(tempProjects, sortcat, status, type) {
        // PP: if sorting is done to be in ascending order
        if (type === "Ascending") {
            if (sortcat === "numOfElev") {
                // PP: sorting
                tempProjects.sort((a, b) => {
                    return (JSON.parse(a["projectElevatorInfo"]?.length >= 0) && (
                        JSON.parse(a["projectElevatorInfo"])?.length)) - (JSON.parse(b["projectElevatorInfo"]?.length >= 0) && (JSON.parse(b["projectElevatorInfo"])?.length))
                })
            } else {
                tempProjects.sort((a, b) => {
                    return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                        JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                            //PP: checking the status matches the object status
                            if (obj.deviceStatus === status) {
                                return true;
                            }
                            return false;
                        }).length
                    )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                        JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                            //PP: checking the status matches the object status
                            if (obj.deviceStatus === status) {
                                return true;
                            }
                            return false;
                        }).length
                    ))
                })

            }
            //PP: if sorting is done to be in descending order
        }
        if (type === "Descending") {
            if (sortcat === "numOfElev") {
                // PP: sorting
                tempProjects.sort((b, a) => {
                    return (JSON.parse(a["projectElevatorInfo"]?.length >= 0) && (
                        JSON.parse(a["projectElevatorInfo"])?.length)) - (JSON.parse(b["projectElevatorInfo"]?.length >= 0) && (JSON.parse(b["projectElevatorInfo"])?.length))
                })
            } else {
                tempProjects.sort((b, a) => {
                    return ((JSON.parse(a["projectElevatorInfo"])?.length >= 0) && (
                        JSON.parse(a["projectElevatorInfo"]).filter(obj => {
                            if (obj.deviceStatus === status) {

                                return true;
                            }

                            return false;
                        }).length
                    )) - ((JSON.parse(b["projectElevatorInfo"])?.length >= 0) && (
                        JSON.parse(b["projectElevatorInfo"]).filter(obj => {
                            if (obj.deviceStatus === status) {

                                return true;
                            }
                            return false;
                        }).length
                    ))
                })

            }
        }

    }
    //PP: Sorts projects by category - ASCENDING or descending
    const handleSort = (sortCat, type) => {

        const tempProjects = [...projects]
        if (sortCat === "projectCreationDate") {
            tempProjects.sort((a, b) => new Date(a[sortCat]) - new Date(b[sortCat]))
        } else if (sortCat === "numOfElev") {
            tempprojectSort(tempProjects, "numOfElev", "", type);
        }
        else if (sortCat === "numOfActiveElev") {
            tempprojectSort(tempProjects, "numOfActiveElev", "Active", type)
        }
        else if (sortCat === "numOfInactiveElev") {
            tempprojectSort(tempProjects, "numOfInActiveElev", "Inactive", type)
        }

        else if (sortCat === "numOfShutDownElev") {
            tempprojectSort(tempProjects, "numOfShutDownElev", "Customer Shut Down", type)
        }
        else {
            if (type === "Ascending") {
                tempProjects.sort(function (a, b) {
                    if (a[sortCat] === null) { return 1; }
                    if (b[sortCat] === null) { return -1; }
                    if (capitalizeFirstLetter(a[sortCat]) < capitalizeFirstLetter(b[sortCat])) { return -1; }
                    if (capitalizeFirstLetter(a[sortCat]) > capitalizeFirstLetter(b[sortCat])) { return 1; }
                    return 0;
                })
            } else {
                tempProjects.sort(function (b, a) {
                    if (a[sortCat] === null) { return 1; }
                    if (b[sortCat] === null) { return -1; }
                    if (capitalizeFirstLetter(a[sortCat]) < capitalizeFirstLetter(b[sortCat])) { return -1; }
                    if (capitalizeFirstLetter(a[sortCat]) > capitalizeFirstLetter(b[sortCat])) { return 1; }
                    return 0;
                })
            }


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
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("projectId", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("projectId", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>Owner Name <br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("projectOwnerName", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("projectOwnerName", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>Address<br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("projectOwnerStNo", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("projectOwnerStNo", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>No. of Elevators <br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("numOfElev", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("numOfElev", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>No. Active Elevators <br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("numOfActiveElev", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("numOfActiveElev", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>No. Inactive Elevators <br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("numOfInactiveElev", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("numOfInactiveElev", "Descending")} alt="sort down"></input>
                                    </th>
                                    <th>No. Customer Shut Down Elevators <br />
                                        <input className="sort-icon" type="image" src={up} onClick={(e) => handleSort("numOfShutDownElev", "Ascending")} alt="sort up"></input>
                                        <input className="sort-icon" type="image" src={down} onClick={(e) => handleSort("numOfShutDownElev", "Descending")} alt="sort down"></input>
                                    </th>
                                </tr>
                                {
                                    //PP: displaying details of the project such as projectId,owner name and many more
                                    projects.map(project => {
                                        return <tr key={project.id}>
                                            <td><button className="sm-btn-blue" onClick={(e) => { handleViewDetails(e, project) }}>View Details</button></td>
                                            <td>{project?.projectId}</td>
                                            <td>{project?.projectOwnerName}</td>
                                            <>{project?.projectOwnerStNo && project?.projectOwnerStName ?
                                                <td> {project?.projectOwnerStNo} {project?.projectOwnerStName}, {project?.projectOwnerCity}, {project?.projectOwnerState}, {project?.projectOwnerPostalCode}</td>
                                                :
                                                <td></td>}
                                            </>
                                            <td>{(JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (JSON.parse(project?.projectElevatorInfo)?.length)}
                                            </td>
                                            <td>{(JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                                JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                                    if (obj.deviceStatus === "Active") {
                                                        return true;
                                                    }
                                                    return false;
                                                }).length
                                            )}
                                            </td>
                                            <td>{(JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                                JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                                    if (obj.deviceStatus === "Inactive") {
                                                        return true;
                                                    }
                                                    return false;
                                                }).length
                                            )}
                                            </td>
                                            <td>{(JSON.parse(project?.projectElevatorInfo)?.length >= 0) && (
                                                JSON.parse(project?.projectElevatorInfo).filter(obj => {
                                                    if (obj.deviceStatus === "Customer Shut Down") {
                                                        return true;
                                                    }
                                                    return false;
                                                }).length
                                            )}
                                            </td>
                                        </tr>
                                    }).sort(function (a, b) {
                                        if (a.projectId < b.projectId) { return -1; }
                                        if (a.projectId > b.projectId) { return 1; }
                                        return 0;
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="table-sub-container">
                        <div className="definitions">
                            {/* PP: displaying definations of the term */}
                            <br />
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
// exporting ProjectTableStatus
export default ProjectTableStatus;
