import {assert, expect} from 'chai'
import {JwtPayload} from '../../src/models/'
import {expectThrows} from '../utils/utils'
import {currentTimestamp} from '../../src/utils/helpers'

const address = `0x${'1'.repeat(40)}`

const timestamp = currentTimestamp()

describe('JwtPayload', () => {
  it('creates JwtPayload object', () => {
    const payload = new JwtPayload()
    expect(payload).to.be.instanceOf(JwtPayload)
  })

  it('setScope() sets in order', () => {
    const payload = new JwtPayload()
      .setScope('c')
      .setScope('b,z')
      .setScope('b')
      .setScope('a')

    expect(payload.scope).to.eql('a,b,c,z')
    expect(payload.getScope()).to.eql('a,b,c,z'.split(','))
  })

  describe('.messageToSignByUser()', () => {
    it('expect message to include migration flag', () => {
      const msg = Buffer.from(new JwtPayload().messageToSignByUser(), 'hex').toString('utf-8')
      expect(msg).to.eq('addressmigration\u0000scopeuserSignatureTimestamp\u0000')
    })

    it('expect to return message for empty object', () => {
      const payload = new JwtPayload()

      expect(payload.messageToSignByUser())
        .to.eq('616464726573736d6967726174696f6e0073636f7065757365725369676e617475726554696d657374616d7000')
    })

    it('expect to return message when data is set', () => {
      const payload = new JwtPayload()
        .setEmail('a@b.c')
        .setScope('email')
        .setAddress(address)
        .setUserSignature(`0x${'1'.repeat(130)}`, 1234567890)

      expect(payload.messageToSignByUser()).to.eq('616464726573731111111111111111111111111111111111111111' +
        '6d6967726174696f6e0073636f7065656d61696c757365725369676e617475726554696d657374616d70499602d2')
    })
  })

  describe('.messageToSignBySilkey()', () => {
    it('expect to be empty when email is empty', () => {
      const payload = new JwtPayload()
      expect(payload.messageToSignBySilkey()).to.eq('')
    })

    it('expect to return message when email is set', () => {
      const payload = new JwtPayload().setEmail('a@b.c')
      const msg = payload.messageToSignBySilkey()
      expect(msg.length).to.eq(18, 'timestamp should be set when empty')
      expect(msg.slice(0, -8)).to.eq('6140622e63')
    })
  })

  describe('.set_Signature()', () => {
    it('setUserSignature', () => {
      const payload = new JwtPayload().setUserSignature('0'.repeat(130), timestamp)
      expect(payload.userSignature).to.eq('0'.repeat(130))
      expect(payload.userSignatureTimestamp).to.eq(timestamp)
    })

    it('setSilkeySignature', () => {
      const payload = new JwtPayload()
      payload.setSilkeySignature('0'.repeat(130), timestamp)
      expect(payload.silkeySignature).to.eq('0'.repeat(130))
      expect(payload.silkeySignatureTimestamp).to.eq(timestamp)
    })
  })

  describe('.export()', () => {
    it('exports data without silkey sig', () => {
      const payload = new JwtPayload()
        .setUserSignature(('0'.repeat(130)), timestamp)
        .export()

      expect(payload).not.to.be.instanceOf(JwtPayload)
      expect(payload.userSignatureTimestamp).not.be.undefined
    })

    it('exports data wth silkey sig', () => {
      const sig = '0'.repeat(130)

      const payload = new JwtPayload()
        .setUserSignature(sig, timestamp)
        .setSilkeySignature(sig, timestamp)
        .export()

      expect(payload).not.to.be.instanceOf(JwtPayload)
      expect(payload.silkeySignature).to.eq(sig)
      expect(payload.userSignature).to.eq(sig)
      expect(payload.silkeySignatureTimestamp).to.eq(timestamp)
      expect(payload.userSignatureTimestamp).to.eq(timestamp)
    })
  })


  describe('.validate()', async () => {
    describe('scope:id', async () => {
      it('validates when required data present', () => {
        const payload = new JwtPayload()
          .setScope('id')
          .setAddress(address)
          .setUserSignature('0'.repeat(130), timestamp)
        assert.doesNotThrow(() => payload.validate())
      })

      it('throws when required data present', () => {
        const payload = new JwtPayload()
        expectThrows(() => payload.validate(), Error, 'address is invalid: ')

        payload.setScope('id')
        expectThrows(() => payload.validate(), Error, 'address is invalid: ')

        payload.setAddress(address)
        expectThrows(() => payload.validate(), Error, 'userSignature is invalid: ')

        payload.setUserSignature('0'.repeat(130), timestamp)
        assert.doesNotThrow(() => payload.validate())
      })
    })

    describe('scope:email', async () => {
      it('validates when required data present', () => {
        const payload = new JwtPayload()
          .setScope('email')
          .setAddress(address)
          .setUserSignature('0'.repeat(130), timestamp)
          .setSilkeySignature('0'.repeat(130), timestamp)
          .setEmail('a@b')
        assert.doesNotThrow(() => payload.validate())
      })

      it('throws when required data present', () => {
        const payload = new JwtPayload()
        expectThrows(() => payload.validate(), Error, 'address is invalid: ')

        payload.setScope('email')
        expectThrows(() => payload.validate(), Error, 'address is invalid: ')

        payload.setAddress(address)
        expectThrows(() => payload.validate(), Error, 'userSignature is invalid: ')

        payload.setUserSignature('0'.repeat(130), timestamp)
        expectThrows(() => payload.validate(), Error, 'email is invalid: ')

        payload.setEmail('a@b')
        expectThrows(() => payload.validate(), Error, 'silkeySignature is invalid: ')

        payload.setSilkeySignature('0'.repeat(130), timestamp)
        assert.doesNotThrow(() => payload.validate())
      })
    })
  })

  describe('.import()', () => {
    it('creates JwtPayload object from standard object', () => {
      const payload = JwtPayload.import({userSignature: 1, silkeySignature: 3})

      expect(payload).to.be.instanceOf(JwtPayload)
      expect(payload.userSignature).to.eq(1)
      expect(payload.silkeySignature).to.eq(3)
    })

    it('can NOT be reference to original object', () => {
      const ori = new JwtPayload().setScope('email')
      const payload = JwtPayload.import(ori)
      payload.setScope('id')

      expect(ori.scope).to.eq('email')
      expect(payload.scope).to.eq('email,id')
    })
  })
})
