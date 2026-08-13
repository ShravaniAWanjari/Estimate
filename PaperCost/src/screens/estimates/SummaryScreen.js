import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import uuid from 'react-native-uuid';
import { getEstimates, saveEstimate } from '../../storage/estimates';
import { saveRecord } from '../../storage/records';

export default function SummaryScreen({ route, navigation }) {
  const estimateId = route.params?.estimateId;
  const [estimate, setEstimate] = useState(null);
  const [recordSaved, setRecordSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEstimate();
  }, [estimateId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EstimateForm', { estimateId })}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, estimateId]);

  const loadEstimate = async () => {
    const all = await getEstimates();
    const est = all.find((e) => e.id === estimateId);
    if (est) {
      setEstimate(est);
    }
  };

  const handleSave = async () => {
    if (!estimate || saving) return;
    setSaving(true);

    await saveEstimate(estimate);

    // Save a record snapshot
    const record = {
      id: uuid.v4(),
      savedAt: Date.now(),
      clientName: estimate.clientName,
      productType: estimate.productType,
      totalPerCopy: estimate.totalPerCopy,
      estimateId: estimate.id,
      paperTypes: [...estimate.paperTypes],
    };
    await saveRecord(record);
    setRecordSaved(true);
    setTimeout(() => setRecordSaved(false), 2000);
    setSaving(false);
  };

  if (!estimate) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.clientName}>{estimate.clientName}</Text>
      </View>

      {/* Product type badge */}
      <View style={styles.productBadge}>
        <Text style={styles.productBadgeText}>{estimate.productType}</Text>
      </View>

      {/* Paper type cards */}
      {estimate.paperTypes.map((pt, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>{pt.name}</Text>
          <View style={styles.cardGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>GSM</Text>
              <Text style={styles.gridValue}>{pt.gsm}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Size</Text>
              <Text style={styles.gridValue}>{pt.sizeKey}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sheets</Text>
              <Text style={styles.gridValue}>{pt.sheets}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Price/kg</Text>
              <Text style={styles.gridValue}>₹{pt.price}</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Paper Cost</Text>
            <Text style={styles.costValue}>₹{pt.paperCost?.toFixed(2)}</Text>
          </View>
          {pt.printCost ? (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Print Cost</Text>
              <Text style={styles.costValue}>₹{pt.printCost?.toFixed(2)}</Text>
            </View>
          ) : null}
          {pt.bindCost ? (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Binding Cost</Text>
              <Text style={styles.costValue}>₹{pt.bindCost?.toFixed(2)}</Text>
            </View>
          ) : null}
          {pt.lamination ? (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Lamination</Text>
              <Text style={styles.costValue}>₹{pt.laminationCost?.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.cardDivider} />
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>Per Copy</Text>
            <Text style={styles.totalValue}>₹{pt.totalPerCopy?.toFixed(2)}</Text>
          </View>
        </View>
      ))}

      {/* Total per copy */}
      <View style={styles.totalSection}>
        <Text style={styles.totalSectionLabel}>Total Per Copy</Text>
        <Text style={styles.totalSectionValue}>
          ₹{estimate.totalPerCopy?.toFixed(2)}
        </Text>
      </View>

      {/* Save section */}
      <View style={styles.saveSection}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Calculation'}</Text>
        </TouchableOpacity>
        {recordSaved && (
          <View style={styles.recordSavedBadge}>
            <Text style={styles.recordSavedText}>Saved to records ✓</Text>
          </View>
        )}
      </View>

      {/* Date info */}
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>
          Created: {new Date(estimate.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.dateText}>
          Updated: {new Date(estimate.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerSection: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  productBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  productBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '47%',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
  totalSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  totalSectionValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  saveSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#1E293B',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  recordSavedBadge: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recordSavedText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateSection: {
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  headerBtn: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  headerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
