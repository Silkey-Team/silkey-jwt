# Silkey SDK  
[![GitHub version](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk.svg)](https://badge.fury.io/gh/Silkey-Team%2Fsilkey-sdk)
[![npm version](https://badge.fury.io/js/silkey-sdk.svg)](//npmjs.com/package/silkey-sdk)

SDK package for integrate with Silkey standard of Decentralised SSO.

[See list of all available methods](./DOCS.md).

## Usage

### Sign In With Silkey

Redirect user to `sso.silkey.io/signin` with parameters:

| Parameter     | Required  | Desc  |
| ------------- |:---------:| ----- |
| signature     | yes | Domain owner signature |
| redirectUrl   | yes | Where to redirect user with token after sign in |
| timestamp     | yes |    |
| refId         | no  | It will be returned back with user token, you may use it to identify request |
| scope         | no  | Scope of data to return in token payload: `id` (default) returns only user address, `email` returns address + email |


When user back to you page with JWT token, validate it and login user.

### Installation

```
npm i --save silkey-sdk
```

### Include in your project

```
import {generateSSORequestParams, ssoPayloadVerifier} from 'silkey-sdk'
```

## TODO
- support of scope: email/null
