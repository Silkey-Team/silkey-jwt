import {expect} from 'chai'

// eslint-disable-next-line @typescript-eslint/ban-types
export const expectThrows = (method: Function, errorType: object, errorMessage: string): void => {
  let msg = ''

  try {
    method()
    msg = 'Expect method to throw'

    if (errorMessage) {
      msg += ` with message: ${errorMessage}`
    }
  } catch (err) {
    expect(err).to.be.an.instanceOf(errorType)

    if (errorMessage) {
      expect(err.message).to.equal(errorMessage)
    }
  }

  if (msg) {
    throw Error(msg)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const expectThrowsAsync = async (method: Function, errorType: object, errorMessage: string): Promise<void> => {
  let msg = ''

  try {
    await method()
    msg = 'Expect method to throw'

    if (errorMessage) {
      msg += ` with message: ${errorMessage}`
    }
  } catch (err) {
    expect(err).to.be.an.instanceOf(errorType)

    if (errorMessage) {
      expect(err.message).to.equal(errorMessage)
    }
  }

  if (msg) {
    throw Error(msg)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const expectNotToThrowsAsync = async (method: Function): Promise<void> => {
  try {
    await method()
  } catch (err) {
    throw Error(err.message)
  }
}
