import React from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, Platform } from "react-native";

export default function NewBottomNav({ navigation }) {
  return (
    <View style={styles.nav}>
      {/* Connection */}
      <TouchableOpacity onPress={() => navigation.navigate("Connection")}>
        <View style={styles.iconBox}>
          <Image source={require("../assets/connection.png")} style={styles.icon} />
          <Text style={styles.label}>Connection</Text>
        </View>
      </TouchableOpacity>

      {/* Report */}
      <TouchableOpacity onPress={() => navigation.navigate("IncidentReport")}>
        <View style={styles.iconBox}>
          <Image source={require("../assets/report.png")} style={styles.icon} />
          <Text style={styles.label}>Report</Text>
        </View>
      </TouchableOpacity>

      {/* Maps */}
      <TouchableOpacity onPress={() => navigation.navigate("Maps")}>
        <View style={styles.iconBox}>
          <Image source={require("../assets/maps.png")} style={styles.icon} />
          <Text style={styles.label}>Maps</Text>
        </View>
      </TouchableOpacity>

      {/* Virtual */}
      <TouchableOpacity onPress={() => navigation.navigate("Virtual")}>
        <View style={styles.iconBox}>
          <Image source={require("../assets/vr.png")} style={styles.icon} />
          <Text style={styles.label}>Virtual</Text>
        </View>
      </TouchableOpacity>

      {/* History */}
      <TouchableOpacity onPress={() => navigation.navigate("History")}>
        <View style={styles.iconBox}>
          <Image source={require("../assets/history.png")} style={styles.icon} />
          <Text style={styles.label}>History</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 60, // stretched background
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start", // icons at top
    backgroundColor: "#E6E6E6",
    borderTopWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
    elevation: 10,
  },
  iconBox: {
    width: 50,
    height: "100%",
    justifyContent: "flex-start", // push icons to top
    alignItems: "center",
    paddingTop: 12,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
  },
});
