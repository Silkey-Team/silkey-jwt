import {Settings} from '../types/Settings'

export const settings: Settings = {
  jwt: {
    id: {
      key: 'id',
      requiredData: ['address']
    },
    email: {
      key: 'email',
      requiredData: ['address', 'email']
    }
  },
  ssoParams: {
    PREFIX: 'sso',
    required: ['ssoSignature', 'ssoRedirectUrl', 'ssoCancelUrl', 'ssoTimestamp'],
    optional: ['ssoRefId', 'ssoScope', 'ssoRedirectMethod'],
    DEFAULT_SCOPE: 'id',
    SCOPE_DIVIDER: ','
  },
  MESSAGE_TO_SIGN_GLUE: '::'
}
