import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TemplateListScreen from '../screens/templates/TemplateListScreen';
import TemplateFormScreen from '../screens/templates/TemplateFormScreen';

const Stack = createStackNavigator();

export default function TemplateStack() {
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
        name="TemplateList"
        component={TemplateListScreen}
        options={{ title: 'Templates' }}
      />
      <Stack.Screen
        name="TemplateForm"
        component={TemplateFormScreen}
        options={{ title: 'New Template' }}
      />
    </Stack.Navigator>
  );
}
