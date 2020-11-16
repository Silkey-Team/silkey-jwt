# Silkey SDK
[![GitHub version](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk.svg)](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk)
[![npm version](https://badge.fury.io/js/silkey-sdk.svg)](//npmjs.com/package/silkey-sdk)

SDK package for integrate with Silkey standard of Decentralised SSO.

[See list of all available methods](./DOCS.md).

## Smart Contracts

### registryAddress
- Kovan: '0x3acd1d20134A2B004d2fEbd685501d5fFBe419d5'

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

### Integration

#### on signin page

```    
    const callerParams = {
      // make sure you support both GET and POST redirection,
      redirectUrl: 'https://your-registered-domain/redirect-path', 
      cancelUrl: 'https://your-registered-domain/cancel',
      refId: 'any',
      scope: 'email'
    }
    
    const requestParams = await silkeySdk.generateSSORequestParams(callerPrivateKey, callerParams)

    // redirect user to provided silkey URL with all params from `requestParams` as query string
```

#### on callback page 

##### default simple version

```
    // token - get `token` from request parameters

    const jwtPayload = silkeySdk.tokenPayloadVerifier(token)

    if (jwtPayload === null) {
      // authorization failed
    } else {
      const {address, email, refId} = jwtPayload
      // address - use this as ID of the user

      // you are ready to go...
    }
```

##### version with additional silkey key check (recommended)

- providerUri: web3 provider uri, we recommend using infura.io as a provider
- registryAddress: Silkey smart contract registry address, see [#registryAddress](#registryAddress) for available addresses

```
    const silkeyPublicKey = await fetchSilkeyPublicKey(providerUri, registryAddress)

    const jwtPayload = silkeySdk.tokenPayloadVerifier(token, silkeyPublicKey)

    if (jwtPayload === null) {
      // authorization failed
    } else {
      const {address, email, refId} = jwtPayload
      // address - use this as ID of the user

      // you are ready to go...
    }
```
