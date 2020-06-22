const cdk = require('@aws-cdk/core')
const dynamodb = require('@aws-cdk/aws-dynamodb')
const{ RemovalPolicy } = require('@aws-cdk/core')


class DatabaseStack extends cdk.Stack {

  constructor(scope, id, props) {
    super(scope, id, props)

    // creating table Users
    const usersTable = new dynamodb.Table(this, 'usersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'Users',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    this.usersTable= usersTable
  }
}

module.exports = { DatabaseStack }
