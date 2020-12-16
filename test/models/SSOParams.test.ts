import {expect} from 'chai'
import {SSOParams} from '../../src/models'
import {expectThrows} from '../utils/utils'

describe('SSOParams', () => {
  describe('.import()', () => {
    it('expect create SSOParams object', () => {
      const w = SSOParams.import()
      expect(w).to.be.instanceOf(SSOParams)
    })

    it('expect non imported params stay undefined', () => {
      const w = SSOParams.import({ssoRedirectUrl: ''})
      expect(w.ssoRedirectUrl).to.eql('')
      expect(w.ssoRedirectMethod).to.eql(undefined)
    })

    it('expect copy values', () => {
      const w = SSOParams.import({ssoScope: 'id'})
      expect(w).to.be.instanceOf(SSOParams)
      expect(w.ssoScope).to.eq('id')
    })
  })

  describe('hasRequired()', () => {
    it('expect to return FALSE when missing required parameters', () => {
      expectThrows(
        () => SSOParams.import().validate(),
        Error,
        'This parameters are required for Silkey SSO: ssoSignature, ssoRedirectUrl, ssoCancelUrl, ssoTimestamp'
      )

      expectThrows(
        () => SSOParams.import({ssoSignature: '1'}).validate(),
        Error,
        'This parameters are required for Silkey SSO: ssoSignature, ssoRedirectUrl, ssoCancelUrl, ssoTimestamp'
      )

      expectThrows(
        () => SSOParams.import({ssoSignature: '1', ssoRedirectUrl: '2'}).validate(),
        Error,
        'This parameters are required for Silkey SSO: ssoSignature, ssoRedirectUrl, ssoCancelUrl, ssoTimestamp'
      )
    })

    it('expect to return TRUE when required parameters are set', () => {
      expect(SSOParams.import({
        ssoSignature: '1',
        ssoRedirectUrl: '2',
        ssoCancelUrl: 'http',
        ssoTimestamp: '3'
      }).validate())
    })
  })

  describe('export()', () => {
    it('expect to export not null keys/values only', () => {
      const nonEmptyVals = {
        ssoSignature: '1',
        ssoRedirectUrl: '2',
        ssoCancelUrl: 'http',
        ssoTimestamp: '3'
      }

      expect(SSOParams.import(nonEmptyVals).export()).to.be.eql({...nonEmptyVals, ssoScope: 'id'})
    })
  })
})
