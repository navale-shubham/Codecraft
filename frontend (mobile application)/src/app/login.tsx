import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import { api } from "../services/api";
import { saveTokens } from "../services/auth";

type UserRole = "citizen" | "field_engineer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] =
    useState<UserRole>("citizen");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Error",
        "Please enter your email and password."
      );
      return;
    }

    // ==================================================
    // TEMPORARY DEMO LOGIN
    // ==================================================
    //
    // Citizen:
    // Email    -> abc@gmail.com
    // Password -> 1234
    //
    // Field Engineer:
    // Email    -> abc@gmail.com
    // Password -> 1234
    //
    // Remove this block when backend testing is ready.
    // ==================================================

    if (
      email.trim().toLowerCase() === "abc@gmail.com" &&
      password === "1234"
    ) {
      console.log(
        `Demo ${role} login successful`
      );

      if (role === "field_engineer") {
        router.replace("/engineer-home");
      } else {
        router.replace("/home");
      }

      return;
    }

    // ==================================================
    // REAL BACKEND LOGIN
    // ==================================================

    try {
      setLoading(true);

      // api.ts already contains /api/v1
      //
      // Final endpoint:
      // POST /api/v1/auth/login

      const response = await api.post(
        "/auth/login",
        {
          email: email.trim(),
          password: password,
        }
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      // ==================================================
      // Validate Response
      // ==================================================

      if (
        !response.data?.success ||
        !response.data?.data?.accessToken ||
        !response.data?.data?.refreshToken
      ) {
        Alert.alert(
          "Login Failed",
          "Invalid login response received from the server."
        );

        return;
      }

      // ==================================================
      // Get Tokens
      // ==================================================

      const accessToken =
        response.data.data.accessToken;

      const refreshToken =
        response.data.data.refreshToken;

      // ==================================================
      // Save Tokens
      // ==================================================

      await saveTokens(
        accessToken,
        refreshToken
      );

      console.log(
        "JWT tokens saved successfully"
      );

      // ==================================================
      // Navigate
      // ==================================================

      /*
       * Currently the selected role determines
       * which screen is opened.
       *
       * Later, the backend should return the
       * authenticated user's role and we should
       * use that instead.
       */

      if (role === "field_engineer") {
        router.replace(
          "/engineer-home"
        );
      } else {
        router.replace("/home");
      }

    } catch (error: any) {
      console.log(
        "LOGIN ERROR:",
        error
      );

      console.log(
        "LOGIN ERROR RESPONSE:",
        error.response?.data
      );

      // ==================================================
      // 401
      // ==================================================

      if (
        error.response?.status === 401
      ) {
        Alert.alert(
          "Login Failed",
          "Invalid email or password."
        );
      }

      // ==================================================
      // 400
      // ==================================================

      else if (
        error.response?.status === 400
      ) {
        Alert.alert(
          "Login Failed",
          "Invalid login data."
        );
      }

      // ==================================================
      // 403
      // ==================================================

      else if (
        error.response?.status === 403
      ) {
        Alert.alert(
          "Access Denied",
          "You are not authorized to access this account."
        );
      }

      // ==================================================
      // 404
      // ==================================================

      else if (
        error.response?.status === 404
      ) {
        Alert.alert(
          "Login API Not Found",
          "The authentication endpoint was not found."
        );
      }

      // ==================================================
      // 500+
      // ==================================================

      else if (
        error.response?.status >= 500
      ) {
        Alert.alert(
          "Server Error",
          "The SMART CIVIC server encountered an error."
        );
      }

      // ==================================================
      // No Response
      // ==================================================

      else if (
        error.request
      ) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the SMART CIVIC server. Make sure the backend is running and your phone is connected to the same network."
        );
      }

      // ==================================================
      // Other
      // ==================================================

      else {
        Alert.alert(
          "Login Failed",
          error.message ||
            "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.back}>
          ← Back
        </Text>
      </Pressable>

      {/* Title */}
      <Text style={styles.title}>
        Welcome Back
      </Text>

      <Text style={styles.subtitle}>
        Login to continue using SMART CIVIC.
      </Text>

      {/* Login Role */}
      <Text style={styles.label}>
        Login As
      </Text>

      <View style={styles.roleContainer}>

        {/* Citizen */}
        <Pressable
          style={styles.roleOption}
          onPress={() =>
            setRole("citizen")
          }
          disabled={loading}
        >
          <View
            style={[
              styles.radioOuter,
              role === "citizen" &&
                styles.radioOuterSelected,
            ]}
          >
            {role === "citizen" && (
              <View
                style={styles.radioInner}
              />
            )}
          </View>

          <Text style={styles.roleText}>
            Citizen
          </Text>
        </Pressable>

        {/* Field Engineer */}
        <Pressable
          style={styles.roleOption}
          onPress={() =>
            setRole("field_engineer")
          }
          disabled={loading}
        >
          <View
            style={[
              styles.radioOuter,
              role === "field_engineer" &&
                styles.radioOuterSelected,
            ]}
          >
            {role === "field_engineer" && (
              <View
                style={styles.radioInner}
              />
            )}
          </View>

          <Text style={styles.roleText}>
            Field Engineer
          </Text>
        </Pressable>

      </View>

      {/* Email */}
      <Text style={styles.label}>
        Email / Engineer ID
      </Text>

      <TextInput
        style={styles.input}
        placeholder={
          role === "field_engineer"
            ? "Enter engineer ID or email"
            : "Enter your email"
        }
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      {/* Password */}
      <Text style={styles.label}>
        Password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {/* Login Button */}
      <Pressable
        style={[
          styles.loginButton,
          loading &&
            styles.loginButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <Text style={styles.loginText}>
            LOGIN
          </Text>
        )}
      </Pressable>

      {/* Register */}
      {role === "citizen" && (
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>
            Don't have an account?
          </Text>

          <Pressable
            onPress={() =>
              router.push("/register")
            }
            disabled={loading}
          >
            <Text style={styles.registerLink}>
              {" "}Register
            </Text>
          </Pressable>
        </View>
      )}

      {/* Engineer information */}
      {role === "field_engineer" && (
        <Text style={styles.engineerInfo}>
          Field Engineer accounts are created by the
          administrator.
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 25,
    paddingTop: 60,
  },

  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 35,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  roleContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },

  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  radioOuterSelected: {
    borderColor: "#2563EB",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },

  roleText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 22,
  },

  loginButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  registerLabel: {
    color: "#64748B",
    fontSize: 14,
  },

  registerLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },

  engineerInfo: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 20,
  },
});