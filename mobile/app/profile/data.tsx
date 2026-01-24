import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, List, Switch, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/themed-view';

export default function DataPrivacyScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(true);
  const [visible, setVisible] = useState(false);

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Data & Privacy" />
      </Appbar.Header>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Usage Data</List.Subheader>
          <List.Item
            title="Share Analytics"
            description="Help improve MediNodus by sharing anonymous usage data."
            right={() => <Switch value={analytics} onValueChange={setAnalytics} />}
            style={styles.listItem}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={styles.subheader}>Account Data</List.Subheader>
          <List.Item
            title="Export My Data"
            description="Download a copy of your medical history."
            left={() => <List.Icon icon="download" />}
            onPress={() => {}}
            style={styles.listItem}
          />
          <List.Item
            title="Delete Account"
            titleStyle={{ color: 'red' }}
            left={() => <List.Icon icon="delete" color="red" />}
            onPress={() => setVisible(true)}
            style={styles.listItem}
          />
        </List.Section>

        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Delete Account?</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">This action cannot be undone. All your reports will be permanently deleted.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Cancel</Button>
              <Button textColor="red" onPress={() => setVisible(false)}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, flex: 1 }, // Fixed Alignment
  subheader: { paddingHorizontal: 0 },
  listItem: { paddingHorizontal: 0 }
});