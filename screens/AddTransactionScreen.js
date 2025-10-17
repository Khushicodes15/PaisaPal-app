import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../utils/store';
import { COLORS, CATEGORIES } from '../constants/colors';

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction } = useStore();

  const initialType = route.params?.type || 'expense';

  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [receiptUri, setReceiptUri] = useState(null);

  const categories = Object.keys(CATEGORIES);

  // 📸 Capture image using camera
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setReceiptUri(uri);
      Alert.alert('Success', 'Receipt captured and saved!');
    }
  };

  // 🧾 Handle transaction submission
  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const tx = {
      type,
      amount: parseFloat(amount),
      category: type === 'income' ? 'Income' : category,
      description,
      receipt: receiptUri, // Store receipt URI locally
    };

    addTransaction(tx);
    Alert.alert('Success', `${type === 'income' ? 'Income' : 'Expense'} added!`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Type Toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'expense' && { backgroundColor: COLORS.danger }]}
          onPress={() => {
            setType('expense');
            setReceiptUri(null);
          }}
        >
          <Text style={[styles.typeText, type === 'expense' && { color: '#fff' }]}>💸 Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === 'income' && { backgroundColor: COLORS.success }]}
          onPress={() => {
            setType('income');
            setReceiptUri(null);
          }}
        >
          <Text style={[styles.typeText, type === 'income' && { color: '#fff' }]}>💵 Income</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Category Picker (for expenses only) */}
      {type === 'expense' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && { backgroundColor: CATEGORIES[cat] },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[styles.categoryText, category === cat && { color: '#fff' }]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {type === 'income' ? 'Source (optional)' : 'Description (optional)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Lunch at cafe'}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Receipt Capture (expenses only) */}
      {type === 'expense' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Receipt (optional)</Text>

          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadText}>📸 Capture Receipt</Text>
          </TouchableOpacity>

          {receiptUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
              <TouchableOpacity 
                style={styles.removeBtn}
                onPress={() => setReceiptUri(null)}
              >
                <Text style={styles.removeBtnText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {type === 'income' ? 'Add Income' : 'Add Expense'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 12,
  },
  receiptPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeBtn: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});