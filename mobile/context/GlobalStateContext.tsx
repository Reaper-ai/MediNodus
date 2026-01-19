import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth';
type ThemeType = 'light' | 'dark' | 'system';

interface MedicalInfo {
  conditions: string;
  allergies: string;
  medications: string;
}


interface Report {
  id: string;
  date: string;
  title: string;
  status: 'safe' | 'warning' | 'danger';
  summary: string;
  details: any[];
  images: string[];
}


interface GlobalContextType {
  theme: ThemeType;
  isHighContrast: boolean;
  medicalInfo: MedicalInfo;
  reports: Report[];
  saveReport: (reportData: Omit<Report, 'id' | 'date'>) => Promise<void>;
  updateMedicalInfo: (info: Partial<MedicalInfo>) => void;
  setTheme: (t: ThemeType) => void;
  setHighContrast: (val: boolean) => void;
  hapticFeedback: (style?: Haptics.ImpactFeedbackStyle) => void;
  updateProfile: (name: string) => void; // Added for profile updates
  isLoggedIn: boolean;
  userName: string;
  token: string | null; // Add token
  login: (email: string, password: string) => Promise<void>; // Update signature
  register: (email: string, password: string, fullName: string) => Promise<void>; // Add register
  logout: () => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isHighContrast, setHighContrastState] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(''); // Initialize username state
  const [medicalInfo, setMedicalInfoState] = useState<MedicalInfo>({
    conditions: '',
    allergies: '',
    medications: '',
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadState = async () => {
      // Keep all async calls inside this function
      const [auth, savedToken ,th, hc, user, medical, savedReports] = await Promise.all([
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('theme'),
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('highContrast'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('medicalInfo'), // Added this
        AsyncStorage.getItem('reports')
      ]);

      if (auth === 'true' && savedToken ){
        setIsLoggedIn(true);
        setToken(savedToken);
        if (user) setUserName(user);
      };
      if (th) setThemeState(th as ThemeType);
      if (hc) setHighContrastState(hc === 'true');
      if (medical) setMedicalInfoState(JSON.parse(medical)); // Parse and set the medical state
      if (savedReports) setReports(JSON.parse(savedReports));

    };
    loadState();
  }, []);


  const hapticFeedback = (style = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
  };

  // UPDATED LOGIN
  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      
      setToken(data.access_token);
      setIsLoggedIn(true);
      // Ideally, you should fetch the user profile here to get the real name
      // For now, we will use the email or a placeholder until a /me endpoint exists
      setUserName(email.split('@')[0]); 

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userToken', data.access_token);
      await AsyncStorage.setItem('userName', email.split('@')[0]);
      
      hapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error(error);
      throw error; // Re-throw to handle UI error states in the view
    }
  };

  // NEW REGISTER
  const register = async (email: string, password: string, fullName: string) => {
    try {
      await authService.register(email, password, fullName);
      await login(email, password);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  const logout = async () => {
    setIsLoggedIn(false);
    setUserName('');
    setToken(null);
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userName');
    hapticFeedback(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateProfile = async (name: string) => {
    setUserName(name);
    await AsyncStorage.setItem('userName', name);
    hapticFeedback(Haptics.ImpactFeedbackStyle.Light);
  };

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    AsyncStorage.setItem('theme', t); // Fire and forget
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    AsyncStorage.setItem('highContrast', String(val)); // Fire and forget
  };


  const saveReport = async (reportData: Omit<Report, 'id' | 'date'>) => {
  const newReport: Report = {
    ...reportData,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
  const updated = [newReport, ...reports];
  setReports(updated);
  await AsyncStorage.setItem('reports', JSON.stringify(updated));
  hapticFeedback();
};

  const updateMedicalInfo = (info: Partial<MedicalInfo>) => {
    const updated = { ...medicalInfo, ...info };
    setMedicalInfoState(updated);
    AsyncStorage.setItem('medicalInfo', JSON.stringify(updated)); // Fire and forget
    hapticFeedback();
  };

  return (
    <GlobalContext.Provider value={{ 
      theme, 
      isHighContrast, 
      isLoggedIn, 
      userName, // Provide username
      medicalInfo, 
      setTheme, 
      setHighContrast, 
      login, 
      logout, 
      hapticFeedback, // Correct naming
      updateProfile, // Provide update function
      updateMedicalInfo,
      reports, 
      saveReport,
      token,
      register,  
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
