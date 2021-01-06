/**
 * @module SilkeySDK
 */

import {ethers} from 'ethers'
import * as jwt from 'jsonwebtoken'

import {isEthereumAddress, isNotSet, isPrivateKey, isSet} from '../utils/helpers'
import {KeyValueI, SSOParamsI} from '../models'
import {JwtPayload} from '../models'
import {createProvider, Registry} from '../contracts'
import {SSOParams} from '../models'
import {Verifier} from './Verifier'

export const SSO_PARAMS_PREFIX = 'sso'
export const SSO_PARAMS_GLUE = '::'

/**
 * Generates message to sign based on plain object data (keys and values)
 *
 * @method
 * @param data {{}}
 * @returns {string}
 *
 * @example
 *
 * messageToSign({ssoRedirectUrl: 'http://silkey.io', ssoRefId: 1});
 * // returns 'ssoRedirectUrl=http://silkey.io::ssoRefId=1'
 */
export const messageToSign = (data: KeyValueI = {}): string => {
  const msg: string[] = []

  // eslint-disable-next-line
  const parser = (v: any): string => isNotSet(v) ? '' : v.toString()
  const sliceLength = SSO_PARAMS_PREFIX.length

  Object.keys(data).sort().forEach(k => {
    if ('ssoSignature' !== k && k.slice(0, sliceLength) === SSO_PARAMS_PREFIX && isSet(data[k])) {
      // empty strings included
      msg.push(`${k}=${parser(data[k])}`)
    }
  })

  return msg.join(SSO_PARAMS_GLUE)
}

/**
 * Generates all needed parameters (including signature) for requesting Silkey SSO
 *
 * @async
 * @method
 * @param privateKey {string} this should be private key of domain owner
 * @param params {SSOParamsI | KeyValueI}
 *  Object with data: {ssoRedirectUrl*, .ssoRedirectMethod, ssoCancelUrl*, ssoRefId, ssoScope, ssoTimestamp}
 *  marked with * are required by Silkey SSO
 * @returns {{signature, ssoTimestamp, ssoRedirectUrl, ssoRefId, ssoScope}}
 * @throws on missing required data
 * @example
 * // returns {ssoSignature, ssoTimestamp, ssoRedirectUrl, ssoRefId, ssoScope, ssoRedirectMethod}
 * await generateSSORequestParams(domainOwnerPrivateKey, {ssoRedirectUrl: 'http://silkey.io', ssoRefId: 1});
 */
export const generateSSORequestParams = async (
  privateKey: string, params: SSOParamsI | KeyValueI
): Promise<KeyValueI> => {
  if (!isPrivateKey(privateKey)) {
    throw Error(`privateKey is invalid: '${privateKey}'`)
  }

  const dataToSign = SSOParams.import(params)
  const wallet = new ethers.Wallet(privateKey)
  await dataToSign.sign(wallet)

  return dataToSign.export()
}


/**
 * Fetches public ethereum Silkey address directly from blockchain
 *
 * @param providerUri {string} ie: 'https://infura.io/v3/:infuraId' register to infura.io to get id
 * @param registryAddress {string} address of silkey smart contract registry,
 *  see list of addresses in README#registryAddress
 * @return {Promise<string>} public ethereum address of Silkey signer
 */
export const fetchSilkeyEthAddress = async (providerUri: string, registryAddress: string): Promise<string> => {
  const provider = createProvider(providerUri)
  const registry = new Registry(provider, registryAddress)
  const key = await registry.getAddress('Hades')

  if (!isEthereumAddress(key)) throw Error(`Invalid key: ${key}`)
  return key
}

/**
 * Verifies JWT token payload
 *
 * @method
 * @see https://jwt.io/ for details about token payload data
 * @param token {string} secret JWT token returned by Silkey, this token CAN NOT BE SHARED as it is like user password
 *  they are all returned back to you when user being authenticated
 * @param callbackParams
 * @param websiteOwnerAddress
 * @param silkeyEthAddress {string} public ethereum address of Silkey
 * @param tokenExpirationTime {number} max age of token in seconds, same token can be used to sign in many times,
 *   however from security perspective we should not allow for that case, because when somebody else steal token,
 *   he can access user account. That's why we should set expiration time. By deefault it iss set to 30 sec.
 *   When you pass 0 token will be always accepted.
 * @returns {JwtPayload|null} null when signatures are invalid, otherwise token payload
 * @throws when token is invalid or data are corrupted
 * @example
 * // returns {JwtPayload}
 * tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0
 *  IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
 */
export const tokenPayloadVerifier = (
  token: string,
  callbackParams: SSOParamsI | KeyValueI,
  websiteOwnerAddress: string,
  silkeyEthAddress: string | undefined = undefined,
  tokenExpirationTime = 30
): JwtPayload | null => {
  const ssoParams = SSOParams.import(callbackParams)

  try {
    const tokenPayload = jwt.decode(token)

    if (!tokenPayload || typeof tokenPayload === 'string') {
      console.warn(`tokenPayload should be object but got ${typeof tokenPayload}`)
      return null
    }

    const jwtPayload = JwtPayload.import(tokenPayload)

    if (!Verifier.verifyAge(jwtPayload, tokenExpirationTime)) {
      return null
    }

    if (!Verifier.verifyUserSignature(jwtPayload)) {
      return null
    }

    if (Verifier.verifySilkeySignature(jwtPayload, silkeyEthAddress) === false) {
      return null
    }

    if (!Verifier.verifyWebsiteSignature(ssoParams, websiteOwnerAddress)) {
      return null
    }

    try {
      Verifier.assertRequiredParamsForScope(ssoParams.ssoScope, jwtPayload.export())
    } catch (e) {
      console.warn(e)
      return null
    }

    return jwtPayload
  } catch (e) {
    console.warn(e)
    return null
  }
}
