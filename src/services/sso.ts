/**
 * @module SilkeySDK
 */

import {ethers} from 'ethers'
import * as jwt from 'jsonwebtoken'

import {
  currentTimestamp,
  isEthereumAddress,
  isNotSet,
  isSet,
  KeyValueInterface,
  xor
} from '../utils/helpers'

import {JwtPayload} from '../models'
import {createProvider, Registry} from '../contracts'

/**
 * Generates message to sign based on plain object data (keys and values)
 *
 * @method
 * @param data {{}}
 * @returns {string}
 * @example
 * messageToSign({redirectUrl: 'http://silkey.io', refId: 1});
 * // returns 'redirectUrl=http://silkey.io::refId=1'
 */
export const messageToSign = (data: KeyValueInterface = {}): string => {
  const msg: string[] = []

  // eslint-disable-next-line
  const parser = (v: any): string => isNotSet(v) ? '' : v.toString()

  Object.keys(data).sort().forEach(k => {
    if (isSet(data[k])) {
      msg.push(`${k}=${parser(data[k])}`)
    }
  })

  return msg.join('&')
}

/**
 * Generates all needed parameters (including signature) for requesting Silkey SSO
 *
 * @async
 * @method
 * @param privateKey {string} this should be private key of domain owner
 * @param params {{redirectUrl, redirectMethod, cancelUrl, refId, scope, ssoTimestamp}} Object with data: {redirectUrl*, redirectMethod, cancelUrl*, refId, scope, ssoTimestamp}
 *  marked with * are required by Silkey SSO
 * @returns {{signature, ssoTimestamp, redirectUrl, refId, scope}}
 * @throws on missing required data
 * @example
 * // returns {signature, ssoTimestamp, redirectUrl, refId, scope, redirectMethod}
 * await generateSSORequestParams(domainOwnerPrivateKey, {redirectUrl: 'http://silkey.io', refId: 1});
 */
export const generateSSORequestParams = async (privateKey: string, params: KeyValueInterface = {}): Promise<KeyValueInterface> => {
  if (!privateKey) {
    throw Error('`privateKey` is required')
  }

  const dataToSign = {...params}

  const {redirectUrl, cancelUrl, ssoTimestamp, scope} = dataToSign

  if (!redirectUrl) {
    throw Error('`redirectUrl` is required')
  }

  if (!cancelUrl) {
    throw Error('`cancelUrl` is required')
  }

  if (!ssoTimestamp) {
    dataToSign.ssoTimestamp = currentTimestamp()
  }

  if (!scope) {
    dataToSign.scope = 'id'
  }

  const wallet = new ethers.Wallet(privateKey)

  const message = messageToSign(dataToSign)
  const signature = await wallet.signMessage(message)

  return {
    ...dataToSign,
    signature
  }
}

export const verifyUserSignature = (tokenPayload: KeyValueInterface): boolean => {
  try {
    const payload = JwtPayload.import(tokenPayload)

    if (!payload.userSignature || !payload.userSignatureTimestamp || !payload.address) {
      console.warn('Verification failed, missing user signature/timestamp and/or address')
      return false
    }

    const message = payload.messageToSignByUser()
    const signer = ethers.utils.verifyMessage(message, payload.userSignature)
    const success = signer.toLowerCase() === payload.address.toLowerCase()
    !success && console.warn(`verifyUserSignature: expect ${signer} to be equal ${payload.address}`)

    return success
  } catch (e) {
    console.warn(e)
    return false
  }
}

/**
 * By default we do not check silkey signature (if not provided)
 * as token is provided by silkey itself and therer is no incentives to manipulate with silkey signature
 * But it is strongly recommended to provide silkeyPublicKey and have full validation.
 *
 * @param tokenPayload {string} token returned by silkey
 * @param silkeyPublicKey {string | null} optional
 * @return {null|boolean}
 */
export const verifySilkeySignature = (tokenPayload: KeyValueInterface, silkeyPublicKey: string | null = null): boolean | null => {
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

    const signer = ethers.utils.verifyMessage(payload.messageToSignBySilkey(), payload.silkeySignature)

    if (!silkeyPublicKey) {
      console.warn('You are using verification without checking silkey signature. We strongly recommended to turn on full verification. This option can be deprecated in the future')
      return true
    }

    const success = signer.toLowerCase() === silkeyPublicKey.toLowerCase()
    !success && console.warn(`verifySilkeySignature: expect ${signer} to be equal ${silkeyPublicKey}`)

    return success
  } catch (e) {
    console.warn(e)
    return false
  }
}

/**
 * Fetches public ethereum Silkey address directly from blockchain
 *
 * @param providerUri {string} ie: 'https://infura.io/v3/:infuraId' register to infura.io to get infuraId
 * @param registryAddress {string} address of silkey smart contract registry, see list of addresses in README#registryAddress
 * @return {Promise<string>} public ethereum address of silkey signer
 */
export const fetchSilkeyPublicKey = async (providerUri: string, registryAddress: string): Promise<string> => {
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
 * @param token {string} JWT token returned by Silkey
 * @param silkeyPublicKey {string} public ethereum address of Silkey
 * @returns {JwtPayload|null} null when signatures are invalid, otherwise token payload
 * @throws when token is invalid or data are corrupted
 * @example
 * // returns {JwtPayload}
 * tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
 */
export const tokenPayloadVerifier = (token: string, silkeyPublicKey: string | null = null): JwtPayload | null => {
  try {
    const tokenPayload = jwt.decode(token)

    if (!tokenPayload || typeof tokenPayload === 'string') {
      return null
    }

    return verifyUserSignature(tokenPayload) && verifySilkeySignature(tokenPayload, silkeyPublicKey) !== false
      ? JwtPayload.import(tokenPayload)
      : null
  } catch (e) {
    console.warn(e)
    return null
  }
}
