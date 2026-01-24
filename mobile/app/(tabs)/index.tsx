import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, Card, Button, Avatar, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '../../components/themed-view';

export default function Dashboard() {
  const router = useRouter();
  const theme = useTheme();

  return (
    // safeArea={true} ensures content starts below the notch
    <ThemedView style={styles.container} safeArea={true}>
      
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View>
          <Text variant="titleSmall" style={{ color: theme.colors.outline }}>Welcome back,</Text>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>MediNodus</Text>
        </View>
        <IconButton 
          icon="account-circle" 
          size={32} 
          onPress={() => router.push('/profile')} 
        />
      </View>

      {/* FIX: style={{ flex: 1 }} ensures the ScrollView fills the container */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Main Action Card */}
        <Card style={styles.card} mode="elevated" onPress={() => router.push('/scan')}>
          <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} />
          <Card.Title 
            title="Scan New Report" 
            subtitle="Analyze lab results or prescriptions"
            left={(props) => <Avatar.Icon {...props} icon="camera" />}
            right={(props) => <IconButton {...props} icon="arrow-right" />}
          />
        </Card>

        {/* Quick Actions Grid */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {/* Action: 'upload' triggers the document picker in Scan screen */}
          <Button 
            mode="contained-tonal" 
            icon="file-upload" 
            style={styles.gridBtn} 
            onPress={() => router.push({ pathname: '/scan', params: { action: 'upload' } })}
          >
            Upload PDF
          </Button>
          <Button mode="contained-tonal" icon="history" style={styles.gridBtn} onPress={() => router.push('/(tabs)/reports')}>
            History
          </Button>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginBottom: 10,
    marginTop: 10 
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  card: { marginBottom: 20, overflow: 'hidden' },
  sectionTitle: { marginBottom: 10, fontWeight: '600' },
  grid: { flexDirection: 'row', gap: 10 },
  gridBtn: { flex: 1 }
});