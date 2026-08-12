import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getSettings, saveSettings } from '../../storage/settings';
import FieldRow from '../../components/FieldRow';

export default function SettingsScreen() {
  const [bulkQty, setBulkQty] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setBulkQty(String(s.defaultBulkQty || 100));
  };

  const handleSave = async () => {
    const qty = parseInt(bulkQty, 10) || 100;
    await saveSettings({ defaultBulkQty: qty });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Defaults</Text>

        <FieldRow label="Default Bulk Quantity">
          <TextInput
            style={styles.input}
            value={bulkQty}
            onChangeText={(v) => {
              setBulkQty(v);
              setSaved(false);
            }}
            onBlur={handleSave}
            keyboardType="number-pad"
            placeholder="100"
            placeholderTextColor="#9CA3AF"
          />
        </FieldRow>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>

        {saved && (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✓ Saved</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#1E293B',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  savedBadge: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  savedText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
  },
});
