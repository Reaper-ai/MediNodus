import React from 'react';
import { StyleSheet } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function LinkProfileScreen() {
  return (
    <ScreenContainer
      title="Link profile"
      subtitle="Join an existing patient profile"
    >
      <View style={styles.card}>
        <Text style={styles.placeholder}>Enter the profile ID to link.</Text>
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
