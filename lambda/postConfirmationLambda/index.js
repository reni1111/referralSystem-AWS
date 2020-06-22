const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS()

module.exports.handler = async (event, context, callback) => {
  try{
    console.log(event)
    // this event is triggered on email confirmation sent (so reset password too... filter that)
    if(event.triggerSource !== 'PostConfirmation_ConfirmSignUp'){
      return event
    }

    const{ sub: id, email, 'custom:referralId': referralId } = event.request.userAttributes
    
    const isUserInvited = referralId && referralId !== ''

    let referralObj ={}

    // if user was invited add 10, if not 0
    if(isUserInvited){
      referralObj.amount = 10
    } else{
      referralObj.amount = 0
    }

    await dynamodb.put({
      TableName: process.env['usersTable'],
      Item: {
        id,
        email, 
        invitedUsers: 0,
        ...referralObj
      },
    }).promise()

    // send referral to queue (the invited will be updated asynchronously)
    if(isUserInvited){
      await sqs.sendMessage({
        MessageBody: referralId,
        QueueUrl: process.env['queueUrl']
      }).promise()
    }

    return event

  } catch(err){
    console.log(err)
    callback('Something went wrong!')
  }
}