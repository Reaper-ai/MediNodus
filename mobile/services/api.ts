// mobile/services/api.ts
import { Platform } from 'react-native';

// Ensure this matches the IP in your services/auth.ts
const API_URL = 'http://10.23.1.82:8000'; 

export const apiService = {
  
  async uploadMedicineImage(imageUri: string, token: string) {
    const formData = new FormData();
    // React Native's FormData requires uri, type, and name
    formData.append('image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: 'image/jpeg', 
      name: 'upload.jpg',
    } as any);

    const response = await fetch(`${API_URL}/med/upload-medicine-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload medicine image');
    }
    return response.json();
  },

  async uploadReportImage(imageUri: string, token: string) {
    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    const response = await fetch(`${API_URL}/med/upload-medical-report-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload report image');
    }
    return response.json();
  },

  async uploadReportPdf(pdfUri: string, fileName: string, token: string) {
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? pdfUri.replace('file://', '') : pdfUri,
      type: 'application/pdf',
      name: fileName || 'report.pdf',
    } as any);

    const response = await fetch(`${API_URL}/med/upload-medical-report-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload PDF');
    }
    return response.json();
  },

  // --- NEW: Medical History Endpoints ---

  async getMedicalHistory(token: string) {
    const response = await fetch(`${API_URL}/med/infoget`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch medical history');
    return response.json();
  },

  async updateMedicalHistory(token: string, data: { allergy: string, chronic_condition: string, current_medication: string }) {
    const response = await fetch(`${API_URL}/med/infoupdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update medical history');
    return response.json();
  },

  // NEW: Fetch Scan History
  async getUserHistory(token: string) {
    const response = await fetch(`${API_URL}/med/history`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch history');
    }
    return response.json();
  }
};


