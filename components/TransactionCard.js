import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, CATEGORIES } from '../constants/colors';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/helpers';

export default function TransactionCard({ item, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onLongPress={() => onDelete?.(item.id)}>
      <View>
        <Text style={[styles.category, { color: CATEGORIES[item.category] || COLORS.text }]}>
          {item.category}
        </Text>
        {item.description ? (
          <Text style={styles.desc}>{item.description}</Text>
        ) : null}
        <Text style={styles.date}>{format(new Date(item.date), 'dd MMM yyyy')}</Text>
      </View>

      <Text
        style={[
          styles.amount,
          { color: item.type === 'income' ? COLORS.success : COLORS.danger },
        ]}
      >
        {item.type === 'income' ? '+' : '-'}
        {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
