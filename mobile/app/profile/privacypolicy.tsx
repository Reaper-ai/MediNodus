import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PrivacyPolicyScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="subtitle" style={styles.title}>Privacy Policy</ThemedText>
        <ThemedText style={styles.date}>Last Updated: October 2025</ThemedText>
        
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">1. Data Collection</ThemedText>
          <ThemedText style={styles.body}>
            MediNodus collects health data from your scanned reports to provide AI-powered analysis. This data is encrypted and stored securely.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">2. AI Analysis</ThemedText>
          <ThemedText style={styles.body}>
            We use Google Gemini and RAG (Retrieval-Augmented Generation) to process your data. Your personal health information is never used to train global AI models.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">3. Your Rights</ThemedText>
          <ThemedText style={styles.body}>
            You can delete your account and all associated cloud data at any time through the Settings menu.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { marginBottom: 8 },
  date: { fontSize: 13, opacity: 0.5, marginBottom: 24 },
  section: { marginBottom: 20, gap: 8 },
  body: { lineHeight: 22, opacity: 0.8 }
});