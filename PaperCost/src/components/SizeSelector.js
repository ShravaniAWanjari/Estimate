import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { STANDARD_SIZES } from '../utils/sizes';

const SIZE_KEYS = Object.keys(STANDARD_SIZES);

export default function SizeSelector({
  sizeKey,
  customW,
  customH,
  onSizeChange,
  onCustomWChange,
  onCustomHChange,
}) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {SIZE_KEYS.map((key) => {
          const selected = sizeKey === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onSizeChange(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {sizeKey === 'Custom' && (
        <View style={styles.customRow}>
          <View style={styles.customField}>
            <Text style={styles.customLabel}>Width (in)</Text>
            <TextInput
              style={styles.input}
              value={customW ? String(customW) : ''}
              onChangeText={(v) => onCustomWChange(v ? parseFloat(v) || '' : '')}
              keyboardType="decimal-pad"
              placeholder="inches"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.customField}>
            <Text style={styles.customLabel}>Height (in)</Text>
            <TextInput
              style={styles.input}
              value={customH ? String(customH) : ''}
              onChangeText={(v) => onCustomHChange(v ? parseFloat(v) || '' : '')}
              keyboardType="decimal-pad"
              placeholder="inches"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  customField: {
    flex: 1,
  },
  customLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
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
});
