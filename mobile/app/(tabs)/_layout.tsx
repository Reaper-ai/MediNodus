import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Get safe area insets (bottom will be > 0 on phones with gesture bars or nav buttons)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          // Add the bottom inset to the base height (60)
          height: 60 + insets.bottom, 
          // Push internal content up by the inset amount
          paddingBottom: insets.bottom, 
          backgroundColor: themeColors.background,
          ...Platform.select({
            ios: { shadowColor: "#333" , shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 10 },
          }),
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* CENTER SPLIT BUTTON */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.centerButtonContainer}>
              {/* We apply a negative margin to lift it out of the tab bar */}
              {/* Note: We don't need to adjust this for safe area because the parent container moved up */}
              <View style={[styles.splitButton, { backgroundColor: themeColors.tint }]}>
                
                <TouchableOpacity 
                  style={styles.halfButton} 
                  onPress={() => router.push('/scan')}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="camera.viewfinder" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.halfButton} 
                  onPress={() => console.log("Trigger Document Picker")}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="doc.text.fill" size={24} color="#000" />
                </TouchableOpacity>

              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.portrait.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButtonContainer: {
    top: -20, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 120, 
    // Ensure the button itself doesn't catch the padding from the tab bar
    height: 60, 
  },
  splitButton: {
    flexDirection: 'row',
    width: 150,
    height: 56,
    borderRadius: 28, 
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  halfButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 2,
    height: '60%',
    backgroundColor: "#000",
  },
});