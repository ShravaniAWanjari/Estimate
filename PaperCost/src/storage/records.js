import AsyncStorage from '@react-native-async-storage/async-storage';

const RECORDS_KEY = 'pc_records';

export async function getRecords() {
  const raw = await AsyncStorage.getItem(RECORDS_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => b.savedAt - a.savedAt);
}

export async function saveRecord(record) {
  const arr = await getRecords();
  arr.push(record);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(arr));
}

export async function deleteRecord(id) {
  const arr = await getRecords();
  const filtered = arr.filter((r) => r.id !== id);
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(filtered));
}
