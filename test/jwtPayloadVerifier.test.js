import chai from 'chai'
import ethersjs from 'ethers'

import { publicKey } from './keys.js'
import { invalidToken, validScopeEmailToken, validScopeIdToken } from './tokens.js'
import { toJwtPayload } from '../src/models/jwtPayload.js'
import { tokenPayloadVerifier, verifySilkeySignature, verifyUserSignature } from '../src/sso.js'

const { expect } = chai
const { ethers } = ethersjs

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
    const payload = toJwtPayload({
      address: await wallet.getAddress(),
      scope: 'id'
    })
    payload.userSignatureTimestamp = 123
    const sig = await wallet.signMessage(payload.messageToSignByUser())
    payload.setUserSignature(sig.toString(), 111)

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
    payload.userSignatureTimestamp = 123
    const sig = await wallet.signMessage(payload.messageToSignByUser())
    payload.setUserSignature(sig.toString(), payload.userSignatureTimestamp)

    expect(verifyUserSignature(payload)).to.be.true
  })
})

describe('verifySilkeySignature()', function () {
  it('expect to return null when email and sig empty', function () {
    expect(verifySilkeySignature(toJwtPayload({}))).to.be.null
  })

  it('expect to return FALSE when email xor silkeySignature empty', function () {
    expect(verifySilkeySignature(toJwtPayload({ email: 'a' }))).to.be.false
    expect(verifySilkeySignature(toJwtPayload({ silkeySignature: 'a' }))).to.be.false
    expect(verifySilkeySignature(toJwtPayload({
      silkeySignature: 'a',
      email: 'a'
    }))).to.be.false
  })

  it('expect to return TRUE', function () {
    const payload = toJwtPayload({
      email: 'aliasId@privaterelay',
      silkeySignature: '0x228b203190b5c1f764e3a5a830bf40702fa1ebed3ce67734a38fb40b8da99ce97218238371ca93f3c8501348b520b1a5399f4cf39995ccbcd48b4fffe48aa7ca1b',
      silkeySignatureTimestamp: 1605290733
    })

    expect(verifySilkeySignature(payload)).to.be.true
    expect(verifySilkeySignature(payload, publicKey)).to.be.true
  })

  it('expect to return FALSE if public key do not match', function () {
    const payload = toJwtPayload({
      email: 'aliasId@privaterelay',
      silkeySignature: '0x228b203190b5c1f764e3a5a830bf40702fa1ebed3ce67734a38fb40b8da99ce97218238371ca93f3c8501348b520b1a5399f4cf39995ccbcd48b4fffe48aa7ca1b',
      silkeySignatureTimestamp: 1605290733
    })

    expect(verifySilkeySignature(payload, '0x6F2c3d07d43aE3c48793507999e7953480D5749E')).to.be.false
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
