var aws = require('aws-sdk');
var iotdata = new aws.IotData({endpoint: 'a1g1fqw1hapg2y-ats.iot.us-east-1.amazonaws.com'});
var eventbridge = new aws.EventBridge();

exports.handler = async (event) => {
  const endport_prefix = process.env.endport_prefix;
  const projectId = event.arguments.projectId;
  const elevatorId = event.arguments.elevatorId;
  const calibrationValue = event.arguments.calibrationValue;
  const message = await `${projectId}+${elevatorId}+${calibrationValue}`;
  console.log(message);
  console.log(JSON.stringify({"projectId" : projectId, "elevatorId": elevatorId, "calibrationValue":calibrationValue}))
  let params = {
        topic: `calibration_variables`,
        payload: JSON.stringify(message),
        qos: 0
  };
  try{
    await iotdata.publish(params).promise();
    console.log("Success publish message to iotdata");
    
    let params_put_event = {
      Entries: [ /* required */
        {
          Detail: JSON.stringify({"projectId" : projectId, "elevatorId": elevatorId, "calibrationValue":calibrationValue}),
          DetailType: 'calibration variables eventbridge put_event detail',
          EventBusName: 'arn:aws:events:us-east-1:788792171177:event-bus/calibration-variables-eventbridge-bus',
          Resources: [
          ],
          Source: 'Lambda Publish',
          Time: new Date(),
          TraceHeader: ' put_event from calibrationVariablesTopicPubSub-dev'
        },
      ],
    };
    try{
      await eventbridge.putEvents(params_put_event).promise();
      console.log(JSON.stringify(params_put_event));
      console.log("Success put_event in event bus");
    } catch (err) {
      console.log("Error", err);
    }
    
  } catch (err) {
    console.log("Error", err);
  }
};
