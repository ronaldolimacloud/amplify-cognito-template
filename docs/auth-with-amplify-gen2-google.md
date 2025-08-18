## Amplify Gen 2 Auth in React Native (Expo) with Google Federation

This guide shows how to add authentication to a React Native app using Amplify Gen 2 and Google as a federated identity provider (IdP), plus practical best practices.

### Prerequisites
- Amplify Gen 2 already initialized (you have `amplify/backend.ts` and `amplify/auth/resource.ts`).
- Expo or React Native environment set up.
- Access to Google Cloud Console to create OAuth credentials.

## 1) Configure the backend (Amplify Gen 2)

Edit `amplify/auth/resource.ts` to enable email sign-in and Google as an external provider. Use Amplify secrets for client credentials and define mobile deep link callback/logout URLs.

```ts
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
      },
      // Use your app scheme; keep consistent across iOS/Android and Google Console
      callbackUrls: ['myapp://'],
      logoutUrls: ['myapp://'],
    },
  },
  // Optional hardening examples:
  // multifactor: { mode: 'OPTIONAL', totpEnabled: true },
  // passwordPolicy: { minLength: 12, requireLowercase: true, requireUppercase: true, requireNumbers: true, requireSymbols: true },
});
```

Store secrets (per environment):

```bash
# Cloud sandbox / local dev
ampx sandbox secret set GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
ampx sandbox secret set GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_OAUTH_CLIENT_SECRET
```

If using Amplify Hosting environments, add these as secrets in the Amplify Console for each branch/environment.

## 2) Create Google OAuth credentials

In Google Cloud Console:
- Create or select a project → APIs & Services → Credentials → Create Credentials → OAuth client ID.
- Application type: Android/iOS/native (or External if using generic app schemes).
- Authorized redirect URIs: add the same values set in `callbackUrls` (for mobile deep links, typically the scheme like `myapp://`). Repeat for logout if Google requires it.
- Copy the client ID and client secret and set them as Amplify secrets (step 1).

Notes:
- Keep scopes minimal (e.g., `openid`, `email`, `profile`).
- If you also plan a web client later, add your web redirect URIs (e.g., `https://<your-domain>/oauth2/idpresponse`) to Cognito and Google.

## 3) Configure deep linking (Expo)

Add a custom scheme in `app.json` (or `app.config.ts`). This ensures your app can receive the Hosted UI redirect.

```json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.example.myapp"
    },
    "android": {
      "package": "com.example.myapp",
      "intentFilters": [
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": [{ "scheme": "myapp" }]
        }
      ]
    }
  }
}
```

Run:

```bash
# For Expo managed workflow using native modules
npx expo prebuild
# iOS pods
npx pod-install
```

## 4) Install required packages

```bash
npm install @aws-amplify/react-native @aws-amplify/ui-react-native aws-amplify \
  @react-native-community/netinfo @react-native-async-storage/async-storage \
  react-native-get-random-values @aws-amplify/rtn-web-browser

# iOS pods (if bare or after prebuild)
npx pod-install
```

`@aws-amplify/rtn-web-browser` is required for Hosted UI (Google) on React Native.

## 5) Initialize Amplify and add the Authenticator UI

In your entry (e.g., `App.tsx` or top-level layout), configure Amplify and render the Authenticator. Amplify Gen 2 generates `amplify_outputs.json` for configuration.

```tsx
import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button title="Sign out" onPress={signOut} />;
}

export default function App() {
  return (
    <Authenticator.Provider>
      <Authenticator>
        {/* Your app screens go here when signed in */}
        <SignOutButton />
      </Authenticator>
    </Authenticator.Provider>
  );
}
```

When `externalProviders.google` is configured, the Authenticator will automatically show a "Continue with Google" button and handle the Hosted UI flow.

## 6) Deploy/apply backend changes

After editing `resource.ts` and setting secrets, start/update your sandbox or environment so Cognito is configured with the new client settings and redirect URIs.

```bash
# Run or refresh your sandbox
ampx sandbox
```

## Best practices

- **Use secrets management**: Store client IDs/secrets only as Amplify secrets. Never commit them.
- **Least privilege scopes**: Keep Google scopes to `openid`, `email`, `profile` unless you truly need more.
- **Environment isolation**: Separate dev/stage/prod backends. Use different Google OAuth clients per environment and unique callback URLs (e.g., `myapp-dev://`, `myapp://`).
- **Consistent redirect URIs**: Ensure `callbackUrls`/`logoutUrls` match Google credentials and your app scheme on both iOS and Android.
- **Enable MFA where appropriate**: TOTP or SMS for higher Assurance (optional in `defineAuth`).
- **Strong password policy**: Increase minimum length and require character classes if using email/password.
- **Token handling**: Let Amplify manage tokens. Avoid manual storage; do not persist tokens in plaintext or logs.
- **App Linking**: Use a single scheme across platforms. Verify iOS `CFBundleURLTypes` and Android intent filters are generated correctly after prebuild.
- **Error handling/analytics**: Surface friendly auth errors and consider monitoring sign-in events.
- **Regular updates**: Keep Amplify packages up-to-date for security fixes and platform improvements.

## Troubleshooting

- **Hosted UI returns to browser instead of app**: Scheme mismatch. Verify `app.json` scheme and `callbackUrls` exactly match. Rebuild the app after changes.
- **Google button not showing**: Ensure `externalProviders.google` is configured and the sandbox/environment is updated.
- **Invalid redirect URI**: Add the exact `callbackUrls` to Google OAuth credentials and to Cognito app client (Amplify manages Cognito when you run the sandbox).
- **Android back navigation closes web view**: Ensure `@aws-amplify/rtn-web-browser` is installed and pods synced.

## References

- Amplify Gen 2 Auth concepts: [Amplify Auth – External identity providers](https://docs.amplify.aws/react-native/build-a-backend/auth/concepts/external-identity-providers/)
- Cognito user pools Hosted UI and federation: [Amazon Cognito user pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html)
- Google as IdP (identity pools): [Google as an IdP](https://docs.aws.amazon.com/cognito/latest/developerguide/google.html)
- Amplify React Native Authenticator: [Authenticator (React Native)](https://ui.docs.amplify.aws/react-native/connected-components/authenticator)


