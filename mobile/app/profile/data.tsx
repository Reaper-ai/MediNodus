import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DataManagementScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? 'light'];

  const handleClearCloudData = () => {
    Alert.alert(
      "Clear Cloud Data",
      "This will delete all your uploaded reports and analysis history from our servers. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive", 
          onPress: () => {
            // Logic to call backend API to wipe data
            Alert.alert("Deleted", "Your cloud data has been cleared.");
          } 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? You will lose access to all your data immediately.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive", 
          onPress: () => {
            // Logic to call backend API for account deletion
            router.dismissAll();
          } 
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.description}>
          Manage how your health data is stored and handled on MediNodus servers.
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionHeader}>Storage</ThemedText>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={handleClearCloudData}
          >
            <View style={styles.cardLeft}>
              <IconSymbol name="cloud.fill" size={24} color={theme.icon} />
              <View>
                <ThemedText type="defaultSemiBold">Clear Cloud Data</ThemedText>
                <ThemedText style={styles.cardSubtext}>Remove all reports from servers</ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionHeader}>Danger Zone</ThemedText>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.cardBackground, borderColor: theme.danger + '40' }]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.cardLeft}>
              <IconSymbol name="trash.fill" size={24} color={theme.danger} />
              <View>
                <ThemedText type="defaultSemiBold" style={{ color: theme.danger }}>Delete Account</ThemedText>
                <ThemedText style={styles.cardSubtext}>Permanently close your account</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, gap: 24 },
  description: { fontSize: 15, opacity: 0.7, lineHeight: 22 },
  section: { gap: 12 },
  sectionHeader: { fontSize: 13, textTransform: 'uppercase', opacity: 0.6, marginLeft: 4 },
  actionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1 
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardSubtext: { fontSize: 13, opacity: 0.6, marginTop: 2 }
});