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