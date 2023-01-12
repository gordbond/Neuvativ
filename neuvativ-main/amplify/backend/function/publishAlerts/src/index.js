/* Amplify Params - DO NOT EDIT
	API_NEUVATIV_ALERTSTABLE_ARN
	API_NEUVATIV_ALERTSTABLE_NAME
	API_NEUVATIV_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 var AWS = require("aws-sdk");
 var sns = new AWS.SNS();
 
 exports.handler = async (event, context, callback) => {
     console.log(`EVENT: ${JSON.stringify(event)}`);
     console.log("Testing Send Signals Notification")
 
     console.log("print event:",event);
 
     event.Records.forEach((record) => {
         console.log('Stream record: ', JSON.stringify(record, null, 2));
 
         if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
             const project_id = record.dynamodb.NewImage.project_id.S
             const elevator_id = record.dynamodb.NewImage.elevator_id.S
             const alert_type = record.dynamodb.NewImage.alert_type.S
             const signal_type = record.dynamodb.NewImage.signal_type.S
             const alert_message = record.dynamodb.NewImage.alert_message.S
             //Include an alert message as well
             //Include signal type to determine the Topic ARN
             console.log("Elevator ID: ", elevator_id)
             console.log("Project ID: ", project_id)
             console.log("alert_type: ", alert_type)
             console.log("signal_type: ", signal_type)
             console.log("alert_message: ", alert_message)
             console.log("dev")
            var params = {
                Subject: 'Signal alert',
                MessageAttributes: {
                  'elevatorAndProject': { DataType: 'String', StringValue: `${elevator_id}-${project_id}`}
                  //  'elevatorAndProject': { DataType: 'String', StringValue: 'EID_0001-PID_0001'}
                },
                Message:  signal_type + ' alert for elevator ' + elevator_id + ' (project: ' + project_id + ' ) with the following message:  ' + alert_message +'.',
                TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.AwsAccountId}:${alert_type}`
            };
            console.log("Params: ", params)
            sns.publish(params, function(err, data) {
                if (err) {
                    console.error("Unable to send message. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Results from succesfully sending message: ", JSON.stringify(data, null, 2));
                }
            });
         }
     });
     callback(null, `Successfully processed ${event.Records.length} records.`);
 
     
 
 };