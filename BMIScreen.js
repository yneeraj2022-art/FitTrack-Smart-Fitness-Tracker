
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#101311",
  card: "#1B211D",
  accent: "#B8F36B",
  white: "#FFFFFF",
  muted: "#999999",
  blue: "#63A9E8",
  yellow: "#F5C45E",
  red: "#EF7777",
};

export default function BMIScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [advice, setAdvice] = useState("");
  const [categoryColor, setCategoryColor] = useState(COLORS.accent);
  const [healthyRange, setHealthyRange] = useState("");

  const calculateBMI = () => {
    const h = Number(height);
    const w = Number(weight);

    if (
      !height.trim() ||
      !weight.trim() ||
      !Number.isFinite(h) ||
      !Number.isFinite(w) ||
      h <= 0 ||
      w <= 0
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter valid height and weight."
      );
      return;
    }

    if (h < 50 || h > 250 || w < 10 || w > 500) {
      Alert.alert(
        "Check Your Values",
        "Enter height between 50–250 cm and weight between 10–500 kg."
      );
      return;
    }

    const heightInMeters = h / 100;
    const result = w / (heightInMeters * heightInMeters);

    let resultCategory = "";
    let resultAdvice = "";
    let resultColor = COLORS.accent;

    if (result < 18.5) {
      resultCategory = "Underweight";
      resultAdvice =
        "Your BMI is below the standard adult range. Consider discussing your nutrition and weight goals with a healthcare professional.";
      resultColor = COLORS.blue;
    } else if (result < 25) {
      resultCategory = "Normal Weight";
      resultAdvice =
        "Your BMI is within the standard adult range. Continue maintaining balanced nutrition, regular physical activity and healthy habits.";
      resultColor = COLORS.accent;
    } else if (result < 30) {
      resultCategory = "Overweight";
      resultAdvice =
        "Your BMI is above the standard adult range. Balanced nutrition and regular physical activity may help. Consider professional guidance.";
      resultColor = COLORS.yellow;
    } else {
      resultCategory = "Obesity";
      resultAdvice =
        "Your BMI is in the obesity range. Consider discussing your health and weight goals with a healthcare professional.";
      resultColor = COLORS.red;
    }

    const minimumWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const maximumWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);

    setBmi(result.toFixed(1));
    setCategory(resultCategory);
    setAdvice(resultAdvice);
    setCategoryColor(resultColor);
    setHealthyRange(`${minimumWeight} - ${maximumWeight} kg`);
  };

  const resetBMI = () => {
    setHeight("");
    setWeight("");
    setBmi(null);
    setCategory("");
    setAdvice("");
    setCategoryColor(COLORS.accent);
    setHealthyRange("");
  };

  const getIndicatorPosition = () => {
    const value = Number(bmi);

    // Visual scale is capped at BMI 40.
    const position = Math.min(Math.max((value / 40) * 100, 0), 100);

    return `${position}%`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>BMI Calculator</Text>
          <Text style={styles.subtitle}>
            Know your body fitness level
          </Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons
            name="fitness-outline"
            size={28}
            color={COLORS.accent}
          />
        </View>
      </View>

      {/* Information */}
      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={COLORS.accent}
        />
        <Text style={styles.infoText}>
          Enter your height and weight to calculate your Body Mass Index.
        </Text>
      </View>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Height (cm)</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="resize-outline"
            size={22}
            color={COLORS.accent}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter height (e.g. 175)"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.unit}>cm</Text>
        </View>

        <Text style={styles.label}>Weight (kg)</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="barbell-outline"
            size={22}
            color={COLORS.accent}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter weight (e.g. 70)"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />

          <Text style={styles.unit}>kg</Text>
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculateBMI}
          activeOpacity={0.8}
        >
          <Text style={styles.calculateText}>Calculate BMI</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={COLORS.background}
          />
        </TouchableOpacity>
      </View>

      {/* BMI Result */}
      {bmi !== null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your BMI Result</Text>

          <Text style={[styles.bmiValue, { color: categoryColor }]}>
            {bmi}
          </Text>

          <View
            style={[
              styles.categoryBadge,
              { borderColor: categoryColor },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: categoryColor },
              ]}
            />
            <Text style={[styles.category, { color: categoryColor }]}>
              {category}
            </Text>
          </View>

          {/* BMI Scale */}
          <View style={styles.scaleContainer}>
            <View style={styles.scale}>
              <View
                style={[
                  styles.scalePart,
                  { backgroundColor: COLORS.blue },
                ]}
              />
              <View
                style={[
                  styles.scalePart,
                  { backgroundColor: COLORS.accent },
                ]}
              />
              <View
                style={[
                  styles.scalePart,
                  { backgroundColor: COLORS.yellow },
                ]}
              />
              <View
                style={[
                  styles.scalePart,
                  { backgroundColor: COLORS.red },
                ]}
              />
            </View>

            <View
              style={[
                styles.indicator,
                { left: getIndicatorPosition() },
              ]}
            >
              <View style={styles.indicatorArrow} />
              <View style={styles.indicatorDot} />
            </View>
          </View>

          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Low</Text>
            <Text style={styles.scaleLabel}>Normal</Text>
            <Text style={styles.scaleLabel}>High</Text>
          </View>

          {/* Healthy Weight Range */}
          <View style={styles.healthyCard}>
            <View style={styles.healthyIcon}>
              <Ionicons
                name="heart-outline"
                size={22}
                color={COLORS.accent}
              />
            </View>

            <View style={styles.healthyContent}>
              <Text style={styles.healthyTitle}>
                Healthy Weight Range
              </Text>
              <Text style={styles.healthyValue}>
                {healthyRange}
              </Text>
              <Text style={styles.healthyNote}>
                Based on the standard adult BMI range of 18.5–24.9
              </Text>
            </View>
          </View>

          {/* Advice */}
          <View style={styles.adviceContainer}>
            <View style={styles.adviceHeading}>
              <Ionicons
                name="bulb-outline"
                size={20}
                color={COLORS.accent}
              />
              <Text style={styles.adviceTitle}>Health Guidance</Text>
            </View>

            <Text style={styles.advice}>{advice}</Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetBMI}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={COLORS.accent}
            />
            <Text style={styles.resetText}>Calculate Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BMI Categories */}
      <View style={styles.categoryCard}>
        <Text style={styles.categoryTitle}>BMI Categories</Text>

        <View style={styles.categoryRow}>
          <View style={styles.categoryLeft}>
            <View
              style={[styles.legendDot, { backgroundColor: COLORS.blue }]}
            />
            <Text style={styles.categoryName}>Underweight</Text>
          </View>
          <Text style={styles.categoryRange}>Below 18.5</Text>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryLeft}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS.accent },
              ]}
            />
            <Text style={styles.categoryName}>Normal Weight</Text>
          </View>
          <Text style={styles.categoryRange}>18.5 – 24.9</Text>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryLeft}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: COLORS.yellow },
              ]}
            />
            <Text style={styles.categoryName}>Overweight</Text>
          </View>
          <Text style={styles.categoryRange}>25 – 29.9</Text>
        </View>

        <View style={[styles.categoryRow, styles.lastCategoryRow]}>
          <View style={styles.categoryLeft}>
            <View
              style={[styles.legendDot, { backgroundColor: COLORS.red }]}
            />
            <Text style={styles.categoryName}>Obesity</Text>
          </View>
          <Text style={styles.categoryRange}>30 or above</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Ionicons
          name="alert-circle-outline"
          size={18}
          color={COLORS.yellow}
        />
        <Text style={styles.disclaimer}>
          BMI is a screening measure, not a diagnosis. These categories
          are intended for adults. BMI may not be appropriate for children,
          teenagers, pregnant people or athletes. Consult a healthcare
          professional for personal advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  heading: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },

  iconCircle: {
    backgroundColor: "#263322",
    padding: 13,
    borderRadius: 16,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 14,
    marginBottom: 20,
    gap: 10,
  },

  infoText: {
    color: "#CCCCCC",
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 18,
  },

  label: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#343C35",
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    color: COLORS.white,
    padding: 14,
    fontSize: 15,
  },

  unit: {
    color: COLORS.accent,
    fontWeight: "bold",
  },

  calculateButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  calculateText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "bold",
  },

  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 22,
    marginTop: 20,
    alignItems: "center",
  },

  resultTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  bmiValue: {
    fontSize: 54,
    fontWeight: "bold",
    marginTop: 12,
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginTop: 8,
    marginBottom: 25,
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  category: {
    fontSize: 15,
    fontWeight: "700",
  },

  scaleContainer: {
    width: "100%",
    position: "relative",
    paddingTop: 5,
  },

  scale: {
    flexDirection: "row",
    height: 10,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    gap: 3,
  },

  scalePart: {
    flex: 1,
  },

  indicator: {
    position: "absolute",
    top: -2,
    marginLeft: -7,
    alignItems: "center",
  },

  indicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.white,
  },

  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginTop: 1,
  },

  scaleLabels: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  scaleLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },

  healthyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 15,
    marginTop: 25,
    width: "100%",
    gap: 12,
  },

  healthyIcon: {
    backgroundColor: "#263322",
    padding: 10,
    borderRadius: 12,
  },

  healthyContent: {
    flex: 1,
  },

  healthyTitle: {
    color: COLORS.muted,
    fontSize: 12,
  },

  healthyValue: {
    color: COLORS.accent,
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 4,
  },

  healthyNote: {
    color: "#777777",
    fontSize: 10,
    marginTop: 4,
  },

  adviceContainer: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 15,
    marginTop: 15,
  },

  adviceHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  adviceTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
  },

  advice: {
    color: "#CCCCCC",
    lineHeight: 21,
    fontSize: 13,
    marginTop: 10,
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    padding: 12,
  },

  resetText: {
    color: COLORS.accent,
    fontWeight: "bold",
  },

  categoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
  },

  categoryTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#303630",
  },

  lastCategoryRow: {
    borderBottomWidth: 0,
  },

  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  categoryName: {
    color: "#CCCCCC",
    fontSize: 14,
  },

  categoryRange: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
  },

  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 20,
    paddingHorizontal: 5,
  },

  disclaimer: {
    color: "#888888",
    fontSize: 11,
    lineHeight: 18,
    flex: 1,
  },
});
