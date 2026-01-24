import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text, List, Switch, Button, Divider, useTheme, Appbar } from 'react-native-paper';
import { useGlobalState } from '../context/GlobalStateContext';
import { useRouter } from 'expo-router';
import { ThemedView } from '../components/themed-view';

export default function ProfileScreen() {
  const { user, logout } = useGlobalState();
  const theme = useTheme();
  const router = useRouter();
  const [isDark, setIsDark] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.container} safeArea={true}>
      
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.[0]?.toUpperCase() || 'G'} 
            style={{ backgroundColor: theme.colors.primaryContainer }} 
            color={theme.colors.onPrimaryContainer} 
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Text variant="headlineSmall" style={styles.name}>{user?.name || 'Guest User'}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>{user?.email || 'guest@medinodus.com'}</Text>
          
          <Button 
            mode="outlined" 
            style={styles.editBtn} 
            onPress={() => router.push('/profile/edit')}
          >
            Edit Profile
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* Settings List */}
        <List.Section>
          <List.Subheader style={styles.subheader}>Preferences</List.Subheader>
          <List.Item
            title="Appearance"
            left={() => <List.Icon icon="palette" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => router.push('/profile/appearance')}
            style={styles.listItem}
          />
        </List.Section>

        <Divider style={styles.divider} />

        <List.Section>
          <List.Subheader style={styles.subheader}>Support</List.Subheader>
          <List.Item
            title="Data & Privacy"
            left={() => <List.Icon icon="shield-account" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => router.push('/profile/data')}
            style={styles.listItem}
          />
          <List.Item
            title="Privacy Policy"
            left={() => <List.Icon icon="file-document-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => router.push('/profile/privacypolicy')}
            style={styles.listItem}
          />
        </List.Section>

        <View style={styles.logoutContainer}>
            <Button 
              mode="contained" 
              buttonColor={theme.colors.error} 
              icon="logout" 
              onPress={handleLogout}
              contentStyle={{ paddingVertical: 8 }}
            >
                Sign Out
            </Button>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Fix: Unified padding for the whole scroll view
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 10 },
  name: { marginTop: 16, fontWeight: 'bold' },
  editBtn: { marginTop: 20, width: '100%' }, // Made button full width of container
  divider: { marginVertical: 10 },
  // Fix: Remove default padding from List Items to align with container
  listItem: { paddingHorizontal: 0 },
  subheader: { paddingHorizontal: 0 }, 
  logoutContainer: { marginTop: 20 }
});