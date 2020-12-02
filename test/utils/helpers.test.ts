import {expect} from 'chai'

import {intToBuffer} from '../../src/utils/helpers'

describe('timestampToBuffer()', () => {
  it('expect to convert timestamp number to buffer', async () => {
    expect(intToBuffer(1).toString('hex')).to.eq('01')
    expect(intToBuffer(16).toString('hex')).to.eq('10')
    expect(intToBuffer(31).toString('hex')).to.eq('1f')
    expect(intToBuffer(256).toString('hex')).to.eq('0100')
    expect(intToBuffer(1604499020).toString('hex')).to.eq('5fa2b64c')
  })
})

describe('Buffer must be align with other languages SDKs', () => {
  const stringsToHex = (arr: string[]): string => Buffer.concat(arr.map(s => Buffer.from(s))).toString('hex')

  it('expect have compatible result', async () => {
    expect(stringsToHex([''])).to.eq('')
    expect(stringsToHex(['1'])).to.eq('31')
    expect(stringsToHex(['1', '2'])).to.eq('3132')
    expect(stringsToHex(['', '1'])).to.eq('31')
    expect(stringsToHex(['żźćłóęąń', '0'])).to.eq('c5bcc5bac487c582c3b3c499c485c58430')
  })
})
