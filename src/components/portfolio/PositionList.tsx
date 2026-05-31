import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { usePortfolioActions } from '@/actions/portfolio'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { PositionItem } from './PositionItem'
import type { Position } from '@/actions/types'

export function PositionList() {
  const { user } = useAuth()
  const { getPortfolio } = usePortfolioActions()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    getPortfolio()
      .then(setPositions)
      .catch((e: any) => setError(e.message ?? 'Failed to load portfolio'))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) return <ActivityIndicator className="mt-8" size="large" />

  if (error) return <ThemedText className="text-red-500 mt-4">{error}</ThemedText>

  if (positions.length === 0) {
    return (
      <ThemedView className="flex-1 items-center justify-center pt-12">
        <ThemedText themeColor="textSecondary">
          No positions yet. Add one to get started.
        </ThemedText>
      </ThemedView>
    )
  }

  const items = []
  for (const position of positions) {
    items.push(<PositionItem key={position.id} position={position} />)
  }

  return <ScrollView className="flex-1">{items}</ScrollView>
}
