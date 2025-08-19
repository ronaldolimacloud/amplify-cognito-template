// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    


  },
  userAttributes: {
    email: { required: true },
    givenName: { required: true },
    familyName: { required: true },
  },
});