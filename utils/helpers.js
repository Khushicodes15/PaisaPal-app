import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';

export function formatCurrency(amount) {
  return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
}

export function formatDate(isoString) {
  return format(parseISO(isoString), 'MMM dd, yyyy');
}

export function generateReferralCode(phone) {
  return `PAISA${phone.slice(-4)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function getMonthlyData(transactions) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return transactions.filter(tx => {
    const txDate = parseISO(tx.date);
    return txDate >= monthStart && txDate <= monthEnd;
  });
}

export function getCategoryTotals(transactions) {
  const totals = {};
  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });
  return totals;
}

export function calculateGoalProgress(goal, balance) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  return Math.min(progress, 100);
}