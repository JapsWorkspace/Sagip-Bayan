import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { UserContext } from "./UserContext";
import axios from "axios";
import NewBottomNav from "./NewBottomNav";

export default function Profile({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = () => {
    
    axios
      .put(`http://localhost:8000/user/archive/${user._id}`)
      .then(() => {
        setUser({ ...user, isArchived: true });
        console.log(
          "Account archived successfully. You can still log in for 6 months."
        );
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
        {/* Header */}
        <Text style={styles.header}>Account Settings</Text>
        <Text style={styles.subText}>
          Manage your personal information, security settings, or archive your
          account below.
        </Text>

        {/* Main Card */}
        <View style={styles.formWrapper}>
          <View style={styles.card}>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("PersonalDetails")}
              >
                <Text style={styles.buttonText}>Personal Details</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("PasswordSecurity")}
              >
                <Text style={styles.buttonText}>Password & Security</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delete Account Section at the very bottom */}
        <View style={styles.deleteWrapper}>
          {!confirmDelete ? (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => setConfirmDelete(true)}
              disabled={user.isArchived}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: user.isArchived ? "#aaa" : "red" },
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
                Your account will be archived for 6 months before permanent
                deletion.
              </Text>
              <Text style={styles.confirmSub}>
                Logging in during this period will reactivate your account.
              </Text>

              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={[styles.buttonText, { color: "red" }]}>
                    Yes, Archive Account
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 6 }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setConfirmDelete(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Nav */}
        <View style={styles.navWrapper}>
          <NewBottomNav navigation={navigation} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Platform.OS === "web" ? "#000" : "#fff",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 30,
    position: "relative",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F3961",
    marginBottom: 4,
    textAlign: "left",
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "left",
    width: "100%",
  },
  formWrapper: {
    alignItems: "center",
    paddingBottom: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  section: {
    marginVertical: 6,
  },
  deleteWrapper: {
    position: "absolute",
    bottom: 75, // above bottom nav
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  deleteButton: {
    borderColor: "red",
  },
  confirmBox: {
    marginTop: 8,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F3961",
    marginBottom: 4,
  },
  confirmSub: {
    fontSize: 12,
    color: "#555",
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F3961",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#1F3961",
    fontWeight: "600",
    fontSize: 16,
  },
  navWrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: Platform.OS === "ios" ? 40 : 1, // iOS safe area or Android padding
  // optional: add a little background so nav buttons are visible
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",

  },
  
});
