import { StyleSheet } from 'react-native';

export { themedInput } from '@/styles/themed-input';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
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
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  error: { color: 'red', marginBottom: 8 },
  success: { color: 'green', marginBottom: 8 },
});
