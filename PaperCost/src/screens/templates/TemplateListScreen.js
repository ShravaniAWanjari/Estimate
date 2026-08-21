import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTemplates, deleteTemplate } from '../../storage/templates';
import EmptyState from '../../components/EmptyState';
import DeleteModal from '../../components/DeleteModal';

export default function TemplateListScreen({ navigation }) {
  const [templates, setTemplates] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    const data = await getTemplates();
    setTemplates(data);
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
          onPress={() => navigation.navigate('TemplateForm')}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
      load();
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TemplateForm', { templateId: item.id })}
      onLongPress={() => setDeleteTarget(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{item.gsm} GSM</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.metaText}>{item.sizeKey}</Text>
        {(item.noOfSheets || item.sheets) ? (
          <>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText}>{item.noOfSheets || item.sheets} sheets</Text>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (templates.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📄"
          title="No Templates Yet"
          subtitle="Create a template to quickly fill in paper type details when building estimates."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <DeleteModal
        visible={!!deleteTarget}
        itemName={deleteTarget?.name || ''}
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
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dot: {
    fontSize: 14,
    color: '#D1D5DB',
    marginHorizontal: 6,
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
