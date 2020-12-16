## Modules

<dl>
<dt><a href="#module_SilkeySDK">SilkeySDK</a></dt>
<dd></dd>
<dt><a href="#module_JwtPayload">JwtPayload</a></dt>
<dd></dd>
</dl>

<a name="module_SilkeySDK"></a>

## SilkeySDK

* [SilkeySDK](#module_SilkeySDK)
    * [~messageToSign(data)](#module_SilkeySDK..messageToSign) ⇒ <code>string</code>
    * [~generateSSORequestParams(privateKey, params)](#module_SilkeySDK..generateSSORequestParams) ⇒ <code>Object</code>
    * [~fetchSilkeyEthAddress(providerUri, registryAddress)](#module_SilkeySDK..fetchSilkeyEthAddress) ⇒ <code>Promise.&lt;string&gt;</code>
    * [~tokenPayloadVerifier(token, callbackParams, websiteOwnerAddress, silkeyEthAddress, tokenExpirationTime)](#module_SilkeySDK..tokenPayloadVerifier) ⇒ <code>JwtPayload</code> \| <code>null</code>

<a name="module_SilkeySDK..messageToSign"></a>

### SilkeySDK~messageToSign(data) ⇒ <code>string</code>
Generates message to sign based on plain object data (keys and values)

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

**Example**  
```js
messageToSign({ssoRedirectUrl: 'http://silkey.io', ssoRefId: 1});
// returns 'ssoRedirectUrl=http://silkey.io::ssoRefId=1'
```
<a name="module_SilkeySDK..generateSSORequestParams"></a>

### SilkeySDK~generateSSORequestParams(privateKey, params) ⇒ <code>Object</code>
Generates all needed parameters (including signature) for requesting Silkey SSO

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Throws**:

- on missing required data


| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>string</code> | this should be private key of domain owner |
| params | <code>SSOParamsI</code> \| <code>KeyValueI</code> | Object with data: {ssoRedirectUrl*, .ssoRedirectMethod, ssoCancelUrl*, ssoRefId, ssoScope, ssoTimestamp}  marked with * are required by Silkey SSO |

**Example**  
```js
// returns {ssoSignature, ssoTimestamp, ssoRedirectUrl, ssoRefId, ssoScope, ssoRedirectMethod}
await generateSSORequestParams(domainOwnerPrivateKey, {ssoRedirectUrl: 'http://silkey.io', ssoRefId: 1});
```
<a name="module_SilkeySDK..fetchSilkeyEthAddress"></a>

### SilkeySDK~fetchSilkeyEthAddress(providerUri, registryAddress) ⇒ <code>Promise.&lt;string&gt;</code>
Fetches public ethereum Silkey address directly from blockchain

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>Promise.&lt;string&gt;</code> - public ethereum address of Silkey signer  

| Param | Type | Description |
| --- | --- | --- |
| providerUri | <code>string</code> | ie: 'https://infura.io/v3/:infuraId' register to infura.io to get id |
| registryAddress | <code>string</code> | address of silkey smart contract registry,  see list of addresses in README#registryAddress |

<a name="module_SilkeySDK..tokenPayloadVerifier"></a>

### SilkeySDK~tokenPayloadVerifier(token, callbackParams, websiteOwnerAddress, silkeyEthAddress, tokenExpirationTime) ⇒ <code>JwtPayload</code> \| <code>null</code>
Verifies JWT token payload

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>JwtPayload</code> \| <code>null</code> - null when signatures are invalid, otherwise token payload  
**Throws**:

- when token is invalid or data are corrupted

**See**: https://jwt.io/ for details about token payload data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>string</code> |  | secret JWT token returned by Silkey, this token CAN NOT BE SHARED as it is like user password  they are all returned back to you when user being authenticated |
| callbackParams |  |  |  |
| websiteOwnerAddress |  |  |  |
| silkeyEthAddress | <code>string</code> |  | public ethereum address of Silkey |
| tokenExpirationTime | <code>number</code> | <code>30</code> | max age of token in seconds, same token can be used to sign in many times,   however from security perspective we should not allow for that case, because when somebody else steal token,   he can access user account. That's why we should set expiration time. By deefault it iss set to 30 sec.   When you pass 0 token will be always accepted. |

**Example**  
```js
// returns {JwtPayload}
tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0
 IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
```
<a name="module_JwtPayload"></a>

## JwtPayload

* [JwtPayload](#module_JwtPayload)
    * [~JwtPayload](#module_JwtPayload..JwtPayload) : <code>object</code>
        * [.messageToSignByUser()](#module_JwtPayload..JwtPayload+messageToSignByUser) ⇒ <code>string</code>
        * [.messageToSignBySilkey()](#module_JwtPayload..JwtPayload+messageToSignBySilkey) ⇒ <code>string</code>

<a name="module_JwtPayload..JwtPayload"></a>

### JwtPayload~JwtPayload : <code>object</code>
**Kind**: inner typedef of [<code>JwtPayload</code>](#module_JwtPayload)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | verified email of the user,  IMPORTANT: if email in user profile is different, you should always update it with this one. |
| address | <code>string</code> | ID of the user, this is also valid ethereum address, use this to identify user |
| userSignature | <code>string</code> | proof that request came from the user |
| userSignatureTimestamp | <code>number</code> | time when signature was crated |
| silkeySignature | <code>string</code> | proof that Silkey verified the email |
| silkeySignatureTimestamp | <code>number</code> | time when signature was crated |
| scope | <code>string</code> |  |
| migration | <code>boolean</code> | if user started migration to Silkey, this will be true |


* [~JwtPayload](#module_JwtPayload..JwtPayload) : <code>object</code>
    * [.messageToSignByUser()](#module_JwtPayload..JwtPayload+messageToSignByUser) ⇒ <code>string</code>
    * [.messageToSignBySilkey()](#module_JwtPayload..JwtPayload+messageToSignBySilkey) ⇒ <code>string</code>

<a name="module_JwtPayload..JwtPayload+messageToSignByUser"></a>

#### jwtPayload.messageToSignByUser() ⇒ <code>string</code>
Creates message that's need to be sign by user

**Kind**: instance method of [<code>JwtPayload</code>](#module_JwtPayload..JwtPayload)  
<a name="module_JwtPayload..JwtPayload+messageToSignBySilkey"></a>

#### jwtPayload.messageToSignBySilkey() ⇒ <code>string</code>
Creates message that's need to be sign by Silkey

**Kind**: instance method of [<code>JwtPayload</code>](#module_JwtPayload..JwtPayload)  
