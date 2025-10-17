import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../utils/store';
import { COLORS } from '../constants/colors';
import BillCard from '../components/BillCard';

const BILL_ICONS = ['💡', '📱', '🏠', '💧', '🌐', '🚗', '🎓', '💳'];
const FREQUENCIES = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'One-time', value: 'one-time' },
];

export default function BillsScreen() {
  const {
    bills,
    addBill,
    payBill,
    deleteBill,
    getUpcomingBills,
    getOverdueBills,
  } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    icon: '💡',
    category: 'Bills',
    isRecurring: false,
    frequency: 'monthly',
  });

  const handleAddBill = () => {
    if (!formData.name || !formData.amount || !formData.dueDate) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    addBill({
      ...formData,
      amount,
      frequency: formData.frequency.toLowerCase(),
      dueDate: new Date(formData.dueDate).toISOString(),
    });

    setModalVisible(false);
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      icon: '💡',
      category: 'Bills',
      isRecurring: false,
      frequency: 'monthly',
    });

    Alert.alert('Success', 'Bill added successfully!');
  };

  const handlePayBill = (billId, instanceDueDate, createTransaction = true) => {
    const originalBill = bills.find(b => b._id === billId);
    if (!originalBill) return;

    // Mark the specific instance as paid by updating the original bill's isPaid
    payBill(billId, createTransaction);

    // Optionally, reset dueDate for recurring bills after payment (future enhancement)
    // For now, rely on recurrence to generate new instances
  };

  const handleDeleteBill = (billId) => {
    deleteBill(billId);
  };

  const getFilteredBills = () => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingBills();
      case 'overdue':
        return getOverdueBills();
      case 'paid':
        return bills.filter((b) => b.isPaid);
      default:
        return bills.filter((b) => !b.isPaid);
    }
  };

  const filteredBills = getFilteredBills();
  const upcomingCount = getUpcomingBills().length;
  const overdueCount = getOverdueBills().length;

  const totalUnpaid = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalUnpaid.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Unpaid</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            {upcomingCount}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>
            {overdueCount}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {['upcoming', 'overdue', 'paid'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.billsList} contentContainerStyle={styles.billsContent}>
        {filteredBills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bills here</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'paid'
                ? 'No paid bills yet'
                : 'Tap + to add your first bill'}
            </Text>
          </View>
        ) : (
          filteredBills.map((bill) => (
            <BillCard
              key={`${bill._id}-${bill.instanceDueDate.toISOString()}`} // Unique key for instances
              bill={bill}
              onPay={(createTx) => handlePayBill(bill._id, bill.instanceDueDate, createTx)}
              onDelete={() => handleDeleteBill(bill._id)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Bill</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Bill</Text>

            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconSelector}>
              {BILL_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    formData.icon === icon && styles.selectedIcon,
                  ]}
                  onPress={() => setFormData({ ...formData, icon })}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Bill Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              placeholder="e.g., Electricity Bill"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(text) =>
                setFormData({ ...formData, amount: text })
              }
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>Due Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={formData.dueDate}
              onChangeText={(text) =>
                setFormData({ ...formData, dueDate: text })
              }
              placeholder="2025-10-20"
              placeholderTextColor={COLORS.textLight}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setFormData({
                  ...formData,
                  isRecurring: !formData.isRecurring,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isRecurring && styles.checkboxChecked,
                ]}
              >
                {formData.isRecurring && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Recurring Bill</Text>
            </TouchableOpacity>

            {formData.isRecurring && (
              <>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                  {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                      key={freq.value}
                      style={[
                        styles.frequencyBtn,
                        formData.frequency === freq.value &&
                          styles.frequencyBtnActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, frequency: freq.value })
                      }
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          formData.frequency === freq.value &&
                            styles.frequencyTextActive,
                        ]}
                      >
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleAddBill}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: { alignItems: 'center', padding: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textLight },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: { padding: 10 },
  activeTab: { backgroundColor: COLORS.primary + '20' },
  tabText: { fontSize: 14, color: COLORS.text },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  billsList: { flex: 1 },
  billsContent: { paddingBottom: 80 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 18, color: COLORS.text, marginVertical: 8 },
  emptySubtext: { fontSize: 14, color: COLORS.textLight },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
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
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkmark: { color: '#fff' },
  checkboxLabel: { fontSize: 14, color: COLORS.text },
  frequencyContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  frequencyBtn: { padding: 8, margin: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  frequencyBtnActive: { backgroundColor: COLORS.primary + '20' },
  frequencyText: { fontSize: 14, color: COLORS.text },
  frequencyTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { padding: 12, borderRadius: 8 },
  cancelBtn: { backgroundColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary },
  cancelBtnText: { color: '#fff' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});