import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            All data is stored locally on this device. No internet connection is required.
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionValue}>1.0.0</Text>
        </View>
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  versionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
