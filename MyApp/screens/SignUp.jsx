// screens/SignUp.jsx
import * as Location from "expo-location";
import { useRef, useState, useEffect } from "react";
import { FlatList, Dimensions, View, Alert } from "react-native";
import api from "../lib/api";

import StepPersonal from "./signup/StepPersonal";
import StepSecurity from "./signup/StepSecurity";
import StepMobile from "./signup/StepMobile";
import SignUpHeader from "./signup/SignUpHeader";

const { width } = Dimensions.get("window");

export default function SignUp({ navigation }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  // ===== DATA =====
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  // ===== ERRORS =====
  const [fNameError, setFNameError] = useState("");
  const [lNameError, setLNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");

  const sanitizeInput = (text, allowSpaces = false) => {
    const pattern = allowSpaces ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
    return text.replace(pattern, "");
  };

  //Jaen bounds and fencing and debugging
  const [debuger, setDebuger] = useState(false);
  const JAEN_CENTER = {
    lat: 15.33830,
    lng: 120.91410,
  };

  const MAX_DISTANCE_KM = 5; //adjust lang this idk optimal size
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "You must allow location access to register.",
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    })();
  }, []);

  const handleCreateUser = () => {
    if (locationPermission !== "granted" || !location) {
      Alert.alert(
        "Location Required",
        "Please enable location permission to continue registration."
      );
      return;
    }
    if (
      usernameError ||
      passwordError ||
      emailError ||
      confirmPasswordError ||
      fNameError ||
      lNameError ||
      phoneError
    ) {
      return;
    }
    if(!debuger){
      if (!location) {
        Alert.alert(
          "Location Required",
          "Waiting for your location. Please try again."
        );
        return;
      }

      const distance = getDistanceKm(
        location.lat,
        location.lng,
        JAEN_CENTER.lat,
        JAEN_CENTER.lng
      );

      if (distance > MAX_DISTANCE_KM) {
        Alert.alert(
          "Outside Service Area",
          "Registration is only allowed within Jaen, Nueva Ecija."
        );
        return;
      }
    }

    const userData = {
      fname: fName,
      lname: lName,
      username,
      email,
      password,
      birthdate: date,
      phone,
      address,
      location
    };

    api
      .post("/user/register", userData)
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

  const handlePassword = (v) => {
    setPassword(v);
    if (!v) setPasswordError("Password required");
    else if (v.length < 8) setPasswordError("Minimum 8 characters");
    else if (!/[A-Z]/.test(v)) setPasswordError("One uppercase required");
    else if (!/[0-9]/.test(v)) setPasswordError("One number required");
    else setPasswordError("");
  };

  const handleConfirmPassword = (v) => {
    setConfirmPassword(v);
    if (!v) setConfirmPasswordError("Confirm password");
    else if (v !== password) setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const handlePhone = (v) => {
    setPhone(v);
    if (!/^\d{10,11}$/.test(v)) setPhoneError("Invalid phone number");
    else setPhoneError("");
  };

  const handleEmail = (v) => {
    setEmail(v);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      setEmailError("Invalid email");
    else setEmailError("");
  };

  // ===== NAV =====
  const next = () => {
    if (index === 0 && (fNameError || lNameError || usernameError)) {
      Alert.alert("Fix errors first");
      return;
    }
    if (index === 1 && (passwordError || confirmPasswordError)) {
      Alert.alert("Fix password errors");
      return;
    }
    ref.current.scrollToIndex({ index: index + 1 });
  };

  const back = () => {
    if (index === 0) navigation.goBack();
    else ref.current.scrollToIndex({ index: index - 1 });
  };

  const register = () => {
    if (phoneError || emailError) {
      Alert.alert("Fix errors before submitting");
      return;
    }

    api.post("/user/register", {
      fname: fName,
      lname: lName,
      username,
      password,
      phone,
      email,
    }).then(() => {
      Alert.alert(
        "Verify Email",
        "Check your inbox to verify your account."
      );
      navigation.replace("LogIn");
    });
  };

  const pages = [
    {
      key: "personal",
      component: (
        <StepPersonal
          fName={fName}
          lName={lName}
          username={username}
          fNameError={fNameError}
          lNameError={lNameError}
          usernameError={usernameError}
          onFNameChange={handleFName}
          onLNameChange={handleLName}
          onUsernameChange={handleUsername}
          onNext={next}
        />
      ),
    },
    {
      key: "security",
      component: (
        <StepSecurity
          password={password}
          confirmPassword={confirmPassword}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          onPasswordChange={handlePassword}
          onConfirmChange={handleConfirmPassword}
          onNext={next}
        />
      ),
    },
    {
      key: "mobile",
      component: (
        <StepMobile
          phone={phone}
          email={email}
          phoneError={phoneError}
          emailError={emailError}
          onPhoneChange={handlePhone}
          onEmailChange={handleEmail}
          onSubmit={register}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Content (TOP-ALIGNED via ScrollView) */}
        <ScrollView
          contentContainerStyle={{ ...styles.contentWrapper, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Image
            source={require("../stores/assets/sagipbayanlogo.png")}
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

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#706f6faa"
              value={phone}
              onChangeText={handlePhone}
            />
            {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#706f6faa"
              value={address}
              onChangeText={handleAddress}
            />
            {addressError ? <Text style={styles.error}>{addressError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => setDebuger(prev => !prev)}
            >
              <Text style={{ color: debuger ? "green" : "red", fontSize: 12 }}>
                {debuger ? "Geo Check: OFF (Debug)" : "Geo Check: ON"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.link} onPress={() => navigation.navigate("LogIn")}>
              Already have an account? LOGIN
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}