import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styles from "../../Designs/StepPersonal";

export default function StepPersonal({
  fName,
  lName,
  username,
  fNameError,
  lNameError,
  usernameError,
  onFNameChange,
  onLNameChange,
  onUsernameChange,
  onNext,
}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../stores/assets/application1.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.description}>
          Tell us a little about yourself to help personalize your experience.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={fName}
          onChangeText={onFNameChange}
        />
        {fNameError ? <Text style={styles.error}>{fNameError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lName}
          onChangeText={onLNameChange}
        />
        {lNameError ? <Text style={styles.error}>{lNameError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={onUsernameChange}
        />
        {usernameError ? (
          <Text style={styles.error}>{usernameError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
