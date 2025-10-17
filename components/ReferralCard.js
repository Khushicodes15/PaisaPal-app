import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ReferralCard({ referralCode }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join PaisaPal! Use my code ${referralCode} and earn rewards 🎁`,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not share code');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🎁 Referral Program</Text>
      <Text style={styles.desc}>Invite friends & earn 50 points each!</Text>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{referralCode}</Text>
      </View>
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareText}>📤 Share Code</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  desc: {
    color: COLORS.textLight,
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
