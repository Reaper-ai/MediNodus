import { StyleSheet, TouchableOpacity, ScrollView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker'; //

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlobalState } from '@/context/GlobalStateContext'; // Access haptics

export default function HomeScreen() {
  const router = useRouter();
  const { hapticFeedback, userName } = useGlobalState(); //
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // 1. Storage Upload Handler
  const handleUploadFromStorage = async () => {
    try {
      if (hapticFeedback) hapticFeedback(); //
      const result = await DocumentPicker.getDocumentAsync({ //
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled && result.assets?.[0]) {
        router.push({
          pathname: '/reports/analysis',
          params: { images: JSON.stringify([result.assets[0].uri]) }
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not access storage. Please try again.");
    }
  };

  const recentActivity = [
    { id: 1, title: 'Blood Panel', date: 'Oct 26', status: '2 Abnormalities', icon: 'doc.text.fill' },
    { id: 2, title: 'Metformin Strip', date: 'Oct 24', status: 'Safe', icon: 'camera.viewfinder' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Hello, {userName || 'Priya'} <HelloWave /></ThemedText>
            <ThemedText style={styles.subtitle}>
              Health Status: <ThemedText type="defaultSemiBold" style={{ color: '#4ADE80' }}>Stable</ThemedText>
            </ThemedText>
          </View>
          <TouchableOpacity 
            onPress={() => { hapticFeedback?.(); router.push('/profile'); }}
          >
            <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
               <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                {(userName || 'P').charAt(0)}
               </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. Primary Quick Actions - Redesigned for Index-only Focus */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Analyze Now</ThemedText>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.mainActionCard, { backgroundColor: theme.tint }]}
            onPress={() => { hapticFeedback?.(); router.push('/scan'); }}
          >
            <IconSymbol name="camera.fill" size={32} color="white" />
            <ThemedText style={styles.mainActionText}>Scan Report</ThemedText>
            <ThemedText style={styles.actionSubtext}>Capture with Camera</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainActionCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
            onPress={handleUploadFromStorage}
          >
            <IconSymbol name="doc.fill" size={32} color={theme.tint} />
            <ThemedText style={[styles.mainActionText, { color: theme.text }]}>Upload File</ThemedText>
            <ThemedText style={styles.actionSubtext}>PDF or Gallery</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 3. Daily Insight Card */}
        <View style={[styles.insightCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="sparkles" size={18} color={theme.tint} />
            <ThemedText type="defaultSemiBold" style={{ color: theme.tint, marginLeft: 8 }}>Daily Insight</ThemedText>
          </View>
          <ThemedText style={styles.cardBody}>
            Your Iron levels were low in the last report. Consider adding spinach or lentils to your lunch today! 🥗
          </ThemedText>
        </View>

        {/* 4. Recent Activity */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent History</ThemedText>
          <TouchableOpacity onPress={() => router.push('/reports')}>
            <ThemedText type="link">See All</ThemedText>
          </TouchableOpacity>
        </View>

        {recentActivity.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.listCard, { borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.surface }]}> 
              <IconSymbol name={item.icon as any} size={22} color={theme.tint} />
            </View>
            <View style={styles.listContent}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText style={[styles.listSubtext, { color: theme.textSecondary }]}>
                {item.date} • {item.status}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={theme.icon} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  subtitle: { marginTop: 4, opacity: 0.7 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  
  // Quick Action Grid
  sectionTitle: { marginBottom: 16, fontSize: 18 },
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  mainActionCard: { 
    flex: 1, 
    height: 140, 
    borderRadius: 24, 
    padding: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  mainActionText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  actionSubtext: { fontSize: 11, opacity: 0.6, textAlign: 'center' },

  insightCard: { padding: 20, borderRadius: 20, marginBottom: 32, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardBody: { fontSize: 14, lineHeight: 20, opacity: 0.9 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  listContent: { flex: 1 },
  listSubtext: { fontSize: 12, marginTop: 2 },
});