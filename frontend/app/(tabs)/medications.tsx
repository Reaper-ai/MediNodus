import React from 'react';

import ScreenContainer from '@/components/ScreenContainer';
import { Text, View } from '@/components/Themed';

export default function MedicationsScreen() {
  return (
    <ScreenContainer
      title="Medications"
      subtitle="Scheduled meds and reminders"
    >
      <View>
        <Text>Medication list and add/edit actions.</Text>
      </View>
    </ScreenContainer>
  );
}
