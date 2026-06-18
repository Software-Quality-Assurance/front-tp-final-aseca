import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
    gap: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  errorIcon: {
    fontSize: 36,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
