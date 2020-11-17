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

Redirect user to `sso.silkey.io/signin` with parameters. These parameters will be generated by the silkeySdk.

| Parameter    | Required | Type   | Desc                                                                                                                  |
| ------------ | :------: | ------ | --------------------------------------------------------------------------------------------------------------------- |
| signature    |   yes    | string | Domain owner signature                                                                                                |
| ssoTimestamp |   yes    | number | Timestamp of signature                                                                                                |
| redirectUrl  |   yes    | string | Where to redirect user with token after sign in                                                                       |
| cancelUrl    |   yes    | string | Where to redirect user on error                                                                                       |
| refId        |    no    | string | It will be return with user token, you may use it to identify request                                                 |
| scope        |    no    | string | Scope of data to return in a token payload: `id` (default) returns only user address, `email` returns address + email |

When user back to you page with JWT token, validate it and login user.

### Installation

```
npm i --save silkey-sdk
```

### Silkey Integration Guide

#### Needed Preperations:

1.  Create a ethereum wallet for the program, save the private key
2.  Save the application in Apollo with the generated wallet, visit https://apollo.silkey.io to do this
3.  Store the private key in the .env variables for the application

#### On Signin Page

```javascript
import silkeySdk from "@silkey/sdk";

// The needed data varaibles are:
// redirectUrl: Where the user is redirected after auth
// cancelUrl: Where the user is redirected if they cancel auth
// scope: "email" or "id" email if you want access to the users email, otherwise id
// refId: (optional) This data will be returned to the program after authentication, and can be used to track previous actions before signup
// ssoTimestamp: (Optional) Time when params were generated, will be automatically generated if not present

// Example:
const requestParams = silkeySdk.generateSSORequestParams(privateKey, {
  redirectUrl: "https://domain/callback",
  cancelUrl: "https://domain/cancel",
  scope: "email",
  refId: "54321",
});

// Add the generated params to silkey url as queryString.
// ATHENA_URL: The url of the Athena webpage that is authenticating the user

// Example:
const silkeyRedirect = new URL((ATHENA_URL = "https://athena-staging.silkey.io"));
Object.entries(requestParams).forEach(([key, param]) => {
  silkeyRedirect.searchParams.append(key, param);
});

// Rediect to silkeyRedirect
```

#### On Callback Page

```javascript
import silkeySdk from "@silkey/sdk";

// providerUri - A web3 provider URI. ie: 'https://infura.io/v3/:infuraId' register to infura.io to get infuraId
// registryAddress: Address of silkey smart contract registry, see list of addresses in the registryAddress section of README.md
const silkeyPublicKey = await silkeySdk.fetchSilkeyPublicKey(providerUri, registryAddress);

const token = queryStringGetter("token");

const jwtPayload = silkeySdk.tokenPayloadVerifier(token, silkeyPublicKey);

if (jwtPayload === null) {
  // authorization failed
} else {
  const { address, email, refId } = jwtPayload;
  // address - use this as ID of the user
  // you are ready to go...
}
```
