import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    paddingBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
