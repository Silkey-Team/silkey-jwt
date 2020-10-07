import ethersjs from "ethers";
import jwt from "jsonwebtoken";

const {ethers} = ethersjs;

let wallet,
  payload;

function createPayload(email) {
  payload = {
    email: email ? email : wallet.address + "@silkey.io",
    address: wallet.address,
  }
}

function signPayload() {
  const digest = ethers.utils.hashMessage(payload.email)
  const signingKey = new ethers.utils.SigningKey(wallet.privateKey)
  payload.signature = signingKey.signDigest(digest)
}

function randomPassword() {
  let r = [];

  for (let i = 0; i < 8; i++) {
    r[i] = Math.random().toString(10).split(".")[1].slice(0, 8)
  }

  return r.join("-")
}

function signJWT() {
  // Silkey not providing any BE api, so we can use random pass
  return jwt.sign(payload, randomPassword());
}

/**
 *
 * @param ethersWallet
 * @param email if empty, default email will be set in format of [eth_address]@silkey.io
 * @returns {jwt.}
 */
export function silkeyJwtGenerator(ethersWallet, email) {
  wallet = ethersWallet
  createPayload(email)
  signPayload()

  return signJWT()
}
