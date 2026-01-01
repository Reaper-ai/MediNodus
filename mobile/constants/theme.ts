/**
 * mobile/constants/theme.ts
 */
import { Platform } from 'react-native';

// 1. Define your primitive color palette here
const palette = {
  white: '#FFFFFF',
  black: '#000000',
  // Grays
  gray100: '#F5F5F5',
  gray200: '#E5E7EB',
  gray800: '#1F2937',
  gray900: '#151718',
  // Brand Colors
  blue50: '#F0F9FF',
  blue500: '#0a7ea4',
  // Functional Colors
  green500: '#4ADE80',
  red500: '#EF4444',
  darkSurface: '#2C2C2E',
  darkCard: '#1E1E1E',
};

const tintColorLight = palette.blue500;
const tintColorDark = palette.white;

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: palette.white,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // UI Elements
    cardBackground: palette.blue50,
    cardBorder: palette.blue500,
    surface: palette.gray100, // For action buttons
    success: palette.green500,
    border: '#eee',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: palette.gray900,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // UI Elements
    cardBackground: palette.darkCard,
    cardBorder: palette.white, // In dark mode, white border looks clean
    surface: palette.darkSurface,
    success: palette.green500,
    border: '#333',
  },
};

// ... (Keep the Fonts export as is) ...
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