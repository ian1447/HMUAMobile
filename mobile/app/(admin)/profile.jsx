import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";

export default function Profile() {
  const { logout, user } = useAuthStore();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState(user?.password || "");

  const handleSave = () => {
    // Replace with actual update logic
    Alert.alert("Success", "Profile updated!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      <View style={styles.profileBox}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Enter username"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            placeholder="Enter email"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            placeholder="Enter password"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutIcon} onPress={logout}>
        <MaterialIcons name="logout" size={28} color="#ff5252" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef2fe",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d81b60",
    textAlign: "center",
    marginBottom: 30,
  },
  profileBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontWeight: "bold",
    color: "#444",
  },
  input: {
    backgroundColor: "#fce4ec",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f8bbd0",
  },
  saveButton: {
    backgroundColor: "#ec407a",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutIcon: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
