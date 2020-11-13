<a name="module_SilkeySDK"></a>

## SilkeySDK

* [SilkeySDK](#module_SilkeySDK)
    * [.verifySilkeySignature](#module_SilkeySDK.verifySilkeySignature) ⇒ <code>null</code> \| <code>boolean</code>
    * [.fetchSilkeyPublicKey](#module_SilkeySDK.fetchSilkeyPublicKey) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.messageToSign(data)](#module_SilkeySDK.messageToSign) ⇒ <code>string</code>
    * [.generateSSORequestParams(privateKey, data)](#module_SilkeySDK.generateSSORequestParams) ⇒ <code>Object</code>
    * [.tokenPayloadVerifier(token, silkeyPublicKey)](#module_SilkeySDK.tokenPayloadVerifier) ⇒ <code>JwtPayload</code> \| <code>null</code>

<a name="module_SilkeySDK.verifySilkeySignature"></a>

### SilkeySDK.verifySilkeySignature ⇒ <code>null</code> \| <code>boolean</code>
By default we do not check silkey signature (if not provided)
as token is provided by silkey itself and therer is no incentives to manipulate with silkey signature
But it is strongly recommended to provide silkeyPublicKey and have full validation.

**Kind**: static constant of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type | Description |
| --- | --- | --- |
| tokenPayload | <code>string</code> | token returned by silkey |
| silkeyPublicKey | <code>string</code> | optional |

<a name="module_SilkeySDK.fetchSilkeyPublicKey"></a>

### SilkeySDK.fetchSilkeyPublicKey ⇒ <code>Promise.&lt;string&gt;</code>
Fetches public ethereum Silkey address directly from blockchain

**Kind**: static constant of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>Promise.&lt;string&gt;</code> - public ethereum address of silkey signer  

| Param | Type | Description |
| --- | --- | --- |
| providerUri | <code>string</code> | ie: 'https://infura.io/v3/:infuraId' register to infura.io to get infuraId |
| registryAddress | <code>string</code> | address of silkey smart contract registry, see list of addresses in README#registryAddress |

<a name="module_SilkeySDK.messageToSign"></a>

### SilkeySDK.messageToSign(data) ⇒ <code>string</code>
Generates message to sign based on plain object data (keys and values)

**Kind**: static method of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

**Example**  
```js
messageToSign({redirectUrl: 'http://silkey.io', refId: 1});
// returns 'redirectUrl=http://silkey.io::refId=1'
```
<a name="module_SilkeySDK.generateSSORequestParams"></a>

### SilkeySDK.generateSSORequestParams(privateKey, data) ⇒ <code>Object</code>
Generates all needed parameters (including signature) for requesting Silkey SSO

**Kind**: static method of [<code>SilkeySDK</code>](#module_SilkeySDK)  

| Param | Type | Description |
| --- | --- | --- |
| privateKey | <code>string</code> | this should be private key of domain owner |
| data | <code>Object</code> | Object with data: {redirectUrl*, cancelUrl*, refId*, scope, sigTimestamp*}  marked with * are required by Silkey SSO |

**Example**  
```js
// returns {signature, sigTimestamp, redirectUrl, refId, scope}
await generateSSORequestParams(domainOwnerPrivateKey, {redirectUrl: 'http://silkey.io', refId: 1});
```
<a name="module_SilkeySDK.tokenPayloadVerifier"></a>

### SilkeySDK.tokenPayloadVerifier(token, silkeyPublicKey) ⇒ <code>JwtPayload</code> \| <code>null</code>
Verifies JWT token payload

**Kind**: static method of [<code>SilkeySDK</code>](#module_SilkeySDK)  
**Returns**: <code>JwtPayload</code> \| <code>null</code> - null when signatures are invalid, otherwise token payload  
**Throws**:

- when token is invalid or data are corrupted

**See**: https://jwt.io/ for details about token payload data  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | JWT token returned by Silkey |
| silkeyPublicKey | <code>string</code> | public ethereum address of Silkey |

**Example**  
```js
// returns {JwtPayload}
tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
```
