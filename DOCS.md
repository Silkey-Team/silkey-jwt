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
    * [~verifySilkeySignature(tokenPayload, silkeyPublicKey)](#module_SilkeySDK..verifySilkeySignature) ⇒ <code>null</code> \| <code>boolean</code>
    * [~fetchSilkeyPublicKey(providerUri, registryAddress)](#module_SilkeySDK..fetchSilkeyPublicKey) ⇒ <code>Promise.&lt;string&gt;</code>
    * [~tokenPayloadVerifier(token, silkeyPublicKey)](#module_SilkeySDK..tokenPayloadVerifier) ⇒ <code>JwtPayload</code> \| <code>null</code>

<a name="module_SilkeySDK..messageToSign"></a>

### SilkeySDK~messageToSign(data) ⇒ <code>string</code>
Generates message to sign based on plain object data (keys and values)

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

**Example**  
```js
messageToSign({redirectUrl: 'http://silkey.io', refId: 1});
// returns 'redirectUrl=http://silkey.io::refId=1'
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
| params | <code>Object</code> | Object with data: {redirectUrl*, redirectMethod, cancelUrl*, refId, scope, ssoTimestamp}  marked with * are required by Silkey SSO |

**Example**  
```js
// returns {signature, ssoTimestamp, redirectUrl, refId, scope, redirectMethod}
await generateSSORequestParams(domainOwnerPrivateKey, {redirectUrl: 'http://silkey.io', refId: 1});
```
<a name="module_SilkeySDK..verifySilkeySignature"></a>

### SilkeySDK~verifySilkeySignature(tokenPayload, silkeyPublicKey) ⇒ <code>null</code> \| <code>boolean</code>
By default we do not check Silkey signature (if not provided) as token is provided by Silkey
itself and there is no incentives to manipulate with Silkey signature
But it is strongly recommended to provide `silkeyPublicKey` and have full validation.

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tokenPayload | <code>string</code> |  | token returned by Silkey |
| silkeyPublicKey | <code>string</code> \| <code>null</code> | <code>null</code> | optional |

<a name="module_SilkeySDK..fetchSilkeyPublicKey"></a>

### SilkeySDK~fetchSilkeyPublicKey(providerUri, registryAddress) ⇒ <code>Promise.&lt;string&gt;</code>
Fetches public ethereum Silkey address directly from blockchain

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>Promise.&lt;string&gt;</code> - public ethereum address of Silkey signer  

| Param | Type | Description |
| --- | --- | --- |
| providerUri | <code>string</code> | ie: 'https://infura.io/v3/:infuraId' register to infura.io to get id |
| registryAddress | <code>string</code> | address of silkey smart contract registry,  see list of addresses in README#registryAddress |

<a name="module_SilkeySDK..tokenPayloadVerifier"></a>

### SilkeySDK~tokenPayloadVerifier(token, silkeyPublicKey) ⇒ <code>JwtPayload</code> \| <code>null</code>
Verifies JWT token payload

**Kind**: inner method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>JwtPayload</code> \| <code>null</code> - null when signatures are invalid, otherwise token payload  
**Throws**:

- when token is invalid or data are corrupted

**See**: https://jwt.io/ for details about token payload data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>string</code> |  | JWT token returned by Silkey |
| silkeyPublicKey | <code>string</code> | <code>null</code> | public ethereum address of Silkey |

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
| address | <code>string</code> | ID of the user, this is also valid ethereum address, use this to identify user |
| userSignature | <code>string</code> | proof that request came from the user |
| userSignatureTimestamp | <code>number</code> | time when signature was crated |
| silkeySignature | <code>string</code> | proof that Silkey verified the email |
| silkeySignatureTimestamp | <code>number</code> | time when signature was crated |
| scope | <code>string</code> |  |
| refId | <code>string</code> |  |


* [~JwtPayload](#module_JwtPayload..JwtPayload) : <code>object</code>
    * [.messageToSignByUser()](#module_JwtPayload..JwtPayload+messageToSignByUser) ⇒ <code>string</code>
    * [.messageToSignBySilkey()](#module_JwtPayload..JwtPayload+messageToSignBySilkey) ⇒ <code>string</code>

<a name="module_JwtPayload..JwtPayload+messageToSignByUser"></a>

#### jwtPayload.messageToSignByUser() ⇒ <code>string</code>
Creates message that's need to be sign by user

**Kind**: instance method of [<code>JwtPayload</code>](#module_JwtPayload..JwtPayload)  
<a name="module_JwtPayload..JwtPayload+messageToSignBySilkey"></a>

#### jwtPayload.messageToSignBySilkey() ⇒ <code>string</code>
Creates message that's need to be sign by silkey

**Kind**: instance method of [<code>JwtPayload</code>](#module_JwtPayload..JwtPayload)  
