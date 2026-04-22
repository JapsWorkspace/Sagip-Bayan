// screens/SignUp.jsx
<<<<<<< HEAD

import { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import api from "../lib/api";

import StepPersonal from "./signup/StepPersonal";
import StepSecurity from "./signup/StepSecurity";
import StepMobile from "./signup/StepMobile";
import SignUpHeader from "./signup/SignUpHeader";

/* ================= CONSTANTS ================= */

const JAEN_CENTER = { lat: 15.3383, lng: 120.9141 };
const MAX_DISTANCE_KM = 5;

/* ================= COMPONENT ================= */

export default function SignUp({ navigation }) {
  const [step, setStep] = useState(0);

  /* ===== FORM DATA ===== */
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");

  /* ===== GEO DEBUG (✅ PERSISTS ACROSS STEPS) ===== */
  const [geoDebug, setGeoDebug] = useState(false);

  /* ===== LOCATION ===== */
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState(null);

  /* ================= HELPERS ================= */

  const toRad = (v) => (v * Math.PI) / 180;
  const getDistanceKm = (a, b) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) *
        Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  /* ================= LOCATION ================= */

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      setPermission(status);

      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      }
    })();
  }, []);

  /* ================= NAV ================= */

  const next = () => setStep((s) => s + 1);
  const back = () =>
    step === 0 ? navigation.goBack() : setStep((s) => s - 1);

  /* ================= FINAL SUBMIT ================= */

  const submit = async () => {
    // ✅ Location check ONLY if debug OFF
    if (!geoDebug) {
      if (permission !== "granted" || !location) {
        Alert.alert("Location Required");
        return;
      }

      const dist = getDistanceKm(location, JAEN_CENTER);
      if (dist > MAX_DISTANCE_KM) {
        Alert.alert(
          "Outside Service Area",
          "Registration is only allowed in Jaen."
        );
        return;
      }
    }

    try {
      await api.post("/user/register", {
        fname: fName,
        lname: lName,
        username,
        password,
        birthdate,
        phone,
        email,
        address,
        location,
      });

      Alert.alert("Success", "Check your email to verify.");
      navigation.replace("LogIn");
    } catch {
      Alert.alert("Signup failed");
    }
  };

  /* ================= STEPS ================= */

  const pages = [
    <StepPersonal
      key="personal"
      fName={fName}
      lName={lName}
      username={username}
      onFNameChange={setFName}
      onLNameChange={setLName}
      onUsernameChange={setUsername}
      geoDebug={geoDebug}
      onToggleGeoDebug={() => setGeoDebug((v) => !v)}
      onNext={next}
    />,

    <StepSecurity
      key="security"
      password={password}
      confirmPassword={confirmPassword}
      onPasswordChange={setPassword}
      onConfirmChange={setConfirmPassword}
      onNext={next}
      onBack={back}
    />,

    <StepMobile
      key="mobile"
      phone={phone}
      email={email}
      address={address}
      birthdate={birthdate}
      onPhoneChange={setPhone}
      onEmailChange={setEmail}
      onAddressChange={setAddress}
      onBirthdateChange={setBirthdate}
      onSubmit={submit}
      onBack={back}
    />,
  ];

  /* ================= RENDER ================= */

  return (
    <SafeAreaView style={{ flex: 1 }}>
=======
import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import styles, { COLORS } from "../Designs/SignUp"; // ← design-only file (ensure folder name is 'Designs')

export default function SignUp({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [date, setDate] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fNameError, setFNameError] = useState("");
  const [lNameError, setLNameError] = useState("");

  const sanitizeInput = (text, allowSpaces = false) => {
    const pattern = allowSpaces ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
    return text.replace(pattern, "");
  };

  const handleCreateUser = () => {
    if (
      usernameError ||
      passwordError ||
      emailError ||
      confirmPasswordError ||
      fNameError ||
      lNameError
    ) {
      return;
    }

    const userData = {
      fname: fName,
      lname: lName,
      username,
      email,
      password,
      birthdate: date,
    };

    axios
      .post("http://localhost:8000/user/register", userData)
      .then(() => {
        alert("Registration successful! Please verify your email.");

        setFName("");
        setLName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDate("");
      })
      .catch(() => {
        alert("Signup failed. Please try again.");
      });
  };

  const handlePassword = (text) => {
    const sanitized = sanitizeInput(text, true);
    setPassword(sanitized);

    if (!sanitized) setPasswordError("Password is required");
    else if (sanitized.length < 8)
      setPasswordError("Password must be at least 8 characters");
    else if (sanitized.length > 16)
      setPasswordError("Password must not exceed 16 characters");
    else if (!/[A-Z]/.test(sanitized))
      setPasswordError("Must contain one uppercase letter");
    else if (!/[0-9]/.test(sanitized))
      setPasswordError("Must contain one number");
    else setPasswordError("");
  };

  const handleConfirmPassword = (text) => {
    const sanitized = sanitizeInput(text, true);
    setConfirmPassword(sanitized);

    if (!sanitized) setConfirmPasswordError("Confirm Password required");
    else if (sanitized !== password)
      setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const handleUsername = (text) => {
    const sanitized = sanitizeInput(text);
    setUsername(sanitized);

    if (!sanitized) setUsernameError("Username required");
    else if (sanitized.length < 4)
      setUsernameError("Minimum 4 characters");
    else if (sanitized.length > 12)
      setUsernameError("Maximum 12 characters");
    else setUsernameError("");
  };

  const handleEmail = (text) => {
    setEmail(text);

    if (!text) setEmailError("Email required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
      setEmailError("Invalid email");
    else if (text.length > 30)
      setEmailError("Email too long");
    else if (!text.includes(".com"))
      setEmailError("Must contain .com");
    else if (text.includes(" "))
      setEmailError("No spaces allowed");
    else setEmailError("");
  };

  const handleFName = (text) => {
    const sanitized = sanitizeInput(text, true);
    setFName(sanitized);

    if (!sanitized) setFNameError("First name required");
    else if (/[0-9]/.test(sanitized))
      setFNameError("No numbers allowed");
    else if (sanitized.length > 20)
      setFNameError("Max 20 characters");
    else setFNameError("");
  };

  const handleLName = (text) => {
    const sanitized = sanitizeInput(text, true);
    setLName(sanitized);

    if (!sanitized) setLNameError("Last name required");
    else if (/[0-9]/.test(sanitized))
      setLNameError("No numbers allowed");
    else if (sanitized.length > 20)
      setLNameError("Max 20 characters");
    else setLNameError("");
  };

  return (
    <SafeAreaView style={styles.safe}>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
<<<<<<< HEAD
        <SignUpHeader step={step} onBack={back} />
        {pages[step]}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
=======
        {/* Content */}
        <View style={styles.contentWrapper}>
          {/* Logo (sagipbayanlogo.png) */}
          <Image
            source={require("../assets/sagipbayanlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.formWrapper}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#706f6faa"
              value={fName}
              onChangeText={handleFName}
            />
            {fNameError ? <Text style={styles.error}>{fNameError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#706f6faa"
              value={lName}
              onChangeText={handleLName}
            />
            {lNameError ? <Text style={styles.error}>{lNameError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#706f6faa"
              value={username}
              onChangeText={handleUsername}
            />
            {usernameError ? <Text style={styles.error}>{usernameError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#706f6faa"
              secureTextEntry
              value={password}
              onChangeText={handlePassword}
            />
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#706f6faa"
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPassword}
            />
            {confirmPasswordError ? (
              <Text style={styles.error}>{confirmPasswordError}</Text>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#706f6faa"
              value={email}
              onChangeText={handleEmail}
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Birthdate (YYYY-MM-DD)"
              placeholderTextColor="#706f6faa"
              value={date}
              onChangeText={setDate}
              {...Platform.select({ web: { type: "date" }, default: {} })}
            />

            <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>

            <Text style={styles.link} onPress={() => navigation.navigate("LogIn")}>
              Already have an account? LOGIN
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
