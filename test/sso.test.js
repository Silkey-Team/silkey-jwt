import dotenv from 'dotenv'
import chai from 'chai'

import { privateKey } from './keys.js'
import { fetchSilkeyPublicKey, generateSSORequestParams, messageToSign } from '../src/sso.js'

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
      const m = messageToSign({
        b: 2,
        a: 1
      })
      expect(m).to.eq('a=1::b=2')
    })
  })

  describe('generateSSORequestParams()', () => {
    it('throws when PK is not provided', async () => {
      await expect(generateSSORequestParams()).to.throws
    })

    it('throws when PK is not valid', async () => {
      await expect(generateSSORequestParams('0x123')).to.throws
    })

    it('generates signature for SSO request', async () => {
      const { signature, ssoTimestamp } = await generateSSORequestParams(privateKey, { ssoTimestamp: 1602151787, redirectUrl: 'http', cancelUrl: 'http' })

      expect(signature).to.eq('0x225883a83c013f87f69c5ec45c1e1644562a261c194b2752458b6001d282dbbf60e95f5f335e84cbfc0ef8cf58d15d77cf73d124bc0c1791f0ab61a0b7e48aa31b')
      expect(ssoTimestamp).to.eq(1602151787)
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
      const { signature } = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: 'http',
        cancelUrl: 'http',
        refId: '',
        scope: ''
      })
      const data2 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: 'http',
        cancelUrl: 'http',
        refId: null,
        scope: null
      })
      const data3 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: 'http',
        cancelUrl: 'http',
        refId: undefined,
        scope: undefined
      })

      expect(signature).to.eq(data2.signature)
      expect(signature).to.eq(data3.signature)
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
    it('expect to fetch silkey public key', async () => {
      const m = await fetchSilkeyPublicKey(process.env.PROVIDER_URI, '0xcEf09Bdb5d73055bc52C55E81F1138f48bcc0eCc')
      expect(m).not.to.eq('0x0000000000000000000000000000000000000000')
      expect(m.length).to.eq(42)
    })
  })
})
