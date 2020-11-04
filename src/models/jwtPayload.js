/**
 * @module JwtPayloadModel
 */

import { intToBuffer, isEmpty, isEthereumAddress, isSignature } from '../utils/helpers.js'

export const SCOPE_DIVIDER = ','

/**
 * @constructor
 */
function JwtPayloadObj () {
  this.scope = ''
  this.silkeySignature = null
  this.silkeySignatureTimestamp = null
  this.userSignature = null
  this.address = null
}

JwtPayloadObj.prototype.setScope = function (scope) {
  if (isEmpty(scope)) {
    return this
  }

  if (isEmpty(this.scope === '')) {
    this.scope = scope
    return this
  }

  const map = {}
  const str = `${this.scope}${SCOPE_DIVIDER}${scope}`
  str.split(SCOPE_DIVIDER).filter(k => !isEmpty(k)).forEach(k => {
    map[k] = k
  })
  this.scope = Object.keys(map).join(SCOPE_DIVIDER)

  return this
}

JwtPayloadObj.prototype.getScopeDivider = function () {
  return SCOPE_DIVIDER
}

JwtPayloadObj.prototype.getScope = function () {
  return this.scope.split(SCOPE_DIVIDER)
}

JwtPayloadObj.prototype.setAddress = function (address) {
  if (!isEthereumAddress(address)) {
    throw Error(`address should be valid ethereum address: ${address}`)
  }

  this.address = address
  return this
}

JwtPayloadObj.prototype.setEmail = function (email) {
  this.email = email
  return this
}

JwtPayloadObj.prototype.setRefId = function (refId) {
  if (isEmpty(refId)) {
    return this
  }

  this.refId = refId
  return this
}

JwtPayloadObj.prototype.setTimestamp = function () {
  this.timestamp = Math.round(Date.now() / 1000)
  return this
}

JwtPayloadObj.prototype.setUserSignature = function (sig) {
  if (!isSignature(sig)) {
    throw Error(`user signature is invalid: ${sig}`)
  }

  this.userSignature = sig
  return this
}

JwtPayloadObj.prototype.setSilkeySignature = function (sig, timestamp) {
  if (!isSignature(sig)) {
    throw Error(`silkey signature is invalid: ${sig}`)
  }

  if (isEmpty(timestamp)) {
    throw Error(`silkey signature timestamp is invalid: ${timestamp}`)
  }

  this.silkeySignature = sig
  this.silkeySignatureTimestamp = timestamp
  return this
}

/**
 * Creates message that's need to be sign by user
 *
 * @method
 *
 * @returns {string}
 */
JwtPayloadObj.prototype.messageToSignByUser = function () {
  const keys = Object.keys(this)
    .filter(k => !['silkeySignature', 'userSignature', 'email', 'iat'].includes(k))
    .sort()

  const items = []

  keys.forEach(k => {
    items.push(this[k])
  })

  return items.join(':')
}

/**
 * Creates message that's need to be sign by silkey
 *
 * @method
 *
 * @returns {string}
 */
JwtPayloadObj.prototype.messageToSignBySilkey = function () {
  if (isEmpty(this.email)) {
    return null
  }

  return Buffer.concat([
    Buffer.from(this.email),
    intToBuffer(this.silkeySignatureTimestamp)
  ]).toString('hex')
}

JwtPayloadObj.prototype.export = function () {
  return Object.assign({}, this)
}

export const JwtPayload = JwtPayloadObj

export const toJwtPayload = (obj = {}) => {
  return Object.assign(new JwtPayloadObj(), obj)
}
