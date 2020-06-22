const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event, context, callback) => {
  try{
    console.log(event)

    // get id from token
    const userId = event.requestContext.authorizer.claims.sub

    const userObj = await dynamodb.get({
      TableName: process.env['usersTable'],
      Key: {
        id: userId
      }
    }).promise()

    const response = {
      'statusCode': 200, 
      'body': JSON.stringify(userObj.Item),
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