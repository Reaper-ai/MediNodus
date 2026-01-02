// mobile/app/profile/medical.tsx
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalState } from '@/context/GlobalStateContext';


export default function MedicalInfoScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? 'light'];

  const { medicalInfo, updateMedicalInfo } = useGlobalState(); //

  // Initialize local form state from global context
  const [form, setForm] = useState(medicalInfo);

  const handleUpdate = async () => {
    await updateMedicalInfo(form); //
    Alert.alert("Context Updated", "This info will now be used by MediNodus AI for your analysis.");
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.description}>
          Provide additional context to help our AI analyze your reports more accurately based on your health history.
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Chronic Conditions</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            multiline
            numberOfLines={4}
            value={form.conditions}
            onChangeText={(text) => setForm({ ...form, conditions: text })}
            placeholder="e.g., Asthma, Heart Disease..."
            placeholderTextColor={theme.icon}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Allergies</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            multiline
            numberOfLines={3}
            value={form.allergies}
            onChangeText={(text) => setForm({ ...form, allergies: text })}
            placeholder="e.g., Pollen, Dairy, specific drugs..."
            placeholderTextColor={theme.icon}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Current Medications</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            multiline
            numberOfLines={3}
            value={form.medications}
            onChangeText={(text) => setForm({ ...form, medications: text })}
            placeholder="List any medicine you take regularly..."
            placeholderTextColor={theme.icon}
          />
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: theme.tint }]}
          onPress={handleUpdate}
        >
          <ThemedText style={styles.updateButtonText}>Update AI Context</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24 },
  description: { fontSize: 15, opacity: 0.7, lineHeight: 22 },
  section: { gap: 10 },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  updateButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  updateButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});