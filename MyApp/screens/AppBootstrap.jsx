// screens/AppBootstrap.jsx
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppBootstrap({ navigation }) {
  useEffect(() => {
    const checkPrivacy = async () => {
      const accepted = await AsyncStorage.getItem("privacyAccepted");
      if (accepted === "true") {
        navigation.replace("GetStarted");
      } else {
        navigation.replace("PrivacyGate");
      }
    };
    checkPrivacy();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#166534" />
    </View>
  );
}