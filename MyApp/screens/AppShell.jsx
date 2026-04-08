// screens/AppShell.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import NewBottomNav from "./NewBottomNav";

import MainCenter from "./MainCenter";
import IncidentReportScreen from "./IncidentReportingScreen";
import Profile from "./Profile";
import RiskHeatMap from "./RiskHeatMap";
import Guidelines from "./Guidelines";
import SafetyMark from "./SafetyMark";

const Stack = createNativeStackNavigator();

export default function AppShell() {
  return (
    <View style={styles.root}>
      {/* ✅ Inner navigation stack */}
      <Stack.Navigator
        initialRouteName="MainCenter"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="MainCenter" component={MainCenter} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="RiskHeatMap" component={RiskHeatMap} />
        <Stack.Screen name="Guidelines" component={Guidelines} />
        <Stack.Screen name="Connection" component={SafetyMark} />
      </Stack.Navigator>

      {/* ✅ Persistent bottom nav (NOT a Screen) */}
      <View style={styles.navWrapper} pointerEvents="box-none">
        <NewBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
});
