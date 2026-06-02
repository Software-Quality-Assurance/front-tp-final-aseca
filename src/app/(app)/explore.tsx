import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { useTheme } from '@/hooks/use-theme';
import {
  ExploreScroll,
  ExploreContainer,
  ExploreTitleSection,
  ExploreSubtitleText,
  ExploreLinkPressable,
  ExploreLinkButton,
  ExploreSections,
  ExploreCollapsibleContent,
  exploreImageTutorialStyle,
  exploreImageReactStyle,
} from '@/app/styles/explore.style';

export default function TabTwoScreen() {
  const theme = useTheme();

  return (
    <ExploreScroll>
      <ExploreContainer>
        <ExploreTitleSection>
          <ThemedText type="subtitle">Explore</ThemedText>
          <ExploreSubtitleText>
            This starter app includes example{'\n'}code to help you get started.
          </ExploreSubtitleText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <ExploreLinkPressable>
              <ExploreLinkButton>
                <ThemedText type="link">Expo documentation</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{
                    ios: 'arrow.up.right.square',
                    android: 'link',
                    web: 'link',
                  }}
                  size={12}
                />
              </ExploreLinkButton>
            </ExploreLinkPressable>
          </ExternalLink>
        </ExploreTitleSection>

        <ExploreSections>
          <Collapsible title="File-based routing">
            <ThemedText type="small">
              This app has two screens:{' '}
              <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              The layout file in{' '}
              <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <ExploreCollapsibleContent>
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open
                the web version, press{' '}
                <ThemedText type="smallBold">w</ThemedText> in the terminal
                running this project.
              </ThemedText>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={exploreImageTutorialStyle}
              />
            </ExploreCollapsibleContent>
          </Collapsible>

          <Collapsible title="Images">
            <ThemedText type="small">
              For static images, you can use the{' '}
              <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files
              for different screen densities.
            </ThemedText>
            <Image
              source={require('@/assets/images/react-logo.png')}
              style={exploreImageReactStyle}
            />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets
              you inspect what the user&apos;s current color scheme is, and so
              you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">
                src/components/ui/collapsible.tsx
              </ThemedText>{' '}
              component uses the powerful{' '}
              <ThemedText type="code">react-native-reanimated</ThemedText>{' '}
              library to animate opening this hint.
            </ThemedText>
          </Collapsible>
        </ExploreSections>
        {Platform.OS === 'web' && <WebBadge />}
      </ExploreContainer>
    </ExploreScroll>
  );
}
