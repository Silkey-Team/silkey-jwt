import chai from 'chai'
import { JwtPayload, toJwtPayload } from '../src/models/jwtPayload.js'

const { expect } = chai

describe('JwtPayload()', () => {
  it('creates JwtPayload object', () => {
    const payload = new JwtPayload()

    expect(payload).to.be.instanceOf(JwtPayload)
    expect(payload.userSignature).not.to.be.undefined
    expect(payload.silkeySignature).not.to.be.undefined
  })

  it('setTimestamp()', () => {
    const payload = new JwtPayload().setTimestamp()
    expect(payload.timestamp).not.to.be.undefined
  })

  it('setUserSignature()', () => {
    const payload = new JwtPayload().setUserSignature('0'.repeat(130))
    expect(payload.userSignature).to.eq('0'.repeat(130))
  })

  it('export()', () => {
    const payload = new JwtPayload().setUserSignature(('0'.repeat(130))).setRefId('id').setTimestamp().export()
    expect(payload).not.to.be.instanceOf(JwtPayload)
    expect(payload.refId).to.eq('id')
    expect(payload.timestamp).not.be.undefined
  })
})

describe('toJwtPayload()', () => {
  it('creates JwtPayload object from standard object', () => {
    const payload = toJwtPayload({ userSignature: 1, silkeySignature: 3 })

    expect(payload).to.be.instanceOf(JwtPayload)
    expect(payload.userSignature).to.eq(1)
    expect(payload.silkeySignature).to.eq(3)
  })
})
