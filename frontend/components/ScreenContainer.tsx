import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

interface ScreenContainerProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function ScreenContainer({
  title,
  subtitle,
  children,
}: ScreenContainerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    gap: 12,
  },
});
