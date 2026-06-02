import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const inputStyles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
});

export function AuthInput({ style, ...props }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        inputStyles.base,
        style,
        {
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          borderColor: theme.backgroundSelected,
        },
      ]}
      {...props}
    />
  );
}
