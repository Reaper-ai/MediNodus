// mobile/services/auth.ts
import { Platform } from 'react-native';

// CHANGE THIS to your backend URL
const API_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http:/10.76.77.212:8000') 
  : 'https://your-production-url.com';

export const authService = {
  async register(email: string, password: string, fullName: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json(); // Returns { access_token: "..." }
  }
};