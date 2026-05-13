import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { C } from "../src/constants/theme";
import { useAuthStore } from "../src/store/authStore";

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === "(auth)";
    const inPrivate = segments[0] === "(private)";

    if (isAuthenticated && inAuth) {
      router.replace("/(private)/dashboard");
    } else if (!isAuthenticated && inPrivate) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg }}>
        <ActivityIndicator color={C.amber} size="large" />
      </View>
    );
  }

  return <Slot />;
}
