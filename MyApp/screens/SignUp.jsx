// screens/SignUp.jsx
import { useRef, useState } from "react";
import { FlatList, Dimensions, View, Alert } from "react-native";
import api from "../lib/api";

import StepPersonal from "./signup/StepPersonal";
import StepSecurity from "./signup/StepSecurity";
import StepMobile from "./signup/StepMobile";

const { width } = Dimensions.get("window");

export default function SignUp({ navigation }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  // ====== DATA STATE ======
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ====== ERROR STATE ======
  const [fNameError, setFNameError] = useState("");
  const [lNameError, setLNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // ====== HELPERS ======
  const sanitizeInput = (text, allowSpaces = false) => {
    const pattern = allowSpaces ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
    return text.replace(pattern, "");
  };

  // ====== VALIDATION HANDLERS (FROM YOUR OLD CODE) ======
  const handleFName = (text) => {
    const v = sanitizeInput(text, true);
    setFName(v);
    if (!v) setFNameError("First name required");
    else if (/[0-9]/.test(v)) setFNameError("No numbers allowed");
    else setFNameError("");
  };

  const handleLName = (text) => {
    const v = sanitizeInput(text, true);
    setLName(v);
    if (!v) setLNameError("Last name required");
    else if (/[0-9]/.test(v)) setLNameError("No numbers allowed");
    else setLNameError("");
  };

  const handleUsername = (text) => {
    const v = sanitizeInput(text);
    setUsername(v);
    if (!v) setUsernameError("Username required");
    else if (v.length < 4) setUsernameError("Minimum 4 characters");
    else if (v.length > 12) setUsernameError("Maximum 12 characters");
    else setUsernameError("");
  };

  const handlePassword = (text) => {
    const v = sanitizeInput(text, true);
    setPassword(v);
    if (!v) setPasswordError("Password required");
    else if (v.length < 8) setPasswordError("Min 8 characters");
    else if (!/[A-Z]/.test(v)) setPasswordError("One uppercase required");
    else if (!/[0-9]/.test(v)) setPasswordError("One number required");
    else setPasswordError("");
  };

  const handleConfirmPassword = (text) => {
    const v = sanitizeInput(text, true);
    setConfirmPassword(v);
    if (!v) setConfirmPasswordError("Confirm your password");
    else if (v !== password) setConfirmPasswordError("Passwords do not match");
    else setConfirmPasswordError("");
  };

  const handlePhone = (text) => {
    const v = sanitizeInput(text);
    setPhone(v);
    if (!/^\d{10,11}$/.test(v)) setPhoneError("Invalid phone number");
    else setPhoneError("");
  };

  const handleEmail = (text) => {
    setEmail(text);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
      setEmailError("Invalid email");
    else setEmailError("");
  };

  // ====== STEP NAVIGATION (BLOCKED BY VALIDATION) ======
  const next = () => {
    // Step 1 validation
    if (index === 0 && (fNameError || lNameError || usernameError)) {
      Alert.alert("Please fix errors before continuing");
      return;
    }

    // Step 2 validation
    if (index === 1 && (passwordError || confirmPasswordError)) {
      Alert.alert("Fix password errors first");
      return;
    }

    ref.current.scrollToIndex({ index: index + 1 });
  };

  const back = () => {
    if (index === 0) navigation.goBack();
    else ref.current.scrollToIndex({ index: index - 1 });
  };

  // ====== SUBMIT ======
  const register = () => {
    if (emailError || phoneError) {
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
      Alert.alert("Verify Email", "Check your inbox for verification.");
      navigation.replace("LogIn");
    });
  };

  // ====== PAGES ======
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
          onBack={back}
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
          onBack={back}
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
          onBack={back}
          onSubmit={register}
        />
      ),
    },
  ];

  return (
    <FlatList
      ref={ref}
      data={pages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ width }}>{item.component}</View>
      )}
      keyExtractor={(item) => item.key}
      onMomentumScrollEnd={(e) =>
        setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
      }
    />
  );
}