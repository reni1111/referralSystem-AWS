const cdk = require('@aws-cdk/core')
const{ UsersStack } = require('../stacks/usersStack')
const{ DatabaseStack } =  require('../stacks/databaseStack')
const app = new cdk.App()

const databaseStack = new DatabaseStack(app, 'databaseStack')

const usersStack = new UsersStack(app, 'usersStack', {
  usersTable: databaseStack.usersTable
})
