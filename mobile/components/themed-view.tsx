import React from 'react';
import { ViewProps } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  safeArea?: boolean;
  children?: React.ReactNode; // Explicitly type children
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  elevation = 0, 
  safeArea = false, 
  children, // FIX: Destructure children here
  ...otherProps 
}: ThemedViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const backgroundColor = theme.colors.background;

  return (
    <Surface
      style={[
        { backgroundColor },
        // Apply safe area padding if requested
        safeArea && { 
          paddingTop: insets.top, 
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        },
        // Default flex: 1 if no style provided to ensure it fills screen
        !style && { flex: 1 }, 
        style,
      ]}
      elevation={elevation}
      {...otherProps}
    >
      {/* FIX: Explicitly render children inside the Surface */}
      {children}
    </Surface>
  );
}