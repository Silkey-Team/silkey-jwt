import chai from 'chai'
import ethersjs from 'ethers'

import { toJwtPayload } from '../src/models/jwtPayload.js'
import { tokenPayloadVerifier, verifyUserSignature } from '../src/sso.js'

const { expect } = chai
const { ethers } = ethersjs

const validScopeIdToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImlkIiwic2lsa2V5U2lnbmF0dXJlIjpudWxsLCJzaWxrZXlTaWduYXR1cmVUaW1lc3RhbXAiOm51bGwsInVzZXJTaWduYXR1cmUiOiIweDcyMDM0M2I2OWY1YWZjNTY3ZjIwNmQ0YjBiMDJhMWQ3MjQ5ODUxNjlhYzk2YTIzMTY2NjUxODc2YjQwY2M1MzEyMWI4MmVkNzNmMTk1Nzc2MmI3NjI4ZjcwNGQ0NWRlZjBmYmQ2MmI5YzlkOTM5ZDcwM2YwM2YwZDQ4ZTJlOTZjMWMiLCJhZGRyZXNzIjoiMHgzRjE1OGY2YzczNDlDRDY5NzMyM2I4NDNkQWJiMGE3ODRkRDk4OTE2IiwidGltZXN0YW1wIjoxNjA0NTEzMTU5LCJpYXQiOjE2MDQ1MTMxNTl9.iccASnCA0XSun9c_Jxr9mNrrUMrSJ-2NtOsVVGpogtI'
const validScopeEmailToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImVtYWlsIiwic2lsa2V5U2lnbmF0dXJlIjoiMHhkM2U1MTdlZjc4NDk4ZDM5ZTUyNzdkMGE5NzQzZjQ4YmRhZTY2ZmIzY2Y2MTJlYTkzZDU0NmY5ZWJkMmM3YmE1NzMyZDI0OWFmZTNlNDRmZjFmNTNlZGJkODQzODUzYzRlNmYwY2UxYjYyYjJmODcyMzQ1M2M2MzUxYjllMjU3ZjFiIiwic2lsa2V5U2lnbmF0dXJlVGltZXN0YW1wIjoxNjA0NTEzMTU5LCJ1c2VyU2lnbmF0dXJlIjoiMHhiYzc5MmYyNTA4ZDlmOGRhMDhmZmIyNDM3Nzk5Y2NkZWNiMGVjNmI1YzAzNTAwMjc3ZThmZmZkNDczMTg3MDdhNzk5YjU1MTAzYjFjZmU0Yjg1ZGFlNzZmMDEwZDI2YjEwMTQzZTNkMDQ4MTc2ZWY2YzFjNGE1MGI2Mjg1MmU3YTFjIiwiYWRkcmVzcyI6IjB4N2VCOGFGRTQzNzc5NDQ2Njg2NDAwNTYzOGQyNzg5NmRBOEQ0Q2Y3YiIsImVtYWlsIjoiYWxpYXNJZEBwcml2YXRlcmVsYXkiLCJ0aW1lc3RhbXAiOjE2MDQ1MTMxNTksImlhdCI6MTYwNDUxMzE1OX0.Qc4sZluSz-by3dbmUvxcvHrGZ4QwHqey__6685C6pS0'
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjB4NjNmNUY0YjUzNjE3MTBiYzViMThBZTYyZGJjQzRkRTFiNjY0RjlCNEBwcml2YXRlcmVsYXkuc2lsa2V5LmlvIiwiYWRkcmVzcyI6IjB4RTIxNDA3ZDc4Q0FkQzQzNDczNTZGMjhiM0U2Mjc1NDM5MzM5RDA4NCIsInNpZ25hdHVyZSI6eyJyIjoiMHgyNmUxZGM0MzA4ZTViMDRiNGVhZWVlNzI0MWYwMjgzOTM0ZTgzYmE1OTMzYjM5NThkOTIyYmRiNmRkOTgzOTc3IiwicyI6IjB4MmMyOGQ2YmZmZWMxYThjOTFlNDFlODJjMWJjMzBmYzZkMTNjYzljNDk1Y2ZhNzQ3MjUzNzQ4OTVlMzhiZTdmNSIsIl92cyI6IjB4YWMyOGQ2YmZmZWMxYThjOTFlNDFlODJjMWJjMzBmYzZkMTNjYzljNDk1Y2ZhNzQ3MjUzNzQ4OTVlMzhiZTdmNSIsInJlY292ZXJ5UGFyYW0iOjEsInYiOjI4fSwiaWF0IjoxNjAyMTQ1MzU2fQ.kmmHfO7mGpHsoZoRcAis373rwNDyyzj3rT0-nbiJmN4'

describe('verifyUserSignature()', function () {
  it('expect to return false when user signature not exists', function () {
    expect(verifyUserSignature(toJwtPayload({}))).to.be.false
  })

  it('expect to return false when user signature NOT valid', function () {
    const payload = toJwtPayload({
      address: '0xeC147F4bdEF4d1690A98822940548713f91567E4',
      userSignature: '0x24a1a2156e3bb590f683bdb2ac35e9c0d66006b7d7424229577b2e74e1905ca71fbd10227299e170dba55abc06074001e5cade5dfe68b3e5f5d914106f1d750f1b'
    })
    expect(verifyUserSignature(payload)).to.be.false
  })

  it('expect to return false when address not set', function () {
    const payload = toJwtPayload({
      address: '',
      userSignature: '0x24a1a2156e3bb590f683bdb2ac35e9c0d66006b7d7424229577b2e74e1905ca71fbd10227299e170dba55abc06074001e5cade5dfe68b3e5f5d914106f1d750f1b'
    })

    expect(verifyUserSignature(payload)).to.be.false
  })

  it('expect to return TRUE when user signature valid', async () => {
    // eslint-disable-next-line new-cap
    const wallet = new ethers.Wallet.createRandom()
    const payload = toJwtPayload({
      address: await wallet.getAddress(),
      email: 'a@c',
      scope: 'email'
    })
    const sig = await wallet.signMessage(payload.messageToSignByUser())
    payload.setUserSignature(sig.toString())

    expect(verifyUserSignature(payload)).to.be.true
  })
})

describe('tokenPayloadVerifier()', function () {
  it('validates token for scope ID and returns payload', function () {
    const payload = tokenPayloadVerifier(validScopeIdToken)
    expect(payload).not.to.be.null

    const { address } = payload
    expect(address).not.to.undefined
  })

  it('validates token for scope Email and returns payload', function () {
    const payload = tokenPayloadVerifier(validScopeEmailToken, '0xDBF03b99664deb3C73045ac8933A6db89fefFf5F')
    expect(payload).not.to.be.null

    const { address, email, silkeySignature, silkeySignatureTimestamp } = payload
    expect(address).not.to.undefined
    expect(email).not.to.undefined
    expect(silkeySignature).not.to.undefined
    expect(silkeySignatureTimestamp).not.to.undefined
  })

  it('returns null when token invalid', function () {
    const payload = tokenPayloadVerifier(invalidToken)
    expect(payload).to.be.null
  })
})
