import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { getTemplates } from '../../storage/templates';
import { getLastUsedForKey, setLastUsedForKey } from '../../storage/lastUsed';
import { getArea } from '../../utils/sizes';
import { calcPaperCost, calcTotalPerCopy } from '../../utils/formula';
import FieldRow from '../../components/FieldRow';
import SizeSelector from '../../components/SizeSelector';
import PriceField from '../../components/PriceField';

export default function PaperTypeFormScreen({ route, navigation }) {
  const existingPaperType = route.params?.paperType || null;
  const existingIndex = route.params?.index ?? null;
  const onSave = route.params?.onSave;

  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [gsm, setGsm] = useState('');
  const [sizeKey, setSizeKey] = useState('A4');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');
  const [sheets, setSheets] = useState('');
  const [price, setPrice] = useState('');
  const [printCost, setPrintCost] = useState('');
  const [bindCost, setBindCost] = useState('');
  const [note, setNote] = useState('');
  const [lastUsedPrice, setLastUsedPrice] = useState(null);
  const [lastUsedPrintCost, setLastUsedPrintCost] = useState(null);
  const [lastUsedBindCost, setLastUsedBindCost] = useState(null);

  useEffect(() => {
    async function loadPrices() {
      if (gsm && sizeKey) {
        const lastUsedPrices = await getLastUsedForKey(`${gsm}_${sizeKey}`);
        if (lastUsedPrices) {
          setLastUsedPrice(lastUsedPrices.price || null);
          setLastUsedPrintCost(lastUsedPrices.printCost || null);
          setLastUsedBindCost(lastUsedPrices.bindCost || null);
          return;
        }
      }
      setLastUsedPrice(null);
      setLastUsedPrintCost(null);
      setLastUsedBindCost(null);
    }
    loadPrices();
  }, [gsm, sizeKey]);

  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (existingPaperType) {
      navigation.setOptions({ title: 'Edit Paper Type' });
      populateFromPaperType(existingPaperType);
    } else {
      navigation.setOptions({ title: 'Add Paper Type' });
      loadManualDefaults();
    }
  }, []);

  const populateFromPaperType = (pt) => {
    setName(pt.name || '');
    setTemplateId(pt.templateId || null);
    setGsm(pt.gsm ? String(pt.gsm) : '');
    setSizeKey(pt.sizeKey || 'A4');
    setCustomW(pt.customW ? String(pt.customW) : '');
    setCustomH(pt.customH ? String(pt.customH) : '');
    setSheets(pt.sheets ? String(pt.sheets) : '');
    setPrice(pt.price ? String(pt.price) : '');
    setPrintCost(pt.printCost ? String(pt.printCost) : '');
    setBindCost(pt.bindCost ? String(pt.bindCost) : '');
    setNote(pt.note || '');
  };

  const loadManualDefaults = async () => {
    const lastUsed = await getLastUsedForKey('manual');
    if (lastUsed) {
      setGsm(lastUsed.gsm ? String(lastUsed.gsm) : '');
      setSizeKey(lastUsed.sizeKey || 'A4');
      setCustomW(lastUsed.customW ? String(lastUsed.customW) : '');
      setCustomH(lastUsed.customH ? String(lastUsed.customH) : '');
      setSheets(lastUsed.sheets ? String(lastUsed.sheets) : '');
      setPrintCost(lastUsed.printCost ? String(lastUsed.printCost) : '');
      setBindCost(lastUsed.bindCost ? String(lastUsed.bindCost) : '');
    }
  };

  const openTemplateModal = async () => {
    const all = await getTemplates();
    setTemplates(all);
    setTemplateModalVisible(true);
  };

  const selectTemplate = async (t) => {
    setTemplateModalVisible(false);
    setTemplateId(t.id);
    setGsm(t.gsm ? String(t.gsm) : '');
    setSizeKey(t.sizeKey || 'A4');
    setCustomW(t.customW ? String(t.customW) : '');
    setCustomH(t.customH ? String(t.customH) : '');
    setSheets(t.sheets ? String(t.sheets) : '');
    setPrintCost(t.printCost ? String(t.printCost) : '');
    setBindCost(t.bindCost ? String(t.bindCost) : '');
    setNote(t.note || '');

    setPrice(''); // leave empty so chip shows if available
  };

  const clearTemplate = async () => {
    setTemplateId(null);
    const lastUsed = await getLastUsedForKey('manual');
    if (lastUsed) {
      setGsm(lastUsed.gsm ? String(lastUsed.gsm) : '');
      setSizeKey(lastUsed.sizeKey || 'A4');
      setCustomW(lastUsed.customW ? String(lastUsed.customW) : '');
      setCustomH(lastUsed.customH ? String(lastUsed.customH) : '');
      setSheets(lastUsed.sheets ? String(lastUsed.sheets) : '');
      setPrintCost(lastUsed.printCost ? String(lastUsed.printCost) : '');
      setBindCost(lastUsed.bindCost ? String(lastUsed.bindCost) : '');
    } else {
      setGsm('');
      setSizeKey('A4');
      setCustomW('');
      setCustomH('');
      setSheets('');
      setPrintCost('');
      setBindCost('');
    }
    setNote('');
    setPrice('');
  };

  const handleSave = async () => {
    const nameVal = name.trim();
    const gsmVal = parseFloat(gsm);
    const sheetsVal = parseInt(sheets, 10);
    const priceVal = parseFloat(price);

    if (!nameVal) {
      Alert.alert('Validation', 'Paper type name is required.');
      return;
    }
    if (!gsmVal) {
      Alert.alert('Validation', 'GSM is required.');
      return;
    }
    if (!sheetsVal) {
      Alert.alert('Validation', 'Sheets is required.');
      return;
    }
    if (!priceVal) {
      Alert.alert('Validation', 'Price per kg is required.');
      return;
    }
    if (!sizeKey) {
      Alert.alert('Validation', 'Paper size is required.');
      return;
    }

    const cw = customW ? parseFloat(customW) : null;
    const ch = customH ? parseFloat(customH) : null;

    const area = getArea(sizeKey, cw, ch);
    if (area === null) {
      Alert.alert('Validation', 'Invalid size. Please check custom dimensions.');
      return;
    }

    const paperCost = calcPaperCost({
      gsm: gsmVal,
      area,
      pricePerKg: priceVal,
      sheets: sheetsVal,
    });

    const pcVal = printCost ? parseFloat(printCost) : 0;
    const bcVal = bindCost ? parseFloat(bindCost) : 0;

    const totalPerCopy = calcTotalPerCopy({
      paperCost,
      printCost: pcVal,
      bindCost: bcVal,
    });

    const paperType = {
      name: nameVal,
      templateId: templateId || null,
      gsm: gsmVal,
      sizeKey,
      customW: cw,
      customH: ch,
      sheets: sheetsVal,
      price: priceVal,
      printCost: pcVal,
      bindCost: bcVal,
      note: note.trim(),
      area,
      paperCost,
      totalPerCopy,
    };

    // Update lastUsed for manual defaults
    await setLastUsedForKey(templateId || 'manual', {
      gsm: gsmVal,
      sizeKey,
      customW: cw,
      customH: ch,
      sheets: sheetsVal,
      printCost: pcVal,
      bindCost: bcVal,
    });

    // Update lastUsed for prices based on GSM and Size pair
    await setLastUsedForKey(`${gsmVal}_${sizeKey}`, {
      price: priceVal,
      printCost: pcVal,
      bindCost: bcVal,
    });

    if (onSave) {
      onSave(paperType, existingIndex);
    }
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Template buttons */}
      <View style={styles.templateRow}>
        <TouchableOpacity
          style={styles.templateBtn}
          onPress={openTemplateModal}
          activeOpacity={0.7}
        >
          <Text style={styles.templateBtnText}>
            {templateId ? '↻ Change Template' : '📄 Use Template'}
          </Text>
        </TouchableOpacity>
        {templateId && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={clearTemplate}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FieldRow label="Paper Type Name *">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Inner Pages"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="GSM *">
        <TextInput
          style={styles.input}
          value={gsm}
          onChangeText={setGsm}
          keyboardType="decimal-pad"
          placeholder="e.g. 80"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Paper Size *">
        <SizeSelector
          sizeKey={sizeKey}
          customW={customW}
          customH={customH}
          onSizeChange={setSizeKey}
          onCustomWChange={setCustomW}
          onCustomHChange={setCustomH}
        />
      </FieldRow>

      <FieldRow label="Sheets per Copy *">
        <TextInput
          style={styles.input}
          value={sheets}
          onChangeText={setSheets}
          keyboardType="number-pad"
          placeholder="e.g. 200"
          placeholderTextColor="#9CA3AF"
        />
      </FieldRow>

      <FieldRow label="Price per Kg (₹) *">
        <PriceField
          value={price}
          onChange={setPrice}
          lastUsedPrice={lastUsedPrice}
        />
      </FieldRow>

      <FieldRow label="Print Cost (₹ per copy)">
        <PriceField
          value={printCost}
          onChange={setPrintCost}
          lastUsedPrice={lastUsedPrintCost}
          placeholder="0"
        />
      </FieldRow>

      <FieldRow label="Binding Cost (₹ per copy)">
        <PriceField
          value={bindCost}
          onChange={setBindCost}
          lastUsedPrice={lastUsedBindCost}
          placeholder="0"
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
        <Text style={styles.saveBtnText}>
          {existingPaperType ? 'Update Paper Type' : 'Add Paper Type'}
        </Text>
      </TouchableOpacity>

      {/* Template selection modal */}
      <Modal visible={templateModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Template</Text>
              <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {templates.length === 0 ? (
              <Text style={styles.noTemplates}>
                No templates saved yet. Create one in the Templates tab.
              </Text>
            ) : (
              <FlatList
                data={templates}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.templateItem}
                    onPress={() => selectTemplate(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateItemName}>{item.name}</Text>
                    <Text style={styles.templateItemMeta}>
                      {item.gsm ? `${item.gsm} GSM` : ''}{' '}
                      {item.sizeKey ? `· ${item.sizeKey}` : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  templateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  templateBtn: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  templateBtnText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
  },
  noTemplates: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  templateItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  templateItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  templateItemMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
