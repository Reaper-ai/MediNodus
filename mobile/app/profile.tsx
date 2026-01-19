import { StyleSheet, TouchableOpacity, View, ScrollView, Switch, Alert, Image, Settings } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Mock State
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isPushEnabled, setPushEnabled] = useState(false);
  const appVersion = "1.0.0 (Beta)";

  // Handlers (Placeholders for now)
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => router.push('/login') }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action is irreversible. All your data will be wiped.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive" }
    ]);
  };

  const renderSettingItem = ({ icon, label, onPress, value, isDestructive = false, showChevron = true }: any) => (
    <TouchableOpacity 
      style={[styles.itemRow, { borderBottomColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FEE2E2' : theme.surface }]}>
            <IconSymbol 
                name={icon} 
                size={20} 
                color={isDestructive ? theme.danger : theme.icon} 
            />
        </View>
        <ThemedText style={[styles.itemLabel, isDestructive && { color: theme.danger }]}>
            {label}
        </ThemedText>
      </View>
      
      <View style={styles.itemRight}>
        {value && <ThemedText style={styles.itemValue}>{value}</ThemedText>}
        {showChevron && <IconSymbol name="chevron.right" size={20} color={theme.icon} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- 1. HEADER PROFILE --- */}
        <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                <ThemedText style={styles.avatarText}>PU</ThemedText>
            </View>
            <ThemedText type="subtitle">Priya Upreti</ThemedText>
            <ThemedText style={{ color: theme.textSecondary }}>priya.upreti@example.com</ThemedText>
            <View style={[styles.badge, { backgroundColor: theme.surface }]}>
                <ThemedText style={styles.badgeText}>v{appVersion}</ThemedText>
            </View>
        </View>

        {/* --- 2. ACCOUNT SETTINGS --- */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionHeader}>Profile</ThemedText>
            <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
                {renderSettingItem({ 
                    icon: "person.fill", 
                    label: "Update Profile", 
                    onPress: () => router.push('/profile/edit')
                })}
                {renderSettingItem({ 
                    icon: "heart.text.square.fill", 
                    label: "Medical Info (RAG Context)", 
                    onPress: () => router.push('/profile/medical')
                })}
                {renderSettingItem({ 
                    icon: "arrow.right.circle.fill", 
                    label: "Log Out", 
                    isDestructive: true,
                    onPress: handleLogout 
                })}
            </View>
        </View>


        {/* Notifications Section */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionHeader}>Notifications</ThemedText>
            <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>   
                <View style={[styles.itemRow, { borderBottomColor: theme.border, borderBottomWidth: 0 }]}>
                    <View style={styles.itemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                            <IconSymbol name="bell.fill" size={20} color={theme.icon} />
                        </View>
                        <ThemedText style={styles.itemLabel}>Push Notifications</ThemedText>
                    </View>
                    <Switch 
                        value={isPushEnabled} 
                        onValueChange={setPushEnabled}
                        trackColor={{ false: theme.icon, true: theme.tint }}
                    />
                </View>
            </View>
        </View>


        {/* --- 3. APPEARANCE --- */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionHeader}>Appearance</ThemedText>
            <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
                {renderSettingItem({ 
                    icon: "moon.fill", 
                    label: "Theme", 
                    value: "System",
                    onPress: () => router.push('/profile/appearance')
                })}
                
                {/* Custom Row for Switch Toggle */}
                <View style={[styles.itemRow, { borderBottomColor: theme.border, borderBottomWidth: 0 }]}>
                    <View style={styles.itemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                            <IconSymbol name="eye.fill" size={20} color={theme.icon} />
                        </View>
                        <ThemedText style={styles.itemLabel}>High Contrast</ThemedText>
                    </View>
                    <Switch 
                        value={isHighContrast} 
                        onValueChange={setIsHighContrast}
                        trackColor={{ false: theme.icon, true: theme.tint }}
                    />
                </View>
            </View>
        </View>


        {/* --- 4. PRIVACY & DATA --- */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionHeader}>Data & Privacy</ThemedText>
            <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
                {renderSettingItem({ 
                    icon: "lock.fill", 
                    label: "Privacy Policy", 
                    onPress: () => router.push('/profile/privacypolicy')
                })}
                {renderSettingItem({ 
                    icon: "cloud.fill", 
                    label: "Clear Cloud Data", 
                    onPress: () => router.push('/profile/data')
                })}
                {renderSettingItem({ 
                    icon: "trash.fill", 
                    label: "Delete Account", 
                    isDestructive: true,
                    showChevron: false,
                    onPress: handleDeleteAccount 
                })}
            </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  
  // Header
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  badge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, opacity: 0.6 },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', opacity: 0.5, marginLeft: 12, marginBottom: 8 },
  sectionBody: { borderRadius: 16, overflow: 'hidden' },

  // List Items
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 16 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { fontSize: 14, opacity: 0.6 },
});