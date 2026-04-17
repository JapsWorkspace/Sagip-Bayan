import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { UserContext } from "./UserContext";
import api from "../lib/api";

export default function ResetPasswordScreen({ route, navigation }) {
  const { user, setResetMode, setUser } = useContext(UserContext);

  const userId = route?.params?.userId || user?.id;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const isValid =
    newPassword.length >= 6 && newPassword === confirmPassword;

  const updatePassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Password fields cannot be empty.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    api
      .put(`/user/update/${userId}`, { password: newPassword })
      .then(() => {
        setNewPassword("");
        setConfirmPassword("");

        // 🔥 EXIT RESET FLOW
        setResetMode(false);
        setUser(null);

        Alert.alert("Success", "Password updated successfully!");

        // optional: go back to login
        navigation.replace("LogIn");
      })
      .catch((error) => {
        console.error(error);
        Alert.alert("Error", "Something went wrong.");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set New Password</Text>

      <TextInput
        placeholder="New Password"
        secureTextEntry={secureText}
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry={secureText}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={() => setSecureText(!secureText)}>
        <Text style={styles.toggle}>
          {secureText ? "Show Passwords" : "Hide Passwords"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isValid ? "#4CAF50" : "#A5D6A7" },
        ]}
        onPress={updatePassword}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  toggle: {
    color: "#007BFF",
    marginBottom: 20,
    textAlign: "right",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});