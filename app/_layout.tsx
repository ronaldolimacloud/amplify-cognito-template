import { Authenticator } from "@aws-amplify/ui-react-native";
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

export default function RootLayout() {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <Stack />
      </Authenticator>
    </Authenticator.Provider>
  );
}
