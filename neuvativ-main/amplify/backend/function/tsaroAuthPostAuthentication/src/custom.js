const aws = require('aws-sdk');
const ddb = new aws.DynamoDB();
const quicksight = new aws.QuickSight({region: 'us-east-1'});
const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider();
const sns = new aws.SNS();

exports.handler = async (event, context) => {
  
  let date = new Date();
  let email = event.request.userAttributes.email;  
  console.log("event",event);
  
  if (event.request.userAttributes.sub) {
    
    // --Read the group that the user belongs to 
    const paramsReadGroup = {
      UserPoolId: process.env.userPoolId, /* required */
      Username: event.request.userAttributes.sub, /* required */
    };
    try {
      let readGroupRes = await cognitoidentityserviceprovider.adminListGroupsForUser(paramsReadGroup).promise();
      let specificGroup  = readGroupRes.Groups.map(x => x.GroupName);
      console.log("Success, the group that the user belongs to has been obtained",specificGroup[0]);

      //-----------------Put Item in dynamodb table only if it doesnt exits---------------------------------------------
      var paramsUsertest = {
        Key: {'id': {S: event.request.userAttributes.sub},},
        AttributesToGet: ['id', 'preferred_username', 'email','username','zoneinfo'],
        TableName: process.env.USERTABLE
      };
      try {
        let gettingItemtest = await ddb.getItem(paramsUsertest).promise();
        console.log("Success, I got the item test from the User table",gettingItemtest);
        if (Object.keys(gettingItemtest).length === 0){
          let params = {
          Item: {
              'id': {S: event.request.userAttributes.sub},
              '__typename': {S: 'User'},
              'username': {S: event.userName},
              'email': {S: event.request.userAttributes.email},
              'preferred_username': {S: event.request.userAttributes.preferred_username},
              'registration_code': {S: event.request.userAttributes.zoneinfo},
              'pending_subscriptions': {L:[]},
              'subscriptions': {L:[]},
              'group': {S: specificGroup[0]},
              'createdAt': {S: date.toISOString()},
              'updatedAt': {S: date.toISOString()},
          },
          TableName: process.env.USERTABLE
          };
          try {
            let writingTable = await ddb.putItem(params).promise();
            console.log("Success, I put an item in the User table",writingTable);
          } catch (err) {
            console.log("Error putting an item in user table ", err);
          }
        }
      } catch (err) {
          console.log("Error getting  test item from user table", err);
      }
    
    } catch (err) {
      console.log("Error reading the group that the user belongs to", err);
    }

    //-----------------Get user SNS subscriptions-----------------------------------------------

    try {
      const listOfSignals = ["acceleration_threshold","minimum_operation"];
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
      subs.forEach(sub=>{

      })

      //GET THE PROJECT/ELEVATOR/SIGNAL FOR ALL SUBSCRIPTIONS (except pending)
      const subAttrs = await Promise.all(
        subs.map(async sub => {
          if (sub.SubscriptionArn !== 'PendingConfirmation'){
            const paramsForSubAttr = {
              SubscriptionArn: sub.SubscriptionArn
            };
            return await sns.getSubscriptionAttributes(paramsForSubAttr).promise();
          }
        })
      );
      let subsForDB = [];
      let pendingForDB = [];
      //RETRIEVE ALL PENDING SUBS
      //Get all of the current pending
      const paramsUser = {
        Key: {'id': {S: event.request.userAttributes.sub}},//user ID
        AttributesToGet: ['id', 'preferred_username', 'email','username','zoneinfo', 'subscriptions', 'pending_subscriptions'],
        TableName: process.env.USERTABLE
      };
      const userData = await ddb.getItem(paramsUser).promise();

      let pendingSubs = []
      userData.Item.pending_subscriptions.L.forEach(ps => {
        pendingSubs.push(JSON.parse(ps.S))
      })
      // For each signal topic
      subAttrs.forEach(subattr => {
        //TO DO: Check to see if the confirmed sub is in the pending still 
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
          
          
          
          // const indexOfOldPendingSub = pendingSubs.findIndex(e => e.id.includes(ep) && e.signalType === subObj.signalType)//just need the signal type
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
          //Need to make it so you only add the ones being included 
          
          
          //Moving through the pending subs 

          
          subsForDB.push({S:JSON.stringify(subObj)});

          
        })
        // if(cur

        
      });
      console.log("PENDING SUBS: ", pendingSubs)
      console.log("pendingForDB PRE PUSH: ", pendingForDB)
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
          Key: {'id': {S: event.request.userAttributes.sub},},
          ReturnValues: "ALL_NEW", 
          TableName: process.env.USERTABLE, 
          UpdateExpression: "SET #UA = :ua, #SB = :sb, #PS = :ps"
         };
  
        const res = await ddb.updateItem(paramsUrl).promise();
        console.log("Success, updated subs in user table: ", res);
      } catch (err) {
        console.log("Error adding subs:",err);
      }
      
    } catch (error) {
      console.log("Error getting subscription statuses", error)
    }

    //-----------------Register User quicksight---------------------------------------------
    const paramsRegisterUser = {
      AwsAccountId: process.env.AwsAccountId, 
      Namespace: 'default',
      IdentityType: 'IAM',
      IamArn: process.env.RoleArn,
      UserRole: 'READER',
      SessionName: email,
      Email: email,
    };
    try {
      let dataRegisteredUser = await quicksight.registerUser(paramsRegisterUser).promise();
      console.log("Yay, I register a user!", dataRegisteredUser);
    } catch (err) {
      console.log("Error registering user in quicksight:",err);
    }
    // ------------------Get Embeded Url----------------------------------------------
    const quicksight1 = new aws.QuickSight({region: 'us-east-1'});
    try {
      const paramsGetDashboard = {
        AwsAccountId: process.env.AwsAccountId,
        ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: process.env.DashId
        }},
        UserArn:  `arn:aws:quicksight:us-east-1:${process.env.AwsAccountId}:user/default/${process.env.RoleName}/${email}`,
        SessionLifetimeInMinutes: 600
      };
      let dataDashboardUrl = await quicksight1.generateEmbedUrlForRegisteredUser(paramsGetDashboard).promise();
      console.log("Yay, I got the embeded url!", dataDashboardUrl);
      //-------------------Get sheet Id from dashboard-------------------------------------
      const paramsSheetId = {
        AwsAccountId: process.env.AwsAccountId,
        DashboardId: process.env.DashId
      };
      let dataSheetId = await quicksight1.describeDashboard(paramsSheetId).promise();
      console.log("Yay, I described the dashboard!",dataSheetId);
      const sheetsInfo = dataSheetId.Dashboard.Version.Sheets;
      console.log("sheetsInfo:", sheetsInfo);
      //--------------------Writing in dynamodb Table--------------------------------------
      const paramsUrl = {
        ExpressionAttributeNames: {
         "#UA": "updatedAt", 
         "#EU": "embededUrl",
         "#SI": "sheetInformation",
        }, 
        ExpressionAttributeValues: {
         ":ua": {S: date.toISOString()}, 
         ":eu": {S: dataDashboardUrl.EmbedUrl},
         ":si": {S: JSON.stringify(sheetsInfo)}
        }, 
        Key: {'id': {S: event.request.userAttributes.sub},},
        ReturnValues: "ALL_NEW", 
        TableName: process.env.USERTABLE, 
        UpdateExpression: "SET #UA = :ua, #EU = :eu, #SI = :si"
       };

      await ddb.updateItem(paramsUrl).promise();
      console.log("Success, I update the User table by adding the  url");
    } catch (err) {
      console.log("Error:",err);
    }
    console.log("print at the end");
  } else {
      console.log("Error in the greater loop");
      context.done(null, event);
  }
};