import React from 'react';
import {
  ImageStyle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});

type ScreenProps = {
  children: React.ReactNode;
};

type ExploreScrollProps = ScreenProps & {
  testID?: string;
};

export function ExploreScroll({ children, testID }: ExploreScrollProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select<ViewStyle>({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      testID={testID}
      accessibilityLabel={testID}
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      {children}
    </ScrollView>
  );
}

export function ExploreContainer({ children }: ScreenProps) {
  return <ThemedView style={styles.container}>{children}</ThemedView>;
}

export function ExploreTitleSection({ children }: ScreenProps) {
  return <ThemedView style={styles.titleContainer}>{children}</ThemedView>;
}

export function ExploreSubtitleText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemedText style={styles.centerText} themeColor="textSecondary">
      {children}
    </ThemedText>
  );
}

type LinkPressableProps = {
  children: React.ReactNode;
  onPress?: () => void;
};

export function ExploreLinkPressable({
  children,
  onPress,
}: LinkPressableProps) {
  return (
    <Pressable
      style={({ pressed }) => pressed && styles.pressed}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

export function ExploreLinkButton({ children }: ScreenProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.linkButton}>
      {children}
    </ThemedView>
  );
}

export function ExploreSections({ children }: ScreenProps) {
  return <ThemedView style={styles.sectionsWrapper}>{children}</ThemedView>;
}

export function ExploreCollapsibleContent({ children }: ScreenProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
      {children}
    </ThemedView>
  );
}

export const exploreImageTutorialStyle: ImageStyle = styles.imageTutorial;
export const exploreImageReactStyle: ImageStyle = styles.imageReact;
