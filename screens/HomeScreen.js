import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../utils/store';
import { formatCurrency } from '../utils/helpers';
import { COLORS } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user, transactions, bills, getUpcomingBills, getOverdueBills } = useStore();

  // 🛡️ Safety: show loader until user is loaded
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textLight, marginTop: 10 }}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  const recentTx = transactions.slice(0, 5);
  const upcomingBills = getUpcomingBills();
  const overdueBills = getOverdueBills();
  const hasBillsDue = upcomingBills.length > 0 || overdueBills.length > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(user?.balance ?? 0)}
        </Text>
        <Text style={styles.streakText}>🔥 {user?.streak_days ?? 0} day streak</Text>
      </View>

      {/* AI Assistant Quick Access */}
      <TouchableOpacity
        style={styles.aiCard}
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={styles.aiIcon}>🤖</Text>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>AI Assistant</Text>
          <Text style={styles.aiSubtitle}>Try: "spent 200 on food"</Text>
        </View>
        <Text style={styles.aiArrow}>→</Text>
      </TouchableOpacity>

      {/* Bills Alert (if any due) */}
      {hasBillsDue && (
        <TouchableOpacity
          style={[
            styles.billsAlert,
            overdueBills.length > 0 ? styles.billsAlertDanger : styles.billsAlertWarning
          ]}
          onPress={() => navigation.navigate('Bills')}
        >
          <Text style={styles.billsAlertIcon}>
            {overdueBills.length > 0 ? '⚠️' : '⏰'}
          </Text>
          <View style={styles.billsAlertContent}>
            <Text style={styles.billsAlertTitle}>
              {overdueBills.length > 0
                ? `${overdueBills.length} Overdue Bills!`
                : `${upcomingBills.length} Bills Due Soon`}
            </Text>
            <Text style={styles.billsAlertSubtitle}>Tap to manage</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
        >
          <Text style={styles.actionText}>💵 Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
        >
          <Text style={styles.actionText}>💸 Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Cards */}
      <TouchableOpacity
        style={styles.navCard}
        onPress={() => navigation.navigate('Bills')}
      >
        <Text style={styles.navTitle}>💡 Bills & Reminders</Text>
        <Text style={styles.navSubtitle}>
          {bills.filter(b => !b.isPaid).length} unpaid bills
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.navTitle}>📜 Transaction History</Text>
        <Text style={styles.navSubtitle}>{transactions.length} transactions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => navigation.navigate('Charts')}
      >
        <Text style={styles.navTitle}>📊 Analytics</Text>
        <Text style={styles.navSubtitle}>View spending trends</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => navigation.navigate('Goals')}
      >
        <Text style={styles.navTitle}>🎯 Goals</Text>
        <Text style={styles.navSubtitle}>Track savings goals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navCard}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.navTitle}>👤 Profile & Referrals</Text>
        <Text style={styles.navSubtitle}>{user?.points ?? 0} points earned</Text>
      </TouchableOpacity>

      {/* Recent Transactions */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTx.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          recentTx.map(tx => (
            <View key={tx._id} style={styles.txItem}>
              <View>
                <Text style={styles.txCategory}>{tx.category}</Text>
                <Text style={styles.txDate}>
                  {new Date(tx.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: tx.type === 'income' ? COLORS.success : COLORS.danger },
                ]}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
  balanceAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8,
  },
  streakText: { color: '#fff', fontSize: 16, marginTop: 8 },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  aiIcon: { fontSize: 32, marginRight: 12 },
  aiContent: { flex: 1 },
  aiTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  aiSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  aiArrow: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },
  billsAlert: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 16 },
  billsAlertWarning: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  billsAlertDanger: {
    backgroundColor: COLORS.danger + '20',
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  billsAlertIcon: { fontSize: 28, marginRight: 12 },
  billsAlertContent: { flex: 1 },
  billsAlertTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  billsAlertSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  navCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  navTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  navSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  recentSection: { marginTop: 8, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  txItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txCategory: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  txDate: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  txAmount: { fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20 },
});
