// screens/NewBottomNav.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Image, Text, Animated, Easing } from "react-native";
import { useRoute } from "@react-navigation/native";
import styles, { COLORS, METRICS } from "../Designs/NewBottomNav";
import { getKeys, setNextKey, syncWithRoute } from "../stores/bottomNavState";

// Tabs (center "+" opens MainCenter/panel)
const TABS = [
  { key: "Connection",     label: "Connection",  icon: require("../stores/assets/connection.png") },
  { key: "IncidentReport", label: "Report",      icon: require("../stores/assets/report.png") },
  { key: "MainCenter",     label: "Add",         icon: null }, // center "+" drawn in code
  { key: "Virtual",        label: "Virtual",     icon: require("../stores/assets/vr.png") },
  { key: "History",        label: "History",     icon: require("../stores/assets/history.png") },
];

/** Lightweight "+" drawn in code (no asset needed). */
function PlusIcon({ color = COLORS.ACTIVE_TINT, size = 18, thickness = 3 }) {
  const half = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: thickness, height: size, backgroundColor: color, borderRadius: thickness / 2 }} />
      <View style={{ position: "absolute", width: size, height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
    </View>
  );
}

export default function NewBottomNav({ navigation, onCenterPress }) {
  const route = useRoute();
  const currentRoute = route?.name || "MainCenter";

  const [activeKey, setActiveKey] = useState(currentRoute);
  const [trackWidth, setTrackWidth] = useState(0);

  const count = TABS.length;
  const segmentW = trackWidth > 0 ? trackWidth / count : 0;
  const centerIndex = Math.floor(count / 2);

  const indexOfKey = (k) => {
    const idx = TABS.findIndex(t => t.key === k);
    return idx >= 0 ? idx : centerIndex;
  };
  const activeIndex = useMemo(() => indexOfKey(activeKey), [activeKey]);

  // Animations
  const slideX = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(1)).current;
  const iconScales = useRef(TABS.map(() => new Animated.Value(1))).current;

  const toX = (idx) => segmentW * idx + (segmentW / 2) - (METRICS.ACTIVE_SIZE / 2);

  /** 1) On layout / mount: position at PREVIOUS tab, animate to CURRENT route. */
  const initialized = useRef(false);
  useEffect(() => {
    if (!trackWidth) return;

    // Sync the store with the real route (covers programmatic navigation)
    syncWithRoute(currentRoute);

    const { prevKey, currKey } = getKeys();
    const prevIdx = indexOfKey(prevKey);
    const currIdx = indexOfKey(currKey);

    // Position without anim at previous…
    slideX.setValue(toX(prevIdx));
    setActiveKey(currKey);

    // …then animate to current
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: toX(currIdx),
        duration: initialized.current ? 200 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(circleScale, { toValue: 1.08, duration: 90, useNativeDriver: true }),
        Animated.spring(circleScale,  { toValue: 1.00, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]),
    ]).start(() => {
      initialized.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackWidth, currentRoute]);

  /** 2) If activeKey changes within the same mount, animate smoothly. */
  useEffect(() => {
    if (!trackWidth || !initialized.current) return;
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: toX(activeIndex),
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(circleScale, { toValue: 1.08, duration: 90, useNativeDriver: true }),
        Animated.spring(circleScale,  { toValue: 1.00, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  /** 3) Press handler: persist prev->curr BEFORE navigation; bounce the icon. */
  const onPress = (tab, index) => {
    Animated.sequence([
      Animated.timing(iconScales[index], { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.spring(iconScales[index], { toValue: 1.00, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();

    // Persist selection so next screen animates from correct source
    setNextKey(tab.key);

    // Immediate visual feedback
    setActiveKey(tab.key);

    // Center "+"
    if (index === centerIndex) {
      if (typeof onCenterPress === "function") onCenterPress();
      else navigation?.navigate?.("MainCenter");
      return;
    }

    navigation?.navigate?.(tab.key);
  };

  return (
    <View style={styles.safe} pointerEvents="box-none">
      <View style={styles.bar}>
        <View style={styles.barBg} />

        <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
          {/* Circular green indicator (behind icons/labels) */}
          {trackWidth > 0 && (
            <Animated.View
              style={[
                styles.indicatorWrap,
                { transform: [{ translateX: slideX }, { scale: circleScale }] },
              ]}
            >
              <View style={styles.indicatorCore} />
              {/* Comment out sparkles if you want absolute minimal overdraw */}
              <View style={styles.sparkleSmall} />
              <View style={styles.sparkleBig} />
            </Animated.View>
          )}

          {/* Tabs */}
          {TABS.map((tab, i) => {
            const isActive = tab.key === activeKey;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onPress(tab, i)}
                style={styles.slot}
                android_ripple={{ color: "rgba(255,255,255,0.08)" }}
              >
                <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ scale: iconScales[i] }] }}>
                  {tab.icon ? (
                    <Image
                      source={tab.icon}
                      resizeMode="contain"
                      style={{
                        width: 22, height: 22, marginBottom: 4,
                        tintColor: isActive ? COLORS.ACTIVE_TINT : COLORS.INACTIVE_TINT,
                      }}
                    />
                  ) : (
                    // Center "+" (no asset dependency)
                    <PlusIcon color={isActive ? COLORS.ACTIVE_TINT : COLORS.INACTIVE_TINT} size={20} thickness={3} />
                  )}
                  <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}