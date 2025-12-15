import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTaskStore } from './store/taskStore';

import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#1f2937',
    onSurface: '#1f2937',
    placeholder: '#9ca3af',
    disabled: '#d1d5db',
    backdrop: 'rgba(0, 0, 0, 0.3)',
    error: '#f43f5e',
    notification: '#6366f1',
    accent: '#6366f1',
    surfaceVariant: '#e5e7eb',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
  },
  roundness: 16,
};

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          paddingTop: 4,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'view-grid';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Projects') {
            iconName = 'folder-multiple';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const initializeTasks = useTaskStore(state => state.initializeTasks);

  useEffect(() => {
    initializeTasks();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <NavigationContainer theme={theme}>
          <TabNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
