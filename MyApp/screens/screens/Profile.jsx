// screens/Profile.jsx
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