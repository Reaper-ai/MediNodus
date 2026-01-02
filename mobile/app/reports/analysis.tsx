import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalState } from '@/context/GlobalStateContext';

export default function AnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { images } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  // Context for RAG and Persistence
  const { userName, medicalInfo, saveReport, hapticFeedback } = useGlobalState();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const imageUris: string[] = images ? JSON.parse(images as string) : [];

  // 1. DATA PREPARATION (Ready for Backend)
  const preparePayload = () => {
    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('context', JSON.stringify(medicalInfo));

    imageUris.forEach((uri, index) => {
      const fileName = uri.split('/').pop() || `report_${index}.jpg`;
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('files', {
        uri,
        name: fileName,
        type: fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : type,
      } as any);
    });
    return formData;
  };

  // 2. SIMULATED ANALYSIS (To be replaced with fetch)
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setIsLoading(true);
        // const payload = preparePayload();
        // const response = await fetch('https://your-api.com/analyze', { method: 'POST', body: payload });
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing
        
        setResult({
          title: "Comprehensive Report Analysis",
          status: 'warning',
          summary: "Based on your context (Diabetes), your glucose levels are within range, but your Iron is slightly low.",
          details: [
            { label: 'Glucose (Fasting)', value: '98 mg/dL', status: 'safe' },
            { label: 'Hemoglobin', value: '11.5 g/dL', status: 'warning' },
            { label: 'Ferritin', value: '22 ng/mL', status: 'danger' }
          ]
        });
      } catch (error) {
        Alert.alert("Error", "MediNodus AI failed to reach the server.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, []);

  // 3. LOADING GUARD (Prevents status of null error)
  if (isLoading || !result) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={{ marginTop: 20, opacity: 0.7 }}>MediNodus AI is processing your files...</ThemedText>
      </ThemedView>
    );
  }

  // 4. SEMANTIC THEME LOGIC
  const getStatusStyles = (status: 'safe' | 'warning' | 'danger') => {
    switch (status) {
      case 'safe': return { bg: theme.successBg, text: theme.success, icon: 'checkmark.circle.fill' };
      case 'warning': return { bg: theme.warningBg, text: theme.warning, icon: 'exclamationmark.triangle.fill' };
      case 'danger': return { bg: theme.dangerBg, text: theme.danger, icon: 'xmark.octagon.fill' };
      default: return { bg: theme.surface, text: theme.text, icon: 'doc.text' };
    }
  };

  const statusStyle = getStatusStyles(result.status);

  const handleSaveToHistory = async () => {
    await saveReport({
      title: result.title,
      status: result.status,
      summary: result.summary,
      details: result.details,
      images: imageUris
    });
    router.replace('/(tabs)/reports');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <IconSymbol name="chevron.left" size={24} color={theme.text} />
           </TouchableOpacity>
           <ThemedText type="subtitle">AI Analysis</ThemedText>
           <View style={{ width: 44 }} />
        </View>

        {/* Image/PDF Preview Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {imageUris.map((uri, idx) => (
              <View key={idx} style={styles.thumbnailWrapper}>
                {uri.toLowerCase().endsWith('.pdf') ? (
                  <View style={[styles.pdfCard, { backgroundColor: theme.surface }]}>
                    <IconSymbol name="doc.text.fill" size={32} color={theme.tint} />
                    <ThemedText style={{ fontSize: 10 }}>PDF</ThemedText>
                  </View>
                ) : (
                  <Image source={{ uri }} style={styles.imageThumb} />
                )}
              </View>
            ))}
        </ScrollView>

        {/* Main Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusStyle.bg, borderColor: statusStyle.text }]}>
           <View style={styles.statusHeader}>
              <IconSymbol name={statusStyle.icon as any} size={28} color={statusStyle.text} />
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {result.status.toUpperCase()}
              </ThemedText>
           </View>
           <ThemedText style={[styles.summaryText, { color: statusStyle.text }]}>
              {result.summary}
           </ThemedText>
        </View>

        {/* Detailed Metrics */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Key Metrics</ThemedText>
        <View style={styles.detailsContainer}>
           {result.details.map((item: any, idx: number) => (
             <View key={idx} style={[styles.detailRow, { borderBottomColor: theme.border }]}>
               <View>
                  <ThemedText style={{ fontWeight: '500' }}>{item.label}</ThemedText>
                  <ThemedText style={styles.metricValue}>{item.value}</ThemedText>
               </View>
               <View style={[styles.miniBadge, { backgroundColor: getStatusStyles(item.status).bg }]}>
                  <ThemedText style={{ color: getStatusStyles(item.status).text, fontSize: 11, fontWeight: 'bold' }}>
                    {item.status.toUpperCase()}
                  </ThemedText>
               </View>
             </View>
           ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.tint }]}
            onPress={handleSaveToHistory}
          >
            <ThemedText style={styles.btnText}>Save to History</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.discardBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={{ color: theme.textSecondary }}>Discard Analysis</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  
  imageScroll: { paddingLeft: 20, marginBottom: 24, flexGrow: 0 },
  thumbnailWrapper: { marginRight: 12 },
  imageThumb: { width: 100, height: 140, borderRadius: 12, backgroundColor: '#333' },
  pdfCard: { width: 100, height: 140, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },

  statusCard: { marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 32 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statusText: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  summaryText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },

  sectionTitle: { marginHorizontal: 20, marginBottom: 16 },
  detailsContainer: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  metricValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  footer: { marginTop: 40, paddingHorizontal: 20, gap: 12 },
  saveBtn: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  discardBtn: { height: 56, justifyContent: 'center', alignItems: 'center' }
});