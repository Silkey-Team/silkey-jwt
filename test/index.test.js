import chai from 'chai';
import ethersjs from "ethers";

const {expect, assert} = chai;
const {ethers} = ethersjs;

import { silkeyJwtGenerator, silkeyJwtPayloadVerificator } from '../src/index.js'

describe("silkey-jwt", function () {
  it("generates signed token", function () {
    const token = silkeyJwtGenerator(ethers.Wallet.createRandom())
    expect(token).not.to.be.empty
    expect(token.split('.').length).to.equal(3)
  });

  it("validated and return payload with default email", function () {
    const token = silkeyJwtGenerator(ethers.Wallet.createRandom())
    const payload = silkeyJwtPayloadVerificator(token)

    expect(payload).not.to.be.empty
    assert.equal(payload.email, payload.address + '@silkey.io')
  });

  it("validated and return payload with provided email", function () {
    const email = 'any@email'
    const token = silkeyJwtGenerator(ethers.Wallet.createRandom(), email)
    const payload = silkeyJwtPayloadVerificator(token)

    expect(payload).not.to.be.empty
    assert.equal(payload.email, email)
  });
});
