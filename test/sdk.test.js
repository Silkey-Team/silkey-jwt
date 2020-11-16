import dotenv from 'dotenv'
import chai from 'chai'
import ethersjs from 'ethers'

import { publicKey, privateKey } from './keys.js'
import { prepend0x } from '../src/utils/helpers.js'

dotenv.config()

const { expect } = chai
const { ethers } = ethersjs

describe('sso.js', () => {
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
      const otherSdkSig = '1db489b7885fc8bf10d5b2f8072b73276f5ebdffab54ad9355db313e2bf761280226f996f15b9b83337ad92f433daa808a08ecb344f92393abba59016a77941e1b'

      expect(await ethers.utils.verifyMessage(message, prepend0x(otherSdkSig))).to.eq(publicKey)
    })

    it('compare sig from other SDK', async () => {
      const message = 'cancelUrl=::redirectUrl=::refId=::scope=::sigTimestamp=1602151787'
      const otherSdkSig = '3f14a50ae39d1b747b51d657fdd1ff3f1b623d2d711dce351a11e0db3d1cbf5500954fab4dbe1107d9ab8dfc1120492397745457c282ca1db4af2fcecac4f8941c'

      expect(await ethers.utils.verifyMessage(message, prepend0x(otherSdkSig))).to.eq(publicKey)
    })
  })
})
