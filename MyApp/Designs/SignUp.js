<<<<<<< HEAD
// Designs/SignUp.js
import { StyleSheet, Dimensions, Platform } from "react-native";

/** Brand palette */
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

const { width: initialWidth } = Dimensions.get("window");

const createStyles = (w = initialWidth) => {
  // Mobile look on web
  const isWeb = Platform.OS === "web";
  const WEB_MOBILE_WIDTH = 360; // set 320 for iPhone SE look if you prefer
  const effectiveWidth = isWeb ? Math.min(w, WEB_MOBILE_WIDTH) : w;

  // Breakpoints
  const isPhone = effectiveWidth < 600;
  const isSmallPhone = effectiveWidth < 360;

  // Always single column for a true mobile stack (even on web)
  const columns = 1;

  // Compact sizing with SMALL gaps between fields (per your request)
  const font = isSmallPhone ? 12 : 13;
  const inputHeight = isSmallPhone ? 32 : 34;
  const inputRadius = 18;
  const fieldGapV = 6;   // ← slightly more gap between text fields
  const fieldGapH = 0;

  const CONTENT_SIDE_PADDING = 12;
  const FORM_MAX_WIDTH = isWeb ? WEB_MOBILE_WIDTH : 520;

  // Pull everything to the very top
  const PULL_UP =
    Platform.OS === "ios"
      ? (isSmallPhone ? -96 : -92)
      : Platform.OS === "android"
      ? (isSmallPhone ? -90 : -84)
      : /* web */ -78;

  // Tuck fields close to the logo, but retain a hairline gap
  const FORM_TUCK = -10;  // use -12 for even closer
  const LOGO_TUCK = 0;    // set to -2 for a subtle overlap

  return StyleSheet.create({
    /** Root */
    safe: {
      flex: 1,
      backgroundColor: COLORS.white,
      ...(isWeb && { alignItems: "center" }), // center the phone column on web
    },

    /** (Optional) background layer */
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

    /** Content — flush to the very top */
    contentWrapper: {
      // Use via ScrollView.contentContainerStyle + flexGrow: 1
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: CONTENT_SIDE_PADDING,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: PULL_UP,

      ...(isWeb && {
        width: "100%",
        maxWidth: WEB_MOBILE_WIDTH,
        alignSelf: "center",
      }),
    },

    /** Logo — small, minimal spacing below */
    logo: {
      width: isSmallPhone ? "46%" : "50%",
      maxWidth: isWeb ? 160 : 170,
      aspectRatio: 280 / 120,
      alignSelf: "center",
      marginTop: 0,
      marginBottom: LOGO_TUCK, // 0 = hairline gap; negative = tuck/overlap
    },

    /** Form wrapper — single column, small vertical gaps, tucked under logo */
    formWrapper: {
      width: "100%",
      maxWidth: FORM_MAX_WIDTH,
      alignSelf: "center",

      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: fieldGapH,
      rowGap: fieldGapV,

      marginTop: FORM_TUCK, // pull closer to the logo
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    /** Field block — single column, spacing via rowGap (no outer margins) */
    field: {
      width: "100%",
      minWidth: "100%",
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    /** Full-width row */
    fieldFull: {
      width: "100%",
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    /** Input — compact + pill */
    input: {
      width: "100%",
      minHeight: inputHeight,
      borderWidth: 1.25,
      borderColor: COLORS.greenOutline,
      borderRadius: inputRadius,
      backgroundColor: COLORS.white,

      paddingHorizontal: 12,
      paddingVertical: isSmallPhone ? 4 : 5,

      color: COLORS.text,
      fontSize: font,
      lineHeight: font + 4,

      shadowColor: COLORS.shadow,
      shadowOpacity: 0.10,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,

      ...(Platform.OS === "web" && { outlineStyle: "none" }),
    },

    /** Error text — minimal */
    error: {
      color: COLORS.danger,
      fontSize: font - 1,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      alignSelf: "flex-start",
    },

    /** Actions — tiny gap above button */
    actions: {
      width: "100%",
      maxWidth: FORM_MAX_WIDTH,
      alignSelf: "center",
      marginTop: 6,  // slightly more gap than before to match field gaps
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    /** Button — full width + compact rounded */
    button: {
      width: "100%",
      backgroundColor: COLORS.green,
      borderRadius: 18,
      paddingVertical: isSmallPhone ? 9 : 10,
      alignItems: "center",
      justifyContent: "center",

      shadowColor: COLORS.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,

      ...(Platform.OS === "web" && {
        cursor: "pointer",
        userSelect: "none",
      }),
    },
    buttonText: {
      color: COLORS.gold,
      fontWeight: "700",
      fontSize: isSmallPhone ? 14 : 15,
      letterSpacing: 0.2,
      textAlign: "center",
    },

    /** Helper link — tiny gap under button */
    helperRow: {
      width: "100%",
      maxWidth: FORM_MAX_WIDTH,
      alignSelf: "center",
      marginTop: 6,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      alignItems: "center",
    },
    link: {
      color: COLORS.link,
      fontWeight: "600",
      fontSize: font,
      textAlign: "center",
    },
  });
};

const styles = createStyles();
export default styles;

// Optional: live responsiveness in your screen component
// const { width } = useWindowDimensions();
// const styles = useMemo(() => createStyles(width), [width]);
=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
