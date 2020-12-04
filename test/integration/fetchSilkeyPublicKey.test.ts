import * as dotenv from 'dotenv'
import {expect} from 'chai'
import {fetchSilkeyPublicKey} from '../../src/services/sso'

dotenv.config()

describe('fetchSilkeyPublicKey()', () => {
  const {PROVIDER_URI} = process.env

  it('expect to fetch silkey public key', (done) => {
    if (PROVIDER_URI) {
      fetchSilkeyPublicKey(PROVIDER_URI, '0x885B924491Fa7dF268f20df91B06b2C23D68490F')
        .then(m => {
          expect(m).not.to.eq('0x0000000000000000000000000000000000000000')
          expect(m.length).to.eq(42)
          done()
        })
        .catch(err => {
          done(err)
        })
    } else {
      console.log('skipping fetchSilkeyPublicKey() test')
      done()
    }
  }).timeout(5000)
})
