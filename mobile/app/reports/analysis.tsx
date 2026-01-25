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
    if (params.data) {
      try {
        const rawData = Array.isArray(params.data) ? params.data[0] : params.data;
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        
        // 1. Determine Type based on unique keys in your JSON
        if (params.type) {
            const passedType = Array.isArray(params.type) ? params.type[0] : params.type;
            setType(passedType as 'med' | 'report');
        } else {
            // Fallback: Medicine has 'drug_name', Report has 'patient_summary'
            if (parsed.drug_name) setType('med');
            else setType('report');
        }
        setData(parsed);

      } catch (e) {
        console.error("Error parsing analysis data", e);
      }
    }
  }, [params.data, params.type]);

  if (!data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.secondary }}>Loading results...</Text>
      </View>
    );
  }

  // --- RENDERERS ---

  const renderMedicine = () => (
    <>
      {/* Header Card */}
      <Card style={styles.card}>
        <Card.Title 
          title={data.drug_name || "Unknown Drug"} 
          titleVariant="headlineSmall"
          subtitle={data.strength || "Strength Not Specified"}
          left={(props) => <List.Icon {...props} icon="pill" />}
        />
        <Card.Content>
          <View style={styles.chipRow}>
            <Chip icon="prescription" style={styles.chip} compact>
                {data.prescription_drug === "Yes" ? "Rx Required" : "OTC"}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Indications (List of Strings) */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Indications</Text>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          {data.indications && data.indications.length > 0 ? (
            data.indications.map((item: string, index: number) => (
              <Text key={index} variant="bodyMedium" style={{ marginBottom: 4 }}>• {item}</Text>
            ))
          ) : (
            <Text variant="bodyMedium" style={{ fontStyle: 'italic', color: 'gray' }}>No indications listed.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Interactions (List of Objects) */}
      {data.interactions && data.interactions.length > 0 && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.error }]}>Interactions</Text>
          {data.interactions.map((item: any, index: number) => (
            <Card key={index} mode="contained" style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
              <Card.Content>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
                   <Text style={{fontWeight: 'bold', color: theme.colors.onErrorContainer}}>{item.type}</Text>
                   {item.severity && <Chip compact style={{height: 24}} textStyle={{fontSize: 10, lineHeight: 10}}>{item.severity}</Chip>}
                </View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
                  {item.warning}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Side Effects (List of Strings) */}
      {data.side_effects && data.side_effects.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Side Effects</Text>
          <Card mode="outlined" style={styles.card}>
            <Card.Content>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
              {data.side_effects.map((item: string, index: number) => (
                <Chip key={index} compact mode="outlined">{item}</Chip>
              ))}
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Final Recommendation (String) */}
      {data.final_recommendation && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recommendation</Text>
          <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}>
                {data.final_recommendation}
              </Text>
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
          title={data.patient_name && data.patient_name !== "Unknown" ? data.patient_name : "Medical Report"} 
          subtitle={data.report_date || "Date Unknown"}
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
        />
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Summary</Text>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
            {data.patient_summary || data.summary || "No summary available."}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Key Findings</Text>
      <View style={styles.card}>
      {data.abnormalities && data.abnormalities.length > 0 ? (
        data.abnormalities.map((item: any, index: number) => (
          <List.Item
            key={index}
            title={item.test}
            description={`${item.value}  (${item.status})`}
            descriptionStyle={{ color: theme.colors.error, fontWeight: 'bold' }}
            left={props => <List.Icon {...props} icon="alert-circle" color={theme.colors.error} />}
            style={[styles.listItem, { backgroundColor: theme.colors.surfaceVariant, marginBottom: 8, borderRadius: 8 }]}
          />
        ))
      ) : (
        <Text style={{color: 'gray', marginBottom: 10, fontStyle: 'italic', paddingLeft: 4}}>No abnormalities detected.</Text>
      )}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Recommendations</Text>
      <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.secondaryContainer }]}>
        <Card.Content>
          {data.recommendations && data.recommendations.length > 0 ? (
            data.recommendations.map((item: string, index: number) => (
               <View key={index} style={{ marginBottom: 8, flexDirection: 'row' }}>
                  <Text style={{ marginRight: 8, color: theme.colors.onSecondaryContainer }}>•</Text>
                  <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSecondaryContainer }}>
                    {item}
                  </Text>
               </View>
            ))
          ) : (
            <Text style={{color: theme.colors.onSecondaryContainer}}>No specific recommendations.</Text>
          )}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={type === 'med' ? 'Medicine Details' : 'Report Analysis'} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
  sectionTitle: { marginBottom: 12, marginTop: 4, fontWeight: 'bold' },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 0 },
  chip: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
  listItem: { paddingVertical: 4 }
});