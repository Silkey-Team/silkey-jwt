import * as Models from './models/index.js'
import * as utils from './utils/helpers.js'
import * as blockchain from './contracts/index.js'

import {
  fetchSilkeyPublicKey,
  generateSSORequestParams,
  messageToSign,
  tokenPayloadVerifier
} from './sso.js'

export default {
  Models,
  utils,
  blockchain,
  generateSSORequestParams,
  tokenPayloadVerifier,
  messageToSign,
  fetchSilkeyPublicKey
}
