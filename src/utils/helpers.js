import int64 from 'int64-buffer'

export const isNotSet = function (v) {
  // eslint-disable-next-line valid-typeof
  return v === null || typeof v === 'undefined' || typeof v === undefined
}

export const isSet = v => !isNotSet(v)

export const isEmpty = v => isNotSet(v) || v === {} || v === ''

export const remove0x = v => ['0X', '0x'].includes(v.toString().slice(0, 2)) ? v.toString().slice(2) : v

export const prepend0x = v => ['0X', '0x'].includes(v.toString().slice(0, 2)) ? v : `0x${v}`

export const isHex = v => {
  if (isEmpty(v)) {
    return false
  }

  const no0x = remove0x(v)

  for (let i = 0; i < no0x.length; i++) {
    if (isNaN(parseInt(no0x.charAt(i), 16))) {
      return false
    }
  }

  return true
}

export const isZeroHex = pk => isHex(pk) && remove0x(pk).replace('0', '') === ''

export const isPrivateKey = pk => isHex(pk) && remove0x(pk).length === 64 && !isZeroHex(pk)

export const isEthereumAddress = pk => isHex(pk) && remove0x(pk).length === 40 && !isZeroHex(pk)

export const isSignature = sig => isHex(sig) && remove0x(sig).length === 130 && !isZeroHex(sig)

export const intToBuffer = t => {
  const hex = new int64.Int64BE(t).toBuffer().toString('hex')
  const hexInt = hex.replace(/^0+/g, '')
  return Buffer.from(`${hexInt.length % 2 === 0 ? '' : '0'}${hexInt}`, 'hex')
}

export const strToBytes32 = str => '0x' + Buffer.from(str).toString('hex').padEnd(64, '0')

export const currentTimestamp = () => Math.round(Date.now() / 1000)
