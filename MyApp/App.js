// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppBootstrap from './screens/AppBootstrap';
import PrivacyGate from './screens/PrivacyGate';
import GetStarted from './screens/GetStarted';

import LogIn from './screens/LogIn';
import SignUp from './screens/SignUp';
import SendOtp from './screens/SendOtp';
import VerifyOtp from './screens/VerifyOtp';
import PasswordSecurity from './screens/PasswordSecurity';
import PersonalDetails from './screens/PersonalDetails';

import AppShell from './screens/AppShell'; // ✅ THIS IS THE ONE
import { UserProvider } from './screens/UserProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="GetStarted"
          screenOptions={{ headerShown: false }}
        >
          {/* BOOTSTRAP */}
          <Stack.Screen name="AppBootstrap" component={AppBootstrap} />

          {/* ENTRY */}
          <Stack.Screen name="GetStarted" component={GetStarted} />
          <Stack.Screen name="LogIn" component={LogIn} />

          {/* SIGN UP FLOW */}
          <Stack.Screen name="PrivacyGate" component={PrivacyGate} />
          <Stack.Screen name="SignUp" component={SignUp} />

          {/* OPTIONAL AUTH */}
          <Stack.Screen name="SendOtp" component={SendOtp} />
          <Stack.Screen
            name="VerifyOtp"
            component={VerifyOtp}
            options={{ presentation: 'modal' }}
          />

          {/* ✅ MAIN APP (BOTTOM NAV LIVES HERE, ONCE) */}
          <Stack.Screen name="AppShell" component={AppShell} />

          {/* SETTINGS (NO BOTTOM NAV) */}
          <Stack.Screen name="PasswordSecurity" component={PasswordSecurity} />
          <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}