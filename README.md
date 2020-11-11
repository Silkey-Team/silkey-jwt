# Silkey SDK
[![GitHub version](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk.svg)](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk)
[![npm version](https://badge.fury.io/js/silkey-sdk.svg)](//npmjs.com/package/silkey-sdk)

SDK package for integrate with Silkey standard of Decentralised SSO.

[See list of all available methods](./DOCS.md).

## Usage

### Sign In With Silkey

Redirect user to `sso.silkey.io/signin` with parameters:

| Parameter     | Required  | Type | Desc |
| ------------- |:---------:| ----- | ----- |
| signature     | yes | string | Domain owner signature |
| sigTimestamp  | yes | number | Timestamp of signature  |
| redirectUrl   | yes | string | Where to redirect user with token after sign in |
| cancelUrl     | yes | string | Where to redirect user on error |
| refId         | no  | string | It will be return with user token, you may use it to identify request |
| scope         | no  | string | Scope of data to return in a token payload: `id` (default) returns only user address, `email` returns address + email |


When user back to you page with JWT token, validate it and login user.

### Installation

```
npm i --save silkey-sdk
```

### Draft integration description

```
# on signin page

import silkeySdk from 'sdk'

    const requestParams = silkeySdk.generateSSORequestParams(privateKey, {
      redirectUrl: 'https://domain/callback', // make sure you support both GET and POST redirection,
      scope: 'email',
      refId: 'any-data-that-will-be-returned-to-you',
      cancelUrl: 'https://domain/cancel',
      sigTimestamp: Math.round(Date.now() / 1000)
    })

    // redirect user to provided silkey URL with requestParams as query string

# on callback page

    import silkeySdk from 'sdk'

    // infuraId|provider - you need to have infura.io account or you can use any other web3 provider
    const {token, silkeyPublicKey} = silkeySdk.fetchSSOCallbackData(infuraId|provider)

    const jwtPayload = silkeySdk.tokenPayloadVerifier(token, silkeyPublicKey)

    if (jwtPayload === null) {
      // authorization failed
    } else {
      const {address, email, refId} = jwtPayload
      // address - use this as ID of the user

      // you are ready to go...
    }
```
