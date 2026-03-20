// Designs/GetStarted.js
import { StyleSheet, Dimensions, Platform } from "react-native";

/** Brand colors */
export const COLORS = {
  white: "#FFFFFF",
  text: "#0B1220",
  textMuted: "#6B7280",
  placeholder: "#6B7280",
  green: "#127e2d",
  greenDark: "#0E561F",
  gold: "#FFC82C",
  shadow: "rgba(0,0,0,0.15)",
  track: "#E5E7EB",
};

const { width: W, height: H } = Dimensions.get("window");

/**
 * 🔧 TWEAK KNOBS — your values kept
 */
const BASE_FACTOR = 0.70;
const FG_RATIO    = 0.78;
const MD_RATIO    = 0.76;
const SM_RATIO    = 0.66;

// 🔒 DO NOT TOUCH — placements preserved (exactly as you provided)
const OFFSETS = {
  gold:  { left: -0.38, bottom: -0.06 },
  dark:  { right:  -0.10, bottom:  0.25 },
  green: { left:   0.30,  bottom: -0.40 },
};

const INNER_EXTRA = 100;
export const WEB_MOBILE_WIDTH = 360;
const WEB_MIN_PHONE_WIDTH = 320;
const WEB_MAX_PHONE_WIDTH = 480;

/** Global looks */
const BASE_SIZE_SCALE      = 0.92; // keep circles a bit smaller on phones (no extra growth)
const SLIDER_LIFT          = 40;   // ⬆️ lift swipe pill more
const TABLET_MIN_FRAME     = 360;  // centered frame for non‑Pro tablets
const TABLET_MAX_FRAME     = 540;

/** iPad Pro only: make big + scatter wider */
const IPAD_PRO_SIZE_BOOST  = 1.28;
const IPAD_PRO_SPREAD      = 1.60;

/**
 * NEW: edge bleed — horizontal negative insets applied to the circle stage
 * so circles bleed past the sides on phones (removes side gutters)
 * without changing positions or growing diameters.
 */
function computeEdgePad(frameWidth, isIPadProNative) {
  if (isIPadProNative) return 28;     // wide canvas → let it breathe more
  if (frameWidth <= 360) return 16;   // SE/narrow phones
  if (frameWidth <= 400) return 12;   // typical phones (Pixel 4a/iPhone 12 mini)
  if (frameWidth <= 430) return 10;   // iPhone 12/13/14
  return 8;                           // larger phones
}

export function createGetStartedStyles(w = W, h = H) {
  const isWeb           = Platform.OS === "web";
  const isTabletNative  = !isWeb && w >= 600;
  const isIPadProNative = !isWeb && (w >= 834 || h >= 1024); // iPad Pro breakpoints

  /**
   * FRAME WIDTH
   * - WEB: fixed 360px “phone” frame (stable, like your LogIn.js)
   * - NATIVE PHONE: full width
   * - NATIVE TABLET:
   *     • iPad Pro → full width (let art go wide)
   *     • other tablets → centered frame 360–540
   */
  const frameWidth =
    isWeb
      ? WEB_MOBILE_WIDTH
      : isIPadProNative
      ? w
      : isTabletNative
      ? Math.min(Math.max(w, TABLET_MIN_FRAME), TABLET_MAX_FRAME)
      : w;

  // Base width/height responsiveness (gentle; we’re not enlarging circles here)
  const wClamp      = Math.min(Math.max(frameWidth, WEB_MIN_PHONE_WIDTH), WEB_MAX_PHONE_WIDTH);
  const widthScale  = 0.95 + ((wClamp - 320) / (WEB_MAX_PHONE_WIDTH - 320)) * 0.19;
  const hClamp      = Math.min(Math.max(h, 640), 932);
  const heightScale = 0.96 + ((hClamp - 720) / (932 - 720)) * 0.14;
  const baseDeviceScale = Math.max(0.94, Math.min(widthScale * heightScale, 1.20));

  // Phones: keep smaller look; iPad Pro: boost size. No extra “edge growth”.
  const sizeScale =
    isIPadProNative
      ? baseDeviceScale * IPAD_PRO_SIZE_BOOST
      : baseDeviceScale * BASE_SIZE_SCALE;

  // Circle base by height, then apply sizeScale
  const baseH = Math.min(Math.max(h * BASE_FACTOR, 460), 760);
  const base  = Math.min(Math.max(baseH * sizeScale, 440), 920);

  // Diameters (placements unchanged)
  const C_LG = Math.round(base * FG_RATIO);
  const C_MD = Math.round(base * MD_RATIO);
  const C_SM = Math.round(base * SM_RATIO);

  // Logo: track frame width & sizeScale (cap)
  const logoFrac    = 0.9 * Math.min(sizeScale, 1.16);
  const logoWidthPx = Math.round(frameWidth * logoFrac);

  // iPad Pro L/R scatter multiplier (keeps your bottom offsets)
  const spread = isIPadProNative ? IPAD_PRO_SPREAD : 1.0;

  // ⬅️➡️ Edge bleed (negative insets) to remove side gutters on phones
  const edgePad = computeEdgePad(frameWidth, isIPadProNative);

  return StyleSheet.create({
    /** Root */
    safe: {
      flex: 1,
      backgroundColor: COLORS.white,
      ...(isWeb ? { alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh" } : null),
      ...(!isWeb && isTabletNative ? { alignItems: "center", justifyContent: "center" } : null),
    },

    /** Frame bounds composition */
    frame: {
      width: "100%",
      height: "100%",
      position: "relative",
      ...(isWeb
        ? { width: frameWidth, maxWidth: frameWidth, alignSelf: "center", flex: 1, minHeight: h }
        : isTabletNative
        ? { width: frameWidth, maxWidth: frameWidth, alignSelf: "center", flex: 1 }
        : null),
    },

    /** Content */
    content: {
      flexGrow: 1,
      width: "100%",
      minHeight: "100%",
      alignItems: "center",
      paddingTop: 28,
      paddingHorizontal: 16,
    },

    /** Logo */
    logo: {
      width: logoWidthPx,
      height: undefined,
      aspectRatio: 280 / 120,
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 12,
    },

    /** Circles layer INSIDE the frame */
    circlesStage: {
      position: "absolute",
      left: -edgePad,     // ⬅️ bleed outwards to kill side gaps
      right: -edgePad,    // ➡️
      bottom: 0,
      top: undefined,
      justifyContent: "flex-end",
      pointerEvents: "none",
    },
    circlesInner: {
      width: "100%",
      height: Math.max(C_LG, 380) + INNER_EXTRA, // avoids “no head” cut
      position: "relative",
      overflow: "hidden",
    },

    /** GOLD — positions preserved; scatter L/R on iPad Pro only */
    circleGold: {
      position: "absolute",
      left:   C_MD * OFFSETS.gold.left * spread,
      bottom: C_MD * OFFSETS.gold.bottom,
      width:  C_MD,
      height: C_MD,
      borderRadius: C_MD / 2,
      backgroundColor: COLORS.gold,
    },

    /** DARK — positions preserved; scatter L/R on iPad Pro only */
    circleDark: {
      position: "absolute",
      right:  C_SM * OFFSETS.dark.right * spread, // your negative sign is respected
      bottom: C_SM * OFFSETS.dark.bottom,
      width:  C_SM,
      height: C_SM,
      borderRadius: C_SM / 2,
      backgroundColor: COLORS.greenDark,
    },

    /** FOREGROUND GREEN — positions preserved; scatter L/R on iPad Pro only */
    circleGreen: {
      position: "absolute",
      left:   C_LG * OFFSETS.green.left * spread,
      bottom: C_LG * OFFSETS.green.bottom,
      width:  C_LG,
      height: C_LG,
      borderRadius: C_LG / 2,
      backgroundColor: COLORS.green,
    },

    /** Bottom dock — lifted more */
    bottomDock: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: Platform.select({ ios: 18, android: 14, default: 16 }),
      marginTop: "auto",
      transform: [{ translateY: -SLIDER_LIFT }], // ⬆️ higher, as you asked
    },

    /** Slider */
    sliderTrack: {
      width: "100%",
      height: 52,
      borderRadius: 26,
      backgroundColor: COLORS.track,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      shadowColor: COLORS.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
      ...(isWeb ? { cursor: "grab", userSelect: "none" } : null),
    },
    sliderFill: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: COLORS.green,
    },
    sliderLabel: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    knob: {
      position: "absolute",
      left: 6,
      top: 6,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.green,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    knobArrow: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "700",
      transform: [{ translateX: 1 }],
    },
  });
}

// Static fallback
const styles = createGetStartedStyles();
export default styles;