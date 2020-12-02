/**
 * @module JwtPayloadModel
 */

import {
  currentTimestamp,
  intToBuffer,
  isEmpty,
  isEthereumAddress,
  isSignature,
  KeyValueInterface,
  remove0x
} from '../utils/helpers'

export const SCOPE_DIVIDER = ','

export interface JwtPayloadI {
  email: string
  refId: string
  scope: string
  address: string
  silkeySignatureTimestamp: number
  silkeySignature: string
  userSignatureTimestamp: number
  userSignature: string
}

/**
 * @constructor
 */
export class JwtPayload implements JwtPayloadI {
  public email = ''
  public refId = ''
  public address = ''
  public silkeySignatureTimestamp = 0
  public silkeySignature = ''
  public userSignatureTimestamp = 0
  public userSignature = ''
  public scope = ''

  getScope = (): string[] => this.scope.split(SCOPE_DIVIDER)

  setScope = (scope: string): JwtPayload => {
    if (isEmpty(scope)) {
      return this
    }

    if (isEmpty(this.scope === '')) {
      this.scope = scope
      return this
    }

    const map: KeyValueInterface = {}
    const str = `${this.scope}${SCOPE_DIVIDER}${scope}`
    str.split(SCOPE_DIVIDER).filter(k => !isEmpty(k)).forEach(k => {
      map[k] = k
    })
    this.scope = Object.keys(map).sort().join(SCOPE_DIVIDER)

    return this
  }

  setAddress = (address: string): JwtPayload => {
    if (!isEthereumAddress(address)) {
      throw Error(`address should be valid ethereum address: ${address}`)
    }

    this.address = address
    return this
  }

  setEmail = (email: string): JwtPayload => {
    this.email = email
    return this
  }

  setRefId = (refId: string): JwtPayload => {
    if (isEmpty(refId)) {
      return this
    }

    this.refId = refId
    return this
  }

  setUserSignature = (sig: string, timestamp: number): JwtPayload => {
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

  setSilkeySignature = (sig: string, timestamp: number): JwtPayload => {
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
  messageToSignByUser = (): string => {
    if (!isEmpty(this.address) && !this.userSignatureTimestamp) {
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
  messageToSignBySilkey = (): string => {
    if (isEmpty(this.email)) {
      return ''
    }

    if (!this.silkeySignatureTimestamp) {
      this.silkeySignatureTimestamp = currentTimestamp()
    }

    return Buffer.concat([
      Buffer.from(this.email),
      intToBuffer(this.silkeySignatureTimestamp)
    ]).toString('hex')
  }

  validate = (): JwtPayload => {
    if (!isEthereumAddress(this.address)) {
      throw new Error(`address is invalid: ${this.address}`)
    }

    if (!isSignature(this.userSignature)) {
      throw new Error(`userSignature is invalid: ${this.userSignature}`)
    }

    if (!this.userSignatureTimestamp) {
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

    if (!this.silkeySignatureTimestamp) {
      throw new Error(`silkeySignatureTimestamp is invalid: ${this.silkeySignatureTimestamp}`)
    }

    return this
  }

  export = (): JwtPayloadI => {
    return (<any>Object).assign({}, this)
  }

  static import = (obj: KeyValueInterface = {}): JwtPayload => {
    return (<any>Object).assign(new JwtPayload(), obj)
  }
}
