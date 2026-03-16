// Designs/SignUp.js
import { StyleSheet } from "react-native";

/** Same brand palette as Designs/LogIn.js */
export const COLORS = {
  white: "#FFFFFF",
  text: "#000000",
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
 * Traits copied from LogIn.js:
 * - Light page bg (#FFFFFF)
 * - Green outlined rounded inputs (radius 18, 1.5px border)
 * - Subtle shadow on fields
 * - Solid green primary button with gold label
 * - Same paddings/margins and max widths
 */
const styles = StyleSheet.create({
  /** Root */
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /** Background layer (optional, kept to mirror LogIn’s API) */
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
    resizeMode: "cover",
    opacity: 0.9,
  },

  /** Foreground content (same spacing as LogIn) */
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 40,
  },

  /** Logo (mirrors LogIn sizing so it won’t push the form) */
  logo: {
    width: "70%",
    maxWidth: 320,
    aspectRatio: 280 / 120, // adjust if your asset ratio differs
    alignSelf: "center",
    // If you used negative margins in LogIn to lift the form visually, keep them here too:
    marginTop: -100,
    marginBottom: -40,
  },

  /** Form container */
  formWrapper: {
    width: "100%",
    maxWidth: 420,
  },

  /** Inputs — identical to LogIn */
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

  /** Primary button — identical to LogIn */
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

  /** Helper texts — identical to LogIn */
  error: {
    color: COLORS.danger,
    marginTop: 4,
    marginBottom: 4,
    textAlign: "left",
    fontSize: 14,
  },
  link: {
    color: COLORS.link,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default styles;
