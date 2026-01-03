import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert, 
  Dimensions, 
  ActivityIndicator,
  BackHandler 
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { ImageEditor } from 'expo-dynamic-image-crop';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

// Themed Components (assuming these paths are correct in your project)
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Colors } from '../constants/theme';
import { useThemeColor } from '../hooks/use-theme-color';
import { IconSymbol } from '../components/ui/icon-symbol';


interface CapturedImage {
  id: string;
  uri: string;
  timestamp: number;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // States
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isLoading, setIsLoading] = useState(false);

  // Theme Colors
  const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
  const tintColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const surfaceColor = useThemeColor({ light: Colors.light.surface, dark: Colors.dark.surface }, 'surface');
  const dangerColor = useThemeColor({ light: Colors.light.danger, dark: Colors.dark.danger }, 'danger');
  const successColor = useThemeColor({ light: Colors.light.success, dark: Colors.dark.success }, 'success');

  // Handle Android Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (isReviewing) {
        setIsReviewing(false);
        return true;
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isReviewing]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  if (!permission?.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.permissionText}>Camera permission is required to scan.</ThemedText>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: tintColor }]} onPress={requestPermission}>
          <ThemedText style={{ color: '#fff' }}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // --- Handlers ---

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setCapturedImages(prev => [...prev, { id: Date.now().toString(), uri: photo.uri, timestamp: Date.now() }]);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
    console.log("toggle")
    Haptics.selectionAsync();
  };

  const handleStartCrop = (index: number) => {
    setEditingIndex(index);
    setIsCropping(true);
  };

  const onCropDone = (uri: string) => {
    if (editingIndex !== null) {
      const updated = [...capturedImages];
      updated[editingIndex].uri = uri;
      setCapturedImages(updated);
    }
    setIsCropping(false);
    setEditingIndex(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('scanned_images', JSON.stringify(capturedImages));
      router.push('/reports/analysis');
    } catch (e) {
      Alert.alert("Error", "Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI Components ---

  // 1. Camera View
  if (!isReviewing) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <CameraView 
          ref={cameraRef} 
          style={StyleSheet.absoluteFill} 
          flash={flash}
          facing="back" 
        />
        
        {/* Top Controls */}
        <View style={[styles.overlayTop, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.roundBtn}>
            <IconSymbol name='chevron.left' size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash} style={styles.roundBtn}>
            <IconSymbol name={flash === 'on' ? 'flash' : 'flash_off'} size={24} color={flash === 'on' ? "#FFD700" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={[styles.overlayBottom, { paddingBottom: insets.bottom + 20 }]}>
          {/* Gallery Preview */}
          <TouchableOpacity 
            style={styles.previewThumbnail} 
            onPress={() => capturedImages.length > 0 && setIsReviewing(true)}
          >
            {capturedImages.length > 0 ? (
              <Image source={{ uri: capturedImages[capturedImages.length - 1].uri }} style={styles.full} />
            ) : (
              <View style={[styles.full, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            )}
            {capturedImages.length > 0 && (
              <View style={styles.badge}><ThemedText style={styles.badgeText}>{capturedImages.length}</ThemedText></View>
            )}
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
            <View style={styles.captureInternal} />
          </TouchableOpacity>

          {/* Proceed Button */}
          <TouchableOpacity 
            style={[styles.doneBtn, { opacity: capturedImages.length > 0 ? 1 : 0.5 }]} 
            onPress={() => capturedImages.length > 0 && setIsReviewing(true)}
          >
            <IconSymbol name="checkmark" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Review View
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsReviewing(false)}>
          <IconSymbol name="camera" size={24} color={tintColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Review Scans</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollList}>
        {capturedImages.map((img, idx) => (
          <View key={img.id} style={[styles.card, { backgroundColor: surfaceColor }]}>
            <Image source={{ uri: img.uri }} style={styles.cardImg} contentFit="cover" />
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleStartCrop(idx)}>
                <IconSymbol name="crop" size={18} color={tintColor} />
                <ThemedText style={{ color: tintColor, marginLeft: 5 }}>Crop</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => setCapturedImages(prev => prev.filter(i => i.id !== img.id))}
              >
                <IconSymbol name="trash" size={18} color={dangerColor} />
                <ThemedText style={{ color: dangerColor, marginLeft: 5 }}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: successColor }]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.submitText}>Submit {capturedImages.length} Photos</ThemedText>}
        </TouchableOpacity>
      </View>

      {/* Crop Modal */}
      {isCropping && editingIndex !== null && (
        <Modal visible={isCropping} transparent={false} animationType="slide">
          <ImageEditor
            imageUri={capturedImages[editingIndex].uri}
            onEditingComplete={(res) => onCropDone(res.uri)}
            onEditingCancel={() => setIsCropping(false)}
          />
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  full: { width: '100%', height: '100%' },
  // Camera UI
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  overlayBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  roundBtn: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInternal: { width: 65, height: 65, borderRadius: 35, backgroundColor: '#fff' },
  previewThumbnail: { width: 60, height: 60, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  doneBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  // Review UI
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollList: { padding: 16 },
  card: { marginBottom: 20, borderRadius: 15, overflow: 'hidden', elevation: 3, shadowOpacity: 0.1 },
  cardImg: { width: '100%', height: 250 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  actionBtn: { flex: 1, flexDirection: 'row', padding: 12, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 16 },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  permissionText: { textAlign: 'center', marginBottom: 20 },
  primaryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});