// mobile/app/profile/edit.tsx
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? 'light'];

  // Form State
  const [name, setName] = useState("Priya Upreti");
  const [email, setEmail] = useState("priya.upreti@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = () => {
    // Logic to update profile via backend
    Alert.alert("Success", "Profile updated successfully!");
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Details */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.icon}
          />

          <ThemedText style={styles.label}>Email Address</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.icon}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Password Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Change Password</ThemedText>
          
          <ThemedText style={styles.label}>Current Password</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.icon}
          />

          <ThemedText style={styles.label}>New Password</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={theme.icon}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.tint }]}
          onPress={handleSave}
        >
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  section: { gap: 8, marginBottom: 20 },
  sectionTitle: { marginBottom: 12 },
  label: { fontSize: 14, opacity: 0.7, marginLeft: 4, marginTop: 8 },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  divider: { height: 1, marginVertical: 20 },
  saveButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});