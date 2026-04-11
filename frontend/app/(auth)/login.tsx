import React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function LoginScreen() {
  return (
    <ScreenContainer
      title="Welcome back"
      subtitle="Sign in to manage shared profiles"
    >
      <View style={styles.card}>
        <Text style={styles.placeholder}>Login form goes here.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  placeholder: {
    fontSize: 16,
  },
});
