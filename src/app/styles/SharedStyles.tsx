import { StyleSheet } from 'react-native';

/** NativeWind classes for tab screen header bottom border (light/dark). */
export const screenHeaderBorderClassName =
  'border-b border-gray-200 dark:border-gray-800';

export const SharedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  padded: {
    padding: 16,
  },
  authScreen: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  screenHeaderWithActions: {
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
