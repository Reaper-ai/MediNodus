import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Appbar, Card, Text, Chip, List, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '../../components/themed-view';

export default function AnalysisScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<'med' | 'report'>('report');

  useEffect(() => {
    // 1. Parse the passed data safely
    if (params.data) {
      try {
        const rawData = Array.isArray(params.data) ? params.data[0] : params.data;
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        
        // 2. Detect Type (Backend schema check)
        if (parsed.drug_name) {
          setType('med');
        } else {
          setType('report');
        }
        setData(parsed);

      } catch (e) {
        console.error("Error parsing analysis data", e);
      }
    }
    // FIX: Depend only on params.data (string), not the whole params object
  }, [params.data]); 

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Loading results...</Text>
      </View>
    );
  }

  // --- RENDERERS ---

  const renderMedicine = () => (
    <>
      <Card style={styles.card}>
        <Card.Title 
          title={data.drug_name} 
          subtitle={data.strength || "Unknown Strength"}
          left={(props) => <List.Icon {...props} icon="pill" />}
        />
        <Card.Content>
          <View style={styles.chipRow}>
            <Chip icon="prescription" style={styles.chip}>{data.prescription_drug === "Yes" ? "Rx Required" : "OTC"}</Chip>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Indications</Text>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">{data.indications}</Text>
        </Card.Content>
      </Card>

      {/* AI Analysis of effects vs User History */}
      {data.warnings && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.error }]}>Warnings</Text>
          <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>{data.warnings}</Text>
            </Card.Content>
          </Card>
        </>
      )}
    </>
  );

  const renderReport = () => (
    <>
      <Card style={styles.card}>
        <Card.Title 
          title={data.patient_name || "Medical Report"} 
          subtitle={new Date().toLocaleDateString()}
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
        />
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Summary</Text>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ lineHeight: 22 }}>{data.summary}</Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Key Findings</Text>
      {data.abnormalities?.map((item: string, index: number) => (
        <List.Item
          key={index}
          title={item}
          left={props => <List.Icon {...props} icon="alert-circle" color={theme.colors.error} />}
          style={styles.listItem}
        />
      ))}

      <Text variant="titleMedium" style={styles.sectionTitle}>Recommendations</Text>
      <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.secondaryContainer }]}>
        <Card.Content>
          {data.recommendations?.map((item: string, index: number) => (
             <View key={index} style={{ marginBottom: 8, flexDirection: 'row' }}>
                <Text style={{ marginRight: 8 }}>•</Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSecondaryContainer }}>{item}</Text>
             </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={type === 'med' ? 'Medicine Details' : 'Analysis Result'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {type === 'med' ? renderMedicine() : renderReport()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  card: { marginBottom: 20 },
  sectionTitle: { marginBottom: 12, marginTop: 10, fontWeight: 'bold' },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  chip: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
  listItem: { paddingLeft: 0, paddingVertical: 0 }
});