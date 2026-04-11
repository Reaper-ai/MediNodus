import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function DashboardScreen() {
  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="At-a-glance health overview"
    >
      <View>
        <Text>Today’s reminders, recent readings, and alerts.</Text>
      </View>
    </ScreenContainer>
  );
}
