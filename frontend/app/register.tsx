import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";

import { api } from "../services/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  // --------------------------------------------------
  // GET CURRENT LOCATION
  // --------------------------------------------------

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Location permission is required to create your citizen account."
        );
        return null;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude =
        currentLocation.coords.latitude;

      const longitude =
        currentLocation.coords.longitude;

      const accuracy =
        currentLocation.coords.accuracy ?? 9999;

      console.log("Registration GPS:", {
        latitude,
        longitude,
        accuracy,
      });

      // Keep the same 100m GPS accuracy rule
      // used for civic issue reporting.
      if (accuracy > 100) {
        Alert.alert(
          "Poor GPS Accuracy",
          `Your current GPS accuracy is ${Math.round(
            accuracy
          )}m. Please move to an open area and try again.`
        );

        return null;
      }

      const newLocation = {
        latitude,
        longitude,
      };

      setLocation(newLocation);

      return newLocation;
    } catch (error) {
      console.error(
        "Location error:",
        error
      );

      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again."
      );

      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // --------------------------------------------------
  // REGISTER
  // --------------------------------------------------

  const handleRegister = async () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter your name."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter your email."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid email address."
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter your phone number."
      );
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Validation Error",
        "Please enter a password."
      );
      return;
    }

    if (password.length < 4) {
      Alert.alert(
        "Validation Error",
        "Password must contain at least 4 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Validation Error",
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------------
      // GET CURRENT GPS
      // ------------------------------------------------

      let currentLocation = location;

      if (!currentLocation) {
        currentLocation =
          await getCurrentLocation();
      }

      if (!currentLocation) {
        return;
      }

      // ------------------------------------------------
      // FINAL API PAYLOAD
      // ------------------------------------------------

      const payload = {
        Name: name.trim(),
        email: email.trim().toLowerCase(),
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        password: password,
      };

      console.log(
        "Citizen registration payload:",
        payload
      );

      // ------------------------------------------------
      // API CALL
      // ------------------------------------------------

      const response = await api.post(
        "/citizens",
        payload
      );

      console.log(
        "Registration response:",
        response.data
      );

      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      if (
        response.data?.success === false
      ) {
        Alert.alert(
          "Registration Failed",
          response.data?.message ||
            "Unable to create your account."
        );
        return;
      }

      Alert.alert(
        "Registration Successful",
        "Your citizen account has been created successfully.",
        [
          {
            text: "Login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      console.error(
        "ERROR MESSAGE:",
        error?.message
      );

      console.error(
        "ERROR CODE:",
        error?.code
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      console.error(
        "SERVER STATUS:",
        error?.response?.status
      );

      // ----------------------------------------------
      // BACKEND ERROR HANDLING
      // ----------------------------------------------

      if (error?.response?.status === 400) {
        Alert.alert(
          "Invalid Data",
          error?.response?.data?.message ||
            "Please check the information you entered."
        );
      } else if (
        error?.response?.status === 409
      ) {
        Alert.alert(
          "Account Already Exists",
          "A citizen account with this email may already exist."
        );
      } else if (
        error?.response?.status === 422
      ) {
        Alert.alert(
          "Invalid Information",
          error?.response?.data?.message ||
            "Please check the registration information."
        );
      } else if (
        error?.response?.status >= 500
      ) {
        Alert.alert(
          "Server Error",
          "The server encountered an error. Please try again later."
        );
      } else if (error?.request) {
        Alert.alert(
          "Connection Error",
          "Could not connect to the backend. Make sure the backend is running and your phone can reach the computer."
        );
      } else {
        Alert.alert(
          "Registration Failed",
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Register as a citizen to report
            civic issues.
          </Text>
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Full Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Confirm Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Location */}
        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>
            Registration Location
          </Text>

          {location ? (
            <Text style={styles.locationText}>
              ✓ Location captured
              {"\n"}
              Latitude:{" "}
              {location.latitude.toFixed(6)}
              {"\n"}
              Longitude:{" "}
              {location.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.locationText}>
              Your current location is required
              for registration.
            </Text>
          )}

          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <Text style={styles.locationButtonText}>
                {location
                  ? "Refresh Location"
                  : "Get Current Location"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            loading &&
              styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Text style={styles.registerButtonText}>
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Login */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.replace("/login")
            }
          >
            <Text style={styles.loginLink}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ----------------------------------------------------
// STYLES
// ----------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },

  locationBox: {
    marginTop: 5,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 12,
  },

  locationButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
  },

  locationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  registerButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  registerButtonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  loginText: {
    color: "#6B7280",
    fontSize: 14,
  },

  loginLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
});