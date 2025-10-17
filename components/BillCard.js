import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { formatCurrency } from '../utils/helpers';

export default function BillCard({ bill, onPay, onDelete }) {
  const dueDate = new Date(bill.instanceDueDate || bill.dueDate); // Fallback to dueDate if instanceDueDate is missing
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to midnight
  dueDate.setHours(0, 0, 0, 0); // Normalize due date
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  // Determine status
  let statusColor = COLORS.success;
  let statusText = 'On Time';
  let statusIcon = '✅';

  if (bill.isPaid) {
    statusColor = COLORS.textLight;
    statusText = 'Paid';
    statusIcon = '✓';
  } else if (daysUntilDue < 0) {
    statusColor = COLORS.danger;
    statusText = `Overdue by ${Math.abs(daysUntilDue)} days`;
    statusIcon = '⚠';
  } else if (daysUntilDue <= 3) {
    statusColor = COLORS.warning;
    statusText = `Due in ${daysUntilDue} days`;
    statusIcon = '⏰';
  } else {
    statusText = `Due in ${daysUntilDue} days`;
  }

  const handlePay = () => {
    Alert.alert(
      'Mark as Paid',
      `Mark "${bill.name}" as paid and create expense transaction? (Due: ${dueDate.toLocaleDateString('en-IN')})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Just Mark Paid', onPress: () => onPay(bill._id, bill.instanceDueDate, false) },
        { text: 'Pay & Add Expense', onPress: () => onPay(bill._id, bill.instanceDueDate, true), style: 'default' },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bill',
      `Delete "${bill.name}"? (Due: ${dueDate.toLocaleDateString('en-IN')})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => onDelete(bill._id), style: 'destructive' },
      ]
    );
  };

  return (
    <View style={[
      styles.card,
      bill.isPaid && styles.paidCard,
      daysUntilDue < 0 && !bill.isPaid && styles.overdueCard,
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{bill.icon || '💡'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{bill.name}</Text>
          <Text style={styles.category}>{bill.category || 'Bills'}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>
        </View>
      </View>

      {/* Due Date & Status */}
      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusIcon]}>{statusIcon}</Text>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        <Text style={styles.dueDate}>
          {dueDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric' 
          })}
        </Text>
      </View>

      {/* Recurring Info */}
      {bill.isRecurring && (
        <View style={styles.recurringBadge}>
          <Text style={styles.recurringText}>
            🔄 Repeats {bill.frequency}
          </Text>
        </View>
      )}

      {/* Actions */}
      {!bill.isPaid && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.payBtn]}
            onPress={handlePay}
          >
            <Text style={styles.actionBtnText}>✓ Mark Paid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      )}

      {bill.isPaid && bill.paidDate && (
        <Text style={styles.paidDate}>
          Paid on {new Date(bill.paidDate).toLocaleDateString('en-IN')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paidCard: {
    opacity: 0.6,
    backgroundColor: COLORS.background,
  },
  overdueCard: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  recurringBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  recurringText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payBtn: {
    backgroundColor: COLORS.success,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger + '20',
    flex: 0,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  paidDate: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});