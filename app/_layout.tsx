import { Authenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

export default function RootLayout() {
  return (
    <Authenticator
      formFields={{
        signUp: {
          given_name: { label: "First name", required: true, order: 2 },
          family_name: { label: "Last name", required: true, order: 3 },
        },
      }}
    >
      <Stack />
    </Authenticator>
  );
}
