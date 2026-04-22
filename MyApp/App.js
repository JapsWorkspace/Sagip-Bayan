<<<<<<< HEAD
// App.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppBootstrap from './screens/AppBootstrap';
import PrivacyGate from './screens/PrivacyGate';
import GetStarted from './screens/GetStarted';

import LogIn from './screens/LogIn';
import SignUp from './screens/SignUp';
import SendOtp from './screens/SendOtp';
import PasswordSecurity from './screens/PasswordSecurity';
import PersonalDetails from './screens/PersonalDetails';
import HazardMap from './screens/hazardMap';
import ResetPasswordScreen from './screens/PasswordReset';
import EmailVerifyer from './screens/EmailVerifyer';
import VerifyOtp from './screens/VerifyOtp';
import DonationScreen from './screens/DonationScreen';

import AppShell from './screens/AppShell';
import { UserProvider } from './screens/UserProvider';
import { UserContext } from './screens/UserContext';

const Stack = createNativeStackNavigator();

/* ================= AUTH STACK ================= */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GetStarted" component={GetStarted} />
      <Stack.Screen name="LogIn" component={LogIn} />
      <Stack.Screen name="PrivacyGate" component={PrivacyGate} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SendOtp" component={SendOtp} />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtp}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

/* ================= APP STACK ================= */
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppShell" component={AppShell} />
      <Stack.Screen name="PasswordSecurity" component={PasswordSecurity} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
    </Stack.Navigator>
  );
}

/* ================= ROOT SWITCH ================= */
function RootNavigator() {
  const {user, loading} = useContext(UserContext);
  if (loading) return null;
  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}
=======
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import NextPage from './screens/NextPage';
import LogIn from './screens/LogIn';
import SignUp from './screens/SignUp';
import IncidentReportScreen from './screens/IncidentReportingScreen';
import Profile from './screens/Profile';
import SendOtp from './screens/SendOtp';
import VerifyOtp from './screens/VerifyOtp';
import PasswordSecurity from './screens/PasswordSecurity';
import PersonalDetails from './screens/PersonalDetails';
import RiskHeatMap from './screens/RiskHeatMap';
import Guidelines from './screens/Guidelines'
import SafetyMark from './screens/SafetyMark';

import { UserProvider } from './screens/UserProvider'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider> {/* Wrap everything in UserProvider */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LogIn">
          <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Next" component={NextPage} />
          <Stack.Screen name="LogIn" component={LogIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="SendOtp" component={SendOtp} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtp} />
           <Stack.Screen name="PasswordSecurity" component={PasswordSecurity} />
          <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
          <Stack.Screen name="RiskHeatMap" component={RiskHeatMap} />
          <Stack.Screen name="Guidelines" component={Guidelines} />
          <Stack.Screen name="Connection" component={SafetyMark} />


        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
