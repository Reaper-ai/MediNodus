import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, List, Switch, Surface, RadioButton, useTheme } from 'react-native-paper'; // Import RadioButton
import { useRouter } from 'expo-router';
import { useGlobalState } from '../../context/GlobalStateContext';
import { ThemedView } from '../../components/themed-view'; // Use ThemedView for consistency

type ThemeType = 'system' | 'light' | 'dark';

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme: currentTheme, setTheme, isHighContrast, setHighContrast } = useGlobalState();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Appearance" />
      </Appbar.Header>

      {/* Fix: Added RadioButton.Group to manage selection */}
      <RadioButton.Group onValueChange={value => setTheme(value as ThemeType)} value={currentTheme}>
        <List.Section style={styles.section}>
          <List.Subheader style={styles.subheader}>Theme Mode</List.Subheader>
          
          <List.Item
            title="System Default"
            left={() => <List.Icon icon="theme-light-dark" />}
            // Fix: Replaced Switch with RadioButton
            right={() => <RadioButton value="system" />}
            onPress={() => setTheme('system')}
            style={styles.listItem}
          />
          
          <List.Item
            title="Light Mode"
            left={() => <List.Icon icon="white-balance-sunny" />}
            right={() => <RadioButton value="light" />}
            onPress={() => setTheme('light')}
            style={styles.listItem}
          />
          
          <List.Item
            title="Dark Mode"
            left={() => <List.Icon icon="weather-night" />}
            right={() => <RadioButton value="dark" />}
            onPress={() => setTheme('dark')}
            style={styles.listItem}
          />
        </List.Section>
      </RadioButton.Group>

      <List.Section style={styles.section}>
        <List.Subheader style={styles.subheader}>Accessibility</List.Subheader>
        <List.Item
          title="High Contrast"
          description="Increase color contrast for better visibility"
          left={() => <List.Icon icon="contrast-circle" />}
          right={() => <Switch value={isHighContrast} onValueChange={setHighContrast} color={theme.colors.error} />}
          style={styles.listItem}
        />
      </List.Section>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 }, // Consistent alignment
  section: { width: '100%' },
  listItem: { paddingHorizontal: 24 },
  subheader: { paddingHorizontal: 24 }
});