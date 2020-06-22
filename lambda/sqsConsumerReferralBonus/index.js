const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event, context, callback) => {
  try{
    console.log(event)
    // id of the person that invited others people (came from queue)
    const userId = event.Records[0].body

    // increment invitedUsers
    const user = await dynamodb.update({
      TableName: process.env['usersTable'],
      UpdateExpression: 'SET invitedUsers =invitedUsers + :inc',
      ExpressionAttributeValues: {
        ':inc': 1
      },
      Key: { id: userId },
      ReturnValues: 'ALL_NEW'
    }).promise()

    // are 5 users invited yet?
    if(user.Attributes.invitedUsers % 5 !==0)
      return

    // for every 5 people we add amount 10
    await dynamodb.update({
      TableName: process.env['usersTable'],
      UpdateExpression: 'SET amount =amount + :amountValue',
      ExpressionAttributeValues: {
        ':amountValue': 10
      },
      Key: { id: userId },
    }).promise()

  } catch(err){
    console.log(err)
    callback('Something went wrong!')
  }
}