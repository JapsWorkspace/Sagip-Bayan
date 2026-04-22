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
<<<<<<< HEAD

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import styles, { COLORS } from "../Designs/LogIn";
=======
import axios from "axios";
import styles, { COLORS } from "../Designs/LogIn";  // ← use external design
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import { UserContext } from "./UserContext";

export default function LogIn({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

<<<<<<< HEAD
  const { setUser } = useContext(UserContext);

  const sanitizeInput = (text) =>
    text.replace(/[^a-zA-Z0-9]/g, "");

  /* ================= LOGIN ================= */
  const handleLogin = () => {
    setError("");

    api
      .post("/user/login", { username, password })
=======
  const { user, setUser } = useContext(UserContext);

  // Helper function to remove special characters
  const sanitizeInput = (text) => text.replace(/[^a-zA-Z0-9]/g, "");

  const handleLogin = () => {
    setError("");
    axios
      .post("http://localhost:8000/user/login", { username, password })
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      .then((res) => {
        const data = res.data;

        if (data.twoFactor) {
<<<<<<< HEAD
          // ✅ Two-factor flow
=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          navigation.navigate("VerifyOtp", {
            userId: data.userId,
            email: data.email,
          });
<<<<<<< HEAD
          api.post("/user/send-otp", { email: data.email });
        } else {
          // ✅ Store FULL backend user object (includes avatar)
          setUser({
            ...data.user,
            id: data.user._id, // normalize ID once
          });

          navigation.replace("AppShell");
=======

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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          setUsername("");
          setPassword("");
        }
      })
      .catch((err) => {
<<<<<<< HEAD
=======
        console.error(err);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
        setError(err.response?.data?.message || "Login failed");
      });
  };

<<<<<<< HEAD
  /* ================= NAV ================= */
  const handleGoToSignup = async () => {
    try {
      const accepted = await AsyncStorage.getItem("privacyAccepted");
      accepted === "true"
        ? navigation.navigate("SignUp")
        : navigation.navigate("PrivacyGate");
    } catch {
      navigation.navigate("PrivacyGate");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* BACKGROUND STRIPES */}
      <View style={styles.stripeTop} />
      <View style={styles.stripeMid} />
      <View style={styles.stripeMid2} />
      <View style={styles.stripeBottom} />

=======
  return (
    <SafeAreaView style={styles.safe}>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
<<<<<<< HEAD
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.pageContainer}>

            {/* WHITE LOGO */}
            <Image
              source={require("../stores/assets/sagipbayanlogowhite.png")}
=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
              style={styles.logo}
              resizeMode="contain"
            />

<<<<<<< HEAD
            {/* FULL-WIDTH PANEL */}
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>LOG IN ACCOUNT</Text>

=======
            <View style={{ height: 140 }} />

            <View style={styles.formWrapper}>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.placeholder}
                value={username}
<<<<<<< HEAD
                autoCapitalize="none"
                onChangeText={(t) =>
                  setUsername(sanitizeInput(t.trimStart()))
                }
=======
                onChangeText={(t) => setUsername(sanitizeInput(t.trimStart()))}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                value={password}
<<<<<<< HEAD
                onChangeText={setPassword}
=======
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
<<<<<<< HEAD
              >
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>

              <Text style={styles.helperText}>
                don’t have an account?
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoToSignup}
              >
                <Text style={styles.secondaryButtonText}>
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>

=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}