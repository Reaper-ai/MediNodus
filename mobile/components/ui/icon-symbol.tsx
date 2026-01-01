// mobile/components/ui/icon-symbol.tsx

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Add new mappings here for your specific tabs
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

const MAPPING = {
  // Existing
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  
  // New MediNodus Icons
  'doc.text.fill': 'description',      // For Reports
  'camera.viewfinder': 'camera-alt',   // For Scan
  'person.fill': 'person',             // For Profile
  'sparkles': 'auto-awesome',
  'list.bullet.rectangle.portrait.fill': 'history', // Material Icon equivalent
} as IconMapping; //

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}