const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event, context, callback) => {
  try{
    // checks if the users writes a fake referralId
    console.log(event)
    const referralId = event.request.userAttributes['custom:referralId'] 
    
    if(referralId && referralId !== ''){
      const referralUser = await dynamodb.get({
        TableName: process.env['usersTable'],
        Key: {
          id: referralId
        }
      }).promise()
  
      if(!referralUser.Item){
        throw new Error('Referral doesn\'t exist!')
      }
    }

    return event
  } catch(err){
    console.log(err)
    callback(err)
  }
}