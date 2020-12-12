export interface Settings {
  jwt: {
    id: {
      key: string,
      requiredData: string[]
    },
    email: {
      key: string,
      requiredData: string[]
    }
  },
  ssoParams: {
    required: string[],
    optional: string[],
    DEFAULT_SCOPE: string,
    SCOPE_DIVIDER: string,
    PREFIX: string
  },
  MESSAGE_TO_SIGN_GLUE: string
}
