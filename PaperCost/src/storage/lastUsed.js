import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAST_USED_KEY } from './keys';

export async function getLastUsed() {
  const raw = await AsyncStorage.getItem(LAST_USED_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function getLastUsedForKey(key) {
  const obj = await getLastUsed();
  return obj[key] || null;
}

export async function setLastUsedForKey(key, values) {
  const obj = await getLastUsed();
  obj[key] = values;
  await AsyncStorage.setItem(LAST_USED_KEY, JSON.stringify(obj));
}
