import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function RecordsScreen() {
  return (
    <ScreenContainer
      title="Records"
      subtitle="Medical files and OCR results"
    >
      <View>
        <Text>Upload and review medical documents.</Text>
      </View>
    </ScreenContainer>
  );
}
