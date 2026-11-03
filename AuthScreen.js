
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// IMPORTANT:
// If using Expo Go on a physical phone, replace localhost
// with your computer's local IPv4 address, e.g. http://192.168.1.5:5000

const API_URL = "http://10.216.82.204:5000";
const COLORS = {
  background: "#101311",
  card: "#1B211D",
  green: "#B8F36B",
  white: "#FFFFFF",
  gray: "#929A94",
  border: "#343D36",
};

export default function AuthScreen({ onLoginSuccess }) {
  const [screen, setScreen] = useState("welcome");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // =====================================
  // LOGIN WITH MONGODB BACKEND
  // =====================================

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Details",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Login Failed",
          data.message || "Invalid email or password."
        );
        return;
      }

      if (!data.token) {
        Alert.alert(
          "Login Error",
          "Backend did not return an authentication token."
        );
        return;
      }

      // Send login response to App.js
      onLoginSuccess?.(data);

    } catch (error) {
      console.log("Login Error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to FitTrack server. Please check whether your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SIGNUP WITH MONGODB BACKEND
  // =====================================

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in all fields."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Registration Failed",
          data.message || "Could not create your account."
        );
        return;
      }

      Alert.alert(
        "Registration Successful",
        "Your account has been saved in MongoDB!",
        [
          {
            text: "Continue to Login",
            onPress: () => {
              setPassword("");
              setConfirmPassword("");
              setScreen("login");
            },
          },
        ]
      );

    } catch (error) {
      console.log("Signup Error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to FitTrack server. Please check whether your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // BACK BUTTON
  // =====================================

  const goBack = () => {
    if (loading) return;
    setScreen("welcome");
  };

  // =====================================
  // LOGO
  // =====================================

  const renderLogo = () => (
    <View style={styles.logoContainer}>
      <MaterialCommunityIcons
        name="run-fast"
        size={70}
        color={COLORS.green}
      />

      <Text style={styles.logoText}>FitTrack</Text>

      <Text style={styles.logoSubtitle}>
        YOUR FITNESS COMPANION
      </Text>
    </View>
  );

  // =====================================
  // LOGIN / SIGNUP HEADER
  // =====================================

  const renderHeader = (title, subtitle) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        disabled={loading}
      >
        <Ionicons
          name="arrow-back"
          size={23}
          color={COLORS.white}
        />
      </TouchableOpacity>

      <View style={styles.headerLogo}>
        <MaterialCommunityIcons
          name="run-fast"
          size={65}
          color={COLORS.green}
        />
      </View>

      <Text style={styles.heading}>{title}</Text>

      <Text style={styles.subheading}>{subtitle}</Text>
    </View>
  );

  // =====================================
  // INPUT FIELD
  // =====================================

  const renderInput = (
    placeholder,
    value,
    setValue,
    icon,
    isPassword = false,
    visible = false,
    toggleVisibility = null,
    keyboardType = "default"
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons
        name={icon}
        size={21}
        color={COLORS.gray}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        value={value}
        onChangeText={setValue}
        secureTextEntry={isPassword && !visible}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      {isPassword && (
        <TouchableOpacity
          onPress={toggleVisibility}
          disabled={loading}
        >
          <Ionicons
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={21}
            color={COLORS.gray}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  // =====================================
  // SOCIAL BUTTONS
  // =====================================

  const renderSocialButtons = () => (
    <>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />

        <Text style={styles.dividerText}>
          or continue with
        </Text>

        <View style={styles.divider} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Google login will be added later."
            )
          }
        >
          <Ionicons
            name="logo-google"
            size={21}
            color={COLORS.white}
          />

          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Apple login will be added later."
            )
          }
        >
          <Ionicons
            name="logo-apple"
            size={23}
            color={COLORS.white}
          />

          <Text style={styles.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // =====================================
  // WELCOME SCREEN
  // =====================================

  const renderWelcome = () => (
    <ScrollView
      contentContainerStyle={styles.welcomeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.welcomeTop}>
        <Text style={styles.brand}>
          Fit<Text style={{ color: COLORS.green }}>Track</Text>
        </Text>

        <Text style={styles.brandTagline}>
          YOUR FITNESS COMPANION
        </Text>
      </View>

      <View style={styles.heroCircle}>
        <View style={styles.heroInnerCircle}>
          <MaterialCommunityIcons
            name="run-fast"
            size={150}
            color={COLORS.green}
          />
        </View>

        <View style={styles.heartIcon}>
          <Ionicons
            name="heart-outline"
            size={43}
            color={COLORS.green}
          />
        </View>
      </View>

      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>
          Get Fit,{"\n"}
          Stay <Text style={{ color: COLORS.green }}>Healthy!</Text>
        </Text>

        <Text style={styles.welcomeDescription}>
          Track your health, set goals and achieve more.
          Start your fitness journey with FitTrack.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setScreen("login")}
      >
        <Text style={styles.primaryButtonText}>Login</Text>

        <Ionicons
          name="arrow-forward"
          size={22}
          color="#101311"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => setScreen("signup")}
      >
        <Text style={styles.outlineButtonText}>
          Create Account
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        A Healthier You, A Happier You ❤️
      </Text>
    </ScrollView>
  );

  // =====================================
  // LOGIN SCREEN
  // =====================================

  const renderLogin = () => (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {renderHeader(
        "Welcome Back!",
        "Login to continue with FitTrack"
      )}

      <View style={styles.form}>
        {renderInput(
          "Email Address",
          email,
          setEmail,
          "mail-outline",
          false,
          false,
          null,
          "email-address"
        )}

        {renderInput(
          "Password",
          password,
          setPassword,
          "lock-closed-outline",
          true,
          showPassword,
          () => setShowPassword(!showPassword)
        )}

        <View style={styles.forgotRow}>
          <Text style={styles.rememberText}>
            Welcome back to FitTrack!
          </Text>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Forgot password feature will be added later."
              )
            }
          >
            <Text style={styles.linkText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#101311" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Login</Text>

              <Ionicons
                name="arrow-forward"
                size={22}
                color="#101311"
              />
            </>
          )}
        </TouchableOpacity>

        {renderSocialButtons()}

        <View style={styles.bottomTextRow}>
          <Text style={styles.bottomText}>
            Don't have an account?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => setScreen("signup")}
            disabled={loading}
          >
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // =====================================
  // SIGNUP SCREEN
  // =====================================

  const renderSignup = () => (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {renderHeader(
        "Create Account",
        "Join FitTrack today"
      )}

      <View style={styles.form}>
        {renderInput(
          "Full Name",
          name,
          setName,
          "person-outline"
        )}

        {renderInput(
          "Email Address",
          email,
          setEmail,
          "mail-outline",
          false,
          false,
          null,
          "email-address"
        )}

        {renderInput(
          "Password",
          password,
          setPassword,
          "lock-closed-outline",
          true,
          showPassword,
          () => setShowPassword(!showPassword)
        )}

        {renderInput(
          "Confirm Password",
          confirmPassword,
          setConfirmPassword,
          "lock-closed-outline",
          true,
          showConfirmPassword,
          () =>
            setShowConfirmPassword(!showConfirmPassword)
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#101311" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                Create Account
              </Text>

              <Ionicons
                name="arrow-forward"
                size={22}
                color="#101311"
              />
            </>
          )}
        </TouchableOpacity>

        {renderSocialButtons()}

        <View style={styles.bottomTextRow}>
          <Text style={styles.bottomText}>
            Already have an account?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => setScreen("login")}
            disabled={loading}
          >
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // =====================================
  // MAIN RETURN
  // =====================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {screen === "welcome" && renderWelcome()}
        {screen === "login" && renderLogin()}
        {screen === "signup" && renderSignup()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================
// STYLES
// =====================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  logoContainer: {
    alignItems: "center",
  },

  logoText: {
    color: COLORS.white,
    fontSize: 35,
    fontWeight: "900",
  },

  logoSubtitle: {
    color: COLORS.gray,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 5,
  },

  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 45,
    paddingBottom: 25,
  },

  welcomeTop: {
    alignItems: "center",
    marginBottom: 25,
  },

  brand: {
    color: COLORS.white,
    fontSize: 43,
    fontWeight: "900",
    fontStyle: "italic",
  },

  brandTagline: {
    color: COLORS.gray,
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 4,
  },

  heroCircle: {
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 20,
  },

  heroInnerCircle: {
    width: 225,
    height: 225,
    borderRadius: 115,
    backgroundColor: "#202D20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#384C32",
  },

  heartIcon: {
    position: "absolute",
    left: 20,
    bottom: 28,
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 35,
  },

  welcomeTextContainer: {
    marginBottom: 30,
  },

  welcomeTitle: {
    color: COLORS.white,
    fontSize: 39,
    fontWeight: "900",
    lineHeight: 47,
  },

  welcomeDescription: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 13,
  },

  primaryButton: {
    minHeight: 57,
    borderRadius: 17,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: "#101311",
    fontSize: 17,
    fontWeight: "800",
  },

  outlineButton: {
    height: 56,
    borderRadius: 17,
    borderWidth: 1.7,
    borderColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  outlineButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },

  footerText: {
    color: COLORS.gray,
    textAlign: "center",
    fontSize: 12,
    marginTop: 28,
  },

  formContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 30,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  backButton: {
    alignSelf: "flex-start",
    width: 43,
    height: 43,
    borderRadius: 23,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },

  headerLogo: {
    marginTop: 12,
    marginBottom: 10,
  },

  heading: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
  },

  subheading: {
    color: COLORS.gray,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },

  form: {
    width: "100%",
  },

  inputContainer: {
    height: 60,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    marginBottom: 14,
    gap: 13,
  },

  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    height: "100%",
  },

  forgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 12,
  },

  rememberText: {
    color: COLORS.gray,
    fontSize: 12,
  },

  linkText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 20,
    gap: 12,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    color: COLORS.gray,
    fontSize: 13,
  },

  socialRow: {
    flexDirection: "row",
    gap: 12,
  },

  socialButton: {
    flex: 1,
    height: 53,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  socialText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  bottomTextRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
    marginBottom: 15,
  },

  bottomText: {
    color: COLORS.gray,
    fontSize: 13,
  },
});
