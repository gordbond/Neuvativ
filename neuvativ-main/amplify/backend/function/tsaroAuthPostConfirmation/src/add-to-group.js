const aws = require('aws-sdk');
var ddb = new aws.DynamoDB();

const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
});

exports.handler = async (event, context) => {
  console.log("event.request.userAttributes:",event.request.userAttributes);
  console.log("event.request.userAttributes.email_verified:",event.request.userAttributes.email_verified);

    // --Read the group that the user belongs to 
    var paramsReadGroup = {
      UserPoolId: process.env.userPoolId, /* required */
      Username: event.request.userAttributes.sub, /* required */
    };
    try {
      let readGroupRes = await cognitoidentityserviceprovider.adminListGroupsForUser(paramsReadGroup).promise();
      let specificGroup  = readGroupRes.Groups.map(x => x.GroupName);
      console.log("Success, the group that the user belongs to has been obtained",specificGroup[0]);
      
      if (specificGroup[0]!=="Admin" || specificGroup[0]!=="ElevatorCompany" || specificGroup[0]!=="BuildingManager" || specificGroup[0]!=="Guest"){
        let codeWasDeleted = false;
          // --- read group according to code in dynamo table
        var paramsScan = {
        TableName: process.env.TableName,
        ScanFilter: {
          'AssignedCodes': {
            ComparisonOperator: 'CONTAINS',
            AttributeValueList: [
              { S: event.request.userAttributes.zoneinfo},
            ]
          },
        },
        };
        try {
          let scanTable = await ddb.scan(paramsScan).promise();
          console.log("scanTable:",scanTable);
          let scanTable1 = scanTable.Items.map(x => x.SignUpGroup);
          console.log("scanTable1",scanTable1);
          let group = scanTable1[0].S;
          console.log("Group", group);
          console.log("Success, group has been obtained");
          const assignedCodesList = scanTable.Items.map(x => x.AssignedCodes)[0].L;
          console.log("Assigned Codes: ", assignedCodesList)
          // ----------Remove used code from the table
          let scanTable2 = scanTable.Items.map(x => x.id);
          console.log("SCAN TABLE 2: ", scanTable2)
          let elementId = scanTable2.map(x => x.S);
          const indexToRemove = assignedCodesList.findIndex(i => i.S === event.request.userAttributes.zoneinfo);
          const paramsUpdate = {
            // ExpressionAttributeValues: {':p' : {"L": [{
            //   "S": event.request.userAttributes.zoneinfo
            // }] } },
            Key: {
              "id": {
                S: elementId[0]
              }
            }, 
            ReturnValues: 'ALL_NEW', 
            TableName: process.env.TableName, 
            // UpdateExpression: `DELETE AssignedCodes :p`, 
            UpdateExpression: `REMOVE AssignedCodes[${indexToRemove}]`, 
          };
          
          try {
            let itemUpdated = await ddb.updateItem(paramsUpdate).promise();
            codeWasDeleted = true;
            console.log("Success, code used has been removed from table", itemUpdated);
          } catch (err) {
            console.log("Code used has not been removed from table ", err);
          }
          // // ----- Add a new code to the table if used code was deleted
          // if(codeWasDeleted){
          //   console.log("Adding new code to table...")
          //   //Random string function from https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript (user Nimphious)
            
          //   function randomString(length, chars) {
          //     //Prefix
          //     let prefix = '';
          //     if(group === 'Admin'){
          //       prefix = 'AD';
          //     }else if(group === 'ElevatorCompany'){
          //       prefix = 'EC';
          //     }else if(group === 'BuildingManager'){
          //       prefix = 'BM';
          //     }else{
          //       prefix = 'GU';
          //     }
          //     //Random string
          //     var mask = '';
          //     if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
          //     if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          //     if (chars.indexOf('#') > -1) mask += '0123456789';
          //     if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
          //     var result = '';

          //     for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];

          //     //concat prefix to string
          //     result = prefix.concat(result);

          //     return result;
          //   }

          //   //Create a random to insert in dynamo db
          //   let codeToBeInserted = randomString(16, '#aA!')

          //   //Parameters 
          //   var paramsForNewCode = {
          //     ExpressionAttributeValues: {
          //     ":p": {
          //       "L": [
          //           { "S": codeToBeInserted }
          //       ]
          //     }},
          //     ExpressionAttributeNames: {"#ac": "CurrentlyAvailableCodes"},
          //     Key: {
          //       "id": {
          //         S: elementId[0]
          //       }
          //     }, 
          //     ReturnValues: 'ALL_NEW', 
          //     TableName: process.env.TableName, 
          //     UpdateExpression: `SET #ac = list_append(#ac, :p)`,
          //   };
            
          //   //Add new code to db
          //   try {
          //     const codesUpdated = await ddb.updateItem(paramsForNewCode).promise();
          //     console.log("Success, new code has been added to the table",codesUpdated);
          //   } catch (err) {
          //     console.log("Code has not been added to the table ", err);
          //   }
          // }



          //----- assign user to a group
          const groupParams = {
            GroupName: group, 
            UserPoolId: event.userPoolId,
          };
          const addUserParams = {
            GroupName: group,
            UserPoolId: event.userPoolId,
            Username: event.userName,
          };
          /**
           * Check if the group exists; if it doesn't, create it.
           */
          try {
            await cognitoidentityserviceprovider.getGroup(groupParams).promise();
            console.log("Success, user has been assigned to a group",group);
          } catch (e) {
            await cognitoidentityserviceprovider.createGroup(groupParams).promise();
          }
          /**
           * Then, add the user to the group.
           */
          await cognitoidentityserviceprovider.adminAddUserToGroup(addUserParams).promise();
          // }   
        } catch (err) {
          console.log("Group has not been obtained", err);
          throw new Error(`The code ${event.request.userAttributes.zoneinfo} is not associated with any group`);
        }
      }
    } catch (err) {
      console.log("Print error", err);
      
    }

  return event;
};
