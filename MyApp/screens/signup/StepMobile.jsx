import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../Designs/StepMobile";

export default function StepMobile({
  phone,
  email,
  setPhone,
  setEmail,
  onBack,
  onSubmit,
}) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image
        source={require("../../stores/assets/application3.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title + Description */}
      <Text style={styles.title}>Mobile Registration</Text>
      <Text style={styles.description}>
        Provide your contact details so we can verify and protect your account.
      </Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
}