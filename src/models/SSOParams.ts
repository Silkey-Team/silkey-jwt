import {currentTimestamp, getKeyValue, isSet, isTimestamp} from '../utils/helpers'
import {ethers} from 'ethers'
import {messageToSign} from '..'
import {settings} from '../config/settings' // do not change path!
import {SSOParamsI, KeyValueI} from '.'

export class SSOParams implements SSOParamsI {
  public ssoTimestamp = 0
  public ssoSignature: string | undefined
  public ssoRedirectUrl = ''
  public ssoCancelUrl = ''
  public ssoRedirectMethod: string | undefined
  public ssoRefId: string | undefined
  public ssoScope = settings.ssoParams.DEFAULT_SCOPE

  sign = async (signer: ethers.Signer): Promise<SSOParams> => {
    if (!isTimestamp(this.ssoTimestamp)) {
      this.ssoTimestamp = currentTimestamp()
    }

    this.ssoSignature = await signer.signMessage(messageToSign(JSON.parse(JSON.stringify(this))))
    return this
  }

  hasRequired = (): boolean => {
    if (!settings.ssoParams.required.every(k => !!getKeyValue(this)(k))) {
      console.warn('This parameters are required for Silkey SSO:', settings.ssoParams.required.join(', '))
      return false
    }

    return true
  }

  validate = (): SSOParams => {
    if (!this.hasRequired()) {
      throw Error(`This parameters are required for Silkey SSO: ${settings.ssoParams.required.join(', ')}`)
    }

    return this
  }

  export = (): Record<string, string> => {
    const exported = JSON.parse(JSON.stringify(this.validate()))

    return Object.keys(exported).reduce((acc: Record<string, string>, k: string) => {
      if (isSet(getKeyValue(exported)(k))) {
        acc[k] = exported[k]
      }

      return acc
    }, {})
  }

  static import = (obj: SSOParams | SSOParamsI | KeyValueI = {}): SSOParams => {
    return (<any>Object).assign(new SSOParams(), obj instanceof SSOParams ? obj.export() : obj)
  }
}
