/**
 * @module SilkeySDK
 */

import ethersjs from 'ethers'
import { isEmpty, isSet } from './utils/helpers.js'
import jwt from 'jsonwebtoken'
import { toJwtPayload } from './models/index.js'

const { ethers } = ethersjs

let wallet

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
 * @param data {{redirectUrl, cancelUrl, refId, scope, timestamp}} Object with data: {redirectUrl*, cancelUrl*, refId*, scope, timestamp}
 *  marked with * are required by Silkey SSO
 * @returns {{signature, message, timestamp, redirectUrl, refId, scope}}
 * @example
 * // returns {signature, message, timestamp, redirectUrl, refId, scope}
 * await generateSSORequestParams(domainOwnerPrivateKey, {redirectUrl: 'http://silkey.io', refId: 1});
 */
export const generateSSORequestParams = async (privateKey, data = {}) => {
  const redirectUrl = data.redirectUrl || null
  const cancelUrl = data.cancelUrl || null
  const sigTimestamp = data.sigTimestamp || Math.round(Date.now() / 1000)
  const refId = data.refId || null
  const scope = data.scope || null

  wallet = new ethers.Wallet(privateKey)
  const message = messageToSign({
    redirectUrl,
    cancelUrl,
    sigTimestamp,
    refId,
    scope
  })
  const signature = await wallet.signMessage(message)
  return {
    signature,
    message,
    sigTimestamp,
    redirectUrl,
    cancelUrl,
    refId,
    scope
  }
}

export const verifyUserSignature = tokenPayload => {
  try {
    const payload = toJwtPayload(tokenPayload)

    if (isEmpty(payload.userSignature) || isEmpty(payload.address)) {
      console.warn('Verification failed, missing user signature and/or address')
      return false
    }

    const message = payload.messageToSignByUser()
    const signer = ethers.utils.verifyMessage(message, payload.userSignature)
    return signer.toLowerCase() === payload.address.toLowerCase()
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
export const verifySilkeySignature = (tokenPayload, silkeyPublicKey = null) => {
  try {
    if (isEmpty(silkeyPublicKey)) {
      console.warn('You are using verification without checking silkey signature. We strongly recommended to turn on full verification. This option can be deprecated in the future')
      return true
    }

    const payload = toJwtPayload(tokenPayload)

    if (isSet(payload.email) ^ isSet(payload.silkeySignature)) {
      console.warn('Verification failed, missing silkey signature or email')
      return false
    }

    if (!isSet(payload.email) && !isSet(payload.silkeySignature)) {
      return null
    }

    const signer = ethers.utils.verifyMessage(payload.messageToSignBySilkey(), payload.silkeySignature)
    const result = signer.toLowerCase() === silkeyPublicKey.toLowerCase()
    !result && console.warn(`verifySilkeySignature: expect ${signer} to be equal ${silkeyPublicKey}`)

    return result
  } catch (e) {
    console.warn(e)
    return false
  }
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
 * tokenPayloadVerifier('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjB4M0EzQTYyMzUxRkFlN2QxOTNlZjUxNTU3MUIxRjM1OTUwNzhEZDllMEBwcml2YXRlcmVsYXkuc2lsa2V5LmlvIiwiYWRkcmVzcyI6IjB4M0EzQTYyMzUxRkFlN2QxOTNlZjUxNTU3MUIxRjM1OTUwNzhEZDllMCIsInNpZ25hdHVyZSI6eyJyIjoiMHg5NzhmZTdhZmMwODY1NTk4YTNiYTNmOGUzMTI0ZDBkMGM3MGYyMTMwOTQ5YTBhZDRiZTk3ODc5MWI0ZGQ2Y2Q3IiwicyI6IjB4MDU1NjEwZGYzZmI2ODAyYzgwZjQ0NzVjNjIyNDc1OGM0Y2VjNWVkMTllMTMzN2YwODEwMmM3NjNlYWM2Y2JjMyIsIl92cyI6IjB4ODU1NjEwZGYzZmI2ODAyYzgwZjQ0NzVjNjIyNDc1OGM0Y2VjNWVkMTllMTMzN2YwODEwMmM3NjNlYWM2Y2JjMyIsInJlY292ZXJ5UGFyYW0iOjEsInYiOjI4fSwiaWF0IjoxNjAyMTQ0OTk2fQ.eU3B-jHnu8ToKeU9833jhr9Klvzwpb_oY60Q_jDW0js');
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
