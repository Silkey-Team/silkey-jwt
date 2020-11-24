import chai from 'chai'
import { JwtPayload, toJwtPayload } from '../src/models/jwtPayload.js'

const { expect, assert } = chai

const currentTimestamp = Math.round(Date.now() / 1000)

const address = `0x${'1'.repeat(40)}`

describe('JwtPayload()', () => {
  it('creates JwtPayload object', () => {
    const payload = new JwtPayload()

    expect(payload).to.be.instanceOf(JwtPayload)
    expect(payload.userSignature).not.to.be.undefined
    expect(payload.silkeySignature).not.to.be.undefined
  })

  it('setScope() sets in order', () => {
    const payload = new JwtPayload()
      .setScope('c')
      .setScope('b')
      .setScope('a')

    expect(payload.scope).to.eq('a,b,c')
  })

  it('messageToSignByUser() for empty object', () => {
    const payload = new JwtPayload()
    expect(payload.messageToSignByUser()).to.eq('61646472657373726566496473636f7065757365725369676e617475726554696d657374616d70')
  })

  it('messageToSignByUser()', () => {
    const payload = new JwtPayload()
      .setRefId('0xabc')
      .setEmail('a@b.c')
      .setScope('email')
      .setAddress(address)
      .setUserSignature(`0x${'1'.repeat(130)}`, 1234567890)

    expect(payload.messageToSignByUser()).to.eq('6164647265737311111111111111111111111111111111111111117265664964307861626373636f7065656d61696c757365725369676e617475726554696d657374616d70499602d2')
  })

  it('messageToSignBySilkey() for empty data', () => {
    const payload = new JwtPayload()
    expect(payload.messageToSignBySilkey()).to.eq('')
  })

  it('messageToSignBySilkey() for set data', () => {
    const payload = new JwtPayload()
      .setEmail('a@b.c')

    const msg = payload.messageToSignBySilkey()
    expect(msg.length).to.eq(18)
    expect(msg.slice(0, -8)).to.eq('6140622e63')
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
