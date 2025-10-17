import 'react-native-get-random-values'; // Polyfill for uuid
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/loginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import HistoryScreen from './screens/HistoryScreen';
import GoalsScreen from './screens/GoalsScreen';
import ChartsScreen from './screens/ChartsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';
import BillsScreen from './screens/BillsScreen';

import { useStore } from './utils/store';
import { requestPermissions, scheduleDailyReminder } from './utils/notifications';
import { COLORS } from './constants/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}

// Home Stack (for nested navigation)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '💰 PaisaPal' }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: '📜 History' }} />
    </Stack.Navigator>
  );
}

// Main Tabs (excluding History from tab bar, accessible via Home)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Bills') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Goals') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'Charts') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Chat') iconName = focused ? 'chatbox' : 'chatbox-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Bills" component={BillsScreen} options={{ tabBarLabel: 'Bills' }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: 'Goals' }} />
      <Tab.Screen name="Charts" component={ChartsScreen} options={{ tabBarLabel: 'Analytics' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'AI' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { loadAll, loading, setUser } = useStore();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadAll();
      const granted = await requestPermissions();
      if (granted) await scheduleDailyReminder();
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          _id: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || 'User',
          balance: 0, // Initialize locally
        });
      } else {
        setUser(null);
      }
      setFirebaseUser(fbUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (loading || checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {firebaseUser ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}