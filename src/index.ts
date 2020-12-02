import * as Models from './models'
import * as utils from './utils/helpers'
import * as blockchain from './contracts'

import {
  fetchSilkeyPublicKey,
  generateSSORequestParams,
  messageToSign,
  tokenPayloadVerifier
} from './services/sso.js'

export default {
  Models,
  utils,
  blockchain,
  generateSSORequestParams,
  tokenPayloadVerifier,
  messageToSign,
  fetchSilkeyPublicKey
}
