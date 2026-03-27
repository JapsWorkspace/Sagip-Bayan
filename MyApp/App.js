import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppBootstrap from './screens/AppBootstrap';
import PrivacyGate from './screens/PrivacyGate';
import GetStarted from './screens/GetStarted';

import Home from './screens/Home';
import LogIn from './screens/LogIn';
import SignUp from './screens/SignUp';
import IncidentReportScreen from './screens/IncidentReportingScreen';
import Profile from './screens/Profile';
import SendOtp from './screens/SendOtp';
import VerifyOtp from './screens/VerifyOtp';
import PasswordSecurity from './screens/PasswordSecurity';
import PersonalDetails from './screens/PersonalDetails';
import RiskHeatMap from './screens/RiskHeatMap';
import Guidelines from './screens/Guidelines';
import SafetyMark from './screens/SafetyMark';
import MainCenter from './screens/MainCenter';

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

          {/* SIGN UP FLOW ONLY */}
          <Stack.Screen name="PrivacyGate" component={PrivacyGate} />
          <Stack.Screen name="SignUp" component={SignUp} />

          {/* OPTIONAL AUTH */}
          <Stack.Screen name="SendOtp" component={SendOtp} />
          <Stack.Screen
            name="VerifyOtp"
            component={VerifyOtp}
            options={{ presentation: 'modal' }}
          />

          {/* MAIN APP */}
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="MainCenter" component={MainCenter} />
          <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
          <Stack.Screen name="Profile" component={Profile} />
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