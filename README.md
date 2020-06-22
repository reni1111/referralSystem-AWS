

# Referral System

Click here for demo => https://bonusreferall.web.app/

We will be building this infrastructure.

![infrastructure](https://firebasestorage.googleapis.com/v0/b/bonusreferall.appspot.com/o/Amitree%20%287%29.png?alt=media&token=47e36421-827b-4375-916d-312d63b5416d)

![infrastructure](https://firebasestorage.googleapis.com/v0/b/bonusreferall.appspot.com/o/SignIn.png?alt=media&token=6196f764-fb5b-43f0-a6c3-5ca265d56f66)

Tools used: 
1. Cognito - Authentication service
2. Lambda - Cloud functions
3. Amazon Simple Queue - Managed Queue
4. DynamoDb - Fast NoSQL for any scale
5. API Gateway - Managed by amazon (used on login..)
6. AWS Cloud Development Kit - Cloud infrastructure by javascript
7. ReactJs for demo

The whole application is implemented by the principle "Infrastructure as Code", so you just need an Amazon account run these commands and this whole application would be hosted in your cloud:

1. Add to env your amazon keys
2. run `npm install`  
3. `cdk deploy usersStack`

You are done :)

If you are looking only for Lambda's codes go at folder => Lambda

## Register flow

Cognito has built-in triggers on every step of authentication([more information](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html?icmpid=docs_cognito_console))

Since having referrals is a custom flow for Cognito, we will be using:

 1. Pre Sign-up Lambda trigger => [preSignUpLambda](https://github.com/reni1111/referralSystem-AWS/blob/master/lambda/preSignUpLambda/index.js)
 2. Post Confirmation Lambda trigger => [postConfirmationLambda](https://github.com/reni1111/referralSystem-AWS/blob/master/lambda/postConfirmationLambda/index.js)

**Pre Sign-up** to check if the value of referralId is correct (if the user exists...).
If the user added a fake value he will be returned to signUp again and nothing will be stored.

**Post Confirmation** is triggered when the user submits their verification code so this is the right time to add this user to our table. (here we know our user isn't a random bot)

If the user doesn't have a referral we will add amount 0$.

If the user has a referral we will add amount 10\$ and send the referralId to SQS (queue), this message will be consumed by our lambda [sqsConsumerReferralBonus](https://github.com/reni1111/referralSystem-AWS/blob/master/lambda/sqsConsumerReferralBonus/index.js).

In this lambda, we increment the referral invitedUsers field and increase amount by 10$ if invitedUsers%5 ==0 (for every 5 people). 


## Sign In flow:

After user signIn using Cognito's services, we will get the JWT token which we will use to get the user's data.

*Fun fact: We don't send any userId to API Gateway, all of the info needed is taken from the token payload.*

In response, we will find amount, invitedUsers, and userId.

To generate the invation link frontEnd can run:
    const  invitationLink = `${window.location.origin}?referralId=${user.id}`

## Front end:
Seems cool... in theoryyyyyyyyyyyy... boring... we want to click and test...

So I decided to make a minimalist demo =>  https://bonusreferall.web.app/

Front end part is done using ReactJs + Amplify (AWS services).
To run it:
1. open folder *client*
2. run `npm install`
3. run `npm start`

*Suggestion: To test the app easily use a fake email generator* 

## Automation tests:
For every edit that I made, I would have needed at least 6 emails ** every time** to test the whole flow.

We want to make sure that we don't break the system when we edit code, so it's time for automation testing.

I have used [mocha](https://www.npmjs.com/package/mocha) framework, tests can be found [here](https://github.com/reni1111/referralSystem-AWS/blob/master/client/test/Test.js).

To run the tests:
1. open folder *client*
2. run `npm install`
3. run `npm run test`
Enjoy

Problem:
To test the flow I needed to signUp and then confirm by using verification code send to the email, automating opening of the email, and getting the code can be tricky...

Solution:
I have used [mailosaur](https://mailosaur.com/) which makes automating email tests easier.
