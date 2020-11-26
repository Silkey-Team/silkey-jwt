import chai from 'chai'

const { expect } = chai

export const expectThrows = (method, errorType, errorMessage) => {
  let error = null
  let msg = null

  try {
    method()
    msg = 'Expect method to throw'

    if (errorMessage) {
      msg += ` with message: ${errorMessage}`
    }
  } catch (err) {
    error = err
  }

  if (!error) {
    throw Error(msg)
  }

  expect(error).to.be.an.instanceOf(errorType)

  if (errorMessage) {
    expect(error.message).to.equal(errorMessage)
  }
}

export const expectThrowsAsync = async (method, errorType, errorMessage) => {
  let error = null
  let msg = null

  try {
    await method()
    msg = 'Expect method to throw'

    if (errorMessage) {
      msg += ` with message: ${errorMessage}`
    }
  } catch (err) {
    error = err
  }

  if (!error) {
    throw Error(msg)
  }

  expect(error).to.be.an.instanceOf(errorType)

  if (errorMessage) {
    expect(error.message).to.equal(errorMessage)
  }
}

export const expectNotToThrowsAsync = async method => {
  try {
    await method()
  } catch (err) {
    throw Error(err.message)
  }
}
