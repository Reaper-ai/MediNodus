// mobile/hooks/use-theme-color.ts
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string; highContrast?: string },
  colorName: keyof typeof Colors.light
) {
  // 1. Get current scheme (light, dark, or highContrast)
  const scheme = useColorScheme() ?? 'light';

  // 2. Check if a specific color was passed via props for this theme
  const colorFromProps = props[scheme as keyof typeof props];
  if (colorFromProps) return colorFromProps;

  // 3. Robust lookup with fallbacks
  // First, try the exact theme (handles highContrast, light, dark)
  const themeColors = Colors[scheme as keyof typeof Colors];
  
  if (themeColors && themeColors[colorName as keyof typeof themeColors]) {
    return themeColors[colorName as keyof typeof themeColors];
  }

  // 4. Emergency Fallbacks if the requested theme or color is missing
  // If highContrast fails, fall back to dark
  if (scheme === 'highContrast') {
    return Colors.dark[colorName] || '#000000';
  }

  // Final fallback to light theme, then pure black
  return Colors.light[colorName] || '#000000';
}