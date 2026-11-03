
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GREEN = "#B8F36B";
const BG = "#101311";
const CARD = "#1B211D";
const WHITE = "#FFFFFF";
const GRAY = "#8D968F";

const PROFILE_IMAGE_KEY = "fittrack_profile_image";
const PROFILE_DATA_KEY = "fittrack_profile_data";

const DEFAULT_PROFILE = {
  name: "Fitness User",
  age: "22",
  height: "175",
  weight: "68.5",
  goal: "Stay Fit",
};

export default function ProfileScreen({ onLogout }) {
  const [name, setName] = useState(DEFAULT_PROFILE.name);
  const [age, setAge] = useState(DEFAULT_PROFILE.age);
  const [height, setHeight] = useState(DEFAULT_PROFILE.height);
  const [weight, setWeight] = useState(DEFAULT_PROFILE.weight);
  const [goal, setGoal] = useState(DEFAULT_PROFILE.goal);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Load saved profile information and photo
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedData = await AsyncStorage.getItem(PROFILE_DATA_KEY);
        const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);

        if (savedData) {
          const profile = JSON.parse(savedData);

          setName(profile.name ?? DEFAULT_PROFILE.name);
          setAge(profile.age ?? DEFAULT_PROFILE.age);
          setHeight(profile.height ?? DEFAULT_PROFILE.height);
          setWeight(profile.weight ?? DEFAULT_PROFILE.weight);
          setGoal(profile.goal ?? DEFAULT_PROFILE.goal);
        }

        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.log("Profile loading error:", error);
      }
    };

    loadProfile();
  }, []);

  // Save all personal information
  const saveProfileData = async (updatedData) => {
    try {
      await AsyncStorage.setItem(
        PROFILE_DATA_KEY,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.log("Profile saving error:", error);
      Alert.alert("Error", "Unable to save profile information.");
    }
  };

  // Automatically save information whenever a field changes
  const updateField = async (field, value) => {
    const updatedData = {
      name,
      age,
      height,
      weight,
      goal,
      [field]: value,
    };

    if (field === "name") setName(value);
    if (field === "age") setAge(value);
    if (field === "height") setHeight(value);
    if (field === "weight") setWeight(value);
    if (field === "goal") setGoal(value);

    await saveProfileData(updatedData);
  };

  // Select photo from gallery
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to select your profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
        setProfileImage(imageUri);

        Alert.alert("Success", "Profile photo saved successfully!");
      }
    } catch (error) {
      console.log("Photo selection error:", error);
      Alert.alert("Error", "Unable to save profile photo.");
    }
  };

  // Remove profile photo
  const removeImage = () => {
    Alert.alert(
      "Remove Photo",
      "Do you want to remove your profile photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
              setProfileImage(null);
            } catch (error) {
              console.log("Photo removal error:", error);
              Alert.alert("Error", "Unable to remove photo.");
            }
          },
        },
      ]
    );
  };

  // Save button
  const saveProfile = async () => {
    await saveProfileData({
      name,
      age,
      height,
      weight,
      goal,
    });

    setEditing(false);
    Alert.alert("Success", "Your profile has been saved successfully!");
  };

  // Cancel editing and reload saved information
  const cancelEditing = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PROFILE_DATA_KEY);

      if (savedData) {
        const profile = JSON.parse(savedData);

        setName(profile.name ?? DEFAULT_PROFILE.name);
        setAge(profile.age ?? DEFAULT_PROFILE.age);
        setHeight(profile.height ?? DEFAULT_PROFILE.height);
        setWeight(profile.weight ?? DEFAULT_PROFILE.weight);
        setGoal(profile.goal ?? DEFAULT_PROFILE.goal);
      }

      setEditing(false);
    } catch (error) {
      console.log("Profile cancel error:", error);
    }
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from FitTrack?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Logout",
          style: "destructive",
          onPress: () => {
            setEditing(false);
            onLogout?.();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>My Profile</Text>
      <Text style={styles.subtitle}>
        Manage your fitness details
      </Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={42} color={GREEN} />
            </View>
          )}

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={pickImage}
          >
            <Ionicons name="camera" size={19} color={BG} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.member}>FITTRACK MEMBER</Text>

        <View style={styles.badge}>
          <Ionicons name="trophy" size={15} color={GREEN} />
          <Text style={styles.badgeText}>Fitness Enthusiast</Text>
        </View>

        {profileImage && (
          <TouchableOpacity onPress={removeImage}>
            <Text style={styles.removePhoto}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <TouchableOpacity
          onPress={() => {
            if (editing) {
              cancelEditing();
            } else {
              setEditing(true);
            }
          }}
        >
          <Text style={styles.editText}>
            {editing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(value) => updateField("name", value)}
          editable={editing}
          placeholder="Enter your name"
          placeholderTextColor={GRAY}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(value) => updateField("age", value)}
          editable={editing}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={(value) => updateField("height", value)}
          editable={editing}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={(value) => updateField("weight", value)}
          editable={editing}
          keyboardType="decimal-pad"
        />

        {editing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProfile}
          >
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Fitness Goal</Text>

      <View style={styles.goalCard}>
        {["Lose Weight", "Build Muscle", "Stay Fit"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.goalOption,
              goal === item && styles.selectedGoal,
            ]}
            onPress={() => updateField("goal", item)}
          >
            <Ionicons
              name={
                item === "Lose Weight"
                  ? "trending-down"
                  : item === "Build Muscle"
                  ? "barbell-outline"
                  : "heart-outline"
              }
              size={21}
              color={goal === item ? GREEN : GRAY}
            />

            <Text
              style={[
                styles.goalText,
                goal === item && styles.selectedGoalText,
              ]}
            >
              {item}
            </Text>

            {goal === item && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={GREEN}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingsRow}>
          <Ionicons
            name="footsteps-outline"
            size={22}
            color={GREEN}
          />
          <Text style={styles.settingsText}>Daily Step Goal</Text>
          <Text style={styles.settingsValue}>10,000</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.settingsRow}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={GREEN}
          />
          <Text style={styles.settingsText}>Notifications</Text>
          <Ionicons
            name="checkmark-circle"
            size={19}
            color={GREEN}
          />
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={21} color="#FF7777" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        FITTRACK • YOUR FITNESS PARTNER
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },
  heading: {
    color: WHITE,
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    color: GRAY,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 25,
  },
  profileCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 28,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    position: "relative",
    marginBottom: 13,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#293521",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: GREEN,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: CARD,
  },
  name: {
    color: WHITE,
    fontSize: 21,
    fontWeight: "800",
  },
  member: {
    color: GRAY,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#293521",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
  },
  badgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
  },
  removePhoto: {
    color: "#FF7777",
    fontSize: 12,
    marginTop: 15,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  editText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 17,
    marginBottom: 28,
  },
  label: {
    color: GRAY,
    fontSize: 12,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    color: WHITE,
    backgroundColor: "#252D27",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: BG,
    fontWeight: "800",
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 12,
    marginBottom: 25,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 12,
  },
  selectedGoal: {
    backgroundColor: "#293521",
  },
  goalText: {
    flex: 1,
    color: GRAY,
    fontSize: 14,
  },
  selectedGoalText: {
    color: GREEN,
    fontWeight: "700",
  },
  settingsCard: {
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 17,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  settingsText: {
    color: WHITE,
    fontSize: 13,
    flex: 1,
  },
  settingsValue: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#303832",
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2A1D1D",
    borderWidth: 1,
    borderColor: "#633737",
    padding: 15,
    borderRadius: 14,
    marginTop: 25,
  },
  logoutText: {
    color: "#FF7777",
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    color: GRAY,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 25,
  },
});
