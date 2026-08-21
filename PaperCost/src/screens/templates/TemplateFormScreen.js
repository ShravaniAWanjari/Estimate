import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  StyleSheet,
} from 'react-native';
import uuid from 'react-native-uuid';
import { getTemplates, saveTemplate } from '../../storage/templates';
import { getAreaSqInches } from '../../utils/sizes';
import { calcLaminationCost } from '../../utils/formula';
import FieldRow from '../../components/FieldRow';
import SizeSelector from '../../components/SizeSelector';

export default function TemplateFormScreen({ route, navigation }) {
  const templateId = route.params?.templateId;

  const [name, setName] = useState('');
  const [gsm, setGsm] = useState('');
  const [sizeKey, setSizeKey] = useState('18 × 23');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const [noOfSheets, setNoOfSheets] = useState('');
  const [printCost, setPrintCost] = useState('');
  const [bindCost, setBindCost] = useState('');
  const [lamination, setLamination] = useState(false);
  const [laminationCost, setLaminationCost] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (templateId) {
      navigation.setOptions({ title: 'Edit Template' });
      loadTemplate();
    } else {
      navigation.setOptions({ title: 'New Template' });
    }
  }, [templateId]);

  const loadTemplate = async () => {
    const all = await getTemplates();
    const t = all.find((x) => x.id === templateId);
    if (t) {
      setName(t.name || '');
      setGsm(t.gsm ? String(t.gsm) : '');
      setSizeKey(t.sizeKey || '18 × 23');
      setCustomW(t.customW ? String(t.customW) : '');
      setCustomH(t.customH ? String(t.customH) : '');
      setNoOfSheets(t.noOfSheets ? String(t.noOfSheets) : (t.sheets ? String(t.sheets) : ''));
      setPrintCost(t.printCost ? String(t.printCost) : '');
      setBindCost(t.bindCost ? String(t.bindCost) : '');
      setLamination(Boolean(t.lamination));
      setLaminationCost(t.laminationCost !== undefined && t.laminationCost !== null ? String(t.laminationCost) : '');
      setNote(t.note || '');
    }
  };

  const handleToggleLamination = (val) => {
    setLamination(val);
    if (val) {
      const area = getAreaSqInches(sizeKey, parseFloat(customW) || 0, parseFloat(customH) || 0);
      const sheetsVal = parseInt(noOfSheets, 10) || 0;
      if (area && sheetsVal) {
        const cost = calcLaminationCost({ areaSqInches: area, noOfSheets: sheetsVal }).toFixed(2);
        setLaminationCost(cost);
      } else {
        setLaminationCost('');
      }
    } else {
      setLaminationCost('');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Template name is required.');
      return;
    }

    const lamCostVal = lamination ? (parseFloat(laminationCost) || 0) : null;

    const template = {
      id: templateId || uuid.v4(),
      name: name.trim(),
      gsm: gsm ? parseFloat(gsm) : null,
      sizeKey,
      customW: customW ? parseFloat(customW) : null,
      customH: customH ? parseFloat(customH) : null,
      noOfSheets: noOfSheets ? parseInt(noOfSheets, 10) : null,
      printCost: printCost ? parseFloat(printCost) : null,
      bindCost: bindCost ? parseFloat(bindCost) : null,
      lamination,
      laminationCost: lamCostVal,
      note: note.trim(),
    };

    await saveTemplate(template);
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <FieldRow label="Template Name *">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cover Page 300gsm"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="GSM">
        <TextInput
          style={styles.input}
          value={gsm}
          onChangeText={setGsm}
          keyboardType="decimal-pad"
          placeholder="e.g. 300"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Paper Size">
        <SizeSelector
          sizeKey={sizeKey}
          customW={customW}
          customH={customH}
          onSizeChange={setSizeKey}
          onCustomWChange={setCustomW}
          onCustomHChange={setCustomH}
        />
      </FieldRow>

      <FieldRow label="No. of Sheets">
        <TextInput
          style={styles.input}
          value={noOfSheets}
          onChangeText={setNoOfSheets}
          keyboardType="number-pad"
          placeholder="e.g. 500"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Print Cost (₹)">
        <TextInput
          style={styles.input}
          value={printCost}
          onChangeText={setPrintCost}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Binding Cost (₹)">
        <TextInput
          style={styles.input}
          value={bindCost}
          onChangeText={setBindCost}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Lamination Cost (₹)">
        <View style={styles.laminationContainer}>
          <View style={styles.laminationToggleRow}>
            <Switch
              value={lamination}
              onValueChange={handleToggleLamination}
              trackColor={{ false: '#D1D5DB', true: '#1E293B' }}
              thumbColor={lamination ? '#FFFFFF' : '#F9FAFB'}
            />
            <Text style={styles.laminationToggleText}>
              {lamination ? 'Lamination active' : 'No lamination'}
            </Text>
          </View>
          {lamination && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={laminationCost}
              onChangeText={setLaminationCost}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          )}
        </View>
      </FieldRow>

      <FieldRow label="Note">
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Optional note..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </FieldRow>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>Save Template</Text>
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
  noteInput: {
    height: 80,
    paddingTop: 12,
  },
  laminationContainer: {
    gap: 8,
  },
  laminationToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  laminationToggleText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
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
});
