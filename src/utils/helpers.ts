export const isNotSet = (v: any): boolean => {
  // eslint-disable-next-line valid-typeof
  return v === null || typeof v === 'undefined' || typeof v === undefined
}

export const isSet = (v: any): boolean => !isNotSet(v)

export const remove0x = (v: string): string => ['0X', '0x'].includes(v.slice(0, 2)) ? v.slice(2) : v

export const prepend0x = (v: string): string => ['0X', '0x'].includes(v.slice(0, 2)) ? v : `0x${v}`

export const isHex = (v: string): boolean => {
  if (!v) {
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

export const isZeroHex = (v: string): boolean => isHex(v) && remove0x(v).replace('0', '') === ''

export const isPrivateKey = (v: string): boolean => isHex(v) && remove0x(v).length === 64 && !isZeroHex(v)

export const isEthereumAddress = (v: string): boolean => isHex(v) && remove0x(v).length === 40 && !isZeroHex(v)

export const isSignature = (sig: string | undefined): boolean => {
  if (!sig) {
    return false
  }

  return isHex(sig) && remove0x(sig).length === 130 && !isZeroHex(sig)
}

export const isTimestamp = (t: number): boolean => t > 0 && t.toString(10).length === 10

export const intToBuffer = (i: number): Buffer => {
  const hex = i.toString(16)
  return Buffer.from(`${hex.length % 2 === 0 ? '' : '0'}${hex}`, 'hex')
}

export const strToBytes32 = (str: string): string => '0x' + Buffer.from(str).toString('hex').padEnd(64, '0')

export const currentTimestamp = (): number => Math.round(Date.now() / 1000)

export const xor = (a: boolean, b: boolean): boolean => !(a == b)

// eslint-disable-next-line
export const getKeyValue = <T extends object, U extends keyof T>(obj: T) => (key: string) => obj[key as keyof T]
