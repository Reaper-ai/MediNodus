import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { 
  Button, StyleSheet, TouchableOpacity, View, Image, Text, 
  Modal, ScrollView, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ImageEditor } from 'expo-dynamic-image-crop';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  
  // --- STATE ---
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState(false); // Shows the Batch Review Modal
  const [isCropping, setIsCropping] = useState(false);   // Shows the Crop Editor
  
  // Temp state for the image currently being edited
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempUri, setTempUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 100}}>Camera Permission Required</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 1. RAPID CAPTURE (No blocking)
  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
            // Add directly to batch!
            setCapturedImages(prev => [...prev, photo.uri]);
        }
      } catch (error) {
        console.error("Capture failed", error);
      }
    }
  };

  // 2. OPEN REVIEW MODAL
  const openReview = () => {
    setIsReviewing(true);
  };

  // 3. TRIGGER CROP (From Review Screen)
  const startCrop = (index: number) => {
    setEditingIndex(index);
    setTempUri(capturedImages[index]); // Load the specific image
    setIsCropping(true);
  };

  // 4. SAVE CROP RESULT
  const onCropSuccess = async (result: { uri: string }) => {
    if (result.uri && editingIndex > -1) {
      // Replace the old image with the cropped version
      const updatedBatch = [...capturedImages];
      updatedBatch[editingIndex] = result.uri;
      setCapturedImages(updatedBatch);
    }
    closeEditor();
  };

  const closeEditor = () => {
    setTempUri(null);
    setEditingIndex(-1);
    setIsCropping(false);
  };

  const deleteImage = (index: number) => {
    const updatedBatch = capturedImages.filter((_, i) => i !== index);
    setCapturedImages(updatedBatch);
    if (updatedBatch.length === 0) setIsReviewing(false); // Close if empty
  };

  const handleFinishBatch = () => {
      // Navigate to Analysis
      setIsReviewing(false);
      router.push({
        pathname: '/reports/analysis',
        params: { images: JSON.stringify(capturedImages) }
      });
  };

  return (
    <View style={styles.container}>
      
      {/* --- CAMERA VIEW --- */}
      <CameraView ref={cameraRef} style={styles.camera} facing="back" animateShutter={false}>
        <View style={[styles.overlayContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
            
            {/* Top Bar */}
            <View style={styles.topBar}>
                 <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <IconSymbol name="xmark" size={24} color="white" />
                 </TouchableOpacity>
                 <View style={styles.batchBadge}>
                     <Text style={styles.batchText}>{capturedImages.length} Scanned</Text>
                 </View>
                 <View style={{ width: 44 }} /> 
            </View>

            {/* Viewfinder Guide */}
            <View style={styles.focusFrame}>
                <View style={styles.cornerTL} /><View style={styles.cornerTR} />
                <View style={styles.cornerBL} /><View style={styles.cornerBR} />
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
                {/* Thumbnail -> Opens Review */}
                <View style={styles.controlSide}>
                    {capturedImages.length > 0 && (
                        <TouchableOpacity onPress={openReview}>
                             <Image source={{ uri: capturedImages[capturedImages.length - 1] }} style={styles.thumbnail} />
                             <View style={styles.thumbnailBadge}><Text style={styles.badgeText}>{capturedImages.length}</Text></View>
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Shutter */}
                <TouchableOpacity onPress={handleCapture} style={styles.shutterOuter}>
                    <View style={styles.shutterInner} />
                </TouchableOpacity>

                {/* Done -> Opens Review (or Submit directly) */}
                <View style={styles.controlSide}>
                    {capturedImages.length > 0 && (
                        <TouchableOpacity onPress={openReview} style={styles.doneButton}>
                            <IconSymbol name="checkmark" size={24} color="black" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
      </CameraView>


      {/* --- REVIEW MODAL (New!) --- */}
      <Modal visible={isReviewing} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.reviewContainer, { backgroundColor: theme.background }]}>
            
            {/* Review Header */}
            <View style={[styles.reviewHeader, { paddingTop: 20 }]}>
                <TouchableOpacity onPress={() => setIsReviewing(false)}>
                    <Text style={{ color: theme.tint, fontSize: 17 }}>Add More</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Review ({capturedImages.length})</Text>
                <TouchableOpacity onPress={handleFinishBatch}>
                    <Text style={{ color: theme.tint, fontSize: 17, fontWeight: 'bold' }}>Done</Text>
                </TouchableOpacity>
            </View>

            {/* Horizontal Scroll List */}
            <ScrollView 
                contentContainerStyle={styles.reviewList}
                showsVerticalScrollIndicator={false}
            >
                {capturedImages.map((uri, index) => (
                    <View key={index} style={styles.reviewItem}>
                        <Image source={{ uri }} style={styles.reviewImage} resizeMode="contain" />
                        
                        <View style={styles.reviewActions}>
                            <TouchableOpacity onPress={() => deleteImage(index)} style={styles.actionBtn}>
                                <IconSymbol name="trash" size={20} color="#EF4444" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => startCrop(index)} style={[styles.actionBtn, { backgroundColor: theme.tint }]}>
                                <IconSymbol name="crop" size={20} color="white" />
                                <Text style={{ color: 'white', marginLeft: 6, fontWeight: '600' }}>Crop</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
      </Modal>


      {/* --- CROP EDITOR (Triggered from Review) --- */}
      <ImageEditor
        isVisible={isCropping}
        imageUri={tempUri}
        fixedAspectRatio={0}
        onEditingComplete={onCropSuccess}
        onEditingCancel={closeEditor}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlayContainer: { flex: 1, justifyContent: 'space-between' },
  
  // Camera UI
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', height: 60 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  batchBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  batchText: { color: '#4ADE80', fontWeight: 'bold' },
  
  focusFrame: { width: 280, height: 400, alignSelf: 'center', borderColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderRadius: 20 },
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: 'white' },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: 'white' },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: 'white' },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: 'white' },
  
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20, height: 120 },
  controlSide: { width: 60, alignItems: 'center' },
  shutterOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' },
  
  thumbnail: { width: 50, height: 50, borderRadius: 8, borderWidth: 2, borderColor: 'white', opacity: 0.8 },
  thumbnailBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#4ADE80', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: 'black' },
  doneButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },

  // Review Modal Styles
  reviewContainer: { flex: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  reviewList: { padding: 20, gap: 30 },
  reviewItem: { marginBottom: 30, alignItems: 'center' },
  reviewImage: { width: '100%', height: 400, borderRadius: 12, backgroundColor: '#f0f0f0' },
  reviewActions: { flexDirection: 'row', marginTop: 12, gap: 16, width: '100%', justifyContent: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#f0f0f0' },
});