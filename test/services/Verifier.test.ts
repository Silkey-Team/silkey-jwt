import {expectNotToThrowsAsync, expectThrowsAsync} from '../utils/utils'
import {Verifier} from '../../src/services/Verifier'
import {JwtPayload, SSOParams} from '../../src/models'
import {expect} from 'chai'
import {publicKey, webPublicKey} from '../keys'
import {callbackParamsForId} from '../tokens'
import {ethers} from 'ethers'

describe('Verifier', () => {
  describe('.assertRequiredParamsForScope()', () => {
    describe('expect NOT throw', () => {
      ['id', ['id'], ',id,', 'id,id'].forEach(scope => {
        it(`scope=${scope}`, async () => {
          await expectNotToThrowsAsync(() => Verifier.assertRequiredParamsForScope(scope, {address: '1'}))
        })
      });

      ['email', 'email,id', ['email', 'id'], ',id,email,'].forEach(scope => {
        it(`scope=${scope}`, async () => {
          await expectNotToThrowsAsync(() => Verifier.assertRequiredParamsForScope(scope, {address: '1', email: 'e'}))
        })
      })
    })

    describe('throws when', () => {
      it('scope not supported', async () => {
        await expectThrowsAsync(() => Verifier.assertRequiredParamsForScope('', {}), Error, 'scope is empty')

        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope('?', {}),
          Error,
          'scope `?` is not supported'
        )
      })

      it('scope:id and missing address', async () => {
        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope('id', {}),
          Error,
          '`address` parameter is required for selected scope: id'
        )
      })

      it('scope:email and missing address', async () => {
        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope('email', {}),
          Error,
          '`address` parameter is required for selected scope: email'
        )
      })

      it('scope:email and missing address', async () => {
        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope('email', {address: 'a'}),
          Error,
          '`email` parameter is required for selected scope: email'
        )
      })

      it('empty scope', async () => {
        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope('', {address: 'a'}), Error, 'scope is empty'
        )
        await expectThrowsAsync(
          () => Verifier.assertRequiredParamsForScope([], {address: 'a'}), Error, 'scope is empty'
        )
      })
    })
  })

  describe('.verifyWebsiteSignature()', () => {
    const callbackParams = SSOParams.import({...callbackParamsForId, ssoSignature: ''})

    it('expect to return false when website signature not exists', () => {
      expect(Verifier.verifyWebsiteSignature(JwtPayload.import({}), callbackParams, webPublicKey)).to.be.false
    })

    it('expect to be truee when sig match', () => {
      const jwtPayload = new JwtPayload().setScope('id').setAddress(webPublicKey)
      expect(Verifier.verifyWebsiteSignature(jwtPayload, callbackParamsForId, webPublicKey)).to.be.true
    })
  })

  describe('.verifyUserSignature()', () => {
    it('expect to return false when user signature not exists', () => {
      expect(Verifier.verifyUserSignature(JwtPayload.import({}))).to.be.false
    })

    it('expect to return false when user signature NOT valid', () => {
      const payload = JwtPayload.import({
        address: '0xeC147F4bdEF4d1690A98822940548713f91567E4',
        userSignature: '0x24a1a2156e3bb590f683bdb2ac35e9c0d66006b7d7424229577b2e74e1905ca71fbd10227299e170dba55abc060' +
          '74001e5cade5dfe68b3e5f5d914106f1d750f1b'
      })
      expect(Verifier.verifyUserSignature(payload)).to.be.false
    })

    it('expect to return false when address not set', () => {
      const payload = JwtPayload.import({
        address: '',
        userSignature: '0x24a1a2156e3bb590f683bdb2ac35e9c0d66006b7d7424229577b2e74e1905ca71fbd10227299e170dba55abc060' +
          '74001e5cade5dfe68b3e5f5d914106f1d750f1b'
      })

      expect(Verifier.verifyUserSignature(payload)).to.be.false
    })

    it('expect to return FALSE when user signature timestamp invalid', async () => {
      // eslint-disable-next-line new-cap
      const wallet = ethers.Wallet.createRandom()
      const payload = JwtPayload.import({
        address: await wallet.getAddress(),
        scope: 'id'
      })
      payload.userSignatureTimestamp = 123
      const sig = await wallet.signMessage(payload.messageToSignByUser())
      payload.setUserSignature(sig.toString(), 111)

      expect(Verifier.verifyUserSignature(payload)).to.be.false
    })

    it('expect to return TRUE when user signature valid', async () => {
      // eslint-disable-next-line new-cap
      const wallet = ethers.Wallet.createRandom()

      const payload = JwtPayload.import({
        address: await wallet.getAddress(),
        email: 'a@c',
        scope: 'email',
        userSignatureTimestamp: 123
      })

      const sig = await wallet.signMessage(payload.messageToSignByUser())
      payload.setUserSignature(sig.toString(), payload.userSignatureTimestamp)

      expect(Verifier.verifyUserSignature(payload)).to.be.true
    })
  })

  describe('.verifySilkeySignature()', () => {
    it('expect to return null when email and sig empty', () => {
      expect(Verifier.verifySilkeySignature(JwtPayload.import({}))).to.be.null
    })

    it('expect to return FALSE when email xor silkeySignature empty', () => {
      expect(Verifier.verifySilkeySignature(JwtPayload.import({email: 'a'}))).to.be.false
      expect(Verifier.verifySilkeySignature(JwtPayload.import({silkeySignature: 'a'}))).to.be.false
      expect(Verifier.verifySilkeySignature(JwtPayload.import({
        silkeySignature: 'a',
        email: 'a'
      }))).to.be.false
    })

    it('expect to return TRUE', () => {
      const payload = JwtPayload.import({
        email: 'aliasId@privaterelay',
        silkeySignature: '0x228b203190b5c1f764e3a5a830bf40702fa1ebed3ce67734a38fb40b8da99ce97218238371ca93f3c850134' +
          '8b520b1a5399f4cf39995ccbcd48b4fffe48aa7ca1b',
        silkeySignatureTimestamp: 1605290733
      })

      expect(Verifier.verifySilkeySignature(payload)).to.be.true
      expect(Verifier.verifySilkeySignature(payload, publicKey)).to.be.true
    })

    it('expect to return FALSE if public key do not match', () => {
      const payload = JwtPayload.import({
        email: 'aliasId@privaterelay',
        silkeySignature: '0x228b203190b5c1f764e3a5a830bf40702fa1ebed3ce67734a38fb40b8da99ce97218238371ca93f3c8501348b' +
          '520b1a5399f4cf39995ccbcd48b4fffe48aa7ca1b',
        silkeySignatureTimestamp: 1605290733
      })

      expect(Verifier.verifySilkeySignature(payload, '0x6F2c3d07d43aE3c48793507999e7953480D5749E')).to.be.false
    })
  })
})
