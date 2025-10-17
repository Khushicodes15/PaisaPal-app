import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useStore } from '../utils/store';
import { COLORS } from '../constants/colors';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() {
  const { user, logout, transactions } = useStore();
  const referralCode = user?._id?.substring(0, 8).toUpperCase() || 'N/A';
  const points = 10 * (user?.streakDays || 0) + (transactions?.length || 0); // Criteria: 10 per streak day + 1 per transaction

  const [showPointsInfo, setShowPointsInfo] = useState(false);

  const handleCopyReferral = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Copied', 'Referral code copied to clipboard!');
  };

  const handleLogout = () => {
    auth.signOut();
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={styles.summaryValue}>₹{(user?.balance || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Streak</Text>
            <Text style={styles.summaryValue}>{user?.streakDays || 0} days 🔥</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{points} pts 🎉</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.expandableSection} onPress={() => setShowPointsInfo(!showPointsInfo)}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>
          <Text style={styles.expandIcon}>{showPointsInfo ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        {showPointsInfo && (
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsText}>• 10 points per daily streak login</Text>
            <Text style={styles.pointsText}>• 1 point per transaction added</Text>
            <Text style={styles.pointsText}>• 50 points for referrals</Text>
            <Text style={styles.pointsText}>Redeem coupons:</Text>
            <Text style={styles.pointsText}>• 100 points: Free coffee coupon</Text>
            <Text style={styles.pointsText}>• 500 points: ₹100 gift card</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Code</Text>
          <View style={styles.referralContainer}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopyReferral}>
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.referralInfo}>Share to earn 50 points per referral!</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 60, marginBottom: 10 },
  avatar: { fontSize: 60, color: '#fff' },
  name: { fontSize: 26, fontWeight: '600', color: COLORS.text },
  email: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 16, color: COLORS.textLight },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  expandableSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  expandIcon: { fontSize: 18, color: COLORS.primary },
  pointsInfo: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  pointsText: { fontSize: 14, color: COLORS.text, marginBottom: 8 },
  referralContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  referralCode: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  copyBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  copyText: { color: '#fff', fontWeight: 'bold' },
  referralInfo: { fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: 'center' },
  logoutBtn: { backgroundColor: COLORS.danger, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});