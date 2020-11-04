import chai from 'chai'
import { generateSSORequestParams, messageToSign } from '../src/sso.js'

const { expect } = chai

describe('sso.js', () => {
  // address: 0xDBF03b99664deb3C73045ac8933A6db89fefFf5F
  // this is random PK, please do not use it for anything else than this test
  const privateKey = '0x2c06e0037dacc4a831049ce0770f5f6f788827659a5842ed96d34c0631d5f6de'

  const t = Math.round(Date.now() / 1000)

  describe('messageToSign()', () => {
    it('generates empty message without data', () => {
      const m = messageToSign()
      expect(m).to.eq('')
    })

    it('generates message with data', () => {
      const m = messageToSign({
        a: 1,
        b: 2
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
      const { signature, message } = await generateSSORequestParams(privateKey, { timestamp: 1602151787 })

      expect(signature).to.eq('0xb7991dccf840cf5600c4d3d5506e7aeea5472562221eedfd405d12cb99acecc57672ec1c304e5530cdc909705fff3478c25471c0de20475cf5091b012300c0461b')
      expect(message).to.eq('cancelUrl=::redirectUrl=::refId=::scope=::timestamp=1602151787')
    })

    it('sets timestamp when not provided', async () => {
      const awaits = [
        generateSSORequestParams(privateKey),
        generateSSORequestParams(privateKey, { timestamp: null }),
        generateSSORequestParams(privateKey, { timestamp: '' })
      ]

      const results = await Promise.all(awaits)

      results.forEach(({ timestamp }) => {
        expect(timestamp).to.gte(t)
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
})
