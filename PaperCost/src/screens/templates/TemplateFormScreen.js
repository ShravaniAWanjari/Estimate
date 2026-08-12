import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import uuid from 'react-native-uuid';
import { getTemplates, saveTemplate } from '../../storage/templates';
import FieldRow from '../../components/FieldRow';
import SizeSelector from '../../components/SizeSelector';

export default function TemplateFormScreen({ route, navigation }) {
  const templateId = route.params?.templateId;

  const [name, setName] = useState('');
  const [gsm, setGsm] = useState('');
  const [sizeKey, setSizeKey] = useState('A4');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const [sheets, setSheets] = useState('');
  const [printCost, setPrintCost] = useState('');
  const [bindCost, setBindCost] = useState('');
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
      setSizeKey(t.sizeKey || 'A4');
      setCustomW(t.customW ? String(t.customW) : '');
      setCustomH(t.customH ? String(t.customH) : '');
      setSheets(t.sheets ? String(t.sheets) : '');
      setPrintCost(t.printCost ? String(t.printCost) : '');
      setBindCost(t.bindCost ? String(t.bindCost) : '');
      setNote(t.note || '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Template name is required.');
      return;
    }

    const template = {
      id: templateId || uuid.v4(),
      name: name.trim(),
      gsm: gsm ? parseFloat(gsm) : null,
      sizeKey,
      customW: customW ? parseFloat(customW) : null,
      customH: customH ? parseFloat(customH) : null,
      sheets: sheets ? parseInt(sheets, 10) : null,
      printCost: printCost ? parseFloat(printCost) : null,
      bindCost: bindCost ? parseFloat(bindCost) : null,
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

      <FieldRow label="Sheets per Copy">
        <TextInput
          style={styles.input}
          value={sheets}
          onChangeText={setSheets}
          keyboardType="number-pad"
          placeholder="e.g. 200"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Print Cost (₹ per copy)">
        <TextInput
          style={styles.input}
          value={printCost}
          onChangeText={setPrintCost}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Binding Cost (₹ per copy)">
        <TextInput
          style={styles.input}
          value={bindCost}
          onChangeText={setBindCost}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
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
