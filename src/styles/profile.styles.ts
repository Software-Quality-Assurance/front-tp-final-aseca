import { StyleSheet } from 'react-native';

export { themedInput } from '@/styles/themed-input';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'flex-start' },
  title: { fontSize: 24, marginBottom: 12 },
  input: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  message: { padding: 16 },
  spacer: { height: 8 },
});
