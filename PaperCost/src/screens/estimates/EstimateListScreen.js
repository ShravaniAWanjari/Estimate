import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEstimates, deleteEstimate } from '../../storage/estimates';
import EmptyState from '../../components/EmptyState';
import DeleteModal from '../../components/DeleteModal';

export default function EstimateListScreen({ navigation }) {
  const [sections, setSections] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    const estimates = await getEstimates();

    // Group by clientName
    const groupMap = {};
    estimates.forEach((e) => {
      const key = e.clientName || 'Unknown';
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(e);
    });

    // Sort groups alphabetically, estimates within each by updatedAt desc
    const grouped = Object.keys(groupMap)
      .sort((a, b) => a.localeCompare(b))
      .map((clientName) => ({
        title: clientName,
        data: groupMap[clientName].sort(
          (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
        ),
      }));

    setSections(grouped);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EstimateForm')}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteEstimate(deleteTarget.id);
      setDeleteTarget(null);
      load();
    }
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EstimateForm', { estimateId: item.id })}
      onLongPress={() => setDeleteTarget(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.productType}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.price}>₹{item.totalPerCopy?.toFixed(2)} / copy</Text>
      </View>
      {item.bulkTotal ? (
        <Text style={styles.bulk}>
          Bulk ({item.bulkQty}): ₹{item.bulkTotal?.toFixed(2)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  if (sections.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📋"
          title="No Estimates Yet"
          subtitle="Tap the + button to create your first paper cost estimate."
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
        visible={!!deleteTarget}
        itemName={deleteTarget?.clientName || ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bulk: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  headerBtn: {
    marginRight: 16,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },
});
