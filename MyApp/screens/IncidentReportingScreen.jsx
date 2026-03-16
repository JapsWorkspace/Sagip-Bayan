// screens/IncidentReportingScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  PanResponder,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import NewBottomNav from "./NewBottomNav";

// ✅ import the separated design file
import styles, { METRICS } from "../Designs/IncidentReporting";

let WebMap = null;
if (Platform.OS === "web") {
  WebMap = require("../screens/WebMap").default;
}

export default function IncidentReportScreen({ navigation }) {
  const [incidentReports, setIncidentReports] = useState({
    type: "",
    level: "",
    location: "",
    latitude: null,
    longitude: null,
    description: "",
  });
  const [image, setImage] = useState(null); // single image

  // ------------------- IMAGE PICKER -------------------
  const pickImage = async (event) => {
    if (Platform.OS === "web") {
      const files = event.target.files;
      if (files.length) {
        const file = files[0];
        setImage({
          uri: URL.createObjectURL(file),
          file,
          name: file.name,
          type: file.type,
        });
      }
    } else {
      const result = await import("expo-image-picker").then((ImagePicker) =>
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 1,
        })
      );
      if (!result.canceled) {
        const asset = result.assets[0];
        setImage({
          uri: asset.uri,
          name: asset.fileName || asset.uri.split("/").pop(),
          type: "image/jpeg",
        });
      }
    }
  };

  // ------------------- SUBMIT REPORT -------------------
  const submitReport = async () => {
    const { type, level, location, latitude, longitude, description } =
      incidentReports;

    if (!latitude || !longitude) {
      alert("Please select a location on the map!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("level", level);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      if (image) {
        if (Platform.OS === "web") {
          formData.append("image", image.file);
        } else {
          formData.append("image", {
            uri: image.uri,
            name: image.name,
            type: image.type,
          });
        }
      }

      await axios.post("http://localhost:8000/incident/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Incident submitted successfully!");
      // Reset
      setIncidentReports({
        type: "",
        level: "",
        location: "",
        latitude: null,
        longitude: null,
        description: "",
      });
      setImage(null);
    } catch (error) {
      console.log(error);
      alert("Error submitting incident");
    }
  };

  // ------------------- DRAGGABLE CARD (dynamic MAX_UP + full-height sheet) -------------------
  // Collapsed anchor from design (centerWrapper.top points at METRICS.panelTop)
  const panelTop = styles.centerWrapper.top || METRICS.panelTop;

  // Device height & status bar (Android). For iOS, we keep a small margin at the very top.
  const { height: WIN_H } = Dimensions.get("window");
  const ANDROID_SB = StatusBar?.currentHeight || 0;

  // Margin to leave under the system bar when fully open
  const TOP_MARGIN = Platform.OS === "ios" ? 12 : 8;

  // How far up (negative translateY) to get near the top for ANY phone
  const MAX_UP = -Math.max(0, (panelTop - ANDROID_SB - TOP_MARGIN));
  const MAX_DOWN = 0;
  const START_Y = 0;

  // 👉 Make the white sheet tall enough to cover the screen at full open:
  // When fully open, the sheet's Visual top becomes (panelTop + MAX_UP) ≈ TOP_MARGIN.
  // So we need minHeight ≈ WIN_H - (panelTop + MAX_UP).
  const FULL_OPEN_TOP = panelTop + MAX_UP;                      // ≈ TOP_MARGIN
  const SHEET_MIN_HEIGHT = WIN_H - FULL_OPEN_TOP;               // fills to bottom
  const EXTRA_BOTTOM_PAD = Platform.OS === "ios" ? 16 : 12;     // breathing room above bottom nav

  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

  // Optional: snap feel
  const SNAP_THRESHOLD = 80;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startY.current = pan.y._value;
      },
      onPanResponderMove: (_, g) => {
        let newY = startY.current + g.dy;
        if (newY < MAX_UP) newY = MAX_UP;     // clamp to top
        if (newY > MAX_DOWN) newY = MAX_DOWN; // clamp to bottom anchor
        pan.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: (_, g) => {
        const draggedUpEnough = -g.dy >= SNAP_THRESHOLD || g.vy <= -0.4;
        const targetY = draggedUpEnough ? MAX_UP : MAX_DOWN;

        Animated.spring(pan, {
          toValue: { x: 0, y: targetY },
          useNativeDriver: false,
          speed: 16,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.webFrame}>
      <View style={styles.phone}>
        {/* Map behind */}
        <View style={styles.mapContainer}>
          {Platform.OS === "web" && WebMap ? (
            <WebMap
              onSelect={(obj) => {
                setIncidentReports((prev) => ({
                  ...prev,
                  location: obj.text,
                  latitude: obj.lat,
                  longitude: obj.lng,
                }));
              }}
            />
          ) : (
            <View />
          )}
        </View>

        {/* ▶️ Draggable panel with full-height sheet */}
        <Animated.View style={[styles.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            {/* Make the sheet tall enough even when content is short */}
            <View style={[styles.card, { minHeight: SHEET_MIN_HEIGHT, paddingBottom: EXTRA_BOTTOM_PAD }]}>
              {/* Drag handle INSIDE the sheet */}
              <View {...panResponder.panHandlers} style={styles.dragHandle} />

              {/* Scroll if content becomes very long on small devices */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
                bounces
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={require("../assets/sagipbayanlogo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.title}>Incident Tagging</Text>

                <Text style={styles.label}>Incident Type</Text>
                <Picker
                  selectedValue={incidentReports.type}
                  onValueChange={(val) =>
                    setIncidentReports((prev) => ({ ...prev, type: val }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select Incident" value="" />
                  <Picker.Item label="Flood" value="flood" />
                  <Picker.Item label="Typhoon" value="typhoon" />
                  <Picker.Item label="Fire" value="fire" />
                  <Picker.Item label="Earthquake" value="earthquake" />
                </Picker>

                <Text style={styles.label}>Severity Level</Text>
                <Picker
                  selectedValue={incidentReports.level}
                  onValueChange={(val) =>
                    setIncidentReports((prev) => ({ ...prev, level: val }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Select Severity" value="" />
                  <Picker.Item label="Low" value="low" />
                  <Picker.Item label="Medium" value="medium" />
                  <Picker.Item label="High" value="high" />
                  <Picker.Item label="Critical" value="critical" />
                </Picker>

                <Text style={styles.label}>Location / Landmark</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Where it takes place"
                  value={incidentReports.location}
                  onChangeText={(val) =>
                    setIncidentReports((prev) => ({ ...prev, location: val }))
                  }
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Extra notes"
                  multiline
                  value={incidentReports.description}
                  onChangeText={(val) =>
                    setIncidentReports((prev) => ({ ...prev, description: val }))
                  }
                  placeholderTextColor="#9CA3AF"
                />

                {/* Add Image Button */}
                {Platform.OS === "web" ? (
                  <label style={styles.webUploadButton}>
                    Add Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={pickImage}
                      style={{ display: "none" }}
                    />
                  </label>
                ) : (
                  <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Add Image</Text>
                  </TouchableOpacity>
                )}

                {/* Image preview */}
                {image && (
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: 60, height: 60, marginTop: 6, borderRadius: 6 }}
                  />
                )}

                <TouchableOpacity style={styles.button} onPress={submitReport}>
                  <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

        <NewBottomNav navigation={navigation} />
      </View>
    </View>
  );
}