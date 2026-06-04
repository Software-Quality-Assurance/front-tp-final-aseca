import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { EnrichedOperation } from '@/hooks/use-history';

const STATUS_COLOR: Record<EnrichedOperation['status'], string> = {
  COMPLETED: '#22c55e',
  PENDING: '#f59e0b',
  REJECTED: '#ef4444',
};

const TYPE_ICON: Record<
  EnrichedOperation['type'],
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  BUY: 'arrow-down-circle',
  SELL: 'arrow-up-circle',
};

const TYPE_COLOR: Record<EnrichedOperation['type'], string> = {
  BUY: '#3b82f6',
  SELL: '#8b5cf6',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  operation: EnrichedOperation;
}

export function HistoryTransactionCard({ operation }: Props) {
  const theme = useTheme();
  const typeColor = TYPE_COLOR[operation.type];
  const statusColor = STATUS_COLOR[operation.status];
  const typeLabel = operation.type === 'BUY' ? 'Compra' : 'Venta';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: typeColor + '1A' }]}>
          <MaterialCommunityIcons
            name={TYPE_ICON[operation.type]}
            size={22}
            color={typeColor}
          />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.ticker}>{operation.ticker}</ThemedText>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '1A' }]}>
              <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
                {typeLabel}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {operation.companyName}
          </ThemedText>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
            {operation.quantity} acciones · {formatCurrency(operation.unitPrice)} c/u
          </ThemedText>
        </View>
      </View>

      <View style={styles.right}>
        <ThemedText style={styles.total}>
          {formatCurrency(operation.totalPrice)}
        </ThemedText>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(operation.timestamp)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 24,
    marginVertical: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticker: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 90,
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  date: {
    fontSize: 11,
    textAlign: 'right',
  },
});