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
      const { signature, sigTimestamp } = await generateSSORequestParams(privateKey, { sigTimestamp: 1602151787 })

      expect(signature).to.eq('0xb1185f29f9fb0bdddfad40a01dd904bc2a99b73041ff26e6288be0ff7a1f38e90e1b520cfb7dab7ae2ab439cd320bc13ce67e5d71b75a879f848c9ec169bf8ab1b')
      expect(sigTimestamp).to.eq(1602151787)
    })

    it('sets timestamp when not provided', async () => {
      const awaits = [
        generateSSORequestParams(privateKey),
        generateSSORequestParams(privateKey, { sigTimestamp: null }),
        generateSSORequestParams(privateKey, { sigTimestamp: '' })
      ]

      const results = await Promise.all(awaits)

      results.forEach(({ sigTimestamp }) => {
        expect(sigTimestamp).to.gte(t)
      })
    })

    it('generates same signature for null/empty data', async () => {
      const { signature } = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: '',
        refId: '',
        scope: ''
      })
      const data2 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: null,
        refId: null,
        scope: null
      })
      const data3 = await generateSSORequestParams(privateKey, {
        timestamp: 1,
        redirectUrl: undefined,
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
      const m = await fetchSilkeyPublicKey(process.env.PROVIDER_URI, '0x3acd1d20134A2B004d2fEbd685501d5fFBe419d5')
      expect(m).not.to.eq('0x0000000000000000000000000000000000000000')
      expect(m.length).to.eq(42)
    })
  })
})
