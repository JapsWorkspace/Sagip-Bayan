// screens/Profile.jsx
<<<<<<< HEAD
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "./UserContext";
import api from "../lib/api";

/* ================= CONSTANTS ================= */
const BASE_URL = "http://192.168.1.4:8000";
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=E5E7EB&color=6B7280&rounded=true&name=User";

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ===== preload avatar ===== */
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUri(user.avatar || null);
    }
  }, [user?.avatar]);

  /* ===== pick & upload avatar ===== */
  const changeAvatar = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const picked = result.assets[0];
    setAvatarUri(picked.uri);

    try {
      setUploading(true);

  const ext = picked.uri.split(".").pop()?.toLowerCase() || "jpg";

  const formData = new FormData();
  formData.append("avatar", {
    uri: picked.uri,
    name: `avatar.${ext}`,
    type: `image/${ext}`,
  });


  const res = await api.put(
  `/user/avatar/${user._id}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

  console.log("✅ Upload success:", res.data);

  setAvatarUri(res.data.avatar); // 🔥 IMPORTANT FIX
  setUser(res.data.user);
    } catch (err) {
      Alert.alert("Upload failed", "Please try again.");
      setAvatarUri(user.avatar || null);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const isSafe = user.safetyStatus === "SAFE";

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ===== HERO PROFILE ===== */}
      <View style={styles.hero}>
        <TouchableOpacity
          onPress={changeAvatar}
          disabled={uploading}
          style={[
            styles.avatarRing,
            { borderColor: isSafe ? "#22C55E" : "#EF4444" },
          ]}
        >
          <Image
            source={{ uri: avatarUri || DEFAULT_AVATAR }}
            style={styles.avatar}
          />

          {uploading && (
            <View style={styles.overlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}

          {/* Status Dot */}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isSafe ? "#22C55E" : "#EF4444" },
            ]}
          />
        </TouchableOpacity>

        <Text style={styles.name}>
          {user.fname} {user.lname}
        </Text>

        <Text style={styles.subInfo}>
          {isSafe ? "Status: SAFE" : "Status: NOT SAFE"}
        </Text>

        <Text style={styles.hint}>Tap photo to change</Text>
      </View>

      {/* ===== ACTIONS ===== */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("PersonalDetails")}
      >
        <Text style={styles.primaryText}>Personal Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("PasswordSecurity")}
      >
        <Text style={styles.primaryText}>Password & Security</Text>
      </TouchableOpacity>

      {/* ===== DANGER ZONE ===== */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account?",
            [
              { text: "Cancel" },
              { text: "Delete", style: "destructive" },
            ]
          )
        }
      >
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    alignItems: "center",
  },

  header: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  back: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: "700" },

  hero: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  avatarRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E5E7EB",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
  },

  statusDot: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },

  name: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
  },

  subInfo: {
    marginTop: 4,
    fontSize: 13,
    color: "#047857",
  },

  hint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },

  primaryBtn: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  primaryText: {
    textAlign: "center",
    color: "#166534",
    fontWeight: "700",
  },

  deleteBtn: {
    width: "85%",
    borderWidth: 1,
    borderColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 30,
  },

  deleteText: {
    textAlign: "center",
    color: "#DC2626",
    fontWeight: "700",
  },
});
=======
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { UserContext } from "./UserContext";
import axios from "axios";
import NewBottomNav from "./NewBottomNav";

// ✅ import the separated design file
import styles, { COLORS } from "../Designs/Profile";

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // --- keep your function unchanged ---
  const handleDeleteAccount = () => {
    axios
      .put(`http://localhost:8000/user/archive/${user._id}`)
      .then(() => {
        setUser({ ...user, isArchived: true });
        console.log("Account archived successfully. You can still log in for 6 months.");
        navigation.navigate("LogIn");
      })
      .catch((error) => console.error(error));
  };

  if (!user) return <Text>No user logged in</Text>;

  return (
    <KeyboardAvoidingView
      style={styles.webFrame}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.phone}>
        {/* ---------- Header with back ---------- */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backGlyph} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>
        <Text style={styles.subText}>
          Manage your personal information, security settings, or archive your account below.
        </Text>

        {/* ---------- Main Card ---------- */}
        <View style={styles.card}>
          {/* Personal Details row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("PersonalDetails")}
          >
            <Text style={styles.rowText}>Personal Details</Text>
            <View style={styles.rowRight}>
              <View style={styles.rowTag}><Text style={styles.rowTagText}>EDIT</Text></View>
              <View style={styles.chevron} />
            </View>
          </TouchableOpacity>

          {/* Password & Security row */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("PasswordSecurity")}
          >
            <Text style={styles.rowText}>Password & Security</Text>
            <View style={styles.rowRight}>
              <View style={styles.rowTag}><Text style={styles.rowTagText}>SECURE</Text></View>
              <View style={styles.chevron} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ---------- Delete Account Section ---------- */}
        <View style={styles.deleteWrapper}>
          {!confirmDelete ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setConfirmDelete(true)}
              disabled={user.isArchived}
            >
              <Text
                style={[
                  styles.deleteText,
                  user.isArchived && styles.disableText,
                ]}
              >
                {user.isArchived ? "Archived Account" : "Delete Account"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                Are you sure you want to delete your account?
              </Text>
              <Text style={styles.confirmSub}>
                Your account will be archived for 6 months before permanent deletion.
              </Text>
              <Text style={styles.confirmSub}>
                Logging in during this period will reactivate your account.
              </Text>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.confirmBtnText}>Yes, Archive Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmDelete(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ---------- Bottom Nav ---------- */}
        <View style={styles.navWrapper}>
          <NewBottomNav
            navigation={navigation}
            onCenterPress={() => navigation.navigate("MainCenter")}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
