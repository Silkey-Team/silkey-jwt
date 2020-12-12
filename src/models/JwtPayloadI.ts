/**
 * @module Types
 */

export interface JwtPayloadI {
  email: string
  scope: string
  address: string
  silkeySignatureTimestamp: number
  silkeySignature: string
  userSignatureTimestamp: number
  userSignature: string
  migration: boolean
}
