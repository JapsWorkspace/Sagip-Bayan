import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import axios from "axios";

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Background */}
        <View style={styles.backgroundWrapper}>
          <Image
            source={require("../assets/bg.png")}
            style={styles.backgroundImage}
          />
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.formWrapper}>
            <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#ffffffaa" value={fName} onChangeText={handleFName} />
            {fNameError ? <Text style={styles.error}>{fNameError}</Text> : null}

            <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#ffffffaa" value={lName} onChangeText={handleLName} />
            {lNameError ? <Text style={styles.error}>{lNameError}</Text> : null}

            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#ffffffaa" value={username} onChangeText={handleUsername} />
            {usernameError ? <Text style={styles.error}>{usernameError}</Text> : null}

            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#ffffffaa" secureTextEntry value={password} onChangeText={handlePassword} />
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

            <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#ffffffaa" secureTextEntry value={confirmPassword} onChangeText={handleConfirmPassword} />
            {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#ffffffaa" value={email} onChangeText={handleEmail} />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Birthdate (YYYY-MM-DD)"
              placeholderTextColor="#ffffffaa"
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  backgroundWrapper: { ...StyleSheet.absoluteFillObject },
  backgroundImage: { width: "100%", height: "100%", transform: [{ scale: 1.65 }] },
  contentWrapper: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  logo: { width: "70%", maxWidth: 220, aspectRatio: 220 / 120, marginBottom: 16 },
  formWrapper: { width: "100%", maxWidth: 420 },
  input: {
    width: "100%",
    height: 35,
    borderWidth: 1,
    borderColor: "#ffffffaa",
    borderRadius: 5,
    paddingHorizontal: 16,
    marginBottom: 6,
    color: "#fff",
    fontSize: 14,
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 8,
    marginTop: 6,
    alignItems: "center",
  },
  buttonText: { color: "#1F3961", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", fontSize: 12, marginBottom: 4 },
  link: { color: "#fff", marginTop: 10, textAlign: "center", fontSize: 14 },
});
