 /**
  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
  */
  const aws = require('aws-sdk');
  const sns = new aws.SNS();
  const ddb = new aws.DynamoDB();
  
  exports.handler = async (event) => {
      /**
       * Update subscription status for projects and retrieve users 
       */
      const updateSubscriptionsByUser = async(username, email) => {
        let userData;
        let response = {};
        let date = new Date();
        

      
        //-----------------Get user SNS subscriptions-----------------------------------------------
    
        try {
        const listOfSignals = ["acceleration_threshold", "minimum_operation"];
        const responses = await Promise.all(
            listOfSignals.map(async signal => {
            const paramsForListSubs = {
                TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.AwsAccountId}:${signal}`, 
            };
            return await sns.listSubscriptionsByTopic(paramsForListSubs).promise();
            })
        );
        //Find subs for current user by email
        let subs = [];
        responses.forEach(response => {
            const results = response.Subscriptions.filter(sub => {
                return sub.Endpoint === email
            });
            results.forEach(res =>{ subs.push(res)})
        })
        
        
        
        console.log("Subs: ", subs)
        let subsForRes = [];
        //GET THE PROJECT/ELEVATOR/SIGNAL FOR ALL SUBSCRIPTIONS (except pending)
        const subAttrs = await Promise.all(
            subs.map(async sub => {
                // subsForRes.push({
                //     'SubscriptionArn': sub.SubscriptionArn,
                //     'Owner': sub.Owner,
                //     'Protocol': sub.Protocol,
                    
                // })
                console.log("sub: ", sub)
                if (sub.SubscriptionArn !== 'PendingConfirmation'){
                    const paramsForSubAttr = {
                        SubscriptionArn: sub.SubscriptionArn
                    };
                    return await sns.getSubscriptionAttributes(paramsForSubAttr).promise();
                }
            })
        );
        console.log("subAttrs:", subAttrs)
        let subsForDB = [];
        let pendingForDB = [];
        //RETRIEVE ALL PENDING SUBS
        //Get all of the current pending
        const paramsUser = {
            Key: {'id': {S: event.identity.claims.sub}},//user ID
            AttributesToGet: ['id', 'createdAt', 'preferred_username', 'email','username','zoneinfo', 'subscriptions', 'pending_subscriptions', 'group', 'registration_code', 'updatedAt'],
            TableName: process.env.USERTABLE
        };
        userData = await ddb.getItem(paramsUser).promise();
        
        const listOfResItems = ['id', 'createdAt', 'preferred_username', 'email','username', 'group', 'registration_code', 'updatedAt']
        listOfResItems.forEach(e => {
            response[e] = userData.Item[e].S
        })

        
    
        let pendingSubs = []
        let pendingSubsForRes = []
        userData.Item.pending_subscriptions.L.forEach(ps => {
            pendingSubs.push(JSON.parse(ps.S))
        })


        // For each signal topic
        console.log("subAttrs: ", subAttrs)
        subAttrs.forEach(subattr => {
            if(subattr !== undefined){
                //If so delete from pending
        
        
                //The elevator and project as a string      
                const elevatorAndProject = JSON.parse(subattr.Attributes.FilterPolicy).elevatorAndProject;
                const topicArn = subattr.Attributes.TopicArn;
        
                let currentSignalPendingSubs = []
                //For each project/elevator in the subscription filter policy of a specific signal topic 
                elevatorAndProject.forEach(ep => {
                //Separate into ids
                const elevatorAndProjectSplit = ep.split("-");
                const elevId = elevatorAndProjectSplit[0];
                const projectId = elevatorAndProjectSplit[1];
                //Get signal type
                const topicArnSplit = topicArn.split(":");
                const signalType = topicArnSplit[topicArnSplit.length - 1];
                console.log("Elevator Id, project Id and signal type: ", elevId, ", ", projectId ,", ", signalType)
                const subObj = {
                    elevId: elevId,
                    projectId: projectId,
                    signalType: signalType
                }
                
                const indexOfPendingSubWithSameSignalType = pendingSubs.findIndex(e => e.signalType === subObj.signalType)//just need the signal type
                console.log("indexOfPendingSubWithSameSignalType: ", indexOfPendingSubWithSameSignalType)
                //Remove id from array or remove whole pending sub from list if it's the last one
                if(indexOfPendingSubWithSameSignalType !== -1){
                    const indexOfId = pendingSubs[indexOfPendingSubWithSameSignalType].id.findIndex(e => {
                    console.log("e: ", e, " ep: ", ep )
                    return e === ep
                    });
                    if(indexOfId !== -1){
                        pendingSubs[indexOfPendingSubWithSameSignalType].id.splice(indexOfId,1);
                        console.log("UPDATED pendingSubs after removal of specific id: ", pendingSubs)
                    }
                }
                subsForDB.push({S:JSON.stringify(subObj)});
                subsForRes.push(JSON.stringify(subObj));
                
                })
            }
    
            
        });
        response.subscriptions = subsForRes
        console.log("Pending subs which will get added to the end response")
        pendingSubs.forEach(ps => {
            pendingSubsForRes.push(JSON.stringify(ps))
        })
        response.pending_subscriptions = pendingSubsForRes
        pendingSubs.forEach(sub => {
            //if pending sub has an empty array of ids skip it
            console.log("sub in loop: ", sub)
            if(sub.id.length > 0){
            pendingForDB.push({S:JSON.stringify(sub)})
            }
        })
        console.log("pendingForDB: ", pendingForDB)
        //SEND TO DB updated subs and pending
        try{
            const paramsUrl = {
            ExpressionAttributeNames: {
                "#UA": "updatedAt", 
                "#SB": "subscriptions",
                "#PS": "pending_subscriptions"
            }, 
            ExpressionAttributeValues: {
                ":ua": {S: date.toISOString()}, 
                ":sb": {L: subsForDB},
                ":ps": {L:pendingForDB}
            }, 
            Key: {'id': {S: event.identity.claims.sub},},
            ReturnValues: "ALL_NEW", 
            TableName: process.env.USERTABLE, 
            UpdateExpression: "SET #UA = :ua, #SB = :sb, #PS = :ps"
            };
    
            const res = await ddb.updateItem(paramsUrl).promise();


            console.log("Success, updated subs in user table: ", res);
            console.log("RESONSE: ", res.Attributes.pending_subscriptions.L)
            console.log("RESONSE: ", res.Attributes.pending_subscriptions.L[0])
        } catch (err) {
            console.log("Error adding subs:",err);
        }
        
        } catch (error) {
            console.log("Error getting subscription statuses", error)
        }
        console.log("Response at end of update: ", response)
        return response;
      }
      
      const resolvers = {
          Query:{
            updateSubscriptionsByUser: (ctx) =>{
                  return updateSubscriptionsByUser(ctx.arguments.userName, ctx.arguments.email);
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
  