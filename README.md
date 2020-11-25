![Silkey Logo](https://raw.githubusercontent.com/Silkey-Team/brand/master/silkey-word-black.png)

# Silkey SDK for NodeJS

[![GitHub version](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk.svg)](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk)
[![npm version](https://badge.fury.io/js/%40silkey%2Fsdk.svg)](https://badge.fury.io/js/%40silkey%2Fsdk)

SDK package for integrate with Silkey standard of Decentralised SSO.

[See list of all available methods](./DOCS.md).

## Smart Contracts

### registryAddress
- Sandbox/Rinkeby: [0x885B924491Fa7dF268f20df91B06b2C23D68490F](https://rinkeby.etherscan.io/address/0x885B924491Fa7dF268f20df91B06b2C23D68490F)

## Usage

### Sign In With Silkey

Redirect user to Silkey with parameters:

| Parameter        | Required  | Type     | Desc 
| ---------------- |:---------:| -------- | ----- 
| signature        | yes       | string   | Domain owner signature
| ssoTimestamp     | yes       | number   | Time of signing SSO request
| redirectUrl      | yes       | string   | Where to redirect user with token after sign in
| redirectMethod   | no        | GET/POST | How to redirect user after sign in, default is POST
| cancelUrl        | yes       | string   | Where to redirect user on error
| refId            | no        | string   | It will be return with user token, you may use it to identify request
| scope            | no        | string   | Scope of data to return in a token payload: `id` (default) returns only user address, `email` returns address + email


#### Redirect URLs

- Live: soon
- Sandbox: https://athena-sandbox.silkey.io


When user back to you page with JWT token, validate it and login user.

### Installation

```shell script
npm i --save @silkey/sdk
```

### Silkey Integration Guide

#### Services

From developer perspective, there are two main services you should care about:
1. Apollo - which registers the domain name of your application
2. Athena - which you redirect to and authenticates the user

When user *Sign In with Silkey*, Athena do background check for your website (using your domain name).
If your request for Sign In is valid (signature match the domain owner) Athena proceeds with Sign In.

##### Information About Sandbox vs. Production

The version of Apollo that is used is determined by the Athena version, and isn't specified by the developer.
Sandbox uses an ethereum test network, where the ether has no monetary value, and the Production is on the main ethereum network.

When in development, the sandbox version of Athena should be used.

##### Services URLs

The Sandbox 
- https://athena-sandbox.silkey.io
- https://apollo-sandbox.silkey.io
- https://demo-sandbox.silkey.io (go and try it!)

The Production
- Soon

#### Needed Preperations:

1. Generate an ethereum wallet for the application, this wallet will be linked to the web domain of the application

    - Visit https://metamask.io
    - Download and add the extension to your browser
    - Create an account for the application
    - Click on account details then export private key to view and write down the private key
    
    A very small amount of ether is used to verify that the domain is registered.
    To obtain free ether on the Rinkeby test network visit https://faucet.rinkeby.io/
    
1. Authenticate the domain of the application in Apollo with the generated wallet:

   Visit the propper Apollo url (see above), there is a wizzard that will guide you through all this steps:
    - Login with metamask
    - Click on Register Domain and enter domain of your application
    - Click "Connect Existing Wallet" to use the metamask account
    - Generate a challenge and add it into the DNS TXT record of the domain
    - Verify the domain with DNS TXT records challenge
    - Add logo url that will be displayed when a user is loging in using silkey
    - Send a transaction which will save the registration

3.  Export private key from MetaMask and store it in a secure way inside your application. You will need it to generate the request for *Silkey Sing In*.

#### On SignIn page

```javascript
import silkeySdk from "@silkey/sdk";

// The needed data varaibles are:
// redirectUrl: Where the user is redirected after auth
// cancelUrl: Where the user is redirected if they cancel authentication
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
const silkeyRedirect = new URL((ATHENA_URL = "https://athena-sandbox.silkey.io"));

Object.entries(requestParams).forEach(([key, param]) => {
  silkeyRedirect.searchParams.append(key, param);
});

// Rediect to silkeyRedirect
```

#### On Callback Page 

`token` - get if from request params (it can be send via POST or GET, based on `redirectMethod`) 

```javascript
import silkeySdk from "@silkey/sdk";

// providerUri: A web3 provider URI. ie: 'https://infura.io/v3/:infuraId' register at infura.io to get infuraId
// registryAddress: Address of silkey smart contract registry, see list of addresses in the registryAddress section of README.md
const silkeyPublicKey = await silkeySdk.fetchSilkeyPublicKey(providerUri, registryAddress);

// token: The token returned by Athena
const token = new URL(window.location).searchParams.get("token");

// Using silkeyPublicKey is optional but recomended for scope=email
const jwtPayload = silkeySdk.tokenPayloadVerifier(token, silkeyPublicKey);

if (jwtPayload === null) {
  // authorization failed
} else {
  const { address, email, refId } = jwtPayload;
  // address - use this as ID of the user
  // you are ready to go...
}
```

`jwtPayload` is type of `silkeySdk.Models.JwtPayload`, object properties:

- `scope`: value from request
- `refId`: value from request
- `address`: ID of the user (also valid ethereum address)
- `email`: present when `scope=email`, `email` is verified by Silkey, no need for additional verification
- `userSignature`: users' signature, 
- `userSignatureTimestamp`: users' signature timestamp, 
- `silkeySignature`: only when email is present, proof that Silkey verified `email`
- `silkeySignatureTimestamp`: timestamp of signature

## SDK for other platforms

- [Silkey SDK for Ruby](https://rubygems.org/gems/silkey-sdk) [![Gem Version](https://badge.fury.io/rb/silkey-sdk.svg)](https://badge.fury.io/rb/silkey-sdk)
