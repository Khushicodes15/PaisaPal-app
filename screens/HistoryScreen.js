import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../utils/store';
import { COLORS } from '../constants/colors';

export default function HistoryScreen() {
  const { transactions, deleteTransaction } = useStore();
  const [search, setSearch] = useState('');

  const filteredTx = transactions
    .filter(tx => tx.note?.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'OK', onPress: () => deleteTransaction(id) }]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.txCard}>
      <View style={styles.txInfo}>
        <Text style={styles.txCategory}>{item.category}</Text>
        <Text style={styles.txNote}>{item.note}</Text>
        <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.txAmount, { color: item.type === 'income' ? COLORS.success : COLORS.danger }]}>
        {item.type === 'income' ? '+' : '-'} ₹{item.amount}
      </Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search by category or note..."
        placeholderTextColor={COLORS.textLight}
      />
      <FlatList
        data={filteredTx}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  searchInput: { backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  list: { paddingBottom: 20 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  txInfo: { flex: 1 },
  txCategory: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  txNote: { fontSize: 14, color: COLORS.textLight },
  txDate: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: 'bold', marginRight: 16 },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 50 },
});