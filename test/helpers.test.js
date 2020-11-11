import chai from 'chai'

import { intToBuffer } from '../src/utils/helpers.js'

const { expect } = chai

describe('timestampToBuffer()', () => {
  it('expect to convert timestamp number to buffer', async () => {
    expect(intToBuffer(1).toString('hex')).to.eq('01')
    expect(intToBuffer(16).toString('hex')).to.eq('10')
    expect(intToBuffer(31).toString('hex')).to.eq('1f')
    expect(intToBuffer(256).toString('hex')).to.eq('0100')
    expect(intToBuffer(1604499020).toString('hex')).to.eq('5fa2b64c')
    expect(intToBuffer('1604499020').toString('hex')).to.eq('5fa2b64c')
  })
})
