import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0f1724',
    background: '#FFFAFA', // very light, slightly cool off-white
    tint: '#467ffa', // calming blue accent
    icon: '#424D5C', // muted slate for icons
    surface: '#F5F5F5', // very soft surface
    cardBackground: '#e9ecef', // slightly distinct from background
    border: '#a5a6a8',
    // Additional semantic colors used across the app
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    successBg: '#ECFDF5',
    warningBg: '#FFFBEB',
    dangerBg: '#FEF2F2',
    textSecondary: '#6B7280',

  },
  dark: {
    text: '#E6EEF8', // soft white (not pure)
    background: '#071226', // deep navy (not pure black)
    tint: '#60A5FA', // soft sky blue accent
    icon: '#94A3B8', // muted icon color
    surface: '#0B1724', // slightly lighter than background
    cardBackground: '#0F2333', // calm navy card background
    border: '#122B3B',
    // Additional semantic colors used across the app
    success: '#34D399',
    danger: '#F87171',
      warning: '#FBBF24',
       successBg: '#064E3B',
    warningBg: '#78350F',
    dangerBg: '#7F1D1D',
    textSecondary: '#94A3B8',
  },
  // Added High Contrast Theme
  highContrast: {
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFF00', // Yellow is standard for high contrast
    icon: '#FFFFFF',
    surface: '#333333',
    cardBackground: '#000000',
    border: '#FFFFFF',
    success: '#00FF00',
    danger: '#FF0000',
    textSecondary: '#FFFFFF',
     warning: '#FFFF00',
    successBg: '#000000',
    warningBg: '#000000',
    dangerBg: '#000000',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});