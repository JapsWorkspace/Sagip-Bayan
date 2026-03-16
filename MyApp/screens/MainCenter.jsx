// screens/MainCenter.jsx
import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Animated,
  PanResponder,
  ScrollView,
} from "react-native";
import styles, { METRICS, COLORS } from "../Designs/MainCenter";
import NewBottomNav from "./NewBottomNav";

let WebMap = null;
if (Platform.OS === "web") {
  WebMap = require("./WebMap").default;
}

export default function MainCenter({ navigation }) {
  // --- DRAG (match your Incident pattern) ---
  const START_Y = 0;
  const MAX_UP = -200;   // how far up the sheet goes
  const MAX_DOWN = 0;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startY.current = pan.y._value; },
      onPanResponderMove: (_, g) => {
        let newY = startY.current + g.dy;
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > MAX_DOWN) newY = MAX_DOWN;
        pan.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: pan.y._value },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const openPanel = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: MAX_UP + 30 },
      useNativeDriver: false,
      bounciness: 6, speed: 10,
    }).start();
  };

  return (
    <View style={styles.webFrame}>
      <View style={styles.phone}>
        {/* MAP BEHIND */}
        <View style={styles.mapContainer}>
          {Platform.OS === "web" && WebMap ? <WebMap onSelect={() => {}} /> : <View />}
        </View>

        {/* SLIDING DASHBOARD SHEET */}
        <Animated.View style={[styles.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <View style={styles.card}>
            <View {...panResponder.panHandlers} style={styles.dragHandle} />

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }} bounces>
              <TextInput
                style={styles.searchBox}
                placeholder="Search"
                placeholderTextColor={COLORS.inputPlaceholder}
              />

              <Pressable style={styles.alertsBtn} onPress={() => navigation.navigate("RiskHeatMap")}>
                <Text style={styles.alertsText}>RECENT / OCCURRING DISASTER Alerts</Text>
              </Pressable>

              <View style={styles.grid}>
                <Pressable style={styles.tile} onPress={() => navigation.navigate("Profile") /* or PersonalDetails */}>
                  <Text style={styles.tileLabel}>Account{"\n"}Settings</Text>
                </Pressable>

                <Pressable style={styles.tile} onPress={() => navigation.navigate("Connection") /* SafetyMark */}>
                  <Text style={styles.tileLabel}>Status{"\n"}Marking</Text>
                </Pressable>

                <Pressable style={styles.tile} onPress={() => navigation.navigate("Guidelines")}>
                  <Text style={styles.tileLabel}>Education{"\n"}& Tutorial</Text>
                </Pressable>

                <Pressable style={styles.tile} onPress={() => navigation.navigate("Connection") /* Find People is there */}>
                  <Text style={styles.tileLabel}>Find{"\n"}People</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Bottom nav — center "+" opens this sheet */}
        <NewBottomNav
          navigation={navigation}
          onCenterPress={openPanel}
        />
      </View>
    </View>
  );
}