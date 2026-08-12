import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function PriceField({ value, onChange, lastUsedPrice, placeholder = '0' }) {
  const showChip = lastUsedPrice && !value;

  return (
    <View>
      <TextInput
        style={styles.input}
        value={value ? String(value) : ''}
        onChangeText={(v) => onChange(v ? parseFloat(v) || '' : '')}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
      {showChip && (
        <TouchableOpacity
          style={styles.chip}
          onPress={() => onChange(lastUsedPrice)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>
            Last used: ₹{lastUsedPrice} — tap to use
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  chip: {
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500',
  },
});
