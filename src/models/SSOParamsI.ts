/**
 * @module Types
 */

export interface SSOParamsI {
  ssoTimestamp: number
  ssoSignature?: string | undefined
  ssoRedirectUrl: string
  ssoCancelUrl: string
  ssoRedirectMethod?: string | undefined
  ssoRefId?: string | undefined
  ssoScope: string
}
