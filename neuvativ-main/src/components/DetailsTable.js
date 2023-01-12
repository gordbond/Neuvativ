
import React, { useState, useEffect } from "react";
import Toggle from "./Toggle";
import { useNavigate } from "react-router-dom";
import warningIcon from '../img/warning.png'
import bellIcon from '../img/ringing-bell.png'
import mailIcon from '../img/mail.png'
import noAlarmIcon from '../img/no-alarm.png'
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import Amplify,  {Auth, API,graphqlOperation} from 'aws-amplify';
import { embedDashboard } from 'amazon-quicksight-embedding-sdk';
import awsExports from '../aws-exports';
Amplify.configure(awsExports);

function DetailsTable({project,setProject}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [elevatorInfo, setElevatorInfo] = useState([]);

    const AWS = require('aws-sdk');
        
    const [embedUrl, setEmbedUrl] = useState("");
    const [dashboard, setDashboard] = useState();
    const [dataUser, setDataUser]= useState("");
    const [buttons, setButtons]= useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [pendingSubs, setPendingSubs] = useState([]);
    const [containerDiv, setContainerDiv] = useState();
    const listOfSignals = ["acceleration_threshold", "minimum_operation"]
    const [subsLoading, setsubsLoading] = useState(true);
    const [counter, setCounter] = useState(0);

    /**
     * Get all of the project info, parse it and set to variable
     */
    const fetchProjectInfo = async () => {
        if (project === undefined) {
            setLoading(true)
        } else {
            setLoading(false)
        }
        let projectElevatorInfo = JSON.parse(project?.projectElevatorInfo)
        let elevatorIdList = ''

        if(projectElevatorInfo !== undefined && projectElevatorInfo !== null){
            projectElevatorInfo.forEach((id,i) => {
                if(i !== projectElevatorInfo.length -1) {
                    elevatorIdList = elevatorIdList + id + ", "
                }else{
                    elevatorIdList = elevatorIdList + id
                }
            })
        }

        setElevatorInfo(elevatorIdList)
    }

    //Get project info when project data is available
    useEffect( () => {
        fetchProjectInfo()
    }, [project])

    //TO BE USED LATER
    let handleTakeAction = (e, data) => {

    }
    //TO BE USED LATER
    let handleEmailNotifications= (e, data) => {

    }

    /**
     * Set the button to say Pending... while subbing or unsubbing 
     * @param {*} data 
     * @param {*} indexOfSignal 
     */
    const setBtnPending = (data, indexOfSignal) => {
        console.log("SET PENDING DATA: ", data)
        const textForPending = 'Loading'
        const btnIndex = buttons.findIndex(btn => btn.elevator_id === data.elevator_id);
        //Update the buttons in state
        const updatedBtns = buttons.map((btn, i) => {
            console.log("SET PENDING BTN: ", btn['signal'][indexOfSignal])
            if (i === btnIndex) {
                let updatedBtn = btn
                updatedBtn['signal'][indexOfSignal]['btn_text'] = textForPending
                updatedBtn['signal'][indexOfSignal]['btn_class'] = "icon-btn-grey-dots"
                return updatedBtn;
            } else {
              return btn;
            }
          });
        setButtons(updatedBtns)
    }

    /**
     * Subscribe or unsubscribe to a specific signal for an elevator.
     * @param {*} e 
     * @param {*} data 
     * @param {*} i 
     */
    const handleSubscribe = async (e, data, i) => {
        //If Unsubscribed then subscribe the user to the alert
        const username = dataUser?.data?.getUser?.username;
        const email = dataUser?.data?.getUser?.email;
        //Set pending... (loading) for button
        setBtnPending(data,i)
        if(data.btn_status === "unsubscribed"){
            try{
                await API.graphql(graphqlOperation(queries.getAlertById, {elevator_id: data.elevator_id, project_id: project.projectId, signal_type: data.name, email: email, userName: username, action: "subscribe"}));
            }catch(err){
                console.log("Error subscribing: ", err)
            }
        }else if(data.btn_status === "subscribed"){
            try{
                await API.graphql(graphqlOperation(queries.getAlertById, {elevator_id: data.elevator_id, project_id: project.projectId, signal_type: data.name, email: email, userName: username, action: "unsubscribe"}));
            }catch(err){
                console.log("Error subscribing: ", err)
            }
        }else{
            console.log("PENDING")
        }
        //Update the subscriptions to show in the front end
        updateSubs()
    }


    /**
     * Updating url for embeded dashboard
     */
    const fetchUpdatedUrl = async () => {
        try {
            const updatedUrlData = await API.graphql(graphqlOperation(queries.getUrl, {id: Auth?.user?.attributes?.sub, email: Auth?.user?.attributes?.email}));
            setEmbedUrl(updatedUrlData?.data?.getUrl?.data)
            displayingDashboard(updatedUrlData?.data?.getUrl?.data);
        } catch (e) {
            console.log("Error testing lambda: ", e)
        }
    }

    /**
     * Get the embededUrl
     */
    const fetchEmbededUrl = async () => {
        try {
            const id = Auth?.user?.attributes?.sub; 
            const userData = await API.graphql(graphqlOperation(queries.getUser, { id: id })); 
            setDataUser(userData);
            const url = userData?.data?.getUser?.embededUrl
            setEmbedUrl(url)
            let contDiv = document.getElementById("embeddingContainer")
            setContainerDiv(contDiv);
            displayingDashboard(url);
        } catch (e) {
            console.log("Error fetchEmbededUrl: ", e)
        }
    }

    /**
     * Update the buttons to represent the subscription state
     */
    const updateSubButtons = (subs, pendingSubs) => {
        console.log("Pending subs: ", pendingSubs)
        try{
            let buttonObj = [];
            console.log("Project: ", project)
            const eleInfo = JSON.parse(project.projectElevatorInfo)
            const currentProjectId = project.projectId
            //Use currentProjectId in some way to filter out any irrelevant projects
            eleInfo.forEach ((e,i) => {
                console.log("eleInfo: ", eleInfo)
                const tempObj = {
                    elevator_id: e.elevatingDeviceNo,
                    signal: []
                }
                //Set button class, status and text
                listOfSignals.forEach(signal => {
                    // console.log("SIGNAL: ", signal)
                    // console.log("subs: ", subs)
                    let subStatus = ''
                    let text = ''
                    let btnClass = ''
                    let disabled = false
                    //Project Id can be used here I think
                    if((subs.find((sub) => sub.elevId === e.elevatingDeviceNo && sub.signalType === signal)) === undefined) {
                        if((pendingSubs.find((sub) => sub.id.includes(e.elevatingDeviceNo + '-' + project.projectId)  && sub.signalType === signal)) === undefined){
                            subStatus = 'unsubscribed'
                            text = "Unsubscribed"
                            btnClass = 'icon-btn-red'
                            disabled = false
                        }else{
                            subStatus = 'pending'
                            text = 'Pending'
                            btnClass = 'icon-btn-grey'
                            disabled = true
                        }
                    }else{
                        subStatus = 'subscribed'
                        text = 'Subscribed'
                        btnClass = 'icon-btn-green'
                        disabled = false
                    }
                    tempObj.signal.push({
                        name: signal,
                        btn_text: text, 
                        btn_status: subStatus,
                        btn_class: btnClass,
                        elevator_id: e.elevatingDeviceNo,
                        disabled: disabled

                    })
                })
                buttonObj.push(tempObj)
            })
            setButtons(buttonObj)
            
        }catch(err){
            console.log("ERROR IN UPDATE SUB BUTTONS: ",err)
        }
    }

    /**
     * Get all the current subscription statuses 
     */
    const updateSubs = async () => {
        try{
            const updatedUserData = await API.graphql(graphqlOperation(queries.updateSubscriptionsByUser, {id: Auth?.user?.attributes?.sub,  email: dataUser?.data?.getUser?.email, userName: dataUser?.data?.getUser?.username}))
            let subs = []
            let pendingSubs = []
            //I need to filter out only relevant projects
            console.log("***updatedUserData: ", updatedUserData?.data?.updateSubscriptionsByUser)
            console.log("***updatedUserData: ", updatedUserData?.data?.updateSubscriptionsByUser.pending_subscriptions)
            // console.log("updatedUSER length: ", updatedUserData?.data?.updateSubscriptionsByUser?.subscriptions.length)
            console.log("DataUSer: ", dataUser?.data?.getUser)
            let user = {
                id: dataUser?.data?.getUser.id,
                username: dataUser?.data?.getUser.username,
                email: dataUser?.data?.getUser.email, 
                preferred_username: dataUser?.data?.getUser.preferred_username,
                registration_code: dataUser?.data?.getUser.registration_code,
                group: dataUser?.data?.getUser.group,
                sheetInformation: dataUser?.data?.getUser.sheetInformation,
                embededUrl: dataUser?.data?.getUser.embededUrl,
                subscriptions: dataUser?.data?.getUser.subscriptions,
                pending_subscriptions: dataUser?.data?.getUser.pending_subscriptions
            }


            console.log("PRE UPDATE USER: ", updatedUserData?.data)
            console.log("PRE UPDATE USER: ", updatedUserData?.data?.updateSubscriptionsByUser.pending_subscriptions)
            console.log("IF STATEMENT: ", updatedUserData?.data?.updateSubscriptionsByUser.pending_subscriptions === null)
            if(updatedUserData?.data?.updateSubscriptionsByUser.pending_subscriptions === null){
                user.pending_subscriptions = []
            }else{
                user.pending_subscriptions = updatedUserData?.data?.updateSubscriptionsByUser.pending_subscriptions
            }
            if(updatedUserData?.data?.updateSubscriptionsByUser.subscriptions === null ){
                user.subscriptions = []
            }else{
                user.subscriptions = updatedUserData?.data?.updateSubscriptionsByUser.subscriptions
            }
            try{
                await API.graphql(graphqlOperation(mutations.updateUser, {input: user}))
            }catch(e){
                console.log("ERROR ADDING array: ", e)
            }
            if(updatedUserData?.data?.updateSubscriptionsByUser?.subscriptions !== null) {
                updatedUserData?.data?.updateSubscriptionsByUser?.subscriptions.forEach(e => {
                    const tempData = JSON.parse(e)
                    
                    if(tempData.projectId === project.projectId)
                        subs.push(JSON.parse(e))
                })
            }else{
                // await API.graphql(graphqlOperation(mutations.updateUser, {id: Auth?.user?.attributes?.sub, subscriptions: []}))
            }
            if(updatedUserData?.data?.updateSubscriptionsByUser?.pending_subscriptions !== null) {
                updatedUserData?.data?.updateSubscriptionsByUser?.pending_subscriptions.forEach(e => {
                    const tempData = JSON.parse(e)
                    console.log("***PENDING SUBS FROM updatedUserData?: ", tempData)
                    
                    const pendingProjId = tempData?.id[0].split('-')[1]

                    console.log("temp vs project: ", pendingProjId, ", ", project.projectId, ", ", pendingProjId === project.projectId)
                    if(pendingProjId === project.projectId)
                        pendingSubs.push(JSON.parse(e))
                })
            }else{
                // await API.graphql(graphqlOperation(mutations.updateUser, {id: Auth?.user?.attributes?.sub,  pending_subscriptions: []}))
            }
            setSubscriptions(subs);
            setPendingSubs(pendingSubs);
            updateSubButtons(subs, pendingSubs);

            
            // setsubsLoading(false)
        }catch(err) {console.log("error while updating subs.", err)}
    }   

    //On page load fettch the embedded url
    useEffect(() => {
        fetchEmbededUrl();
        fetchUpdatedUrl();
    }, [])

    //Update subs once user data has been loaded
    useEffect(() => {
        updateSubs();
        let newCounter = counter +1
        setCounter(newCounter)

        // setsubsLoading(false)
    },[dataUser])

    useEffect(() => {
        console.log("BUTTONS: ", buttons)
        if(buttons.length > 0) {
            setsubsLoading(false)
        }
    }, [buttons])




//---------------------- dashboard-----------------------------------
/**
 * Display the dashboard using the url
 * @param {*} url 
 */
let displayingDashboard = (url) => {
    console.log("URL IN DISPLAYING DB: ", url)
    let contDiv = document.getElementById("embeddingContainer")
    contDiv.innerHTML = ""
    try {
        var options = {
            url: url,
            container: contDiv,
            parameters: {
                projectId: project.projectId
            },
            scrolling: "no",
            height: "1150px",
            width: "100%",
            locale: "en-US",
            footerPaddingEnabled: false,
            sheetTabsDisabled: false,
            printEnabled: true, 
            resetDisabled: false,
        };
        const dashboard = embedDashboard(options);
        setDashboard(dashboard)
    } catch (e) {
        console.log("Error of displayingDashboard: ", e, contDiv)
    
    }
// }
}


    return (
        <>
            {!loading ?
                <>
                
                <table className="details-table">
                    <tr>
                        <td><b>Project Id</b></td>
                        <td>{project.projectId}</td>
                    </tr>
                    <tr>
                        <td><b>Owner Name</b></td>
                        <td>{project.projectOwnerName}</td>
                    </tr>
                    <tr>
                        <td><b>Address</b></td>
                        <td>{project.projectOwnerStNo} {project.projectOwnerStName}, {project.projectOwnerCity}, {project.projectOwnerState}, {project.projectOwnerPostalCode}</td>
                    </tr>
                    <tr>
                        <td><b>Creation Date</b></td>
                        <td>{project.projectCreationDate}</td>
                    </tr>
                    <tr>
                        <td><b>Account No.</b></td>
                        <td>{project.projectOwnerAccountNo}</td>
                    </tr>
                    <tr>
                        <td><b>Location of Elevating Device</b></td>
                        <td>{project.projectLocationofElevatingDevice}</td>
                    </tr>
                    <tr>
                        <td><b>Elevator Contractor</b></td>
                        <td>{project.projectElevatorContractor}</td>
                    </tr>
                    <tr>
                        <td><b>Elevator Consultant</b></td>
                        <td>{project.projectElevatorConsultant}</td>
                    </tr>
                </table>
                <div className="table-container">
                <label className="form-label-e">Elevator Information</label>
                <table className="details-table-e"> 
                    <tr>
                        <td><b>Elevator</b></td>
                        <td><b>Class</b></td>
                        <td><b>Elevator Type</b></td>
                        <td><b>Elevator Status</b></td>
                        {/* <td><b>Operational Status</b></td>
                        <td><b>Action on Elevator Status</b></td> */}
                    </tr>
                    {
                        JSON.parse(project?.projectElevatorInfo)?.map((elevator,index) => {
                            return <tr key={index}>
                                <td>{elevator?.elevatingDeviceNo}</td>
                                <td>{elevator?.deviceClass}</td>
                                <td>{elevator?.deviceType}</td>
                                <td>{elevator?.deviceStatus}</td>                       
                                {/* <td>{project?.alert ? <img src={warningIcon} alt="Warning" className='warningIcon'></img> : ""}</td>
                                <td><button className="sm-btn-blue" onClick={(e)=>{handleTakeAction(e, project)}}>Action Taken</button></td> */}
                            </tr>
                        })
                    }
                </table>
                </div>
                { !subsLoading ? 
                <div className="table-container">
                <label className="form-label-e">Elevator Alert Subscriptions</label>
                <table className="details-table-e"> 
                    <tr>
                        <td><b>Elevator</b></td>
                        <td><b>Acceleration Threshold</b></td>
                        <td><b>Minimum Operation</b></td>
                    </tr>
                    {
                        buttons.map((elevator,index) => {
                            return <tr key={index}>
                                <td>{elevator?.elevator_id}</td>
                                <td>
                                    
                                    <button className={elevator['signal'][0]["btn_class"]} disabled={elevator['signal'][0]["disabled"]} onClick={e => handleSubscribe(e, elevator['signal'][0], 0)}>
                                        {elevator['signal'][0]["btn_text"] === "Subscribed" ? <img src={bellIcon} alt="Alarm" className='bellIcon'></img> : elevator['signal'][0]["btn_text"] === "Unsubscribed" ? <img src={noAlarmIcon} alt="Alarm" className='bellIcon'></img> :elevator['signal'][0]["btn_text"] === "Pending" ? <img src={mailIcon} alt="Alarm" className='bellIcon'></img> : '...'}
                                    </button>
                                </td>
                                <td>
                                    <button className={elevator['signal'][1]["btn_class"]} disabled={elevator['signal'][1]["disabled"]} onClick={e => handleSubscribe(e, elevator['signal'][1], 1)}>
                                        {elevator['signal'][1]["btn_text"] === "Subscribed" ? <img src={bellIcon} alt="Alarm" className='bellIcon'></img> : elevator['signal'][1]["btn_text"] === "Unsubscribed" ? <img src={noAlarmIcon} alt="Alarm" className='bellIcon'></img> : elevator['signal'][1]["btn_text"] === "Pending" ? <img src={mailIcon} alt="Alarm" className='bellIcon'></img> : '...'}
                                    </button>
                                </td>

                                {/* <td><img ></img> <button className={elevator['signal'][4]["btn_class"]} disabled={elevator['signal'][4]["disabled"]} onClick={e => handleSubscribe(e, elevator['signal'][4], 4)}></button></td> */} 
                            </tr>
                        })
                    }
                </table>
                </div>
                :
                <div className="loading-alerts">LOADING ALERT SUBSCRIPTIONS...</div>
                }
                <div className="table-details-container">
                    <div className = "definitions">
                        <br/>
                        <p><b>Legend:</b></p>
                        <p><div className="icon-btn-green-sm"><img src={bellIcon} alt="Alarm" className='bellIcon-sm'></img></div> Subscribed to alarm.</p>
                        <p><div className="icon-btn-red-sm"><img src={bellIcon} alt="Alarm" className='bellIcon-sm'></img></div> Not subscribed to alarm.</p>
                        <p><div className="icon-btn-grey-sm"><img src={mailIcon} alt="Alarm" className='bellIcon-sm'></img></div> Check mail to confirm subscription.</p>
                        <p><div className="icon-btn-grey-sm">...</div> Loading.</p>
                    </div>
                </div>
                <div className="dashboard-container">
                        <button 
                            type="submit"
                            className="sm-btn-refresh"
                            name="Refresh URL"
                            onClick={fetchUpdatedUrl}
                        >
                            Refresh Dashboard
                        </button>

                        <div id="embeddingContainer"></div>
                </div>
                
                </>
                :
                <p>Loading please wait...</p>
            }
        </>
    );
}
export default DetailsTable;