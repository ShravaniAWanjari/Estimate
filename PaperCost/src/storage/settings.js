import AsyncStorage from '@react-native-async-storage/async-storage';
import { SETTINGS_KEY } from './keys';

const DEFAULTS = { defaultBulkQty: 100 };

export async function getSettings() {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { ...DEFAULTS };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
