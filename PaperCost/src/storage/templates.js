import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEMPLATES_KEY } from './keys';

export async function getTemplates() {
  const raw = await AsyncStorage.getItem(TEMPLATES_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function saveTemplate(template) {
  const arr = await getTemplates();
  const idx = arr.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    arr[idx] = template;
  } else {
    arr.push(template);
  }
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(arr));
}

export async function deleteTemplate(id) {
  const arr = await getTemplates();
  const filtered = arr.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
}
