/**
 * @module SilkeySDK
 */

import ethersjs from './import-ethers/index.js'
import { currentTimestamp, isEmpty, isEthereumAddress } from './utils/helpers.js'
import jwt from 'jsonwebtoken'
import { toJwtPayload } from './models/index.js'
import { createProvider, Registry } from './contracts/index.js'

const { ethers } = ethersjs
const parser = v => isEmpty(v) ? '' : v

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
export const messageToSign = (data = {}) => {
  const msg = []
  Object.keys(data).sort().forEach(k => {
    msg.push(`${k}=${parser(data[k])}`)
  })
  return msg.join('::')
}

/**
 * Generates all needed parameters (including signature) for requesting Silkey SSO
 *
 * @async
 * @method
 * @param privateKey {string} this should be private key of domain owner
 * @param data {{redirectUrl, redirectMethod, cancelUrl, refId, scope, ssoTimestamp}} Object with data: {redirectUrl*, redirectMethod, cancelUrl*, refId, scope, ssoTimestamp*}
 *  marked with * are required by Silkey SSO
 * @returns {{signature, ssoTimestamp, redirectUrl, refId, scope}}
 * @example
 * // returns {signature, ssoTimestamp, redirectUrl, refId, scope, redirectMethod}
 * await generateSSORequestParams(domainOwnerPrivateKey, {redirectUrl: 'http://silkey.io', refId: 1});
 */
export const generateSSORequestParams = async (privateKey, data = {}) => {
  if (isEmpty(data.redirectUrl)) {
    throw Error('`data.redirectUrl` is required')
  }

  if (isEmpty(data.cancelUrl)) {
    throw Error('`data.redirectUrl` is required')
  }

  const { redirectUrl, cancelUrl, redirectMethod, refId } = data
  const ssoTimestamp = data.ssoTimestamp || currentTimestamp()
  const scope = data.scope || 'id'

  const wallet = new ethers.Wallet(privateKey)

  const dataToSign = {}

  const items = { redirectUrl, redirectMethod, cancelUrl, ssoTimestamp, refId, scope }

  Object.keys(items).forEach(k => {
    if (!isEmpty(items[k])) {
      dataToSign[k] = items[k]
    }
  })

  const message = messageToSign(dataToSign)
  const signature = await wallet.signMessage(message)

  return {
    ...dataToSign,
    signature
  }
}

export const verifyUserSignature = tokenPayload => {
  try {
    const payload = toJwtPayload(tokenPayload)

    if (isEmpty(payload.userSignature) || isEmpty(payload.userSignatureTimestamp) || isEmpty(payload.address)) {
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
 * @param silkeyPublicKey {string} optional
 * @return {null|boolean}
 */
export const verifySilkeySignature = (tokenPayload, silkeyPublicKey) => {
  try {
    const payload = toJwtPayload(tokenPayload)

    if (isEmpty(payload.email) && isEmpty(payload.silkeySignature)) {
      return null
    }

    if (isEmpty(payload.email) ^ isEmpty(payload.silkeySignature)) {
      console.warn('Verification failed, missing silkey signature or email')
      return false
    }

    if (isEmpty(payload.silkeySignatureTimestamp)) {
      console.warn('Verification failed, missing silkey signature timestamp')
      return false
    }

    const signer = ethers.utils.verifyMessage(payload.messageToSignBySilkey(), payload.silkeySignature)

    if (isEmpty(silkeyPublicKey)) {
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
export const fetchSilkeyPublicKey = async (providerUri, registryAddress) => {
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
export const tokenPayloadVerifier = (token, silkeyPublicKey = null) => {
  try {
    const tokenPayload = jwt.decode(token)
    return verifySilkeySignature(tokenPayload, silkeyPublicKey) !== false && verifyUserSignature(tokenPayload) !== false ? toJwtPayload(tokenPayload) : null
  } catch (e) {
    console.warn(e)
    return null
  }
}
