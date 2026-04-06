import React from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppTopBar({
  onMenuPress,
  onSearchChange,
  showSearch,
  suggestions = [],
  onSelectSuggestion,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>

        {showSearch && (
          <TextInput
            placeholder="Search place in Jaen"
            style={styles.search}
            onChangeText={onSearchChange}
          />
        )}

        <Ionicons name="person-circle" size={32} color="#444" />
      </View>

      {/* ✅ SUGGESTIONS DROPDOWN */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) =>
              item.id
                ? String(item.id)
                : `${item.source}-${item.latitude}-${item.longitude}-${index}`
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelectSuggestion?.(item)}
              >
                <Text numberOfLines={2}>{item.label}</Text>
                {item.source === "evacuation" && (
                  <Text style={styles.badge}>EVAC CENTER</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 25,
    left: 16,
    right: 16,
    zIndex: 2000,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
  },
  search: {
    flex: 1,
    marginHorizontal: 12,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: 220,
    elevation: 6,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  badge: {
    fontSize: 11,
    color: "#047857",
    fontWeight: "700",
    marginTop: 4,
  },
});