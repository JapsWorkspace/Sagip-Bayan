<<<<<<< HEAD
// Designs/LogIn.js
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  base: "#053101",
  dark: "#032500",
  mid: "#0C4308",
  light: "#25B01A",
  white: "#FFFFFF",
  placeholder: "#5E7E5E",
  danger: "#DC2626",
  gold: "#FFC82C",
};

export default StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.base,
  },

  /* ===== CAMO STRIPES (SAME AS GETSTARTED) ===== */

  stripeTop: {
    position: "absolute",
    top: -150,
    left: -width,
    width: width * 2,
    height: height * 0.35,
    backgroundColor: COLORS.dark,
    transform: [{ rotate: "-12deg" }],
  },

  stripeMid: {
    position: "absolute",
    top: height * 0.15,
    left: -width,
    width: width * 2,
    height: height * 0.35,
    backgroundColor: COLORS.mid,
    transform: [{ rotate: "-12deg" }],
  },

  stripeMid2: {
    position: "absolute",
    top: height * 0.35,
    left: -width,
    width: width * 2,
    height: height * 0.25,
    backgroundColor: COLORS.dark,
    transform: [{ rotate: "-12deg" }],
  },

  stripeBottom: {
    position: "absolute",
    bottom: -200,
    left: -width,
    width: width * 2,
    height: height * 0.4,
    backgroundColor: COLORS.light,
    transform: [{ rotate: "-12deg" }],
  },

  /* ===== CONTENT ===== */

  pageContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  logo: {
    width: width * 2.75,
    height: 180,
    marginBottom: 56,
  },

  /* ===== FULL-WIDTH PANEL ===== */

  panel: {
    width: "100%",
    backgroundColor: "#E6E6E6",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 32,

    // ensure panel sticks to bottom visually
    minHeight: height * 0.55,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },

  panelTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.placeholder,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },

  button: {
    backgroundColor: "#136D2A",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: COLORS.gold,
    fontWeight: "800",
    fontSize: 16,
  },

  helperText: {
    textAlign: "center",
    marginTop: 14,
    color: "#333",
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#136D2A",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "#136D2A",
    fontWeight: "700",
  },

  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 6,
  },
});
=======
// designs/LogIn.js
import { StyleSheet } from "react-native";

/** Brand palette aligned to your mock (white bg, green outlines, gold CTA) */
export const COLORS = {
  white: "#FFFFFF",
  text: "#0B1220",
  textMuted: "#6B7280",
  placeholder: "#5E7E5E",
  greenOutline: "#1F7A32",
  green: "#136D2A",
  greenDark: "#0E561F",
  gold: "#FFC82C",
  link: "#0284C7",
  danger: "#DC2626",
  shadow: "rgba(0,0,0,0.15)",
};

/**
 * NOTE:
 * - Style keys match your JSX exactly so you don't need to change code.
 * - Background is absolute and does not affect layout.
 * - contentWrapper provides spacing; logo has fixed sizing to prevent push-down.
 */
const styles = StyleSheet.create({
  /** Root */
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /** Background layer (optional) */
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: COLORS.white,
    pointerEvents: "none",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // change to "contain" if you prefer
    opacity: 0.9,
  },

  /** Foreground content */
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 40,
  },

  /** Logo (fixed sizing so it won't shift layout when it loads) */
  logo: {
    width: "70%",
    maxWidth: 320,
    aspectRatio: 280 / 120, // adjust to your actual image proportions
    alignSelf: "center",
    marginTop: -100,
    marginBottom: -40,
  },

  /** Form */
  formWrapper: {
    width: "100%",
    maxWidth: 420,
  },

  /** Inputs (green outline, rounded) */
  input: {
    width: "100%",
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: COLORS.greenOutline,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    color: COLORS.text,
    fontSize: 16,

    // subtle depth
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  /** Primary button (solid green, gold label) */
  button: {
    width: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: COLORS.gold,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.2,
    textAlign: "center",
  },

  /** Helper texts */
  error: {
    color: COLORS.danger,
    marginTop: 4,
    marginBottom: 4,
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: COLORS.link,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  or: {
    color: COLORS.textMuted,
    marginVertical: 12,
    textAlign: "center",
    fontSize: 14,
  },
});

export default styles;
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
