import { View, ViewProps } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  safeArea?: boolean; // Fix: Enable safe area padding
  children?: React.ReactNode;
};
export function ThemedView({ style, lightColor, darkColor, elevation = 0, safeArea = false, children, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const backgroundColor = theme.colors.background;

  return (
    <Surface
      style={[
        { backgroundColor },
        // Fix: Apply dynamic padding based on safe area insets
        safeArea && { 
          paddingTop: insets.top, 
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        },
        style,
      ]}
      elevation={elevation}
      {...otherProps}
    >
      {children}
    </Surface>
  );
} 