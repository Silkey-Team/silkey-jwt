import chai from 'chai'
import ethersjs from 'ethers'

import { toJwtPayload } from '../src/models/jwtPayload.js'
import { tokenPayloadVerifier, verifyUserSignature } from '../src/sso.js'

const { expect } = chai
const { ethers } = ethersjs

const validScopeIdToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImlkIiwic2lsa2V5U2lnbmF0dXJlIjpudWxsLCJ1c2VyU2lnbmF0dXJlIjoiMHhlZDYxODU1YjA4OTYyNDQ0MzljNzBjYTkwMzMxNGJhY2Y3MzZlZDE4YWE0ZWY1ZDA1YWMzZjMyOGMxMGFiOWY5NjA2MTgwYTRhNzgzN2U4NTExYTkyNzM1MWJiOWEzZGExMWJkZDUwY2IwMzMyYTFhOTU2NWFmNzhhNjljZGI5MDFjIiwiYWRkcmVzcyI6IjB4M0Y2ZDc0QTY2Y2YwMTQ5OTk2NDc2RjhCMEMyNUQwRkEyNjMwZDFFQyIsInRpbWVzdGFtcCI6MTYwMzk3ODU5NSwiaWF0IjoxNjAzOTc4NTk0fQ.vqW8s89alI-S38gnnDdDaH-6__zPzPvMQHgTZlG0f3Q'
const validScopeEmailToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImVtYWlsIiwic2lsa2V5U2lnbmF0dXJlIjoiMHgyMzMzMTk2YzU3YWNlMzE3ZDQzNmIyOTEyYWNkZTIxMDExNGRjYjE3Yzg2NGVjYTdhYzVhMTRkNTcyOTIzZjEzNjZkMDhhMzYwOWFkN2ViOTFkYTNmMDUzYTI4NDY4MGViNDU4NTFkNmRkZTMwODNiMWNhMGEzZGU5NTc1MTRkYTFjIiwidXNlclNpZ25hdHVyZSI6IjB4MjlkM2E5N2RiNWYwZjFhMjA0NjAxNWRkYzQ1ODc2Njg1NmY5NzM2NDZkNGQ1ZjRjN2NlZDY0Njg5ODk4MmQ3ZDRhYjFjOWE2ZjM5NDJjNjAxZjVjYjY3NTE0NjA0YWExN2ZlYmJkNjk1ZDQyMmVhMTQzMjY0OGQ1ZDM1MWRiNTUxYiIsImFkZHJlc3MiOiIweDhCYzJiQWJFNjRGQWUxYkVBZDFkMjJCQ0Q5MjU1MzNGQzdCMzI4YjgiLCJlbWFpbCI6IjB4OEJjMmJBYkU2NEZBZTFiRUFkMWQyMkJDRDkyNTUzM0ZDN0IzMjhiOEBwcml2YXRlcmVsYXkuc2lsa2V5LmlvIiwidGltZXN0YW1wIjoxNjAzOTgyMDY2LCJpYXQiOjE2MDM5ODIwNjZ9.5ZGKCenDOiJoZKt7nl2e3cTJYCutDCbiw760MLQVZHc'
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
    const payload = tokenPayloadVerifier(validScopeEmailToken, '0x8Bc2bAbE64FAe1bEAd1d22BCD925533FC7B328b8')
    expect(payload).not.to.be.null

    const { address, email } = payload
    expect(address).not.to.undefined
    expect(email).not.to.undefined
  })

  it('returns null when token invalid', function () {
    const payload = tokenPayloadVerifier(invalidToken)
    expect(payload).to.be.null
  })
})
