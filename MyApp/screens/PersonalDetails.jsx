import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import { UserContext } from "./UserContext";
import NewBottomNav from "./NewBottomNav";

export default function PersonalDetails({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState(user?.username || "");
  const [error, setError] = useState("");

  if (!user) return <Text>No user logged in</Text>;

  const saveUsername = () => {
    setError(""); // reset previous error

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    axios
      .put(`http://localhost:8000/user/update/${user._id}`, { username })
      .then(() => {
        setUser({ ...user, username });
        console.log("Username updated successfully");
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to update username.");
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.webFrame}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.phone}>
        <Text style={styles.header}>Personal Details</Text>
        <Text style={styles.subText}>
          Review and manage your personal information below. Keeping your details accurate ensures smoother communication, secure account recovery, and a more personalized experience across the app.
        </Text>

        <View style={styles.formWrapper}>
          {/* First Name */}
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={user.fname}
            editable={false}
            placeholder="First Name"
            placeholderTextColor="#1F3961"
          />

          {/* Last Name */}
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={user.lname}
            editable={false}
            placeholder="Last Name"
            placeholderTextColor="#1F3961"
          />

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <Text style={styles.helper}>
            This is your unique identifier. You can update this here.
          </Text>
          <TextInput
  style={styles.input}
  value={username}
  editable={true}
  onChangeText={(text) => {
    setUsername(text);
    if (error) setError(""); // clear error message when typing
  }}
  placeholder="Username"
  placeholderTextColor="#1F3961"
/>
          {/* Error message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <Text style={styles.helper}>
            This is the email linked to your account.
          </Text>
          <TextInput
            style={styles.input}
            value={user.email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="#1F3961"
          />

          {/* Save button */}
          <TouchableOpacity style={styles.button} onPress={saveUsername}>
            <Text style={styles.buttonText}>Save Changes</Text>
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
    flex: 1, alignItems: "center", backgroundColor: Platform.OS === "web" ? "#000" : "#fff" 
  },
  phone: 
  { flex: 1, width: "100%", maxWidth: 390, backgroundColor: "#fff", position: "relative", paddingHorizontal: 20, paddingTop: 30 

  },
  header: { 
    fontSize: 22, fontWeight: "bold", color: "#1F3961", marginBottom: 4, textAlign: "left" 
  },
  subText: 
  { fontSize: 14, color: "#555", marginBottom: 5, textAlign: "left", width: "100%" 

  },
  formWrapper: 
  { 
    marginTop: 60, alignItems: "center"

   },
  label:
   {
     fontSize: 13, fontWeight: "600", color: "#1F3961", textAlign: "left", width: "90%", maxWidth: 320, marginTop: 1

    },
  helper: 
  { 
    fontSize: 12, color: "#777", textAlign: "left", width: "90%", maxWidth: 320, marginBottom: 4

   },
  input:
   { 
    width: "90%", maxWidth: 320, height: 40, borderWidth: 1, borderColor: "#1F3961", borderRadius: 5, paddingHorizontal: 12, marginBottom: 8, color: "#1F3961", backgroundColor: "#f9f9f9", fontSize: 16, textAlign: "left"

    },
  button: 
  {
     width: "90%", maxWidth: 320, backgroundColor: "#1F3961", borderRadius: 5, paddingVertical: 10, marginTop: 10, alignItems: "center", justifyContent: "center"

   },
  buttonText: 
  { 
    color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center"

   },
  bottomNavWrapper: 
  { 
    position: "absolute", left: 0, right: 0, bottom: Platform.OS === "ios" ? 40 : 1, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" 

  },
  error:  {
     color: "red", marginBottom: 6, textAlign: "center"

   },
});
