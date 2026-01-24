import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Appbar, Text, Divider, Title, Paragraph, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/themed-view';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Privacy Policy" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.mainTitle}>Your Privacy Matters</Title>
        <Paragraph style={styles.intro}>
          At MediNodus, we take your medical data privacy seriously. This document outlines how we collect, use, and protect your personal health information.
        </Paragraph>

        <Divider style={styles.divider} />

        <List.Section>
          <List.Subheader style={styles.subheader}>1. Data Collection</List.Subheader>
          <Paragraph style={styles.paragraph}>
            We collect data that you explicitly provide, including medical history, allergies, and uploaded medical reports. All image processing for reports happens securely.
          </Paragraph>

          <List.Subheader style={styles.subheader}>2. AI Processing</List.Subheader>
          <Paragraph style={styles.paragraph}>
            Your medical reports are analyzed by our AI algorithms to generate summaries. We do not use your personal health data to train our public models without your explicit consent.
          </Paragraph>

          <List.Subheader style={styles.subheader}>3. Local Storage</List.Subheader>
          <Paragraph style={styles.paragraph}>
            Where possible, sensitive data is stored locally on your device using secure encryption. Cloud syncing is optional and encrypted at rest.
          </Paragraph>

          <List.Subheader style={styles.subheader}>4. Data Sharing</List.Subheader>
          <Paragraph style={styles.paragraph}>
            We never sell your data to third parties. Data is only shared with medical professionals when you explicitly use the "Share" feature.
          </Paragraph>
        </List.Section>

        <Divider style={styles.divider} />

        <Text variant="bodySmall" style={styles.footer}>
          Last updated: January 24, 2026
        </Text>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 }, // Fixed Alignment
  mainTitle: { marginBottom: 10, fontWeight: 'bold' },
  intro: { marginBottom: 20, opacity: 0.8 },
  divider: { marginVertical: 10 },
  subheader: { fontWeight: 'bold', fontSize: 16, paddingHorizontal: 0, marginTop: 10 },
  paragraph: { marginBottom: 10, lineHeight: 22 },
  footer: { textAlign: 'center', marginTop: 30, opacity: 0.5 }
});