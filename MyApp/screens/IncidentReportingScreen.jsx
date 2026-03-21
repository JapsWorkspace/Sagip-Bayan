// screens/IncidentReportingScreen.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
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
import api from "../lib/api";
import NewBottomNav from "./NewBottomNav";
import { UserContext } from "./UserContext";

// ✅ import the separated design file
import styles, { METRICS } from "../Designs/IncidentReporting";

// ✅ Always import the map component (native RN Maps version)
import WebMap from "./WebMap";

export default function IncidentReportScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const [incidentReports, setIncidentReports] = useState({
    type: "",
    level: "",
    location: "",
    latitude: null,
    longitude: null,
    description: "",
    usernames: user.username || "",
    phone: user.phone || "",
  });
  const [image, setImage] = useState(null); // single image

  // Seed initial selection pin at Jaen
  useEffect(() => {
    if (incidentReports.latitude == null || incidentReports.longitude == null) {
      setIncidentReports(prev => ({
        ...prev,
        location: prev.location || "Jaen, Nueva Ecija",
        latitude: 15.33830,
        longitude: 120.91410,
      }));
    }
  }, []);

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
    const { type, level, location, latitude, longitude, description, usernames, phone } =
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
      formData.append("usernames", usernames || "");
      formData.append("phone", phone || "");

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

      await api.post("/incident/register", formData, {
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
        usernames: "",
        phone: "",
      });
      setImage(null);
    } catch (error) {
      console.log(error);
      alert("Error submitting incident");
    }
  };

  /* ------------------- DRAGGABLE CARD (full-height sheet) ------------------- */
  const panelTop = styles.centerWrapper.top || METRICS.panelTop;

  const { height: WIN_H } = Dimensions.get("window");
  const ANDROID_SB = StatusBar?.currentHeight || 0;

  const TOP_MARGIN = Platform.OS === "ios" ? 12 : 8;

  const MAX_UP = -Math.max(0, panelTop - ANDROID_SB - TOP_MARGIN);
  const MAX_DOWN = 0;
  const START_Y = 0;

  const FULL_OPEN_TOP = panelTop + MAX_UP; // ≈ TOP_MARGIN
  const SHEET_MIN_HEIGHT = WIN_H - FULL_OPEN_TOP;
  const EXTRA_BOTTOM_PAD = Platform.OS === "ios" ? 16 : 12;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

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
        <View style={[styles.mapContainer, { flex: 1 }]}>
          <WebMap
            selected={{
              lat: incidentReports.latitude,
              lng: incidentReports.longitude,
              label: incidentReports.location,
            }}
            selectedLevel={incidentReports.level}  // used only if you want severity image elsewhere
            onSelect={(obj) => {
              setIncidentReports((prev) => ({
                ...prev,
                location: obj.text,
                latitude: obj.lat,
                longitude: obj.lng,
              }));
            }}
          />
        </View>

        {/* ▶️ Draggable panel with full-height sheet */}
        <Animated.View style={[styles.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
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