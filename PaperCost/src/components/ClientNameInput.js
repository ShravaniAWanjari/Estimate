import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getEstimates } from '../storage/estimates';
import { getRecords } from '../storage/records';

export default function ClientNameInput({ value, onChange, style }) {
  const [savedClients, setSavedClients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const blurTimeout = useRef(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    if (!value || value.trim() === '') {
      setFiltered(savedClients);
    } else {
      const lower = value.toLowerCase();
      setFiltered(savedClients.filter((c) => c.toLowerCase().includes(lower)));
    }
  }, [value, savedClients, showDropdown]);

  const loadClients = async () => {
    try {
      const [estimates, records] = await Promise.all([
        getEstimates(),
        getRecords(),
      ]);
      const names = new Set();
      estimates.forEach((e) => {
        if (e.clientName) names.add(e.clientName);
      });
      records.forEach((r) => {
        if (r.clientName) names.add(r.clientName);
      });
      const sorted = Array.from(names).sort((a, b) => a.localeCompare(b));
      setSavedClients(sorted);
    } catch (err) {
      setSavedClients([]);
    }
  };

  const handleSelect = (name) => {
    onChange(name);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Delay so tap on dropdown item registers before blur closes it
    blurTimeout.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const hasTyped = value && value.trim().length > 0;
  const showAddNew = hasTyped && filtered.length === 0;

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(v) => {
          onChange(v);
          if (!showDropdown) setShowDropdown(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="e.g. ABC Publishers"
        placeholderTextColor="#9CA3AF"
      />
      {showDropdown && (savedClients.length > 0 || showAddNew) && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.dropdownScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {showAddNew ? (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(value.trim())}
                activeOpacity={0.7}
              >
                <Text style={styles.addNewText}>＋ Add "{value.trim()}"</Text>
              </TouchableOpacity>
            ) : (
              filtered.map((name, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>{name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 999,
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
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
  },
  addNewText: {
    fontSize: 15,
    color: '#4338CA',
    fontWeight: '600',
  },
});
