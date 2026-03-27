import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../Designs/StepPersonal";

export default function StepPersonal({
  fName,
  lName,
  username,
  setFName,
  setLName,
  setUsername,
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
        source={require("../../stores/assets/application1.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title + Description */}
      <Text style={styles.title}>Personal Information</Text>
      <Text style={styles.description}>
        Tell us a little about yourself to help us personalize your experience.
      </Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={fName}
        onChangeText={setFName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lName}
        onChangeText={setLName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      {/* Next Button */}
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>NEXT</Text>
      </TouchableOpacity>
    </View>
  );
}