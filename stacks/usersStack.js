const cdk = require('@aws-cdk/core')
const cognito = require('@aws-cdk/aws-cognito')
const{ StringAttribute } = require('@aws-cdk/aws-cognito')
const lambda = require('@aws-cdk/aws-lambda')
const apiGateway = require('@aws-cdk/aws-apigateway')
const{ PolicyStatement, Effect } = require('@aws-cdk/aws-iam')
const sqs = require('@aws-cdk/aws-sqs')
const{ SqsEventSource } = require('@aws-cdk/aws-lambda-event-sources')

class UsersStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props)

    // LAMBDA section
    const PostConfirmationLambda = new lambda.Function(this, 'PostConfirmationLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambda/postConfirmationLambda/'),
      functionName: 'PostConfirmationLambda'
    })

    const PreSignUpLambda = new lambda.Function(this, 'PreSignUpLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambda/preSignUpLambda/'),
      functionName: 'PreSignUpLambda'
    })

    const SqsConsumerReferralBonus = new lambda.Function(this, 'SqsConsumerReferralBonus', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambda/sqsConsumerReferralBonus/'),
      functionName: 'SqsConsumerReferralBonus'
    })

    const GetUserData = new lambda.Function(this, 'GetUserData', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambda/getUserData/'),
      functionName: 'GetUserData'
    })

    const DeleteUser = new lambda.Function(this, 'DeleteUser', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lambda/deleteUser/'),
      functionName: 'DeleteUser'
    })



    // QUEUE section
    const queue = new sqs.Queue(this, 'ReferralBonusQueue', {
      queueName: 'ReferralBonusQueue'
    })
    SqsConsumerReferralBonus.addEventSource(new SqsEventSource(queue))

    // subscribe lambda to queue
    PostConfirmationLambda.addEnvironment('queueUrl', queue.queueUrl)
    queue.grantSendMessages(PostConfirmationLambda)


    // COGNITO section
    const cognitoUserPool = new cognito.UserPool(this, 'Users', {
      autoVerify: { email: true },
      customAttributes: {
        'referralId': new StringAttribute({ dataType: 'string', mutable: false, minLen: 1, maxLen: 256 }),
      },
      mfa: cognito.Mfa.OFF,
      requiredAttributes: { email: true },
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      passwordPolicy: {
        minLength: 8,
      },
      signInAliases: {
        email: true,
      },
      // these trigger are IMPORTANT part of the whole logic
      lambdaTriggers: {
        preSignUp: PreSignUpLambda,
        postConfirmation: PostConfirmationLambda
      },
      userPoolName: 'Users',
    })

    cognitoUserPool.node.defaultChild.accountRecoverySetting = { recoveryMechanisms: [{ name: 'verified_email', priority: 1 }, ] }
    cognitoUserPool.node.defaultChild.schema.forEach(element => {
      if(element.name === 'email') {
        element.attributeDataType = 'String',
        element.mutable = true
      }
    })

    // client is the app that will consume cognito (in our case our web application)
    const userPoolClient = new cognito.UserPoolClient(this, 'ReactJsClient', {
      userPool: cognitoUserPool,
      generateSecret: false,
      authFlows: { custom: true, refreshToken: true, userSrp: true },
      userPoolClientName: 'ReactJsClient',
    })

    userPoolClient.node.defaultChild.refreshTokenValidity = 30,

    this.cognitoUserPool = cognitoUserPool


    const lambdas =[
      PreSignUpLambda,
      PostConfirmationLambda,
      SqsConsumerReferralBonus,
      GetUserData,
      DeleteUser
    ]
    
    // creating IAM permission for cognito lambda consumer
    const cognitoAccessPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['cognito-idp:AdminDeleteUser'],
      resources: [cognitoUserPool.userPoolArn]
    })
    
    lambdas.map(lambda=> {
      lambda.addEnvironment('usersTable', props.usersTable.tableName)
      props.usersTable.grantReadWriteData(lambda)
    })

    DeleteUser.addToRolePolicy(cognitoAccessPolicy)
    DeleteUser.addEnvironment('userPoolId', cognitoUserPool.userPoolId)


    // API GATEWAY section
    const api = new apiGateway.RestApi(this, 'users-api', {
      // allow cors
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS
      }
    })

    // setting cognito as authorizer for api gateway
    const auth = new apiGateway.CfnAuthorizer(this, 'APIGatewayAuthorizer', {
      name: 'user-authorizer',
      identitySource: 'method.request.header.Authorization',
      providerArns: [cognitoUserPool.userPoolArn],
      restApiId: api.restApiId,
      type: apiGateway.AuthorizationType.COGNITO,
    })
    
    // creates the route /user
    const user = api.root.addResource('user')

    // method get
    const GetUserDataIntegration = new apiGateway.LambdaIntegration(GetUserData)
    user.addMethod('GET', GetUserDataIntegration, {
      authorizationType: apiGateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref },
    })

    // method delete is used only at tests (to remove tests accounts when testing is finished)
    const DeleteUserIntegration = new apiGateway.LambdaIntegration(DeleteUser)
    user.addMethod('DELETE', DeleteUserIntegration, {
      authorizationType: apiGateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref },
    })

  }
}

module.exports = { UsersStack }

