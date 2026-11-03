
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BG = "#101311";
const CARD = "#1B211D";
const GREEN = "#B8F36B";
const WHITE = "#FFFFFF";
const GRAY = "#8D968F";
const BLUE = "#55C8F5";

const STORAGE_KEY = "fittrack_water_data";

export default function WaterScreen() {
  const [water, setWater] = useState(0);
  const [goal, setGoal] = useState("2500");
  const [editingGoal, setEditingGoal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved water data
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedData) {
          const data = JSON.parse(savedData);

          // Reset daily intake if the date has changed
          const today = new Date().toDateString();

          if (data.date === today) {
            setWater(data.water || 0);
            setGoal(String(data.goal || 2500));
          } else {
            setWater(0);
            setGoal(String(data.goal || 2500));
          }
        }
      } catch (error) {
        console.log("Water loading error:", error);
      } finally {
        setLoaded(true);
      }
    };

    loadWaterData();
  }, []);

  // Save water data
  const saveWaterData = async (newWater, newGoal) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          water: newWater,
          goal: Number(newGoal),
          date: new Date().toDateString(),
        })
      );
    } catch (error) {
      console.log("Water saving error:", error);
    }
  };

  // Add water
  const addWater = async (amount) => {
    const newWater = water + amount;
    setWater(newWater);
    await saveWaterData(newWater, goal);
  };

  // Remove water
  const removeWater = async () => {
    if (water <= 0) return;

    const newWater = Math.max(0, water - 250);
    setWater(newWater);
    await saveWaterData(newWater, goal);
  };

  // Save daily goal
  const saveGoal = async () => {
    const numericGoal = Number(goal);

    if (!Number.isFinite(numericGoal) || numericGoal < 250 || numericGoal > 10000) {
      Alert.alert(
        "Invalid Goal",
        "Please enter a goal between 250 and 10000 ml."
      );
      return;
    }

    setGoal(String(numericGoal));
    await saveWaterData(water, String(numericGoal));
    setEditingGoal(false);

    Alert.alert("Success", "Daily water goal updated!");
  };

  // Reset today's intake
  const resetWater = () => {
    Alert.alert(
      "Reset Water Intake",
      "Do you want to reset today's water intake?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setWater(0);
            await saveWaterData(0, goal);
          },
        },
      ]
    );
  };

  const dailyGoal = Number(goal) || 2500;
  const progress = Math.min((water / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - water, 0);

  if (!loaded) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Water Intake</Text>
      <Text style={styles.subtitle}>
        Stay hydrated, stay healthy!
      </Text>

      {/* Main Water Card */}
      <View style={styles.mainCard}>
        <View style={styles.waterIcon}>
          <Ionicons name="water" size={35} color={BLUE} />
        </View>

        <Text style={styles.cardLabel}>TODAY'S WATER INTAKE</Text>

        <View style={styles.amountRow}>
          <Text style={styles.waterAmount}>{water}</Text>
          <Text style={styles.mlText}>ml</Text>
        </View>

        <Text style={styles.goalText}>
          Daily goal: {dailyGoal} ml
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {Math.round(progress)}% completed
          </Text>
          <Text style={styles.progressText}>
            {remaining} ml left
          </Text>
        </View>

        {water >= dailyGoal && (
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={19} color={GREEN} />
            <Text style={styles.successText}>
              Daily goal completed!
            </Text>
          </View>
        )}
      </View>

      {/* Add Water */}
      <Text style={styles.sectionTitle}>Add Water</Text>

      <View style={styles.addCard}>
        <View style={styles.glassIcon}>
          <Ionicons name="water-outline" size={30} color={BLUE} />
        </View>

        <View style={styles.glassInfo}>
          <Text style={styles.glassTitle}>One Glass of Water</Text>
          <Text style={styles.glassSubtitle}>250 ml per glass</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addWater(250)}
        >
          <Ionicons name="add" size={25} color={BG} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickButtons}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => addWater(100)}
        >
          <Text style={styles.quickText}>+100 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => addWater(250)}
        >
          <Text style={styles.quickText}>+250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => addWater(500)}
        >
          <Text style={styles.quickText}>+500 ml</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Goal */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Water Goal</Text>

        <TouchableOpacity
          onPress={() => setEditingGoal(!editingGoal)}
        >
          <Text style={styles.editText}>
            {editingGoal ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalCard}>
        {editingGoal ? (
          <>
            <Text style={styles.goalLabel}>Enter your goal (ml)</Text>

            <TextInput
              style={styles.goalInput}
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              placeholder="2500"
              placeholderTextColor={GRAY}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveGoal}
            >
              <Text style={styles.saveText}>Save Goal</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.goalDisplay}>
            <Ionicons name="flag-outline" size={25} color={GREEN} />
            <Text style={styles.goalValue}>{dailyGoal} ml</Text>
          </View>
        )}
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetWater}
      >
        <Ionicons name="refresh-outline" size={19} color="#FF7777" />
        <Text style={styles.resetText}>Reset Today's Intake</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        FITTRACK • DRINK WATER, STAY HEALTHY
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
  mainCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303832",
  },
  waterIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#20323A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  cardLabel: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12,
  },
  waterAmount: {
    color: WHITE,
    fontSize: 43,
    fontWeight: "800",
  },
  mlText: {
    color: BLUE,
    fontSize: 17,
    marginLeft: 7,
  },
  goalText: {
    color: GRAY,
    fontSize: 13,
    marginTop: 5,
  },
  progressBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#343C35",
    borderRadius: 10,
    marginTop: 25,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BLUE,
    borderRadius: 10,
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  progressText: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "600",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
    backgroundColor: "#293521",
    padding: 10,
    borderRadius: 12,
  },
  successText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 12,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 15,
  },
  addCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303832",
  },
  glassIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#20323A",
    justifyContent: "center",
    alignItems: "center",
  },
  glassInfo: {
    flex: 1,
    marginLeft: 12,
  },
  glassTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  glassSubtitle: {
    color: GRAY,
    fontSize: 11,
    marginTop: 5,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  quickButtons: {
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
  },
  quickButton: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#303832",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  quickText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  editText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
  },
  goalCard: {
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 18,
  },
  goalDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  goalValue: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "800",
  },
  goalLabel: {
    color: GRAY,
    fontSize: 12,
    marginBottom: 9,
  },
  goalInput: {
    backgroundColor: "#252D27",
    borderRadius: 10,
    padding: 13,
    color: WHITE,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 13,
  },
  saveText: {
    color: BG,
    fontWeight: "800",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 15,
    marginTop: 22,
    backgroundColor: CARD,
    borderRadius: 13,
  },
  resetText: {
    color: "#FF7777",
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    color: GRAY,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 1.1,
    marginTop: 27,
  },
});
