import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { useRootNavigationState } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const segments = useSegments();
  const { checkAuth, user, token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(null);

  useEffect(() => {
    (async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      if (!hasLaunched) {
        setFirstLaunch(true);
        await AsyncStorage.setItem("hasLaunched", "true");
      } else {
        setFirstLaunch(false);
      }
    })();
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || navigationState.stale) return;
    setIsMounted(true);
  }, [navigationState]);

  useEffect(() => {
    if (!isMounted || firstLaunch === null) return;

    if (firstLaunch) {
      router.replace("/(first)/index");
      return;
    }

    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;
    
    if (user === null && token === null) {
      router.replace("/(auth)");
    }

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen && user.role === "user") {
      router.replace("/(tabs)");
    } else if (isSignedIn && inAuthScreen && user.role !== "user") {
      router.replace("/(admin)");
    }
  }, [isMounted, user, token, segments]);
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(first)/index" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
        <StatusBar barStyle={"dark-content"} />
      </SafeScreen>
    </SafeAreaProvider>
  );
}
