import React, { useCallback } from 'react';
import { StyleSheet, FlatList, View, Image, RefreshControl } from 'react-native';
import { Appbar, Text, Card, Chip, useTheme, TouchableRipple } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedView } from '../../components/themed-view';
import { useGlobalState, HistoryItem } from '../../context/GlobalStateContext';

export default function ReportsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { reports, refreshHistory } = useGlobalState();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const title = item.type === 'med' 
      ? (item.response?.drug_name || "Unknown Medicine")
      : (item.response?.patient_name !== "Unknown" ? item.response?.patient_name : "Medical Report");

    const subtitle = new Date(item.date).toLocaleDateString();

    return (
      // FIX: Removed hardcoded 'backgroundColor: white' from styles.card
      // Now using theme.colors.elevation.level1 which adapts to Dark/Light mode
      <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]} mode="elevated">
        <TouchableRipple onPress={() => 
          router.push({ 
            pathname: '/reports/analysis', 
            params: { 
              data: JSON.stringify(item.response), 
              type: item.type 
            } 
          })
        } borderless style={{ borderRadius: 12 }}>
          <View style={styles.cardRow}>
            {/* FIX: Dynamic background color for thumbnail placeholder */}
            <Image 
              source={{ uri: item.image_ref }} 
              style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]} 
              resizeMode="cover"
            />
            
            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Chip compact mode="outlined" style={{height: 24}} textStyle={{fontSize: 10, lineHeight: 10}}>
                  {item.type === 'med' ? 'Medicine' : 'Report'}
                </Chip>
                <Text variant="bodySmall" style={{color: theme.colors.outline}}>{subtitle}</Text>
              </View>
              
              <Text variant="titleMedium" style={{fontWeight: 'bold', marginTop: 4}} numberOfLines={1}>
                {title}
              </Text>
              
              <Text variant="bodySmall" style={{color: theme.colors.secondary, marginTop: 2}} numberOfLines={2}>
                {item.type === 'med' 
                  ? (item.response?.final_recommendation || "See details...") 
                  : (item.response?.patient_summary || item.response?.summary || "No summary available.")}
              </Text>
            </View>
          </View>
        </TouchableRipple>
      </Card>
    );
  };

  return (
    <ThemedView style={styles.container} safeArea>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.Content title="Scan History" />
        <Appbar.Action icon="refresh" onPress={onRefresh} />
      </Appbar.Header>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id || item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{color: theme.colors.secondary}}>No history found.</Text>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  // FIX: Removed 'backgroundColor: white'
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', height: 110 },
  // FIX: Removed hardcoded grey
  thumbnail: { width: 100, height: '100%' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 50 }
});