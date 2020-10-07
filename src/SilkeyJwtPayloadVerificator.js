import ethersjs from "ethers";
import jwt from "jsonwebtoken";

const {ethers} = ethersjs;

/**
 *
 * @returns {null|payload}
 * @param token
 */
export function silkeyJwtPayloadVerificator(token) {
  try {
    const payload = jwt.decode(token)
    const signer = ethers.utils.verifyMessage(payload.email, payload.signature)
    return signer.toLowerCase() === payload.address.toLowerCase() ? payload : null
  } catch (e) {
    console.error(e)
    return null
  }
}
