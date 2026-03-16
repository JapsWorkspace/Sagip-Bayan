// screens/LogIn.jsx
import React, { useState, useContext } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
} from "react-native";
import axios from "axios";
import styles, { COLORS } from "../Designs/LogIn";  // ← use external design
import { UserContext } from "./UserContext";

export default function LogIn({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, setUser } = useContext(UserContext);

  // Helper function to remove special characters
  const sanitizeInput = (text) => text.replace(/[^a-zA-Z0-9]/g, "");

  const handleLogin = () => {
    setError("");
    axios
      .post("http://localhost:8000/user/login", { username, password })
      .then((res) => {
        const data = res.data;

        if (data.twoFactor) {
          navigation.navigate("VerifyOtp", {
            userId: data.userId,
            email: data.email,
          });

          axios
            .post("http://localhost:8000/user/send-otp", {
              email: data.email,
            })
            .then(() => console.log("OTP sent"))
            .catch((err) => console.error("OTP error:", err));
        } else {
          setUser({
            id: data.user._id,
            fname: data.user.fname,
            lname: data.user.lname,
            username: data.user.username,
            password: password,
            email: data.user.email,
          });

          console.log(user);

          navigation.navigate("MainCenter");
          setUsername("");
          setPassword("");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ===== Optional background ===== */}
        {/* Comment out this block if assets don't exist yet to avoid crashes */}
        {/* <View style={styles.backgroundWrapper}>
          <Image source={require("../assets/bg.png")} style={styles.backgroundImage} />
        </View> */}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* ===== Foreground content ===== */}
          <View style={styles.contentWrapper}>
            {/* Replace with your real logo asset */}
            <Image
              source={require("../assets/sagipbayanlogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={{ height: 140 }} />

            <View style={styles.formWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.placeholder}
                value={username}
                onChangeText={(t) => setUsername(sanitizeInput(t.trimStart()))}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                value={password}
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              {/* Bottom helper row like your screenshot */}
              <Text
                style={{ textAlign: "center", marginTop: 10, color: "#111827" }}
              >
                Don’t have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate("SignUp")}
                >
                  SignUp
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}