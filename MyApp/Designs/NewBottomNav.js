// Designs/NewBottomNav.js
import { Platform, StyleSheet } from "react-native";

/** THEME */
export const COLORS = {
  BAR_BG:        "#0B0F14",   // dark bar (set to #FFFFFF for light)
  ACTIVE_BG:     "#16A34A",   // green circle
  ACTIVE_TINT:   "#FFFFFF",
  INACTIVE_TINT: "#9AA3B2",
  SPARKLE_1:     "#D1FAE5",
  SPARKLE_2:     "#BBF7D0",
};

export const METRICS = {
  // NOTE: BAR_HEIGHT is just the inner bar height (safe-area padding is handled in NewBottomNav.jsx).
  BAR_HEIGHT:      Platform.OS === "ios" ? 64 : 64,
  PHONE_MAX_WIDTH: 440,        // allow a bit wider nav on larger phones
  ACTIVE_SIZE:     46,         // indicator circle diameter
  H_PAD:           10,
};

const styles = StyleSheet.create({
  // Absolute container that sits at the bottom of the screen.
  // (Real bottom spacing is applied from NewBottomNav.jsx via SafeAreaView.)
  safe: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 1000,
    elevation: 20,
    // don't set a fixed height here; SafeAreaView + inner 'bar' controls the size
    // backgroundColor: 'transparent',
  },

  // The inner bar “card”
  bar: {
    width: "100%",
    maxWidth: METRICS.PHONE_MAX_WIDTH,
    height: METRICS.BAR_HEIGHT,
    justifyContent: "flex-end",
    // Small side gutters so it looks centered on big phones
    marginHorizontal: 10,
    // Make sure shadows render nicely
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        // elevation is already on 'safe'; keep the bar clean
      },
      default: {},
    }),
  },

  // Background layer for the bar
  barBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.BAR_BG,
    borderRadius: 16,
  },

  // Track that holds the indicator + tab slots
  track: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: METRICS.H_PAD,
    paddingVertical: 8,
  },

  // Each tab slot area
  slot: {
    flex: 1,
    height: METRICS.BAR_HEIGHT - 16, // leave room for internal padding
    alignItems: "center",
    justifyContent: "center",
  },

  /** Circular indicator (behind icons) */
  indicatorWrap: {
    position: "absolute",
    top: 8,
    left: 0,
    width: METRICS.ACTIVE_SIZE,
    height: METRICS.ACTIVE_SIZE,
    borderRadius: METRICS.ACTIVE_SIZE / 2,
    zIndex: 0,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.ACTIVE_BG,
        shadowOpacity: 0.24,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 5 },
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  indicatorCore: {
    width: METRICS.ACTIVE_SIZE,
    height: METRICS.ACTIVE_SIZE,
    borderRadius: METRICS.ACTIVE_SIZE / 2,
    backgroundColor: COLORS.ACTIVE_BG,
  },
  sparkleSmall: {
    position: "absolute",
    top: 10,
    left: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.SPARKLE_1,
    opacity: 0.9,
  },
  sparkleBig: {
    position: "absolute",
    top: 12,
    right: 11,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.SPARKLE_2,
    opacity: 0.9,
  },

  // Icon + labels
  icon: { width: 22, height: 22, marginBottom: 4 },
  label: { fontSize: 11, color: COLORS.INACTIVE_TINT, letterSpacing: 0.2 },
  labelActive: { color: COLORS.ACTIVE_TINT, fontWeight: "800" },
});

export default styles;