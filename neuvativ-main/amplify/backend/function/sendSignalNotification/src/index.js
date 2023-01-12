

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
            const door_state = record.dynamodb.NewImage.door_state.S
            console.log("Elevator ID: ", elevator_id)
            console.log("Project ID: ", project_id)
            console.log("Door State: ", door_state)
            if ( door_state === "open" ) {
            
                var params = {
                    Subject: 'Signal alert',
                    MessageAttributes: {
                        // 'elevatorAndProject': { DataType: 'String', StringValue: `${elevator_id}-${project_id}`}
                        'elevatorAndProject': { DataType: 'String', StringValue: '1-PID_0001'}
                    },
                    Message: 'The signal for elevator door state in elevator' + elevator_id + ' in project ' + project_id + ' has changed to ' + door_state +'.',
                    TopicArn: `arn:aws:sns:${process.env.REGION}:${process.env.AwsAccountId}:door_state_alert`
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
        }
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);

    

};
