import React from 'react';
import { ThemedText } from '@/components/themed-text';
import {
  CurrentValueScreen,
  CurrentValueSafeArea,
  CurrentValueHeader,
  CurrentValueTitle,
  CurrentValueCenteredContent,
} from '@/app/styles/current-value.style';

export default function CurrentValueScreenPage() {
  return (
    <CurrentValueScreen>
      <CurrentValueSafeArea>
        <CurrentValueHeader>
          <CurrentValueTitle>Current Value</CurrentValueTitle>
        </CurrentValueHeader>
        <CurrentValueCenteredContent>
          <ThemedText themeColor="textSecondary">Coming soon</ThemedText>
        </CurrentValueCenteredContent>
      </CurrentValueSafeArea>
    </CurrentValueScreen>
  );
}
