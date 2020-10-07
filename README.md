# Silkey-jwt

Package to generates and validates Silkey compatible JWT.

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

# returns null when fail and data when succeed
const payload = silkeyJwtPayloadVerificator(token)
```
