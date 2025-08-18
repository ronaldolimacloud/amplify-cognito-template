import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

type UserProfile = {
  email?: string;
  given_name?: string;
  family_name?: string;
};

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({});
  const { signOut } = useAuthenticator();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (isMounted) setProfile(attrs as unknown as UserProfile);
      } catch (e) {
        // noop; user might not be signed in yet
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <View style={{ position: "absolute", top: 24, right: 24 }}>
        <Button title="Sign Out" onPress={signOut} />
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={{ fontSize: 18, marginBottom: 12 }}>Welcome 👋</Text>
          <Text style={{ marginBottom: 4 }}>
            {profile.given_name || ""} {profile.family_name || ""}
          </Text>
          <Text style={{ color: "#666" }}>{profile.email || ""}</Text>
        </>
      )}
    </View>
  );
}
