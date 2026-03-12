import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import NewBottomNav from "./NewBottomNav";

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

  // ------------------- DRAGGABLE CARD -------------------
  const START_Y = 0;
  const MAX_UP = -330;
  const MAX_DOWN = 0;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startY.current = pan.y._value;
      },
      onPanResponderMove: (_, gestureState) => {
        let newY = startY.current + gestureState.dy;
        if (newY < MAX_UP) newY = MAX_UP;
        if (newY > MAX_DOWN) newY = MAX_DOWN;
        pan.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: pan.y._value },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.webFrame}>
      <View style={styles.phone}>
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

        <Animated.View style={[styles.centerWrapper, { transform: pan.getTranslateTransform() }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <View style={styles.card}>
              <View {...panResponder.panHandlers} style={styles.dragHandle} />

              <Image
                source={require("../assets/logo.png")}
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
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

        <NewBottomNav navigation={navigation} />
      </View>
    </View>
  );
}

// ------------------- STYLES -------------------
// keep your previous styles unchanged

// ------------------- STYLES -------------------
const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Platform.OS === "web" ? "#f0f0f0" : "#fff",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#fff",
    position: "relative",
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ddd",
  },
  centerWrapper: {
    position: "absolute",
    top: 350,
    width: "100%",
    alignSelf: "center",
    zIndex: 10,
    paddingBottom: 30,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 6,
  },
  logo: {
    width: 90,
    height: 45,
    alignSelf: "center",
    marginVertical: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    color: "#365275",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#365275",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 4,
    fontSize: 14,
    width: "100%",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#365275",
    borderRadius: 8,
    marginTop: 6,
    width: "100%",
    height: 50,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#365a7c",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.8,
  },
  webUploadButton: {
    backgroundColor: "#365a7c",
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    display: "inline-block",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 14,
  },
});