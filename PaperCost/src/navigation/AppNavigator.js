import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import EstimateStack from './EstimateStack';
import TemplateStack from './TemplateStack';
import RecordListScreen from '../screens/records/RecordListScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const RecordStack = createStackNavigator();

function RecordStackScreen() {
  return (
    <RecordStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        cardStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <RecordStack.Screen
        name="RecordList"
        component={RecordListScreen}
        options={{ title: 'Records' }}
      />
    </RecordStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E293B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="EstimatesTab"
        component={EstimateStack}
        options={{
          tabBarLabel: 'Estimates',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="TemplatesTab"
        component={TemplateStack}
        options={{
          tabBarLabel: 'Templates',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📄</Text>
          ),
        }}
      />
      <Tab.Screen
        name="RecordsTab"
        component={RecordStackScreen}
        options={{
          tabBarLabel: 'Records',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📑</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#1E293B',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
