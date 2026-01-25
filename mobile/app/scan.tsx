import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { Appbar, Text, Button, IconButton, ActivityIndicator, useTheme, Portal, Dialog, RadioButton, HelperText } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/api';
import { useGlobalState } from '../context/GlobalStateContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../components/ui/icon-symbol';

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { token } = useGlobalState();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  
  // New State for Validation Flow
  const [tempFile, setTempFile] = useState<{ uri: string; type: 'image' | 'pdf'; name: string } | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'report' | 'medicine'>('report');
  const [showTypeDialog, setShowTypeDialog] = useState(false);

  // Helper to trigger the validation dialog
  const initiateUpload = (uri: string, type: 'image' | 'pdf', name: string = 'file') => {
    setTempFile({ uri, type, name });
    setUploadCategory('report'); // Reset default
    setShowTypeDialog(true);
  };


const processUpload = async () => {
    if (!tempFile) return;

    // VALIDATION 1: Medicine cannot be PDF
    if (uploadCategory === 'medicine' && tempFile.type === 'pdf') {
      Alert.alert("Invalid File", "Medicine uploads must be images (Photos of pills/bottles).");
      return;
    }

    setShowTypeDialog(false); // Close dialog
    setLoading(true); 

    try {
      let response;
      
      if (uploadCategory === 'medicine') {
        // Call Medicine Endpoint
        response = await apiService.uploadMedicineImage(tempFile.uri, token || '');
      } else {
        // Call Report Endpoint
        if (tempFile.type === 'pdf') {
          response = await apiService.uploadReportPdf(tempFile.uri, tempFile.name, token || '');
        } else {
          response = await apiService.uploadReportImage(tempFile.uri, token || '');
        }
      }
      
      Alert.alert("Success", "Analysis complete!");

      // FIX: Explicitly pass 'type' ('med' or 'report') so AnalysisScreen doesn't have to guess
      router.push({ 
        pathname: '/reports/analysis', 
        params: { 
          data: JSON.stringify(response.message),
          type: uploadCategory === 'medicine' ? 'med' : 'report' 
        } 
      });

    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setLoading(false);
      setTempFile(null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !loading) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        initiateUpload(photo.uri, 'image', 'capture.jpg');
      }
    }
  };

  const pickDocument = async () => {
    if (loading) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // VALIDATION 2: Only PDF and Images
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const type = file.mimeType?.includes('pdf') ? 'pdf' : 'image';
        initiateUpload(file.uri, type, file.name);
      } else if (params.action === 'upload') {
        router.back();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (params.action === 'upload') {
      pickDocument();
    }
  }, [params.action]);

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
        <Appbar.BackAction color="white" onPress={() => !loading && router.back()} />
        <Appbar.Content title="Scan & Upload" titleStyle={{ color: 'white' }} />
      </Appbar.Header>

      <View style={styles.cameraContainer}>
        {/* If we have a temp image (not PDF), show preview. If PDF, show icon */}
        {tempFile && tempFile.type === 'image' ? (
          <Image source={{ uri: tempFile.uri }} style={styles.preview} />
        ) : tempFile && tempFile.type === 'pdf' ? (
          <View style={styles.pdfPreview}>
            <IconSymbol name="doc.fill" size={80} color="white" />
            <Text style={{color: 'white', marginTop: 10}}>{tempFile.name}</Text>
          </View>
        ) : (
          <CameraView style={styles.camera} ref={cameraRef} facing="back" />
        )}

        {/* VALIDATION 4: Disable background interactions when loading */}
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: 'white', marginTop: 10 }}>Analyzing...</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Please wait</Text>
          </View>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
         <View style={styles.captureRow}>
            <View style={styles.sideBtn}>
              <IconButton 
                icon="folder-open" 
                iconColor="white" 
                size={32} 
                onPress={pickDocument} 
                disabled={loading} // Disable button
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', opacity: loading ? 0.5 : 1 }}
              />
              <Text style={styles.btnLabel}>Upload</Text>
            </View>

            <IconButton 
              icon="circle-slice-8" 
              iconColor="white" 
              size={80} 
              onPress={takePicture}
              disabled={loading} // Disable button
              style={{ margin: 0, opacity: loading ? 0.5 : 1 }} 
            />

            <View style={styles.sideBtn} />
          </View>
      </View>

      {/* VALIDATION: Type Selection Dialog */}
      <Portal>
        <Dialog visible={showTypeDialog} onDismiss={() => setShowTypeDialog(false)} style={{ backgroundColor: theme.colors.elevation.level3 }}>
          <Dialog.Title>Select Upload Type</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 10 }}>What are you scanning?</Text>
            <RadioButton.Group onValueChange={value => setUploadCategory(value as any)} value={uploadCategory}>
              <RadioButton.Item label="Medical Report (Lab/Rx)" value="report" />
              <RadioButton.Item 
                label="Medicine (Pill/Bottle)" 
                value="medicine" 
                disabled={tempFile?.type === 'pdf'} // Disable if PDF
              />
            </RadioButton.Group>
            
            {/* VALIDATION 3: PDF Limit Warning */}
            {tempFile?.type === 'pdf' && (
              <HelperText type="info" visible={true} style={{ color: theme.colors.tertiary }}>
                ⚠️ Ensure PDF is max 2 pages. Longer files may be rejected.
              </HelperText>
            )}
            {uploadCategory === 'medicine' && tempFile?.type === 'pdf' && (
               <HelperText type="error" visible={true}>
                 Medicines cannot be PDF files.
               </HelperText>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setShowTypeDialog(false); setTempFile(null); }}>Cancel</Button>
            <Button mode="contained" onPress={processUpload}>Analyze</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, overflow: 'hidden', borderRadius: 24, marginHorizontal: 16, marginBottom: 10, backgroundColor: '#1a1a1a', justifyContent: 'center' },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'contain' },
  pdfPreview: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 100 // Ensure it sits on top
  },
  controls: { paddingHorizontal: 20, alignItems: 'center' },
  captureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 30 },
  sideBtn: { width: 60, alignItems: 'center' },
  btnLabel: { color: 'white', fontSize: 12, marginTop: 4 }
});