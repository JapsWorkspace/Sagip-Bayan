import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
} from "react-native";
import axios from "axios";

export default function GuidelinesListScreen() {
  const [guidelines, setGuidelines] = useState([]);
  const [filteredGuidelines, setFilteredGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const BASE_URL = "http://localhost:8000/api/guidelines/";
  const categories = ["all", "earthquake", "flood", "typhoon", "general"];

  useEffect(() => {
    fetchGuidelines();
  }, [selectedCategory]);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, guidelines]);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);

      let url = BASE_URL;

      if (selectedCategory !== "all") {
        url = `${BASE_URL}?category=${selectedCategory}`;
      }

      const response = await axios.get(url);
      setGuidelines(response.data);
      setFilteredGuidelines(response.data);
    } catch (error) {
      console.log("Error fetching guidelines:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);

    if (text.trim() === "") {
      setFilteredGuidelines(guidelines);
      setSuggestions([]);
      return;
    }

    const filtered = guidelines.filter((item) =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredGuidelines(filtered);

    // Auto-complete suggestions (top 5)
    const autoSuggestions = filtered
      .map((item) => item.title)
      .slice(0, 5);

    setSuggestions(autoSuggestions);
  };

  const selectSuggestion = (title) => {
    setSearchText(title);
    setSuggestions([]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <Text>Category: {item.category}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Priority: {item.priorityLevel}</Text>

      <Text style={{ marginTop: 5 }}>{item.description}</Text>

      {item.attachments?.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Attachments:</Text>

          {item.attachments.map((file, index) =>
            file.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <Image
                key={index}
                source={{ uri: file.fileUrl }}
                style={{ width: 120, height: 120, marginTop: 5 }}
              />
            ) : (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(file.fileUrl)}
              >
                <Text style={styles.link}>{file.fileName}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guidelines</Text>

      {/* 🔎 SEARCH BAR */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* 🔥 AUTO-COMPLETE DROPDOWN */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((title, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectSuggestion(title)}
              style={styles.suggestionItem}
            >
              <Text>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CATEGORY FILTER */}
      <View style={styles.filterContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              selectedCategory === cat && styles.selectedFilter,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={{
                color: selectedCategory === cat ? "#fff" : "#000",
              }}
            >
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredGuidelines}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#007bff",
    textDecorationLine: "underline",
    marginTop: 5,
  },
});