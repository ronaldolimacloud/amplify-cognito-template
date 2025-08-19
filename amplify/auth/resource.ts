// amplify/auth/resource.ts
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET')
      },
    },
    callbackUrls: ["amplifycognitotemplate://callback/"],
    logoutUrls: ["amplifycognitotemplate://signout/"],
  },
  userAttributes: {
    email: { required: true },
    givenName: { required: true },
    familyName: { required: true },
  },
});