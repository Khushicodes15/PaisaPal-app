import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { formatCurrency, calculateGoalProgress } from '../utils/helpers';

export default function GoalCard({ goal, onAddFunds }) {
  const progress = calculateGoalProgress(goal, goal.currentAmount);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{goal.name}</Text>
      <View style={styles.row}>
        <Text style={styles.amount}>{formatCurrency(goal.currentAmount)}</Text>
        <Text style={styles.target}>/ {formatCurrency(goal.targetAmount)}</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor:
                progress >= 100 ? COLORS.success : COLORS.primary,
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>{progress.toFixed(0)}% complete</Text>

      {progress < 100 ? (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddFunds(goal.id, goal.currentAmount)}
        >
          <Text style={styles.addText}>➕ Add Funds</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.doneText}>🎉 Goal Achieved!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  target: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  progressBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  doneText: {
    color: COLORS.success,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
});
