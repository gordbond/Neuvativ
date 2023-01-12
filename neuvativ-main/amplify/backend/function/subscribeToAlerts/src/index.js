 /**
  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
  */
  const aws = require('aws-sdk');
  const sns = new aws.SNS();
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider();
  const ddb = new aws.DynamoDB();
  
  exports.handler = async (event) => {
      //Current logged in user's email
  
      function getAlerts() {
          return {result: "get List test"};
        }
      
      /**
       * Resolver for getAlertsById - used to toggle a subscription on/off for a signal/elevator/user
       * @param {*} elevatorId 
       * @param {*} projectId 
       * @param {*} signal_type 
       * @returns 
       */
      const getAlertsById = async(elevatorId, projectId, signal_type, email, username, action) => {
        //Select which signal/topic is being toggled (sub/unsub)
        const today = new Date();
        //To be returned so there is no errors
        let response = {
            elevator_id: '',
            project_id: '',
            status: '',
            acceleration_threshold: [],
            minimum_operation: [],
            createdAt: today,
            updatedAt: today,
        };

        const userId = event.arguments.userName;
        const topicArn = `arn:aws:sns:${process.env.REGION}:${process.env.AwsAccountId}:${signal_type}`
        //-----------------get userType from cognito to decide if subscribe user to SNS or not---------------------------------------------
        const paramsGetUserType = {
            UserPoolId: process.env.userPoolId,
            Username: username,
        };
            try {
                //Get the admin user list
                const gettingUserType =  await cognitoidentityserviceprovider.adminListGroupsForUser(paramsGetUserType).promise();
                if (gettingUserType.Groups[0].GroupName === "Admin" || gettingUserType.Groups[0].GroupName === "BuildingManager" || gettingUserType.Groups[0].GroupName === "ElevatorCompany"){
                    //-----------------List subscriptions by topic:door_state_alert------check that user is Admin or ElevatorCompany or BuildingManager---------------------------------------
                    const paramsListSubscriptions = {
                        TopicArn: topicArn, 
                    };
                    try {
                        const listOfSubs = await sns.listSubscriptionsByTopic(paramsListSubscriptions).promise();
                        //Find sub with the users email
                        const subFind = listOfSubs.Subscriptions.find(element => element.Endpoint === email && (element.TopicArn.split(':')[5]) === signal_type)
    
                        //IF SUBSCRIBING
                        if(action === 'subscribe'){
                        //-----------------Register User SNS--------
                        //If user is not already subscribed. Subscribe them and update dynamo user database
                            if (subFind === undefined){
                                const paramsRegisterUserSNS = {
                                    Protocol: 'email', 
                                    TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.AwsAccountId}:${signal_type}`, 
                                    Endpoint: email,
                                    Attributes:{
                                        'FilterPolicy':`{"elevatorAndProject":["forAdminUseDoNotRemove","${elevatorId}-${projectId}"]}`
                                    },
                                    ReturnSubscriptionArn: true
                                };
        
                                try {
                                    
                                    const dataRegisteredUserSNS = await sns.subscribe(paramsRegisterUserSNS).promise();
                                    const newSubArn = dataRegisteredUserSNS.SubscriptionArn
                                    console.log("NEW ARN: ", newSubArn)
                                    //Update pending with sub data
                                    let allPending = [];
                                    //Get all of the current pending
                                    const paramsUser = {
                                        Key: {'id': {S: userId}},//user ID
                                        AttributesToGet: ['id', 'preferred_username', 'email','username','zoneinfo', 'subscriptions', 'pending_subscriptions'],
                                        TableName: process.env.USERTABLE
                                        };
                                    let userData = await ddb.getItem(paramsUser).promise();
                                    console.log("USER DATA: ", userData)
                                    const pendingSubsFromDDB = userData.Item.pending_subscriptions.L
                                    
                                    pendingSubsFromDDB.forEach(e=>{
                                        console.log("e from pending from ddb: ", e)
                                        allPending.push(e)
                                    })
                                    console.log("All pending: ", allPending)
                                    //Object to be added to pending
                                    const pendingObj = {
                                        id: [`${elevatorId}-${projectId}`],
                                        signalType: signal_type,
                                        sub_arn: newSubArn
                                    }
                                    // const pendingObj = {
                                    //     id: ["testID"],
                                    //     signalType: "testSignal",
                                    //     sub_arn: "testARN"
                                    // }
                                    console.log("Pending sub to add: ", pendingObj)
                                    allPending.push({S:JSON.stringify(pendingObj)});
                                    console.log("All pending after push: ", allPending)
                                    let date = new Date();
                                    try{
        
                                        const paramsUrl = {
                                            ExpressionAttributeNames: {
                                            "#UA": "updatedAt", 
                                            "#SB": "pending_subscriptions",
                                            }, 
                                            ExpressionAttributeValues: {
                                            ":ua": {S: date.toISOString()}, 
                                            ":sb": {L: allPending},
                                            }, 
                                            Key: {'id': {S: userId},},//USER ID
                                            ReturnValues: "ALL_NEW", 
                                            TableName: process.env.USERTABLE, 
                                            UpdateExpression: "SET #UA = :ua, #SB = :sb"
                                        };
                                    
                                            const res = await ddb.updateItem(paramsUrl).promise();
                                            console.log("RESONSE: ", res)
                                            console.log("RESONSE: ", res.Attributes.pending_subscriptions.L)
                                            console.log("RESONSE: ", res.Attributes.pending_subscriptions.L[0])
                                        } catch (err) {
                                            console.log("Error adding pending subs:",err);
                                        }
                                } catch (err) {
                                    console.log("Error registering a user in SNS:",err);
                                }
                            //Else if user subscribed but filter doesn't have the elevator/project of the current subscription request add it to the filterPolicy
                            }else {
                                /** 
                                 * Check if it is already pending
                                 * Add project/elevator to filter policy
                                 */
                                
                                const paramsUser = {
                                    Key: {'id': {S: event.arguments.userName}},//user ID
                                    AttributesToGet: ['id', 'email', 'subscriptions', 'pending_subscriptions'],
                                    TableName: process.env.USERTABLE
                                };
                                const userData = await ddb.getItem(paramsUser).promise();
                                let pendingSubs = []
                                if(userData.Item.pending_subscriptions !== undefined){
                                    userData.Item.pending_subscriptions.L.forEach(ps => {
                                        pendingSubs.push(JSON.parse(ps.S))
                                    })
                                }
                                //Look for a pending sub with same signal type but not the same project/elevator Id
                                const pendingSubFound = pendingSubs.find(e =>  (e.signalType === signal_type && !e.id.includes(`${elevatorId}-${projectId}`)) )
                                if(pendingSubFound !== undefined){
                                    const pendingSubArn = pendingSubFound.sub_arn
                                    //Use this to update the filter policy
                                    const paramsForPendingSubAttr = {
                                        SubscriptionArn: pendingSubArn
                                    };
        
                                    const pendingSubAttrs = await sns.getSubscriptionAttributes(paramsForPendingSubAttr).promise();
                                    const elevatorAndProjectForPending = JSON.parse(pendingSubAttrs.Attributes.FilterPolicy).elevatorAndProject;
                                    const findPendingElevProject = elevatorAndProjectForPending.find(e => e === `${elevatorId}-${projectId}`)
                                    
                                    if(findPendingElevProject === undefined){
                                        console.log(`Add ${elevatorId}-${projectId} to list of subs (${elevatorAndProjectForPending})`)
                                        elevatorAndProjectForPending.push(`${elevatorId}-${projectId}`)
                                        const filterPolicy = JSON.stringify({"elevatorAndProject":elevatorAndProjectForPending})
                                        const snsAttrParamsPending = {
                                            AttributeName: 'FilterPolicy', /* required */
                                            SubscriptionArn: pendingSubArn, /* required */
                                            AttributeValue: filterPolicy
                                        };
                                        const updatedSubAttrsPending = await sns.setSubscriptionAttributes(snsAttrParamsPending).promise();
                                        //Update pending subs in userTable too
                                        const allPending = []
                                        pendingSubs.forEach(e=>{
                                            if(e.signalType === signal_type){
                                            e.id.push(`${elevatorId}-${projectId}`)
                                            }
                                            allPending.push({S:JSON.stringify(e)});
                                        })
                                        let date = new Date();
                                        try{
            
                                            const paramsUrl = {
                                                ExpressionAttributeNames: {
                                                "#UA": "updatedAt", 
                                                "#SB": "pending_subscriptions",
                                                }, 
                                                ExpressionAttributeValues: {
                                                ":ua": {S: date.toISOString()}, 
                                                ":sb": {L: allPending},
                                                }, 
                                                Key: {'id': {S: userId},},//USER ID
                                                ReturnValues: "ALL_NEW", 
                                                TableName: process.env.USERTABLE, 
                                                UpdateExpression: "SET #UA = :ua, #SB = :sb"
                                            };
                                        
                                            await ddb.updateItem(paramsUrl).promise();
                                        } catch (err) {
                                            console.log("Error updating user with pending subs:",err);
                                        }
                                    }
                                }
                                const subArn = subFind.SubscriptionArn
                                const paramsForSubAttr = {
                                    SubscriptionArn: subArn
                                };
                                //If it isn't pending and isn't a new subscription then update the existing filter policy 
                                if(subArn !== 'PendingConfirmation'){
                                    const subAttrs = await sns.getSubscriptionAttributes(paramsForSubAttr).promise();
                                    const elevatorAndProject = JSON.parse(subAttrs.Attributes.FilterPolicy).elevatorAndProject;
                                    const findElevProject = elevatorAndProject.find(e => e === `${elevatorId}-${projectId}`)
                                    
                                    if(findElevProject === undefined){
                                        elevatorAndProject.push(`${elevatorId}-${projectId}`)
                                        const filterPolicy = JSON.stringify({"elevatorAndProject":elevatorAndProject})
                                        const snsAttrParams = {
                                            AttributeName: 'FilterPolicy', /* required */
                                            SubscriptionArn: subArn, /* required */
                                            AttributeValue: filterPolicy
                                        };
                                        const updatedSubAttrs = await sns.setSubscriptionAttributes(snsAttrParams).promise();
                                    }
                                }
                            }
                        } else{// unsubscribe
                            //Find the subscription and the attributes 
                            //Remove subscription from list in sns OR remove SUB all together if it is the last sub in the list
                            //Then remove the subscription from the list in the DDB
                            const subArn = subFind.SubscriptionArn
                            const paramsForSubAttr = {
                                SubscriptionArn: subArn
                            };
                            const subAttrs = await sns.getSubscriptionAttributes(paramsForSubAttr).promise();
                            const elevatorAndProject = JSON.parse(subAttrs.Attributes.FilterPolicy).elevatorAndProject;
                            const findElevProject = elevatorAndProject.find(e => e === `${elevatorId}-${projectId}`)
                            const subIndex = elevatorAndProject.findIndex(e => e === `${elevatorId}-${projectId}`);
                            elevatorAndProject.splice(subIndex, 1);
                            const filterPolicy = JSON.stringify({"elevatorAndProject":elevatorAndProject})
                            const snsAttrParams = {
                                AttributeName: 'FilterPolicy', /* required */
                                SubscriptionArn: subArn, /* required */
                                AttributeValue: filterPolicy
                            };
                            const updatedSubAttrs = await sns.setSubscriptionAttributes(snsAttrParams).promise();
                            //Remove from DDB now
                            let allSubs = [];
                            //Get all of the current pending
                            const paramsUser = {
                                Key: {'id': {S: userId}},//user ID
                                AttributesToGet: ['id', 'preferred_username', 'email','username','zoneinfo', 'subscriptions', 'pending_subscriptions'],
                                TableName: process.env.USERTABLE
                                };
                            let userData = await ddb.getItem(paramsUser).promise();
                            const subsFromDDB = userData.Item.subscriptions.L
                            subsFromDDB.forEach(e=>{
                                allSubs.push(JSON.parse(e.S))
                            })
                            const subToRemoveIndex = allSubs.findIndex(e => e.elevId === elevatorId && e.projectId === projectId && signal_type === e.signalType)
                            allSubs.splice(subToRemoveIndex,1)
                            //Object to be added to pending
                            let subsForDB =[]
                            allSubs.forEach(e=>{
                                subsForDB.push({S:JSON.stringify({'S':JSON.stringify(e)})});
                            })
                            
                            

                            let date = new Date();
                            try{

                                const paramsUrl = {
                                    ExpressionAttributeNames: {
                                    "#UA": "updatedAt", 
                                    "#SB": "subscriptions",
                                    }, 
                                    ExpressionAttributeValues: {
                                    ":ua": {S: date.toISOString()}, 
                                    ":sb": {L: subsForDB},
                                    }, 
                                    Key: {'id': {S: userId},},//USER ID
                                    ReturnValues: "ALL_NEW", 
                                    TableName: process.env.USERTABLE, 
                                    UpdateExpression: "SET #UA = :ua, #SB = :sb"
                                };
                            
                                await ddb.updateItem(paramsUrl).promise();
                                } catch (err) {
                                console.log("Error adding subs:",err);
                                }
                        }
                        
                    } catch (err) {
                        console.log("Error obtaining list of subscription in SNS:",err);
                    }
                }
            } catch (err) {
                console.log("Error getting  test item from user table", err);
            }
  
        console.log("Resonse: ", response)    
        return response;
      }
      
      //Upon query call the appropriate function
      const resolvers = {
          Query:{
              getListOfAlerts: () => {
                  return getAlerts();
              },
              getAlertById: (ctx) =>{
                  return getAlertsById(ctx.arguments.elevator_id, ctx.arguments.project_id, ctx.arguments.signal_type, ctx.arguments.email, ctx.arguments.userName, ctx.arguments.action);
              }
          }
        };

      const typeHandler = resolvers[event.typeName];
      if (typeHandler){
          const resolver = typeHandler[event.fieldName];
          if (resolver){
              var result = await resolver(event);
              return result;
          }
      }
      throw new Error("Resolver not found.");
  };
  
