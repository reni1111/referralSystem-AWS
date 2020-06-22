//amplify needs this for auth on node endearment
global.fetch = require("node-fetch");

const assert = require('assert');
const Amplify = require('aws-amplify');
const { Auth } = require('aws-amplify');
const axios = require('axios')
const {v4: uuid} = require('uuid')
const MailosaurClient = require('mailosaur')

const DEFAULT_PASSWORD = '123123?!'
const EMAIL_SECRET = 'T8BgjPBTgTyDSeV'
const EMAIL_SERVER = 'naw0s0bi'
const emailClient = new MailosaurClient(EMAIL_SECRET)

Amplify.default.configure({
  "aws_cognito_region": "eu-central-1",
  "aws_user_pools_id": "eu-central-1_PP2mrEDza",
  "aws_user_pools_web_client_id": "7fhfn3438lo7m662ndsg9dtrsu",
});

describe('Amitree', function () {
  // could be done using .map too, but it's more readable like this (tests should be readable)
  let users = [
    {
      email: `users0${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    },
    {
      email: `users1${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    },
    {
      email: `users2${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    },
    {
      email: `users3${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    },
    {
      email: `users4${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    },
    {
      email: `users5${uuid()}.${EMAIL_SERVER}@mailosaur.io`
    }
  ]


  it('User 0 signUp', async function () {
    let user = await userSignUp(users[0].email)
    assert.equal(typeof (user), "object")
  })

  it('User 0 signIn', async function () {
    let user = await userSignIn(users[0].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[0]
    users[0] = {
      ...users[0],
      ...user
    }
  })

  it('User 0\'s amount should be 0', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 0)
  })

  it('User 1 signUp', async function () {
    let user = await userSignUp(users[1].email, users[0].id)
    assert.equal(typeof (user), "object")
  })

  it('User 1 signIn', async function () {
    let user = await userSignIn(users[1].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[1]
    users[1] = {
      ...users[1],
      ...user
    }
  })

  it('User 1\'s amount should be 10$', async function () {
    let user = await getUserData(users[1].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 10)
  })

  it('User 0\'s invitedUsers should be 1', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.invitedUsers, 1)
  })


  it('User 2 signUp', async function () {
    let user = await userSignUp(users[2].email, users[0].id)
    assert.equal(typeof (user), "object")
  })

  it('User 2 signIn', async function () {
    let user = await userSignIn(users[2].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[2]
    users[2] = {
      ...users[2],
      ...user
    }

  })

  it('User 2\'s amount should be 10$', async function () {
    let user = await getUserData(users[2].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 10)
  })

  it('User 0\'s invitedUsers should be 2', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.invitedUsers, 2)
  })


  it('User 3 signUp', async function () {
    let user = await userSignUp(users[3].email, users[0].id)
    assert.equal(typeof (user), "object")
  })

  it('User 3 signIn', async function () {
    let user = await userSignIn(users[3].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[3]
    users[3] = {
      ...users[3],
      ...user
    }

  })

  it('User 3\'s amount should be 10$', async function () {
    let user = await getUserData(users[3].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 10)
  })

  it('User 0\'s invitedUsers should be 3', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.invitedUsers, 3)
  })

  it('User 4 signUp', async function () {
    let user = await userSignUp(users[4].email, users[0].id)
    assert.equal(typeof (user), "object")
  })

  it('User 4 signIn', async function () {
    let user = await userSignIn(users[4].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[4]
    users[4] = {
      ...users[4],
      ...user
    }

  })

  it('User 4\'s amount should be 10$', async function () {
    let user = await getUserData(users[4].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 10)
  })

  it('User 0\'s invitedUsers should be 4', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.invitedUsers, 4)
  })

  it('User 5 signUp', async function () {
    let user = await userSignUp(users[5].email, users[0].id)
    assert.equal(typeof (user), "object")
  })

  it('User 5 signIn', async function () {
    let user = await userSignIn(users[5].email)
    assert.equal(typeof (user), "object")
    // passing Id and token to the users[5]
    users[5] = {
      ...users[5],
      ...user
    }

  })

  it('User 5\'s amount should be 10$', async function () {
    let user = await getUserData(users[5].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.amount, 10)
  })

  it('User 0\'s invitedUsers should be 5 and amount 10$', async function () {
    let user = await getUserData(users[0].token)
    console.log(user)
    assert.equal(typeof (user), "object")
    assert.equal(user.invitedUsers, 5)
    assert.equal(user.amount, 10)
  })

  it('Delete all test accounts', async function () {
    // sends ALL request at the same time (asynchronous...)
    let deletedAccounts = await Promise.all(
      users.map(async (user)=> await deleteUser(user.token))
    )
    console.log(deletedAccounts)
  })

});


async function getVerificationCode(email) {
  // waits up to 20seconds for email (amazon takes about 1-3seconds)
  const message = await emailClient.messages.get(EMAIL_SERVER, {
    sentTo: email
  })
  const verificationCode = message.html.body.replace('The verification code to your new account is ', '')
  console.log("verification code", verificationCode)
  return verificationCode
}

async function userSignUp(email, referralId) {
  let user
  const referralObj = !referralId ? {} : {
    'custom:referralId': referralId
  }

  try {
    user = await Auth.signUp({
      username: email,
      password: DEFAULT_PASSWORD,
      attributes: {
        ...referralObj
      }

    })

    const code = await getVerificationCode(email)

    await Auth.confirmSignUp(email, code)

    return user
  } catch (err) {
    console.log("signUp err", err)
  }
}

async function userSignIn(email) {
  let user = {}
  try {
    let signInObj = await Auth.signIn({
      username: email,
      password: DEFAULT_PASSWORD
    })
    user.id = signInObj.username
    const session = await Auth.currentSession()
    user.token = session.getIdToken().getJwtToken()

    return user
  } catch (err) {
    console.log("signUp err", err)
  }
}

async function getUserData(token) {
  try {
    const userData = await axios.get('https://4tpj2t1a90.execute-api.eu-central-1.amazonaws.com/prod/user', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    return userData.data
  } catch (err) {
    console.log("getUserData error", err)
  }
}

async function deleteUser(token) {
  try {
    const userData = await axios.delete('https://4tpj2t1a90.execute-api.eu-central-1.amazonaws.com/prod/user', {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    return userData.data
  } catch (err) {
    console.log("deleteUser err", err)
  }
}