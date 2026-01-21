import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native'; // Import ActivityIndicator
import { GlobalProvider, useGlobalState } from '../context/GlobalStateContext';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useGlobalState(); // Get isLoading
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // DO NOT redirect while loading

    const firstSegment = Array.isArray(segments) ? segments[0] : segments;
    const inAuthGroup = String(firstSegment) === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to login if not logged in
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect to main app if logged in
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isLoading]); // Add isLoading to dependency array

  // Show a loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ animation: 'slide_from_right' }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <RootLayoutNav />
    </GlobalProvider>
  );
}

