import { useState, useContext } from "react";
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
          setUser( {

        id: data.user._id,
        fname: data.user.fname,
        lname: data.user.lname,
        username: data.user.username,
        password: password,
        email: data.user.email,
      });

      console.log(user)
    
          navigation.navigate("Profile");
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
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#ffffffaa"
              value={username}
              onChangeText={(text) => setUsername(sanitizeInput(text))}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ffffffaa"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(sanitizeInput(text))}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            <Text
              style={styles.link}
              onPress={() => navigation.navigate("SendOtp")}
            >
              Forgot Password?
            </Text>

            <Text style={styles.or}>— OR —</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.65 }],
    resizeMode: "contain",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -80,
  },
  logo: {
    width: "70%",
    maxWidth: 220,
    aspectRatio: 220 / 120,
    marginBottom: 16,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  input: {
    width: "100%",
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#ffffffaa",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#1F3961",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  link: {
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  or: {
    color: "#fff",
    marginVertical: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});
