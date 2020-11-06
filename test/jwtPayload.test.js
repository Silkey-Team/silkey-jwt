import chai from 'chai'
import { JwtPayload, toJwtPayload } from '../src/models/jwtPayload.js'

const { expect, assert } = chai

const currentTimestamp = Math.round(Date.now() / 1000)

const address = '0xDBF03b99664deb3C73045ac8933A6db89fefFf5F'

describe('JwtPayload()', () => {
  it('creates JwtPayload object', () => {
    const payload = new JwtPayload()

    expect(payload).to.be.instanceOf(JwtPayload)
    expect(payload.userSignature).not.to.be.undefined
    expect(payload.silkeySignature).not.to.be.undefined
  })

  it('setUserSignature()', () => {
    const payload = new JwtPayload().setUserSignature('0'.repeat(130), currentTimestamp)
    expect(payload.userSignature).to.eq('0'.repeat(130))
  })

  it('export()', () => {
    const payload = new JwtPayload()
      .setUserSignature(('0'.repeat(130)), currentTimestamp)
      .setRefId('id')
      .export()

    expect(payload).not.to.be.instanceOf(JwtPayload)
    expect(payload.refId).to.eq('id')
    expect(payload.userSignatureTimestamp).not.be.undefined
  })

  it('export() #2', () => {
    const payload = new JwtPayload()
      .setUserSignature(('0'.repeat(130)), currentTimestamp)
      .setSilkeySignature(('0'.repeat(130)), currentTimestamp)
      .setRefId('id')
      .export()

    expect(payload).not.to.be.instanceOf(JwtPayload)
    expect(payload.refId).to.eq('id')
    expect(payload.silkeySignature).not.be.undefined
    expect(payload.silkeySignatureTimestamp).not.be.undefined
  })
})

describe('validate()', async () => {
  describe('scope:id', async () => {
    it('validates when required data present', () => {
      const payload = new JwtPayload()
        .setScope('id')
        .setAddress(address)
        .setUserSignature('0'.repeat(130), currentTimestamp)
      assert.doesNotThrow(() => payload.validate())
    })

    it('throws when required data present', () => {
      const payload = new JwtPayload()
      assert.throws(() => payload.validate(), Error)

      payload.setScope('id')
      assert.throws(() => payload.validate(), Error)

      payload.setAddress(address)
      assert.throws(() => payload.validate(), Error)

      payload.setUserSignature('0'.repeat(130), currentTimestamp)
      assert.doesNotThrow(() => payload.validate())
    })
  })

  describe('scope:email', async () => {
    it('validates when required data present', () => {
      const payload = new JwtPayload()
        .setScope('email')
        .setAddress(address)
        .setUserSignature('0'.repeat(130), currentTimestamp)
        .setSilkeySignature('0'.repeat(130), currentTimestamp)
        .setEmail('a@b')
      assert.doesNotThrow(() => payload.validate())
    })

    it('throws when required data present', () => {
      const payload = new JwtPayload()
      assert.throws(() => payload.validate(), Error)

      payload.setScope('email')
      assert.throws(() => payload.validate(), Error)

      payload.setAddress(address)
      assert.throws(() => payload.validate(), Error)

      payload.setUserSignature('0'.repeat(130), currentTimestamp)
      assert.throws(() => payload.validate(), Error)

      payload.setEmail('a@b')
      assert.throws(() => payload.validate(), Error)

      payload.setSilkeySignature('0'.repeat(130), currentTimestamp)
      assert.doesNotThrow(() => payload.validate())
    })
  })
})

describe('toJwtPayload()', () => {
  it('creates JwtPayload object from standard object', () => {
    const payload = toJwtPayload({
      userSignature: 1,
      silkeySignature: 3
    })

    expect(payload).to.be.instanceOf(JwtPayload)
    expect(payload.userSignature).to.eq(1)
    expect(payload.silkeySignature).to.eq(3)
  })
})
