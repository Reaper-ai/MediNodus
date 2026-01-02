import { FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useGlobalState } from '@/context/GlobalStateContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ReportsScreen() {
  const { reports } = useGlobalState();
  const theme = Colors[useColorScheme() ?? 'light'];

  const renderReportItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}
      onPress={() => {/* We will add View Details later */}}
    >
      <View style={[styles.statusIndicator, { backgroundColor: item.status === 'safe' ? '#4ADE80' : '#F87171' }]} />
      <View style={styles.reportInfo}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.dateText}>{item.date}</ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color={theme.icon} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<ThemedText type="title" style={styles.header}>History</ThemedText>}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={48} color={theme.icon} />
            <ThemedText style={styles.emptyText}>No reports analyzed yet.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  listContent: { paddingBottom: 100 },
  reportCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  statusIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  reportInfo: { flex: 1 },
  dateText: { fontSize: 13, opacity: 0.6, marginTop: 4 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyText: { opacity: 0.5 }
});