import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJSON(key) {
  try {
    const val = await AsyncStorage.getItem(key);
    return val != null ? JSON.parse(val) : null;
  } catch (e) {
    console.error('readJSON error:', e);
    return null;
  }
}

export async function writeJSON(key, obj) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.error('writeJSON error:', e);
  }
}

export async function clearAll() {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('clearAll error:', e);
  }
}