import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import api from "../lib/api";
import { UserContext } from "./UserContext";

export default function EmailVerifyer({ navigation }) {
  const { setResetMode, setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = () => {
  if (!email) {
    Alert.alert("Error", "Email is required");
    return;
  }

  setLoading(true);

  api
    .post("/user/verify-email", { email })
    .then((res) => {
      const data = res.data;

      if (!data.exists) {
        Alert.alert("Error", "Email not found");
        return;
      }

      const userData = {
        ...data.user,
        id: data.user._id,
      };

      setUser(userData);
      setResetMode(true);

      return api.post("/user/send-otp", { email }).then((otpRes) => {
        Alert.alert("Success", otpRes.data.message || "OTP sent");

        navigation.navigate("VerifyOtp", {
          email,
          userId: userData.id,
        });
      });
    })
    .catch((err) => {
      console.error(err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    })
    .finally(() => setLoading(false));
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Checking..." : "Verify Email"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});