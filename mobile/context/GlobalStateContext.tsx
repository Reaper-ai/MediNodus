import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { authService } from '../services/auth';
import { apiService } from '../services/api';

type ThemeType = 'light' | 'dark' | 'system';

export interface User {
  name: string;
  email: string;
}

interface MedicalInfo {
  conditions: string;
  allergies: string;
  medications: string;
}

// Matches Backend AppHistoryEntry
export interface HistoryItem {
  _id: string;
  image_ref: string; // URL from Cloudinary
  date: string;
  type: 'med' | 'report';
  response: any; // The AI JSON response
}

interface GlobalContextType {
  theme: ThemeType;
  isHighContrast: boolean;
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  medicalInfo: MedicalInfo;
  reports: HistoryItem[]; // Updated type
  
  setTheme: (t: ThemeType) => void;
  setHighContrast: (val: boolean) => void;
  updateProfile: (name: string) => void;
  updateMedicalInfo: (info: Partial<MedicalInfo>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshHistory: () => Promise<void>; // New helper
  hapticFeedback: (style?: Haptics.ImpactFeedbackStyle) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isHighContrast, setHighContrastState] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [reports, setReports] = useState<HistoryItem[]>([]);
  const [medicalInfo, setMedicalInfoState] = useState<MedicalInfo>({
    conditions: '', allergies: '', medications: ''
  });

  useEffect(() => {
    const loadState = async () => {
      try {
        const [auth, savedToken, th, hc, savedUserStr, med, savedReports] = await Promise.all([
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('highContrast'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('medicalInfo'),
          AsyncStorage.getItem('reports')
        ]);

        if (auth === 'true' && savedToken) {
          setIsLoggedIn(true);
          setToken(savedToken);
          if (savedUserStr) setUser(JSON.parse(savedUserStr));
        }
        if (th) setThemeState(th as ThemeType);
        if (hc) setHighContrastState(hc === 'true');
        if (med) setMedicalInfoState(JSON.parse(med));
        if (savedReports) setReports(JSON.parse(savedReports));

      } catch (e) {
        console.error("Failed to load global state", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const refreshHistory = async () => {
    if (token) {
      try {
        const data = await apiService.getUserHistory(token);
        setReports(data);
        await AsyncStorage.setItem('reports', JSON.stringify(data));
      } catch (e) {
        console.log("Could not fetch history:", e);
      }
    }
  };

  useEffect(() => {
    if (token && isLoggedIn) {
      refreshHistory(); // Fetch on login
      apiService.getMedicalHistory(token).then(data => {
          const mappedInfo = {
            conditions: data.chronic_condition || '',
            allergies: data.allergy || '',
            medications: data.current_medication || ''
          };
          setMedicalInfoState(mappedInfo);
          AsyncStorage.setItem('medicalInfo', JSON.stringify(mappedInfo));
      }).catch(() => {});
    }
  }, [token, isLoggedIn]);

  const hapticFeedback = (style = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(style);
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    const accessToken = data.access_token;
    const newUser: User = { name: email.split('@')[0], email: email };

    setToken(accessToken);
    setIsLoggedIn(true);
    setUser(newUser);

    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userToken', accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    hapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
  };

  const register = async (email: string, password: string, fullName: string) => {
    await authService.register(email, password, fullName);
    const data = await authService.login(email, password);
    const accessToken = data.access_token;
    const newUser: User = { name: fullName, email };
    
    setToken(accessToken);
    setIsLoggedIn(true);
    setUser(newUser);

    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userToken', accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    hapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
  };

  const logout = async () => {
    if (token) {
      try { await authService.logout(token); } catch (e) {}
    }
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setReports([]); // Clear history on logout
    await AsyncStorage.removeItem('reports');
  };

  // ... (setTheme, setHighContrast, updateProfile, updateMedicalInfo same as before) ...
  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    AsyncStorage.setItem('theme', t);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    AsyncStorage.setItem('highContrast', String(val));
  };

  const updateProfile = (name: string) => {
    if (user) {
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateMedicalInfo = async (info: Partial<MedicalInfo>) => {
    const updated = { ...medicalInfo, ...info };
    setMedicalInfoState(updated);
    await AsyncStorage.setItem('medicalInfo', JSON.stringify(updated));
    if (token) {
      try {
        await apiService.updateMedicalHistory(token, {
          chronic_condition: updated.conditions,
          allergy: updated.allergies,
          current_medication: updated.medications
        });
      } catch (error) {
        console.error("Failed to sync medical history:", error);
      }
    }
  };

  return (
    <GlobalContext.Provider value={{
      theme, isHighContrast, isLoggedIn, user, token, isLoading,
      medicalInfo, reports,
      setTheme, setHighContrast, login, register, logout, updateProfile,
      updateMedicalInfo, refreshHistory, hapticFeedback
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalState must be used within GlobalProvider");
  return context;
};