import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this
import { IconSymbol } from '../../components/ui/icon-symbol';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // Get safe area insets

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopWidth: 0,
          elevation: 5,
          // Fix: Dynamic height calculation based on safe area
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5, // Add breathing room
          paddingTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle.portrait.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}