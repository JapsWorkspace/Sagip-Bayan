// Designs/MainCenter.js
import { Platform, StyleSheet } from "react-native";

export const COLORS = {
  bg: "#FFFFFF",
  mapBg: "#DDDDDD",

  green: "#14532D",       // deep green text/button
  greenLite: "#16A34A",   // bright green accents
  text: "#0B1220",
  textMuted: "#6B7280",

  sheetBg: "#FFFFFF",
  handle: "#D1D5DB",

  tileBg: "#E5E7EB",
  inputBorder: "#14532D",
  inputPlaceholder: "#94A3B8",

  alertsBtnBg: "#0B3916",
  alertsBtnText: "#FFFFFF",
};

export const METRICS = {
  phoneMaxWidth: 390,
  panelTop: 450,   // baseline (collapsed) like your other panels
  panelRadius: 18,
  pad: 14,
  handleW: 52,
  handleH: 5,
  handleRadius: 3,
  tileH: 112,
  tileR: 12,
  gutter: 12,
};

const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Platform.OS === "web" ? "#f0f0f0" : COLORS.bg,
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: METRICS.phoneMaxWidth,
    backgroundColor: COLORS.bg,
    position: "relative",
  },
  mapContainer: { flex: 1, width: "100%", backgroundColor: COLORS.mapBg },

  centerWrapper: {
    position: "absolute",
    top: METRICS.panelTop,
    width: "100%",
    alignSelf: "center",
    zIndex: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: METRICS.panelRadius,
    borderTopRightRadius: METRICS.panelRadius,
    padding: METRICS.pad,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  dragHandle: {
    width: METRICS.handleW,
    height: METRICS.handleH,
    borderRadius: METRICS.handleRadius,
    backgroundColor: COLORS.handle,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 4,
  },

  searchBox: {
    width: "100%",
    height: 44,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  alertsBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.alertsBtnBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  alertsText: {
    color: COLORS.alertsBtnText,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    height: METRICS.tileH,
    backgroundColor: COLORS.tileBg,
    borderRadius: METRICS.tileR,
    padding: 12,
    marginBottom: METRICS.gutter,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileLabel: {
    color: "#2B2B2B",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default styles;
