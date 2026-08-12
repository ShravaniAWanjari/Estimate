import AsyncStorage from '@react-native-async-storage/async-storage';
import { ESTIMATES_KEY } from './keys';

export async function getEstimates() {
  const raw = await AsyncStorage.getItem(ESTIMATES_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveEstimate(estimate) {
  const arr = await getEstimates();
  const idx = arr.findIndex((e) => e.id === estimate.id);
  if (idx >= 0) {
    arr[idx] = estimate;
  } else {
    arr.push(estimate);
  }
  await AsyncStorage.setItem(ESTIMATES_KEY, JSON.stringify(arr));
}

export async function deleteEstimate(id) {
  const arr = await getEstimates();
  const filtered = arr.filter((e) => e.id !== id);
  await AsyncStorage.setItem(ESTIMATES_KEY, JSON.stringify(filtered));
}
