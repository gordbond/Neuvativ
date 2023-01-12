var aws = require('aws-sdk');
var ddb = new aws.DynamoDB();

exports.handler = async (event, context) => {
  console.log("event.request.userAttributes.zoneinfo",event.request.userAttributes.zoneinfo);
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
    let printScan =  await ddb.scan(paramsScan).promise();
    if (printScan.Count > 0){
      console.log("Success, code is allowed",printScan,event.request.userAttributes.zoneinfo);
    }else{
      console.log("Code is not allowed",printScan,event.request.userAttributes.zoneinfo);
      throw new Error(`The code ${event.request.userAttributes.zoneinfo} is invalid`);
    }
  } catch (err) {
        console.log("Error",err,event.request.userAttributes.zoneinfo);
        throw new Error(`The code ${event.request.userAttributes.zoneinfo} is invalid`);
  }
  
  return event;
};
