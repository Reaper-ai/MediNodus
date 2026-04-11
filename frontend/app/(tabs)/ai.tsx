import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function AiScreen() {
  return (
    <ScreenContainer
      title="AI Search"
      subtitle="Ask questions across records"
    >
      <View>
        <Text>Search summaries and chat responses.</Text>
      </View>
    </ScreenContainer>
  );
}
