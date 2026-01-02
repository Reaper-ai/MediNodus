import { Platform } from 'react-native';

const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray800: '#1F2937',
  gray900: '#151718',
  blue500: '#0a7ea4',
  red600: '#DC2626',
};

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#6B7280',
    background: palette.white,
    tint: palette.blue500,
    icon: '#687076',
    surface: palette.gray100,
    cardBackground: palette.gray50,
    border: '#E5E7EB',
    danger: palette.red600,
    
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9CA3AF',
    background: palette.gray900,
    tint: palette.white,
    icon: '#9BA1A6',
    surface: '#262829',
    cardBackground: '#1E2021',
    border: '#374151',
    danger: '#EF4444',
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