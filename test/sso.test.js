import dotenv from 'dotenv'
import chai from 'chai'

import { privateKey } from './keys.js'
import { fetchSilkeyPublicKey, generateSSORequestParams, messageToSign } from '../src/sso.js'
import { expectThrowsAsync } from './utils/utils.js'

dotenv.config()

const { expect } = chai

describe('sso.js', () => {
  const t = Math.round(Date.now() / 1000)

  describe('messageToSign()', () => {
    it('generates empty message without data', () => {
      const m = messageToSign()
      expect(m).to.eq('')
    })

    it('generates message with data', () => {
      expect(messageToSign({ b: 2, a: 1 })).to.eq('a=1&b=2')
      expect(messageToSign({ d: null, c: '', b: 2, a: 1 })).to.eq('a=1&b=2&c=')
    })
  })

  describe('generateSSORequestParams()', () => {
    describe('throws when', () => {
      it('PK is not provided', async () => {
        await expectThrowsAsync(() => generateSSORequestParams(), Error, '`privateKey` is required')
      })

      it('PK is not valid', async () => {
        await expectThrowsAsync(() => generateSSORequestParams('0x123'), Error, '`redirectUrl` is required')
      })

      it('missing required parameters', async () => {
        await expectThrowsAsync(() => generateSSORequestParams(privateKey, {}), Error, '`redirectUrl` is required')

        await expectThrowsAsync(
          () => generateSSORequestParams(privateKey, { redirectUrl: 'redirectUrl' }),
          Error, '`cancelUrl` is required'
        )
      })
    })

    it('generates signature for SSO request', async () => {
      const data = { ssoTimestamp: 1602151787, redirectUrl: 'http', cancelUrl: 'http' }
      const params = await generateSSORequestParams(privateKey, data)
      const sig = '0xb60f9b1f5c9d6e58b5d802a5019f96415ab7b14bea45721d74e0868df48c85080063beffb19a485b0038b1b158c31ddab4dff08458b0d9a9a43da0b3a2abb72b1b'

      expect(params.signature).to.eq(sig)
      expect(params.ssoTimestamp).to.eq(1602151787)

      data.unset = null
      const paramsWithUnset = await generateSSORequestParams(privateKey, data)

      expect(paramsWithUnset.signature).to.eq(params.signature)
      expect(paramsWithUnset.ssoTimestamp).to.eq(params.ssoTimestamp)
      console.log(data)

      data.unset = ''
      const paramsWithSet = await generateSSORequestParams(privateKey, data)

      console.log(data)
      expect(paramsWithSet.signature).not.to.eq(params.signature)
      expect(paramsWithSet.ssoTimestamp).to.eq(params.ssoTimestamp)
    })

    it('sets timestamp when not provided', async () => {
      const awaits = [
        generateSSORequestParams(privateKey, { redirectUrl: 'http', cancelUrl: 'http' }),
        generateSSORequestParams(privateKey, { ssoTimestamp: null, redirectUrl: 'http', cancelUrl: 'http' }),
        generateSSORequestParams(privateKey, { ssoTimestamp: '', redirectUrl: 'http', cancelUrl: 'http' })
      ]

      const results = await Promise.all(awaits)

      results.forEach(({ ssoTimestamp }) => {
        expect(ssoTimestamp).to.gte(t)
      })
    })

    it('generates same signature for null/empty data', async () => {
      const data1 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: 'http',
        cancelUrl: 'http',
        scope: 'id',
        refId: null
      })

      const data2 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: 'http',
        cancelUrl: 'http',
        refId: undefined,
        scope: undefined,
        a: null,
        b: undefined
      })

      expect(data1.signature).to.eq(data2.signature)
    })

    it('generates same signature for same data', async () => {
      // test silkey owner: 0xe07574Db57717E4A32d2D9B41Ee2B2e2c5C7BB62
      const f = () => generateSSORequestParams(privateKey, {
        timestamp: t,
        redirectUrl: 'https://silkey.io/',
        cancelUrl: 'https://silkey.io/fail',
        refId: 123,
        scope: 'id'
      })

      const res1 = await f()
      const res2 = await f()

      console.log(res1)

      expect(res1.signature).to.eq(res2.signature)
    })
  })

  describe('fetchSilkeyPublicKey()', () => {
    const { PROVIDER_URI } = process.env

    it('expect to fetch silkey public key', (done) => {
      if (PROVIDER_URI) {
        fetchSilkeyPublicKey(PROVIDER_URI, '0xcEf09Bdb5d73055bc52C55E81F1138f48bcc0eCc')
          .then(m => {
            expect(m).not.to.eq('0x0000000000000000000000000000000000000000')
            expect(m.length).to.eq(42)
            done()
          })
      }
    }).timeout(5000)
  })
})
