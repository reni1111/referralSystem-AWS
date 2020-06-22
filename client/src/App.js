import React from 'react';
import Amplify from 'aws-amplify';
import { Authenticator, } from 'aws-amplify-react';
import User from './User'
import awsConfig from './aws-exports';
import {
  useLocation,
} from "react-router-dom";
import queryString from "query-string"

Amplify.configure(awsConfig);

function App() {

  // used to get referral from URL
  const location = useLocation()
  const queryStringObj = queryString.parse(location.search)

  return (
    <>
      <Authenticator
        usernameAttributes="email"
        signUpConfig={{
          hiddenDefaults: ["phone_number"],
          signUpFields: [
            {
              label: 'Referral Id',
              key: 'custom:referralId',
              placeholder: 'xxxx',
              displayOrder: 3,
              // forked the library and did few modification to support value as a prop (more on commit)
              value: queryStringObj.referralId
            },
          ],
        }}
      >
        <User />
      </Authenticator>
    </>
  );
}

export default App