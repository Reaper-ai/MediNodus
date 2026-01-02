// mobile/app/profile/appearance.tsx
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AppearanceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // State for settings
  const [selectedTheme, setSelectedTheme] = useState('System');
  const [isHighContrast, setIsHighContrast] = useState(false);

  const ThemeOption = ({ label, value }: { label: string; value: string }) => (
    <TouchableOpacity 
      style={[styles.optionRow, { borderBottomColor: theme.border }]} 
      onPress={() => setSelectedTheme(value)}
    >
      <ThemedText style={styles.optionLabel}>{label}</ThemedText>
      {selectedTheme === value && (
        <IconSymbol name="checkmark" size={20} color={theme.tint} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Theme Selection */}
        <ThemedText style={styles.sectionHeader}>Theme</ThemedText>
        <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
          <ThemeOption label="Light" value="Light" />
          <ThemeOption label="Dark" value="Dark" />
          <ThemeOption label="System" value="System" />
        </View>

        {/* Accessibility Section */}
        <ThemedText style={styles.sectionHeader}>Accessibility</ThemedText>
        <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.switchRow}>
            <View style={styles.rowLeft}>
              <IconSymbol name="eye.fill" size={22} color={theme.icon} />
              <ThemedText style={styles.rowLabel}>High Contrast Mode</ThemedText>
            </View>
            <Switch 
              value={isHighContrast} 
              onValueChange={setIsHighContrast}
              trackColor={{ false: '#767577', true: theme.tint }}
            />
          </View>
        </View>

        <ThemedText style={styles.footerNote}>
          High Contrast mode increases the visibility of text and UI elements for better accessibility.
        </ThemedText>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, marginLeft: 12, marginBottom: 8, marginTop: 24 },
  sectionBody: { borderRadius: 16, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  optionLabel: { fontSize: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16 },
  footerNote: { fontSize: 13, opacity: 0.5, marginTop: 12, paddingHorizontal: 12, lineHeight: 18 },
});