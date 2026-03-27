import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../Designs/StepSecurity";

export default function StepSecurity({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  onNext,
  onBack,
}) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image
        source={require("../../stores/assets/application2.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title + Description */}
      <Text style={styles.title}>Security Setup</Text>
      <Text style={styles.description}>
        Create a strong password to keep your account safe and secure.
      </Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Next Button */}
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
}