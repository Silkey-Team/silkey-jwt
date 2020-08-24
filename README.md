# silkey-jwt

Package to generates and validates silkey compatible JWT.

## Generate JWT

```
import ethersjs from "ethers";
import {silkeyJwtGenerator} from 'silkey-jwt'

const token = silkeyJwtGenerator(ethers.Wallet.createRandom())
```

## Validate JWT payload

```
import ethersjs from "ethers";
import {silkeyJwtPayloadVerificator} from 'silkey-jwt'

const payload = silkeyJwtPayloadVerificator(token)
```
