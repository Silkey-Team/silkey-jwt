<a name="module_SilkeySDK"></a>

## SilkeySDK

* [SilkeySDK](#module_SilkeySDK)
    * [.messageToSign(data)](#module_SilkeySDK.messageToSign) ⇒ <code>string</code>
    * [.generateSSORequestParams(privateKey, data)](#module_SilkeySDK.generateSSORequestParams) ⇒ <code>Object</code>
    * [.tokenPayloadVerifier(token, silkeyPublicKey)](#module_SilkeySDK.tokenPayloadVerifier) ⇒ <code>JwtPayload</code> \| <code>null</code>

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
| data | <code>Object</code> | Object with data: {redirectUrl*, cancelUrl*, refId*, scope, timestamp}  marked with * are required by Silkey SSO |

**Example**  
```js
// returns {signature, message, timestamp, redirectUrl, refId, scope}
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
tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjB4M0EzQTYyMzUxRkFlN2QxOTNlZjUxNTU3MUIxRjM1OTUwNzhEZDllMEBwcml2YXRlcmVsYXkuc2lsa2V5LmlvIiwiYWRkcmVzcyI6IjB4M0EzQTYyMzUxRkFlN2QxOTNlZjUxNTU3MUIxRjM1OTUwNzhEZDllMCIsInNpZ25hdHVyZSI6eyJyIjoiMHg5NzhmZTdhZmMwODY1NTk4YTNiYTNmOGUzMTI0ZDBkMGM3MGYyMTMwOTQ5YTBhZDRiZTk3ODc5MWI0ZGQ2Y2Q3IiwicyI6IjB4MDU1NjEwZGYzZmI2ODAyYzgwZjQ0NzVjNjIyNDc1OGM0Y2VjNWVkMTllMTMzN2YwODEwMmM3NjNlYWM2Y2JjMyIsIl92cyI6IjB4ODU1NjEwZGYzZmI2ODAyYzgwZjQ0NzVjNjIyNDc1OGM0Y2VjNWVkMTllMTMzN2YwODEwMmM3NjNlYWM2Y2JjMyIsInJlY292ZXJ5UGFyYW0iOjEsInYiOjI4fSwiaWF0IjoxNjAyMTQ0OTk2fQ.eU3B-jHnu8ToKeU9833jhr9Klvzwpb_oY60Q_jDW0js');
```
