import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme]; // Access the theme object directly

  const recentActivity = [
    { id: 1, title: 'Blood Panel', date: 'Oct 26', status: '2 Abnormalities', icon: 'doc.text.fill' },
    { id: 2, title: 'Metformin Strip', date: 'Oct 24', status: 'Safe', icon: 'camera.viewfinder' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Hello, Priya <HelloWave /></ThemedText>
            <ThemedText style={styles.subtitle}>
              Health Status: <ThemedText type="defaultSemiBold" style={{ color: theme.success }}>Stable</ThemedText>
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <View style={[styles.avatar, { backgroundColor: theme.tint }]} />
          </TouchableOpacity>
        </View>

        {/* 2. Daily Insight Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.tint }]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="sparkles" size={20} color={theme.tint} />
            <ThemedText type="defaultSemiBold" style={{ color: theme.tint, marginLeft: 8 }}>Daily Insight</ThemedText>
          </View>
          <ThemedText style={styles.cardBody}>
            Your Iron levels were low in the last report. Consider adding spinach or lentils to your lunch today! 🥗
          </ThemedText>
        </View>

        {/* 3. Quick Actions */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.surface }]}
            onPress={() => console.log('Open Document Picker')} 
          >
            <IconSymbol name="doc.text.fill" size={32} color={theme.tint} />
            <ThemedText type="defaultSemiBold" style={styles.actionText}>Upload Report</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/scan')}
          >
            <IconSymbol name="camera.viewfinder" size={32} color={theme.tint} />
            <ThemedText type="defaultSemiBold" style={styles.actionText}>Check Meds</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 4. Recent Activity */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          <TouchableOpacity onPress={() => router.push('/reports')}>
            <ThemedText type="link">See All</ThemedText>
          </TouchableOpacity>
        </View>

        {recentActivity.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.listCard, { borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.tint + '20' }]}> 
              <IconSymbol name={item.icon as any} size={24} color={theme.tint} />
            </View>
            <View style={styles.listContent}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText style={[styles.listSubtext, { color: theme.textSecondary }]}>
                {item.date} • {item.status}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.icon} />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  subtitle: { marginTop: 4, opacity: 0.7 },
  profileButton: { padding: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  card: { padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: 'transparent' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardBody: { fontSize: 15, lineHeight: 22 },
  sectionTitle: { marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  actionCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionText: { textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  listContent: { flex: 1 },
  listSubtext: { fontSize: 13, marginTop: 2 },
});