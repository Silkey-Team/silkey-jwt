import * as dotenv from 'dotenv'
import {expect} from 'chai'

import {publicKey, webPrivateKey, webPublicKey} from '../keys'
import {settings} from '../../src/config/settings'
import {generateSSORequestParams, messageToSign, tokenPayloadVerifier} from '../../src'
import {currentTimestamp} from '../../src/utils/helpers'
import {expectThrowsAsync} from '../utils/utils'
import {
  callbackParamsForEmail,
  callbackParamsForId,
  invalidToken,
  validScopeEmailToken,
  validScopeIdToken
} from '../tokens'

dotenv.config()

const {MESSAGE_TO_SIGN_GLUE} = settings

describe('sso', () => {
  const t = currentTimestamp()

  describe('messageToSign()', () => {
    it('generates empty message without data', () => {
      const m = messageToSign()
      expect(m).to.eq('')
    })

    it(`generates empty message for data that are NOT prefixed with ${settings.ssoParams.PREFIX}`, () => {
      expect(messageToSign({d: null, c: '', b: 2, a: 1})).to.eq('')
    })

    it('generates message with sorted data', () => {
      expect(messageToSign({ssoD: null, ssoC: 'c', sso: 2, ssoA: 1}))
        .to.eq(`sso=2${MESSAGE_TO_SIGN_GLUE}ssoA=1${MESSAGE_TO_SIGN_GLUE}ssoC=c`)
    })

    it('exclude ssoSignature', () => {
      expect(messageToSign({ssoSignature: null, ssoC: 'c'})).to.eq('ssoC=c')
    })
  })

  describe('generateSSORequestParams()', () => {
    describe('throws when', () => {
      it('PK is not valid', async () => {
        await expectThrowsAsync(() => generateSSORequestParams('0x123', {}), Error, 'privateKey is invalid: \'0x123\'')
      })

      it('missing required parameters', async () => {
        await expectThrowsAsync(
          () => generateSSORequestParams(webPrivateKey, {}),
          Error,
          'This parameters are required for Silkey SSO: ssoSignature, ssoRedirectUrl, ssoCancelUrl, ssoTimestamp'
        )

        await expectThrowsAsync(
          () => generateSSORequestParams(webPrivateKey, {ssoRedirectUrl: 'ssoRedirectUrl'}),
          Error, 'This parameters are required for Silkey SSO: ssoSignature, ssoRedirectUrl, ssoCancelUrl, ssoTimestamp'
        )
      })
    })

    it('generates signature for SSO request', async () => {
      const data = {ssoTimestamp: 1602151787, ssoRedirectUrl: 'http', ssoCancelUrl: 'http'}
      const params = await generateSSORequestParams(webPrivateKey, data)
      const sig = '0xba6a1d96fae8aeac3ab0df505a48d678e45bfe3080affcee703b011978a137255968daf3ef63186f4f67117a1522ab' +
        '19aef325e48e1db985343a084881b0f0391c'

      expect(params.ssoSignature).to.eq(sig)
      expect(params.ssoTimestamp).to.eq(1602151787)

      const dataWithNull = {
        ssoTimestamp: 1602151787,
        ssoRedirectUrl: 'http',
        ssoCancelUrl: 'http',
        unset: null
      }

      const paramsWithUnset = await generateSSORequestParams(webPrivateKey, dataWithNull)

      expect(paramsWithUnset.ssoSignature).to.eq(params.ssoSignature)
      expect(paramsWithUnset.ssoTimestamp).to.eq(params.ssoTimestamp)

      const dataWithEmptyString = {
        ssoTimestamp: 1602151787,
        ssoRedirectUrl: 'http',
        ssoCancelUrl: 'http',
        unset: ''
      }
      const paramsWithEmptyString = await generateSSORequestParams(webPrivateKey, dataWithEmptyString)

      expect(paramsWithEmptyString.ssoSignature).to.eq(sig)
      expect(paramsWithEmptyString.ssoTimestamp).to.eq(params.ssoTimestamp)
    })

    it('sets timestamp when not provided', async () => {
      const awaits = [
        generateSSORequestParams(webPrivateKey, {ssoRedirectUrl: 'http', ssoCancelUrl: 'http'}),
        generateSSORequestParams(webPrivateKey, {
          ssoTimestamp: 0,
          ssoRedirectUrl: 'http',
          ssoCancelUrl: 'http'
        }),
        generateSSORequestParams(webPrivateKey, {
          ssoTimestamp: -1,
          ssoRedirectUrl: 'http',
          ssoCancelUrl: 'http'
        })
      ]

      const results = await Promise.all(awaits)

      results.forEach(({ssoTimestamp}) => {
        expect(ssoTimestamp).to.gte(t)
      })
    })

    it('generates same signature for null/empty data', async () => {
      const data1 = await generateSSORequestParams(webPrivateKey, {
        ssoTimestamp: 1,
        ssoRedirectUrl: 'http',
        ssoCancelUrl: 'http',
        ssoScope: 'id',
        ssoRefId: undefined
      })

      const data2 = await generateSSORequestParams(webPrivateKey, {
        ssoTimestamp: 1,
        ssoRedirectUrl: 'http',
        ssoCancelUrl: 'http',
        ssoRefId: undefined,
        ssoScope: undefined,
        a: null,
        b: undefined
      })

      expect(data1.signature).to.eq(data2.signature)
    })

    it('generates same signature for same data', async () => {
      const f = () => generateSSORequestParams(webPrivateKey, {
        ssoTimestamp: t,
        ssoRedirectUrl: 'https://silkey.io/',
        ssoCancelUrl: 'https://silkey.io/fail',
        ssoRefId: 123,
        ssoScope: 'id'
      })

      const res1 = await f()
      const res2 = await f()

      expect(res1.ssoSignature).not.to.be.empty
      expect(res1.ssoSignature).to.eq(res2.ssoSignature)
    })

    it('generates SSO for scope:id', async () => {
      const sso = await generateSSORequestParams(webPrivateKey, {
        ssoTimestamp: t,
        ssoRedirectUrl: 'https://silkey.io/',
        ssoCancelUrl: 'https://silkey.io/fail',
        ssoRefId: 123,
        ssoScope: 'id'
      })

      expect(sso.ssoSignature).not.to.be.empty
      console.log(sso)
    })

    it('generates SSO for scope:email', async () => {
      const sso = await generateSSORequestParams(webPrivateKey, {
        ssoTimestamp: t,
        ssoRedirectUrl: 'https://silkey.io/',
        ssoCancelUrl: 'https://silkey.io/fail',
        ssoRefId: 123,
        ssoScope: 'email'
      })

      expect(sso.ssoSignature).not.to.be.empty
      console.log(sso)
    })
  })

  describe('tokenPayloadVerifier()', () => {
    it('validates token for scope ID and returns payload', () => {
      const payload = tokenPayloadVerifier(validScopeIdToken, callbackParamsForId, webPublicKey, publicKey, 0)
      expect(payload).not.to.be.null
      expect(payload!.address).not.to.undefined
    })

    it('validates token for scope:email and returns payload', () => {
      const payload = tokenPayloadVerifier(validScopeEmailToken, callbackParamsForEmail, webPublicKey, publicKey, 0)
      expect(payload).not.to.be.null

      if (!payload) {
        expect(false, 'hack for ts for payload == null')
        return
      }

      const {address, email, silkeySignature, silkeySignatureTimestamp} = payload

      expect(address).not.to.undefined
      expect(email).not.to.undefined
      expect(silkeySignature).not.to.undefined
      expect(silkeySignatureTimestamp).not.to.undefined
    })

    it('returns null when token is old', () => {
      const payload = tokenPayloadVerifier(invalidToken, {}, webPublicKey)
      expect(payload).to.be.null
    })

    it('returns null when token invalid', () => {
      const payload = tokenPayloadVerifier(invalidToken, {}, webPublicKey, publicKey, 0)
      expect(payload).to.be.null
    })
  })
})
