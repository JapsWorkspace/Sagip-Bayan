// screens/SignUp.jsx
import { useRef, useState } from "react";
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

  // ===== ERRORS =====
  const [fNameError, setFNameError] = useState("");
  const [lNameError, setLNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // ===== VALIDATION (NO SANITIZE ON TYPE) =====
  const handleFName = (v) => {
    setFName(v);
    if (!v) setFNameError("First name required");
    else if (/[0-9]/.test(v)) setFNameError("No numbers allowed");
    else setFNameError("");
  };

  const handleLName = (v) => {
    setLName(v);
    if (!v) setLNameError("Last name required");
    else if (/[0-9]/.test(v)) setLNameError("No numbers allowed");
    else setLNameError("");
  };

  const handleUsername = (v) => {
    setUsername(v);
    if (!v) setUsernameError("Username required");
    else if (v.length < 4) setUsernameError("Minimum 4 characters");
    else if (v.length > 12) setUsernameError("Maximum 12 characters");
    else setUsernameError("");
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
    <View style={{ flex: 1 }}>
      <SignUpHeader step={index} onBack={back} />

      <FlatList
        ref={ref}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={{ width }}>{item.component}</View>
        )}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
      />
    </View>
  );
}