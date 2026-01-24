import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Appbar, Text, Button, IconButton, ActivityIndicator, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/api';
import { useGlobalState } from '../context/GlobalStateContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { token } = useGlobalState();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // FIX: Moved helper functions ABOVE the early returns so they are always defined
  const handleUpload = async (uri: string, type: 'image' | 'pdf') => {
    setLoading(true);
    try {
      const response = type === 'image' 
        ? await apiService.uploadReportImage(uri, token || '')
        : await apiService.uploadReportPdf(uri, 'report.pdf', token || '');
      
      Alert.alert("Success", "Analysis complete!");
      router.push({ pathname: '/reports/analysis', params: { ...response } });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setCapturedImage(null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) setCapturedImage(photo.uri);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const type = file.mimeType?.includes('pdf') ? 'pdf' : 'image';
        handleUpload(file.uri, type);
      } else if (params.action === 'upload') {
        router.back();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // FIX: useEffect is now safe because pickDocument is definitely defined
  useEffect(() => {
    if (params.action === 'upload') {
      pickDocument();
    }
  }, [params.action]);

  // --- Early Returns (Must be AFTER function definitions) ---
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ marginBottom: 10 }}>Camera permission is required</Text>
        <Button mode="contained" onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'black', paddingTop: insets.top }]}>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction color="white" onPress={() => router.back()} />
        <Appbar.Content title="Scan Report" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.preview} />
        ) : (
          <CameraView style={styles.camera} ref={cameraRef} facing="back" />
        )}
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: 'white', marginTop: 10 }}>Analyzing...</Text>
          </View>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        {capturedImage ? (
          <View style={styles.actionRow}>
            <Button mode="outlined" textColor="white" onPress={() => setCapturedImage(null)}>Retake</Button>
            <Button mode="contained" onPress={() => handleUpload(capturedImage, 'image')}>Analyze</Button>
          </View>
        ) : (
          <View style={styles.captureRow}>
            <View style={styles.sideBtn}>
              <IconButton 
                icon="image-multiple" 
                iconColor="white" 
                size={32} 
                onPress={pickDocument} 
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <Text style={styles.btnLabel}>Upload</Text>
            </View>

            <IconButton 
              icon="circle-slice-8" 
              iconColor="white" 
              size={80} 
              onPress={takePicture}
              style={{ margin: 0 }} 
            />

            <View style={styles.sideBtn} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 24, marginHorizontal: 16, marginBottom: 10 },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  controls: { paddingHorizontal: 20, alignItems: 'center' },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 30 },
  actionRow: { flexDirection: 'row', gap: 20 },
  sideBtn: { width: 60, alignItems: 'center' },
  btnLabel: { color: 'white', fontSize: 12, marginTop: 4 }
});