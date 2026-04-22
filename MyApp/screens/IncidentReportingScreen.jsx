// screens/IncidentReportingScreen.jsx
<<<<<<< HEAD
import React, { useState, useRef, useEffect, useContext } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
=======
import React, { useState, useRef, useEffect } from "react";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
import api from "../lib/api";
import { UserContext } from "./UserContext";
import AppLayout from './AppLayout';
// ✅ import the separated design file
import useJaenPlaceSearch from "./hooks/useJaenPlaceSearch";
import styles, { METRICS } from "../Designs/IncidentReporting";

// ✅ Always import the map component (native RN Maps version)
import WebMap from "./WebMap";
import { socket } from "../lib/socket";
import AppShell from "./AppShell";

export default function IncidentReportScreen({ navigation }) {

  const { user } = useContext(UserContext);
=======
import axios from "axios";
import NewBottomNav from "./NewBottomNav";

// ✅ import the separated design file
import styles, { METRICS } from "../Designs/IncidentReporting";

let WebMap = null;
if (Platform.OS === "web") {
  WebMap = require("../screens/WebMap").default;
}

export default function IncidentReportScreen({ navigation }) {
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const [incidentReports, setIncidentReports] = useState({
    type: "",
    level: "",
    location: "",
    latitude: null,
    longitude: null,
    description: "",
<<<<<<< HEAD
    usernames: user.username || "",
    phone: user.phone || "",
  });
  

   const {
      query,
      suggestions,
      search,
      clear,
    } = useJaenPlaceSearch();

    const handleSelectSuggestion = (place) => {
  setIncidentReports((prev) => ({
    ...prev,
    location: place.label,
    latitude: place.latitude,
    longitude: place.longitude,
  }));

  clear(); // ✅ close suggestions
};

  const [image, setImage] = useState(null); // single image
  const [debuger, setDebuger] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
  if (!image?.uri) return;

  setImage(prev => prev ? { ...prev } : prev);
  console.log("Image updated:", image);
}, [image?.uri]);

  useEffect(() => {
  if (suggestions.length === 1) {
    const place = suggestions[0];

    setIncidentReports(prev => ({
      ...prev,
      location: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    }));

    clear();
  }
}, [suggestions]);
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
  //Jaen Bounds and fencing
  const JAEN_CENTER = {
    lat: 15.33830,
    lng: 120.91410,
  };

  const MAX_DISTANCE_KM = 5; // adjust (e.g., 3–10 km depending on strictness)

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;

    const R = 6371; // Earth radius (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  //New thing, realtime gps thingy
  useEffect(() => {
    socket.connect();

    let subscription;

    const startTracking = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location Required", "Enable location to proceed.");
        return;
      }

      // 🔥 continuous tracking (NOT one-time)
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,     // every 3 seconds
          distanceInterval: 5,    // or every 5 meters
        },
        (loc) => {
          const coords = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };

          // update local state
          setUserLocation(coords);

          // 🔥 send to server
          socket.emit("send-location", coords);
        }
      );
    };

    startTracking();

    return () => {
      if (subscription) subscription.remove();
      socket.disconnect();
    };
  }, []);
=======
  });
  const [image, setImage] = useState(null); // single image
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

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
<<<<<<< HEAD
    const { type, level, location, latitude, longitude, description, usernames, phone } =
=======
    const { type, level, location, latitude, longitude, description } =
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      incidentReports;

    if (!latitude || !longitude) {
      alert("Please select a location on the map!");
      return;
    }

<<<<<<< HEAD
    const userLat = userLocation?.lat;
    const userLng = userLocation?.lng;

    if (!userLat || !userLng) {
      Alert.alert(
        "Location Error",
        "Unable to get current location."
      );
      return;
    }

    if (!debuger) {
      const distance = getDistanceKm(
        userLat,
        userLng,
        JAEN_CENTER.lat,
        JAEN_CENTER.lng
      );

      if (distance > MAX_DISTANCE_KM) {
        Alert.alert(
          "Outside Service Area",
          "You must be within Jaen, Nueva Ecija to report an incident."
        );
        return;
      }
    }

=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("level", level);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
<<<<<<< HEAD
      formData.append("usernames", usernames || "");
      formData.append("phone", phone || "");

      if (image) {
        formData.append("image", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      });
      }

      await api.post("/incident/register", formData, {
=======

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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
        usernames: "",
        phone: "",
=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      });
      setImage(null);
    } catch (error) {
      console.log(error);
      alert("Error submitting incident");
    }
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

<<<<<<< HEAD
=======
  // Optional: snap feel
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
<AppLayout
  onSearch={search}
  suggestions={suggestions}
  onSelectSuggestion={handleSelectSuggestion}
>

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
            userLocation={userLocation}

            onSelect={(obj) => {
              setIncidentReports(prev => ({
                ...prev,
                location: obj.text,
                latitude: obj.lat,
                longitude: obj.lng,
              }));
            }}

            // 🔥 NEW
            onIncidentPress={(incident) => {
              console.log("INCIDENT CLICKED:", incident);

              setIncidentReports(prev => ({
                ...prev,
                type: incident.type || "",
                level: incident.level || "",
                location: incident.location || "",
                latitude: Number(incident.latitude),
                longitude: Number(incident.longitude),
                description: incident.description || "",
                usernames: incident.usernames || "",
                phone: incident.phone || "",
              }));

              // ✅ FIX: ensure valid + force RN refresh
              if (incident?.image?.fileUrl) {
                const cleanUrl = String(incident.image.fileUrl);

                setImage({
                  uri: cleanUrl.includes("?")
                    ? cleanUrl + "&t=" + Date.now()
                    : cleanUrl + "?t=" + Date.now(),
                });
              } else {
                setImage(null);
              }
            }}
            />
=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
        </View>

        {/* ▶️ Draggable panel with full-height sheet */}
        <Animated.View style={[styles.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
<<<<<<< HEAD
=======
            {/* Make the sheet tall enough even when content is short */}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
=======
                <Image
                  source={require("../assets/sagipbayanlogo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
                {image?.uri ? (
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: 60, height: 60, marginTop: 6, borderRadius: 6 }}
                    resizeMode="cover"
                  />
                ) : null}
=======
                {image && (
                  <Image
                    source={{ uri: image.uri }}
                    style={{ width: 60, height: 60, marginTop: 6, borderRadius: 6 }}
                  />
                )}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

                <TouchableOpacity style={styles.button} onPress={submitReport}>
                  <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>
<<<<<<< HEAD
                <TouchableOpacity
                  onPress={() => setDebuger(prev => !prev)}
                  style={{ marginBottom: 8 }}
                >
                  <Text style={{ color: debuger ? "green" : "red", fontSize: 12 }}>
                    {debuger ? "Geo Check: OFF (Debug)" : "Geo Check: ON"}
                  </Text>
                </TouchableOpacity>
=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

<<<<<<< HEAD
      </View>
    </View>
  </AppLayout>
=======
        <NewBottomNav navigation={navigation} />
      </View>
    </View>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  );
}