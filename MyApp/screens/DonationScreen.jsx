import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function DonationScreen() {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [proof, setProof] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setProof(result.assets[0].uri);
    }
  };

 const handleDonate = async () => {
  if (!amount || !reference || !proof) {
    Alert.alert('Missing Fields', 'Please complete all fields.');
    return;
  }

  try {
    const formData = new FormData();

    formData.append("amount", amount);
    formData.append("referenceNumber", reference);

    formData.append("proof", {
      uri: proof,
      name: "proof.jpg",
      type: "image/jpeg"
    });

    const response = await fetch("http://192.168.1.209:8000/api/donations", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      credentials: "include"
    });

    // ✅ SAFE RESPONSE HANDLING (NO DUPLICATES)
    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    let data = {};
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.log("Non-JSON response:", text);
      Alert.alert("Error", "Server returned invalid response");
      return;
    }

    if (response.ok) {
      Alert.alert("Success", "Donation submitted!");
      setAmount("");
      setReference("");
      setProof(null);
    } else {
      Alert.alert("Error", data.message || "Something went wrong");
    }

  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Network error");
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Donate</Text>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="₱ Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Reference */}
        <Text style={styles.label}>Reference Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter reference"
          value={reference}
          onChangeText={setReference}
        />

        {/* Upload */}
        <Text style={styles.label}>Proof of Payment</Text>
        <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
          {proof ? (
            <Image source={{ uri: proof }} style={styles.image} />
          ) : (
            <Text style={styles.uploadText}>Tap to Upload</Text>
          )}
        </TouchableOpacity>

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={handleDonate}>
          <Text style={styles.buttonText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7' // iOS background
  },
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 25
  },
  label: {
    fontSize: 14,
    color: '#6e6e73',
    marginBottom: 6,
    marginTop: 15
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  uploadCard: {
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  uploadText: {
    color: '#8e8e93',
    fontSize: 15
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16
  },
  button: {
    marginTop: 40,
    backgroundColor: '#007AFF', // iOS blue
    padding: 16,
    borderRadius: 14,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  }
});