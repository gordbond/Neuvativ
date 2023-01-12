/* Amplify Params - DO NOT EDIT
	API_APRENEWABLES_GRAPHQLAPIENDPOINTOUTPUT
	API_APRENEWABLES_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

var aws = require('aws-sdk');
var sts = new aws.STS();

exports.handler = async (event) => {
  let email = event.arguments.email;  
  // new code--------------------------------------
      var paramsAssumeRole = {
        RoleArn: `arn:aws:iam::${process.env.AwsAccountId}:role/tsaroAuthPostAuthentication-dev`, 
        RoleSessionName: "default", 
    };
    let dataAssumedRole = await sts.assumeRole(paramsAssumeRole).promise();
    console.log("Yay, I assume a role!");
    console.log("Data of assumed role:",dataAssumedRole);
    //---------------Update Credentials-------------------------
    var paramsUpdateCredentials = {
        accessKeyId: dataAssumedRole.Credentials.AccessKeyId, 
        secretAccessKey: dataAssumedRole.Credentials.SecretAccessKey,
        sessionToken: dataAssumedRole.Credentials.SessionToken
    };
    console.log("credentials to be assumed:",paramsUpdateCredentials);
    await aws.config.update({region: 'us-east-1',credentials: paramsUpdateCredentials});
    console.log("Print credentials",aws.config.credentials);
  // end new code--------------------------------------
  var quicksight1 = new aws.QuickSight({region: 'us-east-1'});
  console.log("quickSight1 after:", quicksight1);
  
    var paramsGetDashboard = {
        AwsAccountId: process.env.AwsAccountId,
        ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: process.env.DashId
        }},
        UserArn:  `arn:aws:quicksight:us-east-1:${process.env.AwsAccountId}:user/default/${process.env.RoleName}/${email}`,
        SessionLifetimeInMinutes: 600
        };
    let dataDashboardUrl = await quicksight1.generateEmbedUrlForRegisteredUser(paramsGetDashboard).promise();
    console.log("Yay, I got the embeded url!");
    console.log("Data of embeded url:",dataDashboardUrl);
    
  const URLS = [
    {id: event.identity.claims.sub, data: dataDashboardUrl.EmbedUrl, email: email}
  ];
  console.log("print URLS:",URLS);
  
  function getUrls() {
    return URLS;
  }
    
  function getUrlById(id, email) {
    return URLS.find(url => url.id === id);
  }

  const resolvers = {
    Query:{
      listUrls: () => {
        return getUrls();
      },
      getUrl: (ctx) =>{
        return getUrlById(ctx.arguments.id);
      }
    }
  };
console.log("before last function");
  const typeHandler = resolvers[event.typeName];
    if (typeHandler){
      const resolver = typeHandler[event.fieldName];
        if (resolver){
          var result = await resolver(event);
          console.log(result);
          return result;
        }
    }
  throw new Error("Resolver not found.");
  
};