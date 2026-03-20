// screens/GetStarted.jsx
import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import styles, { COLORS } from "../Designs/GetStarted";

export default function GetStarted({ navigation, route }) {
  const nextRoute = route?.params?.nextRoute || "LogIn";

  const trackWidthRef = useRef(0);
  const KNOB_SIZE = 40;
  const PADDING = 6;
  const knobX = useRef(new Animated.Value(0)).current;

  const setTrackWidth = (w) => { if (w && trackWidthRef.current !== w) trackWidthRef.current = w; };
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const completeSwipe = () => {
    const max = Math.max(0, trackWidthRef.current - (KNOB_SIZE + PADDING * 2));
    Animated.timing(knobX, {
      toValue: max,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate(nextRoute);
      knobX.setValue(0);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const max = Math.max(0, trackWidthRef.current - (KNOB_SIZE + PADDING * 2));
        const nx = clamp(g.dx, 0, max);
        knobX.setValue(nx);
      },
      onPanResponderRelease: (_, g) => {
        const max = Math.max(0, trackWidthRef.current - (KNOB_SIZE + PADDING * 2));
        const progress = clamp(g.dx, 0, max) / (max || 1);
        if (progress >= 0.7) completeSwipe();
        else Animated.spring(knobX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <SafeAreaView style={styles.safe}>
      {/* PHONE FRAME — bounds circles + content to 360px on web */}
      <View style={styles.frame}>
        {/* Circles (absolute inside the frame) */}
        <View style={styles.circlesStage}>
          <View style={styles.circlesInner}>
            <View style={styles.circleGold} />
            <View style={styles.circleDark} />
            <View style={styles.circleGreen} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            {/* Logo */}
            <Image
              source={require("../stores/assets/sagipbayanlogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Bottom dock: slider */}
            <View style={styles.bottomDock}>
              <View
                style={styles.sliderTrack}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View
                  style={[
                    styles.sliderFill,
                    { width: Animated.add(knobX, new Animated.Value(KNOB_SIZE + PADDING * 2)) },
                  ]}
                />
                <Text style={styles.sliderLabel}>Swipe to get started</Text>
                <Animated.View
                  {...pan.panHandlers}
                  style={[styles.knob, { transform: [{ translateX: knobX }] }]}
                >
                  <Text style={styles.knobArrow}>➔</Text>
                </Animated.View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}