import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import { useStore } from '../utils/store';
import { COLORS } from '../constants/colors';

const GOAL_ICONS = ['🏆', '🏠', '🚗', '✈️', '📱', '💻', '🎓', '💰'];

export default function GoalsScreen() {
  const { goals, addGoal, updateGoal } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    icon: '🏆',
  });

  const handleAddGoal = () => {
    if (!formData.name || !formData.targetAmount) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Invalid Amount', 'Enter a valid target amount');
      return;
    }
    addGoal({ ...formData, targetAmount });
    setModalVisible(false);
    setFormData({ name: '', targetAmount: '', icon: '🏆' });
    Alert.alert('Success', 'Goal added!');
  };

  const openFundModal = (goalId) => {
    setSelectedGoalId(goalId);
    setFundModalVisible(true);
  };

  const handleConfirmFunds = () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid', 'Enter valid amount');
      return;
    }
    const goal = goals.find(g => g._id === selectedGoalId);
    const newCurrent = (goal.currentAmount || 0) + amount;
    updateGoal(selectedGoalId, { currentAmount: newCurrent });
    useStore.getState().addTransaction({
      type: 'income',
      amount,
      category: 'Goal Funding',
      note: `Added to goal: ${goal.name}`,
    });
    setFundModalVisible(false);
    setFundAmount('');
    Alert.alert('Success', 'Funds added!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Goals</Text>
        <Text style={styles.headerSubtitle}>Track your savings progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySub}>Add your first goal!</Text>
          </View>
        ) : (
          goals.map(goal => (
            <View key={goal._id} style={styles.goalCard}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalAmount}>₹{goal.currentAmount || 0} / ₹{goal.targetAmount}</Text>
                <Progress.Bar
                  progress={(goal.currentAmount || 0) / goal.targetAmount}
                  width={200}
                  color={COLORS.primary}
                  unfilledColor={COLORS.border}
                  borderWidth={0}
                  height={8}
                  style={styles.progress}
                />
              </View>
              <TouchableOpacity style={styles.addFundsBtn} onPress={() => openFundModal(goal._id)}>
                <Text style={styles.addFundsText}>+ Funds</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Goal</Text>
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconSelector}>
              {GOAL_ICONS.map(icon => (
                <TouchableOpacity key={icon} style={[styles.iconOption, formData.icon === icon && styles.selectedIcon]} onPress={() => setFormData({ ...formData, icon })}>
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Goal Name *</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={text => setFormData({ ...formData, name: text })} placeholder="e.g., New Car" />
            <Text style={styles.label}>Target Amount *</Text>
            <TextInput style={styles.input} value={formData.targetAmount} onChangeText={text => setFormData({ ...formData, targetAmount: text })} placeholder="0" keyboardType="numeric" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddGoal}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Funds Modal */}
      <Modal visible={fundModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Funds</Text>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={fundAmount}
              onChangeText={setFundAmount}
              placeholder="0"
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFundModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmFunds}>
                <Text style={styles.saveText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, backgroundColor: COLORS.primary, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 16, color: '#fff', opacity: 0.8 },
  list: { padding: 16 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textLight },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  goalIcon: { fontSize: 32, marginRight: 16 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  goalAmount: { fontSize: 14, color: COLORS.textLight, marginVertical: 4 },
  progress: { marginTop: 8 },
  addFundsBtn: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 8 },
  addFundsText: { color: '#fff', fontWeight: 'bold' },
  addButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: COLORS.primary, padding: 16, borderRadius: 50, elevation: 5 },
  addButtonText: { color: '#fff', fontSize: 20 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 12 },
  iconSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  iconOption: { padding: 8, margin: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  selectedIcon: { backgroundColor: COLORS.primary + '20' },
  iconText: { fontSize: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 12, borderRadius: 8, backgroundColor: COLORS.border },
  saveBtn: { padding: 12, borderRadius: 8, backgroundColor: COLORS.primary },
  saveText: { color: '#fff' },
});