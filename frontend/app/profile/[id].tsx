import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function ProfileDetailScreen() {
  return (
    <ScreenContainer
      title="Profile"
      subtitle="Shared access across accounts"
    >
      <View>
        <Text>Profile details and linked accounts.</Text>
      </View>
    </ScreenContainer>
  );
}
