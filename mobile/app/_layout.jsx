import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import { useRootNavigationState } from "expo-router";

export default function RootLayout() {
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return; // Wait until layout is mounted
    
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen && user.role === "user") {
      router.replace("/(tabs)");
    } else if (isSignedIn && inAuthScreen && user.role !== "user") {
      router.replace("/(admin)");
    }
  }, [user, token, segments, navigationState]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        <StatusBar barStyle={"dark-content"} />
      </SafeScreen>
    </SafeAreaProvider>
  );
}
