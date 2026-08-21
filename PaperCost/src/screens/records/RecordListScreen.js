import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRecords, deleteRecord } from '../../storage/records';
import DeleteModal from '../../components/DeleteModal';
import EmptyState from '../../components/EmptyState';

export default function RecordListScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const load = async () => {
    const records = await getRecords();

    // Group by clientName
    const groupMap = {};
    records.forEach((r) => {
      const key = r.clientName || 'Unknown';
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(r);
    });

    // Sort groups alphabetically, records within each by savedAt desc
    const grouped = Object.keys(groupMap)
      .sort((a, b) => a.localeCompare(b))
      .map((clientName) => ({
        title: clientName,
        data: groupMap[clientName].sort((a, b) => b.savedAt - a.savedAt),
      }));

    setSections(grouped);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    if (selectedIds.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.headerBtnText}>🗑️</Text>
          </TouchableOpacity>
        ),
        title: `${selectedIds.length} Selected`,
      });
    } else {
      navigation.setOptions({
        headerRight: null,
        title: 'Records',
      });
    }
  }, [navigation, selectedIds]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleDelete = async () => {
    for (const id of selectedIds) {
      await deleteRecord(id);
    }
    setSelectedIds([]);
    setDeleteModalVisible(false);
    load();
  };

  const renderSectionHeader = ({ section }) => {
    const selectedInSection = section.data.filter(r => selectedIds.includes(r.id));
    const recordsToSum = selectedInSection.length > 0 ? selectedInSection : section.data;
    const totalCost = recordsToSum.reduce(
      (sum, r) => sum + (r.totalCost !== undefined ? r.totalCost : (r.totalPerCopy || 0)),
      0
    );

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCost}>
            ₹{totalCost.toFixed(2)}
            {selectedInSection.length > 0 ? ' (selected)' : ''}
          </Text>
        </View>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const isSelectionMode = selectedIds.length > 0;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onLongPress={() => toggleSelection(item.id)}
        onPress={() => {
          if (isSelectionMode) toggleSelection(item.id);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.row1}>
          <View style={styles.productBadge}>
            <Text style={styles.productBadgeText}>{item.productType}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.details}>
          Total: ₹{(item.totalCost !== undefined ? item.totalCost : (item.totalPerCopy || 0)).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (sections.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📑"
          title="No Records Yet"
          subtitle="Records are saved when you tap 'Save Calculation' in the Summary screen."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.list}
      />
      <DeleteModal
        visible={deleteModalVisible}
        itemName={`${selectedIds.length} record${selectedIds.length > 1 ? 's' : ''}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  sectionCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  details: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  cardSelected: {
    borderColor: '#4338CA',
    backgroundColor: '#EEF2FF',
  },
  headerBtn: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  headerBtnText: {
    fontSize: 18,
  },
});
