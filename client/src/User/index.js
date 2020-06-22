import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { Auth, } from 'aws-amplify';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function User(props) {
  const [user, setUser] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (props.authState === "signedIn") {
      getUserData()
    }

    return () => {
      //in case of logout
      setUser(null)
      setIsCopied(null)
    }
  }, [props.authState])

  if (props.authState !== "signedIn") {
    return null
  }

  async function getUserData() {
    const session = await Auth.currentSession()
    const userData = await axios.get('https://4tpj2t1a90.execute-api.eu-central-1.amazonaws.com/prod/user', {
      headers: {
        'Authorization': session.getIdToken().getJwtToken(),
        'Content-Type': 'application/json'
      }
    })
    setUser(userData.data)
  }

  const invitationLink = user && `${window.location.origin}?referralId=${user.id}`

  return (
    <div className="flexAlignCenter">
      {user ?
        <>
          <div>
            User's amount: {user.amount}$
          </div>
          <div>
            Invited Users: {user.invitedUsers}
          </div>

          <div className="flexAlignCenter">
            <div>Invite users using this link:</div>
            {invitationLink}

            <CopyToClipboard text={invitationLink}
              onCopy={() => {
                setIsCopied(true)
              }}
            >
              <button className="copyButton">Copy to clipboard</button>
            </CopyToClipboard>
            {isCopied && "Copied"}

          </div>
        </>
        :
        <div>
          Loading...
        </div>
      }
    </div>
  )
}

export default User