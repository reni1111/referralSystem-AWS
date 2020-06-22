const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
const cognito = new AWS.CognitoIdentityServiceProvider()

module.exports.handler = async (event, context, callback) => {
  try{
    console.log(event)

    // get id from token
    const userId = event.requestContext.authorizer.claims.sub

    let params = {
      UserPoolId: process.env['userPoolId'],
      Username: userId
    }
    // delete user from cognito user pool
    await cognito.adminDeleteUser(params).promise()


    // delete from db
    await dynamodb.delete({
      TableName: process.env['usersTable'],
      Key: {
        id: userId
      }
    }).promise()

    const response = {
      'statusCode': 200, 
      'body': JSON.stringify({ id: userId }),
      'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }
    
    return response

  } catch(err){
    console.log(err)
    callback('Something went wrong!')
  }
}