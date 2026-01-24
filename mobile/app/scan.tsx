import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Appbar, Text, Button, IconButton, ActivityIndicator, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { apiService } from '../services/api';
import { useGlobalState } from '../context/GlobalStateContext';

export default function ScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { token } = useGlobalState();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ marginBottom: 10 }}>We need your permission to show the camera</Text>
        <Button mode="contained" onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  const handleUpload = async (uri: string, type: 'image' | 'pdf') => {
    setLoading(true);
    try {
      // Choose correct API endpoint based on file type
      const response = type === 'image' 
        ? await apiService.uploadReportImage(uri, token || '')
        : await apiService.uploadReportPdf(uri, 'report.pdf', token || '');
      
      Alert.alert("Success", "Analysis complete!");
      // Navigate to analysis results (mock navigation)
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
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const type = file.mimeType?.includes('pdf') ? 'pdf' : 'image';
      handleUpload(file.uri, type);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'black' }]}>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction color="white" onPress={() => router.back()} />
        <Appbar.Content title="Scan Report" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      {/* Main Content Area */}
      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.preview} />
        ) : (
          <CameraView 
            style={styles.camera} 
            ref={cameraRef}
            facing="back"
          />
        )}
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: 'white', marginTop: 10 }}>Analyzing...</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {capturedImage ? (
          <View style={styles.actionRow}>
            <Button mode="outlined" textColor="white" onPress={() => setCapturedImage(null)}>Retake</Button>
            <Button mode="contained" onPress={() => handleUpload(capturedImage, 'image')}>Analyze</Button>
          </View>
        ) : (
          <View style={styles.captureRow}>
            <IconButton icon="file-document" iconColor="white" size={30} onPress={pickDocument} />
            <IconButton icon="camera-iris" iconColor="white" size={70} onPress={takePicture} />
            <IconButton icon="image" iconColor="white" size={30} onPress={pickImage} />
          </View>
        )}
        <Text style={styles.hint}>Photo, Gallery, or PDF</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 20, marginHorizontal: 10 },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  controls: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
  actionRow: { flexDirection: 'row', gap: 20 },
  hint: { color: 'gray', marginTop: 10 }
});