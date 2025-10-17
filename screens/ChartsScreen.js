import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useStore } from '../utils/store';
import { COLORS } from '../constants/colors';
import { getCategoryTotals, getMonthlyData } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: COLORS.background,
  backgroundGradientTo: COLORS.background,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

export default function ChartsScreen() {
  const { transactions } = useStore();
  const monthlyTx = getMonthlyData(transactions);
  const categoryTotals = getCategoryTotals(monthlyTx);

  const pieData = Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    population: value,
    color: [`#FF6384`, `#36A2EB`, `#FFCE56`, `#4BC0C0`, `#9966FF`][index % 5],
    legendFontColor: COLORS.text,
    legendFontSize: 14,
  }));

  const barData = {
    labels: ['Income', 'Expenses'],
    datasets: [{ data: [
      monthlyTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
      monthlyTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    ] }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Monthly Analytics</Text>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <BarChart
            data={barData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  chartContainer: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
});