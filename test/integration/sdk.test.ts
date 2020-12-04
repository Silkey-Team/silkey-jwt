import * as dotenv from 'dotenv'
import {expect} from 'chai'
import {ethers} from 'ethers'

import { publicKey, privateKey } from '../keys'
import { prepend0x } from '../../src/utils/helpers'

dotenv.config()

describe('sso', () => {
  describe('eth - SDK alignment test', () => {
    const wallet = new ethers.Wallet(privateKey)

    it('should have same result for all SDK', async () => {
      const emptySig = (await wallet.signMessage('')).toString()
      const abcSig = (await wallet.signMessage('abc')).toString()

      expect(await wallet.getAddress()).to.eq(publicKey)

      expect(await ethers.utils.verifyMessage('', emptySig)).to.eq(publicKey)
      expect(await ethers.utils.verifyMessage('abc', abcSig)).to.eq(publicKey)
    })

    it('compare sig from other SDK', async () => {
      const message = 'abc'
      const otherSdkSig = '1db489b7885fc8bf10d5b2f8072b73276f5ebdffab54ad9355db313e2bf761280226f996f15b9b83337ad' +
        '92f433daa808a08ecb344f92393abba59016a77941e1b'

      expect(await ethers.utils.verifyMessage(message, prepend0x(otherSdkSig))).to.eq(publicKey)
    })

    it('compare sig from other SDK', async () => {
      const message = 'cancelUrl=::redirectUrl=::refId=::scope=::ssoTimestamp=1602151787'
      const otherSdkSig = 'a1164b34b42940a98b5f23c5125f0c4d00957836b988f8a7a52e755b63e0b57912f7846cab32e8cf67b26d' +
        'b34fe2b7fa8e2504e0a75df9468c580aceb91252b11b'

      expect(await ethers.utils.verifyMessage(message, prepend0x(otherSdkSig))).to.eq(publicKey)
    })
  })
})
