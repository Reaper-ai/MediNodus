import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AnalysisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // We expect 'images' to be passed as a JSON string
  const imageUris = params.images ? JSON.parse(params.images as string) : [];
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // SIMULATE API CALL
    const analyzeImages = async () => {
      // 1. In real app: FormData append images -> fetch('api/analyze')
      setTimeout(() => {
        setResult({
          status: 'warning', // 'safe' | 'warning' | 'danger'
          title: 'Potential Interaction Found',
          summary: 'The scanned medication "Metformin" may interact with your reported kidney condition. Please consult your doctor.',
          details: [
            { label: 'Drug Name', value: 'Metformin Hydrochloride' },
            { label: 'Dosage', value: '500mg' },
            { label: 'Safety Score', value: '85/100' },
          ]
        });
        setLoading(false);
      }, 3000); // 3 second fake delay
    };

    analyzeImages();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText type="subtitle" style={{ marginTop: 20 }}>Analyzing Report...</ThemedText>
        <ThemedText style={{ opacity: 0.6, marginTop: 8 }}>Consulting medical database</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismissTo('/(tabs)')} style={styles.closeBtn}>
           <IconSymbol name="xmark" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Analysis Result</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. Status Card */}
        <View style={[styles.statusCard, { backgroundColor: result.status === 'safe' ? '#DCFCE7' : '#FEF2F2', borderColor: result.status === 'safe' ? '#16A34A' : '#DC2626' }]}>
            <IconSymbol 
              name={result.status === 'safe' ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'} 
              size={32} 
              color={result.status === 'safe' ? '#16A34A' : '#DC2626'} 
            />
            <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ color: result.status === 'safe' ? '#14532D' : '#7F1D1D' }}>
                  {result.title}
                </ThemedText>
            </View>
        </View>

        {/* 2. AI Summary */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="defaultSemiBold" style={styles.label}>AI Summary</ThemedText>
          <ThemedText style={styles.bodyText}>{result.summary}</ThemedText>
        </View>

        {/* 3. Extracted Details */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Extracted Details</ThemedText>
          {result.details.map((item: any, index: number) => (
             <View key={index} style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: index === result.details.length - 1 ? 0 : 1 }]}>
                <ThemedText style={{ opacity: 0.6 }}>{item.label}</ThemedText>
                <ThemedText type="defaultSemiBold">{item.value}</ThemedText>
             </View>
          ))}
        </View>

        {/* 4. Original Images */}
        <ThemedText type="defaultSemiBold" style={styles.label}>Scanned Images</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
           {imageUris.map((uri: string, idx: number) => (
             <Image key={idx} source={{ uri }} style={styles.scannedThumb} />
           ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.tint }]}
          onPress={() => router.navigate('/(tabs)/reports')} // Go to history
        >
          <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Save to History</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
  closeBtn: { padding: 8 },
  content: { padding: 20, paddingBottom: 50 },
  statusCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 12, marginBottom: 24 },
  section: { padding: 16, borderRadius: 16, marginBottom: 24 },
  label: { marginBottom: 12, opacity: 0.8 },
  bodyText: { lineHeight: 24, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  imageScroll: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  scannedThumb: { width: 80, height: 80, borderRadius: 12, marginRight: 12, backgroundColor: '#eee' },
  saveButton: { padding: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
});