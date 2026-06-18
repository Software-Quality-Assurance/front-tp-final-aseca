import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Operation, OperationType } from '@/actions/types';
import { DeleteHistoryButton } from './DeleteHistoryButton';
import { styles } from '@/app/styles/history/HistoryTransactionCardStyles';

const TYPE_ICON: Record<
  OperationType,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  BUY: 'arrow-down-circle',
  SELL: 'arrow-up-circle',
};

const TYPE_COLOR: Record<OperationType, string> = {
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
  operation: Operation;
  onEdit: (operation: Operation) => void;
  onRefresh: () => void;
}

export function HistoryTransactionCard({
  operation,
  onEdit,
  onRefresh,
}: Props) {
  const theme = useTheme();
  const typeColor = TYPE_COLOR[operation.type];
  const typeLabel = operation.type === 'BUY' ? 'Compra' : 'Venta';

  return (
    <View
      testID={`history-item-${operation.ticker}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[styles.iconWrapper, { backgroundColor: typeColor + '1A' }]}
        >
          <MaterialCommunityIcons
            name={TYPE_ICON[operation.type]}
            size={22}
            color={typeColor}
          />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.ticker}>{operation.ticker}</ThemedText>
            <View
              style={[styles.typeBadge, { backgroundColor: typeColor + '1A' }]}
            >
              <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
                {typeLabel}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {operation.companyName}
          </ThemedText>
          <ThemedText
            style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}
          >
            {operation.quantity} acciones ·{' '}
            {formatCurrency(operation.unitPrice)} c/u
          </ThemedText>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              testID={`edit-history-button-${operation.id}`}
              style={styles.editButton}
              onPress={() => onEdit(operation)}
            >
              <ThemedText style={{ color: '#3b82f6', fontSize: 12 }}>
                Edit
              </ThemedText>
            </TouchableOpacity>
            <DeleteHistoryButton operation={operation} onSuccess={onRefresh} />
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <ThemedText style={styles.total}>
          {formatCurrency(operation.totalPrice)}
        </ThemedText>
        <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(operation.timestamp)}
        </ThemedText>
        <ThemedText
          testID="history-item-timestamp"
          style={{ width: 0, height: 0, opacity: 0 }}
        >
          {operation.timestamp}
        </ThemedText>
      </View>
    </View>
  );
}
