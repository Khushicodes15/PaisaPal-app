import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';

export default function ReceiptUpload({ receiptUri, setReceiptUri }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
      Alert.alert('Receipt captured!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Receipt (optional)</Text>
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.text}>📸 Capture Receipt</Text>
      </TouchableOpacity>
      {receiptUri && <Image source={{ uri: receiptUri }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 12,
  },
});
