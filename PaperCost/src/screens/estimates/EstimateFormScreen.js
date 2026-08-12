import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { getEstimates, saveEstimate } from '../../storage/estimates';
import { getSettings } from '../../storage/settings';
import { calcBulkTotal } from '../../utils/formula';
import FieldRow from '../../components/FieldRow';
import ClientNameInput from '../../components/ClientNameInput';

const PRODUCT_TYPES = ['Diary', 'Magazine', 'Book', 'Brochure', 'Notebook', 'Other'];

export default function EstimateFormScreen({ route, navigation }) {
  const estimateId = route.params?.estimateId || null;

  const [clientName, setClientName] = useState('');
  const [productType, setProductType] = useState('Book');
  const [bulkQty, setBulkQty] = useState('100');
  const [paperTypes, setPaperTypes] = useState([]);
  const [existingEstimate, setExistingEstimate] = useState(null);

  useEffect(() => {
    if (estimateId) {
      navigation.setOptions({ title: 'Edit Estimate' });
      loadEstimate();
    } else {
      navigation.setOptions({ title: 'New Estimate' });
      loadDefaults();
    }
  }, [estimateId]);

  const loadEstimate = async () => {
    const all = await getEstimates();
    const est = all.find((e) => e.id === estimateId);
    if (est) {
      setExistingEstimate(est);
      setClientName(est.clientName || '');
      setProductType(est.productType || 'Book');
      setBulkQty(String(est.bulkQty || 100));
      setPaperTypes(est.paperTypes || []);
    }
  };

  const loadDefaults = async () => {
    const settings = await getSettings();
    setBulkQty(String(settings.defaultBulkQty || 100));
  };

  const handleAddPaperType = () => {
    navigation.navigate('PaperTypeForm', {
      onSave: (pt) => {
        setPaperTypes((prev) => [...prev, pt]);
      },
    });
  };

  const handleEditPaperType = (pt, index) => {
    navigation.navigate('PaperTypeForm', {
      paperType: pt,
      index,
      onSave: (updatedPt, idx) => {
        setPaperTypes((prev) => {
          const copy = [...prev];
          if (idx !== null && idx !== undefined) {
            copy[idx] = updatedPt;
          } else {
            copy.push(updatedPt);
          }
          return copy;
        });
      },
    });
  };

  const handleDeletePaperType = (index) => {
    setPaperTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = async () => {
    if (!clientName.trim()) {
      Alert.alert('Validation', 'Client name is required.');
      return;
    }
    if (paperTypes.length === 0) {
      Alert.alert('Validation', 'Add at least one paper type.');
      return;
    }

    const totalPerCopy = paperTypes.reduce((sum, pt) => sum + (pt.totalPerCopy || 0), 0);
    const qty = parseInt(bulkQty, 10) || 1;
    const bulkTotal = calcBulkTotal(totalPerCopy, qty);

    const estimate = {
      id: existingEstimate?.id || uuid.v4(),
      createdAt: existingEstimate?.createdAt || Date.now(),
      updatedAt: Date.now(),
      clientName: clientName.trim(),
      productType,
      bulkQty: qty,
      paperTypes,
      totalPerCopy,
      bulkTotal,
    };

    await saveEstimate(estimate);
    navigation.navigate('Summary', { estimateId: estimate.id });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ zIndex: 999 }}>
        <FieldRow label="Client Name *">
          <ClientNameInput
            value={clientName}
            onChange={setClientName}
          />
        </FieldRow>
      </View>

      <FieldRow label="Product Type">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {PRODUCT_TYPES.map((type) => {
            const selected = productType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setProductType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </FieldRow>

      <FieldRow label="Bulk Quantity">
        <TextInput
          style={styles.input}
          value={bulkQty}
          onChangeText={setBulkQty}
          keyboardType="number-pad"
          placeholder="100"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      {/* Paper types section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Paper Types</Text>
        <Text style={styles.sectionCount}>{paperTypes.length} added</Text>
      </View>

      {paperTypes.map((pt, index) => (
        <View key={index} style={styles.paperCard}>
          <View style={styles.paperCardHeader}>
            <Text style={styles.paperName}>{pt.name}</Text>
            <Text style={styles.paperCost}>₹{pt.totalPerCopy?.toFixed(2)}</Text>
          </View>
          <View style={styles.paperMeta}>
            <Text style={styles.paperMetaText}>
              {pt.gsm} GSM · {pt.sizeKey} · {pt.sheets} sheets · ₹{pt.price}/kg
            </Text>
          </View>
          <View style={styles.paperActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEditPaperType(pt, index)}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleDeletePaperType(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAddPaperType}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>+ Add Paper Type</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.calcBtn}
        onPress={handleCalculate}
        activeOpacity={0.8}
      >
        <Text style={styles.calcBtnText}>Calculate & Save</Text>
      </TouchableOpacity>
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
  chipRow: {
    flexDirection: 'row',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  paperCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paperCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paperName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  paperCost: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  paperMeta: {
    marginBottom: 8,
  },
  paperMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  paperActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editBtnText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  removeBtnText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  calcBtn: {
    backgroundColor: '#1E293B',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calcBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
