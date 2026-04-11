import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function TelemetryScreen() {
  return (
    <ScreenContainer
      title="Telemetry"
      subtitle="Manual readings and trends"
    >
      <View>
        <Text>Log readings and review recent entries.</Text>
      </View>
    </ScreenContainer>
  );
}
