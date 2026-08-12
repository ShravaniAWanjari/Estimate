import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EstimateListScreen from '../screens/estimates/EstimateListScreen';
import EstimateFormScreen from '../screens/estimates/EstimateFormScreen';
import PaperTypeFormScreen from '../screens/estimates/PaperTypeFormScreen';
import SummaryScreen from '../screens/estimates/SummaryScreen';

const Stack = createStackNavigator();

export default function EstimateStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        cardStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen
        name="EstimateList"
        component={EstimateListScreen}
        options={{ title: 'Estimates' }}
      />
      <Stack.Screen
        name="EstimateForm"
        component={EstimateFormScreen}
        options={{ title: 'New Estimate' }}
      />
      <Stack.Screen
        name="PaperTypeForm"
        component={PaperTypeFormScreen}
        options={{ title: 'Paper Type' }}
      />
      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: 'Summary' }}
      />
    </Stack.Navigator>
  );
}
