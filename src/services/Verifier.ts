import {JwtPayload, SSOParamsI, KeyValueI} from '../models'
import {settings} from '../config/settings' // do not change path!
import {currentTimestamp, getKeyValue, prepend0x, xor} from '../utils/helpers'
import {ethers} from 'ethers'
import {messageToSign} from './sso'

const {SCOPE_DIVIDER} = settings.ssoParams

export class Verifier {
  static assertRequiredParamsForScope = (scope: string | string[], data: KeyValueI): void => {
    if (!scope) {
      throw Error('scope is empty')
    }

    const scopeArr = typeof scope === 'string' ? scope.toString().split(SCOPE_DIVIDER).filter(s => !!s) : scope

    if (!scopeArr.length) {
      throw Error('scope is empty')
    }

    const supportedScopes = Object.values(settings.jwt).map(v => v.key)

    scopeArr.forEach(scopeKey => {
      if (supportedScopes.includes(scopeKey)) {
        getKeyValue(settings.jwt)(scopeKey).requiredData.forEach(item => {
          if (!data[item]) {
            throw Error(`\`${item}\` parameter is required for selected scope: ${scopeKey}`)
          }
        })
      } else {
        throw Error(`scope \`${scopeKey}\` is not supported`)
      }
    })
  }

  static verifyWebsiteSignature = (ssoParams: SSOParamsI, websiteOwnerAddress: string): boolean => {
    try {
      if (!ssoParams.ssoSignature) {
        console.warn('ssoSignature is empty')
        return false
      }

      const message = messageToSign(ssoParams)
      const signer = ethers.utils.verifyMessage(message, prepend0x(ssoParams.ssoSignature))

      if (websiteOwnerAddress.toLowerCase() !== signer.toLowerCase()) {
        console.warn(`verifyWebsiteSignature: expect ${websiteOwnerAddress} but got ${signer}`)
        return false
      }

      return true
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  static verifyAge = (jwtPayload: JwtPayload, tokenExpirationTime: number): boolean => {
    if (tokenExpirationTime <= 0) {
      console.warn(`You set token expiration time to ${tokenExpirationTime}.`,
        'That mean token age will not be verified.',
        'We strongly recommended to set expiration time between 5s - 60s for security reasons.'
      )

      return true
    }

    if (tokenExpirationTime > 100) {
      console.warn(`You set token high expiration time: ${tokenExpirationTime}.`,
        'We strongly recommended to set expiration time between 5s - 30s for security reasons.')
    }

    const age = currentTimestamp() - jwtPayload.userSignatureTimestamp

    if (age > tokenExpirationTime) {
      console.warn(`token expired, expected age ${tokenExpirationTime}s but got ${age}s`)
      return false
    }

    if (age < 0) {
      console.warn('token from the future... https://www.youtube.com/watch?v=FWG3Dfss3Jc')
      return false
    }

    return true
  }

  static verifyUserSignature = (tokenPayload: JwtPayload | KeyValueI): boolean => {
    try {
      const payload = JwtPayload.import(tokenPayload)

      if (!payload.userSignature || !payload.userSignatureTimestamp || !payload.address) {
        console.warn('Verification failed, missing user signature/timestamp and/or address')
        return false
      }

      const message = payload.messageToSignByUser()
      const signer = ethers.utils.verifyMessage(message, payload.userSignature)
      const success = signer.toLowerCase() === payload.address.toLowerCase()
      !success && console.warn(`verifyUserSignature: expect ${signer} but got ${payload.address}`)

      return success
    } catch (e) {
      console.warn(e)
      return false
    }
  }


  /**
   * By default we do not check Silkey signature (if not provided) as token is provided by Silkey
   * itself and there is no incentives to manipulate with Silkey signature
   * But it is strongly recommended to provide `silkeyEthAddress` and have full validation.
   *
   * @param tokenPayload {string} token returned by Silkey
   * @param silkeyEthAddress {string|null} optional
   * @return {null|boolean}
   */
  static verifySilkeySignature = (
    tokenPayload: JwtPayload | KeyValueI,
    silkeyEthAddress: string | undefined = undefined
  ): boolean | null => {
    try {
      const payload = JwtPayload.import(tokenPayload)

      if (!payload.email && !payload.silkeySignature) {
        return null
      }

      if (xor(!payload.email, !payload.silkeySignature)) {
        console.warn('Verification failed, missing silkey signature or email')
        return false
      }

      if (!payload.silkeySignatureTimestamp) {
        console.warn('Verification failed, missing silkey signature timestamp')
        return false
      }

      // verify message even if silkeyEthAddress is not set
      const signer = ethers.utils.verifyMessage(payload.messageToSignBySilkey(), payload.silkeySignature)

      if (!silkeyEthAddress) {
        console.warn('You are using verification without checking silkey signature. ' +
          'We strongly recommended to turn on full verification. ' +
          'This option can be deprecated in the future')
        return true
      }

      const success = signer.toLowerCase() === silkeyEthAddress.toLowerCase()
      !success && console.warn(`verifySilkeySignature: expect ${silkeyEthAddress} but got ${signer}`)

      return success
    } catch (e) {
      console.warn(e)
      return false
    }
  }
}
