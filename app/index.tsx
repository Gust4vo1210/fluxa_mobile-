import { Redirect } from "expo-router";

// Redirect root to splash / auth flow
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
