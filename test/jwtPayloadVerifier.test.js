import chai from 'chai'
import ethersjs from 'ethers'

import { toJwtPayload } from '../src/models/jwtPayload.js'
import { tokenPayloadVerifier, verifyUserSignature } from '../src/sso.js'

const { expect } = chai
const { ethers } = ethersjs

const validScopeIdToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImlkIiwic2lsa2V5U2lnbmF0dXJlIjpudWxsLCJzaWxrZXlTaWduYXR1cmVUaW1lc3RhbXAiOm51bGwsInVzZXJTaWduYXR1cmUiOiIweGM5ZDgyODdkYTIzMDQyMjVjZjEwNDBhNzIwNTVjYmRlYzIxNzA5YjcwYjMwZTM4NGQ2ZTRiMTM0MjJlZTIxOTE3ODQwMzM0MjgyOGE4NTBkYzQ0OTc4MmM5MzVjYTFiYzcwMzNmZDg5YzMxMzIwMjg2OGIyOTM5YjJkMDU0MzBmMWMiLCJ1c2VyU2lnbmF0dXJlVGltZXN0YW1wIjoxNjA0Njg4ODY1LCJhZGRyZXNzIjoiMHhjZkE2YkVEN0I1NjgxQ0ZhM0FkRjUzYkYzMWVCM2NkMDY5OTNjQURlIiwiaWF0IjoxNjA0Njg4ODY1fQ.qBHwJWbb65qT4tmux_8l1dVVgYYsLG7FvIrfZs15yCo'
const validScopeEmailToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImVtYWlsIiwic2lsa2V5U2lnbmF0dXJlIjoiMHhjMmQwOGZjYjA0MmRmNjEzNzgwMTQ1NzljOTQ4ZmQxMjEwNGVkNTkxYjkyMTIzYTQ3NWMxMjQ5Mjg2YzI5MWNjMGRjNzlmMTU1MmM4MTMyODA3NGU5OTYyYmVmNzI4YmVlMjBmMzZmNTNiOWY1ZWU0OWFmOWRiZjY4NjEwNDQ0YzFjIiwic2lsa2V5U2lnbmF0dXJlVGltZXN0YW1wIjoxNjA0Njg4ODY1LCJ1c2VyU2lnbmF0dXJlIjoiMHg5MGQ1N2Q2NTA5NDQ2YjhhNGUyN2VlMGFjZTI1MjUyYmVhYTNhZGNlMDE1NzNmZmY4NzBjYTAzZTE0ZjBiYjQ3MmQ3MDM4MjVlMWM3M2UwZmY4YzcwNGI1NGMyMDI4ZTZkN2YxZjhiNmExZjAzNTkwZDFiZWYwY2E1MGVhMTY5NjFiIiwidXNlclNpZ25hdHVyZVRpbWVzdGFtcCI6MTYwNDY4ODg2NSwiYWRkcmVzcyI6IjB4MEEzNEFCNzJkMjMxMDY1YjVmOTcxRkE3YTRFNzVlMjA1N0EzOEM1NiIsImVtYWlsIjoiYWxpYXNJZEBwcml2YXRlcmVsYXkiLCJpYXQiOjE2MDQ2ODg4NjV9.hYsP5aBz_BlWxy5HaQYHllWie1ovunYNKHGAjt_u_No'
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

  it('expect to return FALSE when user signature timestamp invalid', async () => {
    // eslint-disable-next-line new-cap
    const wallet = new ethers.Wallet.createRandom()
    const payload = toJwtPayload({ address: await wallet.getAddress(), scope: 'id' })
    payload.userSignatureTimestamp = 123
    const sig = await wallet.signMessage(payload.messageToSignByUser())
    payload.setUserSignature(sig.toString(), 111)

    expect(verifyUserSignature(payload)).to.be.false
  })

  it('expect to return TRUE when user signature valid', async () => {
    // eslint-disable-next-line new-cap
    const wallet = new ethers.Wallet.createRandom()
    const payload = toJwtPayload({ address: await wallet.getAddress(), email: 'a@c', scope: 'email' })
    payload.userSignatureTimestamp = 123
    const sig = await wallet.signMessage(payload.messageToSignByUser())
    payload.setUserSignature(sig.toString(), payload.userSignatureTimestamp)

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
