import React, { useContext, useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from "react-native";
import axios from "axios";
import NewBottomNav from "./NewBottomNav";
import { UserContext } from "./UserContext";

export default function PasswordSecurity({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  const handleNewPassword = (text) => {
    setNewPassword(text);
    if (text.length === 0) setNewPasswordError("Password is required");
    else if (text.length < 8) setNewPasswordError("Password must be at least 8 characters long");
    else if (text.length > 16) setNewPasswordError("Password must not exceed 16 characters");
    else if (!/[A-Z]/.test(text)) setNewPasswordError("Password must contain at least one uppercase letter");
    else if (!/[0-9]/.test(text)) setNewPasswordError("Password must contain at least one number");
    else setNewPasswordError("");

    if (confirmPassword && text !== confirmPassword) setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const handleConfirmPassword = (text) => {
    setConfirmPassword(text);
    if (text.length === 0) setConfirmPasswordError("Confirm Password is required");
    else if (text !== newPassword) setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const updatePassword = () => {
    if (currentPassword !== user.password) {
      console.log(user.password, currentPassword)
      console.log("Error: Current password is incorrect.");
      return;
    }
    if (newPasswordError || confirmPasswordError) {
      console.log("Error: Fix validation errors first.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      console.log("Error: Password fields cannot be empty.");
      return;
    }
    if (newPassword === currentPassword) {
      console.log("Error: New password must be different from current password.");
      return;
    }

    console.log(user)
    axios
      .put(`http://localhost:8000/user/update/${user.id}`, { password: newPassword })
      .then(() => {
        setUser({ ...user, password: newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        console.log("Password updated successfully");
      })
      .catch((error) => console.error(error));
  };

  const toggle2FA = (value) => {
    setTwoFactorEnabled(value);
    axios
      .put(`http://localhost:8000/user/twofactor/${user._id}`, { enabled: value })
      .then(() => setUser({ ...user, twoFactorEnabled: value }))
      .catch((err) => console.error(err));
  };

  if (!user) return <Text>No user logged in</Text>;

  return (
    <KeyboardAvoidingView
      style={styles.webFrame}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.phone}>
        {/* Title at top-left */}
        <Text style={styles.header}>Password & Security</Text>
        <Text style={styles.subText}>
          Manage your password and enable two‑factor authentication for extra protection.
        </Text>

        {/* Inputs pushed lower */}
        <View style={styles.formWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#1F3961"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#1F3961"
            secureTextEntry
            value={newPassword}
            onChangeText={handleNewPassword}
          />
          {newPasswordError ? <Text style={styles.error}>{newPasswordError}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#1F3961"
            secureTextEntry
            value={confirmPassword}
            onChangeText={handleConfirmPassword}
          />
          {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

          {/* Two-Factor Authentication */}
          <View style={styles.twoFAWrapper}>
            <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
            <Text style={styles.subInfo}>
              Add an extra layer of security by requiring a verification code when signing in.
            </Text>
            <Switch value={twoFactorEnabled} onValueChange={toggle2FA} />
            <Text style={styles.status}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Text>
          </View>

          {/* Button BELOW 2FA, lowered more */}
          <TouchableOpacity style={styles.button} onPress={updatePassword}>
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

       {/* Bottom Nav */}
<View style={styles.bottomNavWrapper}>
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
    position: "relative",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F3961",
    marginBottom: 4,
    textAlign: "left", // top-left alignment
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textAlign: "left",
    width: "100%",
  },
  formWrapper: {
    marginTop: 10, // pushes inputs/buttons lower
    alignItems: "center",
  },
  input: {
    width: "90%",
    maxWidth: 320,
    height: 40,
    borderWidth: 1,
    borderColor: "#1F3961",
    borderRadius: 5,
    paddingHorizontal: 12,
    marginVertical: 6, // reduced margins
    color: "#1F3961",
    backgroundColor: "transparent",
    fontSize: 16,
    textAlign: "left",
  },
  button: {
    width: "90%",
    maxWidth: 320,
    backgroundColor: "#1F3961",
    borderRadius: 5,
    paddingVertical: 10,
    marginTop: 50, // lowered more below 2FA
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginTop: -2,
    marginBottom: 6,
    textAlign: "left",
    width: "90%",
    maxWidth: 320,
    fontSize: 13,
  },
  twoFAWrapper: {
    marginTop: 60,
    alignItems: "flex-start", // aligned left like header
    width: "90%",
    maxWidth: 320,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F3961",
    marginBottom: 4,
    textAlign: "left", // aligned left
  },
  subInfo: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
    textAlign: "left",
    width: "100%",
  },
  status: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F3961",
    textAlign: "left",
  },
  bottomNavWrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: Platform.OS === "ios" ? 40 : 1, // iOS safe area or Android padding
  // optional: add a little background so nav buttons are visible
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
}

});
