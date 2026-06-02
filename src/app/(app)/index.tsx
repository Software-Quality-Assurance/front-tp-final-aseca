import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { AddPositionButton } from '@/components/portfolio/AddPositionButton';
import { AddPositionModal } from '@/components/portfolio/AddPositionModal';
import { PositionList } from '@/components/portfolio/PositionList';
import {
  PortfolioScreen,
  PortfolioSafeArea,
  PortfolioHeader,
  PortfolioTitle,
  PortfolioLinkSection,
  PortfolioLinkButton,
  PortfolioContent,
} from '@/app/styles/PortfolioStyles';

export default function PortfolioScreenPage() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleSuccess() {
    setModalVisible(false);
    setRefreshTrigger((t) => t + 1);
  }

  return (
    <PortfolioScreen>
      <PortfolioSafeArea>
        <PortfolioHeader>
          <PortfolioTitle>Portfolio</PortfolioTitle>
          <AddPositionButton onPress={() => setModalVisible(true)} />
        </PortfolioHeader>

        <PortfolioLinkSection>
          <PortfolioLinkButton onPress={() => router.push('/current-value')}>
            View Current Value →
          </PortfolioLinkButton>
        </PortfolioLinkSection>

        <PortfolioContent>
          <PositionList
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger((t) => t + 1)}
          />
        </PortfolioContent>
      </PortfolioSafeArea>

      <AddPositionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </PortfolioScreen>
  );
}
