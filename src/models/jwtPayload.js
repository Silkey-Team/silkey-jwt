/**
 * @module JwtPayloadModel
 */

import {
  currentTimestamp,
  intToBuffer,
  isEmpty,
  isEthereumAddress,
  isSignature,
  remove0x
} from '../utils/helpers.js'

export const SCOPE_DIVIDER = ','

/**
 * @constructor
 */
function JwtPayloadObj () {
  this.scope = ''
  this.address = ''
  this.refId = ''
  this.email = ''
  this.silkeySignature = ''
  this.silkeySignatureTimestamp = ''
  this.userSignature = ''
  this.userSignatureTimestamp = ''
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
  this.scope = Object.keys(map).sort().join(SCOPE_DIVIDER)

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

JwtPayloadObj.prototype.setUserSignature = function (sig, timestamp) {
  if (!isSignature(sig)) {
    throw Error(`user signature is invalid: ${sig}`)
  }

  if (isEmpty(timestamp)) {
    throw Error(`user signature timestamp is invalid: ${timestamp}`)
  }

  this.userSignature = sig
  this.userSignatureTimestamp = timestamp
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
  if (!isEmpty(this.address) && isEmpty(this.userSignatureTimestamp)) {
    this.userSignatureTimestamp = currentTimestamp()
  }

  return Buffer.concat([
    Buffer.from('address'),
    Buffer.from(remove0x(this.address.toLowerCase()), 'hex'),
    Buffer.from('refId'),
    Buffer.from(this.refId.toString()),
    Buffer.from('scope'),
    Buffer.from(this.scope),
    Buffer.from('userSignatureTimestamp'),
    intToBuffer(this.userSignatureTimestamp)
  ]).toString('hex')
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
    return ''
  }

  if (isEmpty(this.silkeySignatureTimestamp)) {
    this.silkeySignatureTimestamp = currentTimestamp()
  }

  return Buffer.concat([
    Buffer.from(this.email),
    intToBuffer(this.silkeySignatureTimestamp)
  ]).toString('hex')
}

JwtPayloadObj.prototype.validate = function () {
  if (!isEthereumAddress(this.address)) {
    throw new Error(`address is invalid: ${this.address}`)
  }

  if (!isSignature(this.userSignature)) {
    throw new Error(`userSignature is invalid: ${this.userSignature}`)
  }

  if (isEmpty(this.userSignatureTimestamp)) {
    throw new Error('userSignatureTimestamp is empty')
  }

  if (isEmpty(this.scope) || this.scope === 'id') {
    return this
  }

  if (isEmpty(this.email)) {
    throw new Error(`email is invalid: ${this.email}`)
  }

  if (!isSignature(this.silkeySignature)) {
    throw new Error(`silkeySignature is invalid: ${this.silkeySignature}`)
  }

  if (isEmpty(this.silkeySignatureTimestamp)) {
    throw new Error(`silkeySignatureTimestamp is invalid: ${this.silkeySignatureTimestamp}`)
  }

  return this
}

JwtPayloadObj.prototype.export = function () {
  return Object.assign({}, this)
}

export const JwtPayload = JwtPayloadObj

export const toJwtPayload = (obj = {}) => {
  return Object.assign(new JwtPayloadObj(), obj)
}
