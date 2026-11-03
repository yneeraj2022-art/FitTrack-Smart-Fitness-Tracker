
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GREEN = "#B8F36B";
const CARD = "#1B211D";
const WHITE = "#FFFFFF";
const GRAY = "#929B94";
const HISTORY_KEY = "fittrack_workout_history";

const exercises = [
  {
    id: 1,
    name: "Push-ups",
    category: "Strength",
    duration: "10 min",
    durationMinutes: 10,
    calories: 60,
    icon: "barbell-outline",
    level: "Beginner",
  },
  {
    id: 2,
    name: "Squats",
    category: "Strength",
    duration: "15 min",
    durationMinutes: 15,
    calories: 90,
    icon: "fitness-outline",
    level: "Beginner",
  },
  {
    id: 3,
    name: "Running",
    category: "Cardio",
    duration: "20 min",
    durationMinutes: 20,
    calories: 180,
    icon: "walk-outline",
    level: "Intermediate",
  },
  {
    id: 4,
    name: "Cycling",
    category: "Cardio",
    duration: "25 min",
    durationMinutes: 25,
    calories: 200,
    icon: "bicycle-outline",
    level: "Intermediate",
  },
  {
    id: 5,
    name: "Yoga Flow",
    category: "Yoga",
    duration: "20 min",
    durationMinutes: 20,
    calories: 80,
    icon: "body-outline",
    level: "Beginner",
  },
  {
    id: 6,
    name: "Plank",
    category: "Strength",
    duration: "5 min",
    durationMinutes: 5,
    calories: 30,
    icon: "fitness-outline",
    level: "Beginner",
  },
];

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatWeeklyTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
};

export default function ActivityScreen() {
  const [category, setCategory] = useState("All");
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const categories = ["All", "Strength", "Cardio", "Yoga"];

  const filteredExercises =
    category === "All"
      ? exercises
      : exercises.filter((item) => item.category === category);

  // Load saved workout records
  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const savedData = await AsyncStorage.getItem(HISTORY_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setWorkoutHistory(Array.isArray(parsedData) ? parsedData : []);
      }
    } catch (error) {
      console.log("Workout history loading error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Workout timer
  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((previous) => previous + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const weeklyRecords = workoutHistory.filter((record) => {
    const recordDate = new Date(record.date).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return (
      !Number.isNaN(recordDate) &&
      recordDate >= sevenDaysAgo &&
      recordDate <= Date.now()
    );
  });

  const weeklySeconds = weeklyRecords.reduce(
    (total, record) => total + (Number(record.durationSeconds) || 0),
    0
  );

  const weeklyCalories = weeklyRecords.reduce(
    (total, record) => total + (Number(record.calories) || 0),
    0
  );

  const weeklyWorkouts = weeklyRecords.length;

  const startWorkout = (exercise) => {
    if (selectedWorkout && !completed) {
      Alert.alert(
        "Workout in progress",
        "Please complete or cancel your current workout before starting another one."
      );
      return;
    }

    setSelectedWorkout(exercise);
    setElapsedSeconds(0);
    setCompleted(false);
    setIsRunning(true);
  };

  const pauseWorkout = () => {
    setIsRunning(false);
  };

  const resumeWorkout = () => {
    setIsRunning(true);
  };

  const cancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout? Your progress will not be saved.",
      [
        { text: "Keep Working Out", style: "cancel" },
        {
          text: "Cancel Workout",
          style: "destructive",
          onPress: () => {
            setIsRunning(false);
            setSelectedWorkout(null);
            setElapsedSeconds(0);
            setCompleted(false);
          },
        },
      ]
    );
  };

  const finishWorkout = async () => {
    if (!selectedWorkout) return;

    if (elapsedSeconds < 1) {
      Alert.alert(
        "Workout not started",
        "Please exercise for at least one second before completing your workout."
      );
      return;
    }

    setIsRunning(false);

    const plannedSeconds = selectedWorkout.durationMinutes * 60;

    // Estimated calories based on elapsed time and exercise estimate
    const estimatedCalories = Math.round(
      selectedWorkout.calories *
        Math.min(elapsedSeconds / plannedSeconds, 1)
    );

    const newRecord = {
      id: `${Date.now()}-${selectedWorkout.id}`,
      name: selectedWorkout.name,
      category: selectedWorkout.category,
      durationSeconds: elapsedSeconds,
      calories: estimatedCalories,
      date: new Date().toISOString(),
    };

    try {
      const updatedHistory = [newRecord, ...workoutHistory];

      await AsyncStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      setWorkoutHistory(updatedHistory);
      setCompleted(true);

      Alert.alert(
        "Workout Completed!",
        `${selectedWorkout.name}\nDuration: ${formatTime(elapsedSeconds)}\nEstimated calories: ${estimatedCalories} kcal`
      );
    } catch (error) {
      console.log("Workout saving error:", error);

      Alert.alert(
        "Saving failed",
        "Workout record could not be saved. Please try again."
      );
    }
  };

  const resetWorkout = () => {
    setSelectedWorkout(null);
    setElapsedSeconds(0);
    setIsRunning(false);
    setCompleted(false);
  };

  const plannedSeconds = selectedWorkout
    ? selectedWorkout.durationMinutes * 60
    : 0;

  const progress = plannedSeconds
    ? Math.min(elapsedSeconds / plannedSeconds, 1)
    : 0;

  const currentEstimatedCalories = selectedWorkout
    ? Math.round(
        selectedWorkout.calories *
          Math.min(elapsedSeconds / plannedSeconds, 1)
      )
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>YOUR FITNESS JOURNEY</Text>

          <Text style={styles.heading}>Workout Activity</Text>

          <Text style={styles.description}>
            Build strength. Stay consistent. Get stronger.
          </Text>
        </View>

        {/* WEEKLY SUMMARY */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>LAST 7 DAYS</Text>

            <Text style={styles.summaryValue}>
              {loadingHistory ? "--" : formatWeeklyTime(weeklySeconds)}
            </Text>

            <Text style={styles.summaryText}>
              Total completed workout time
            </Text>
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons name="barbell" size={32} color={GREEN} />
          </View>
        </View>

        {/* STATISTICS */}
        <View style={styles.statsRow}>
          <View style={styles.smallCard}>
            <Ionicons
              name="flame-outline"
              size={23}
              color={GREEN}
            />

            <Text style={styles.smallValue}>
              {loadingHistory ? "--" : weeklyCalories.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.smallLabel}>
              Estimated kcal
            </Text>
          </View>

          <View style={styles.smallCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={23}
              color={GREEN}
            />

            <Text style={styles.smallValue}>
              {loadingHistory ? "--" : weeklyWorkouts}
            </Text>

            <Text style={styles.smallLabel}>
              Completed workouts
            </Text>
          </View>
        </View>

        {/* CURRENT WORKOUT SESSION */}
        {selectedWorkout && (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>
                {completed ? "Workout Completed!" : "Workout Session"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  completed && styles.completedBadge,
                ]}
              >
                <Text style={styles.statusText}>
                  {completed
                    ? "DONE"
                    : isRunning
                    ? "LIVE"
                    : "PAUSED"}
                </Text>
              </View>
            </View>

            <Text style={styles.sessionName}>
              {selectedWorkout.name}
            </Text>

            <Text style={styles.sessionDetails}>
              {selectedWorkout.category} • {selectedWorkout.level}
            </Text>

            <Text style={styles.timerText}>
              {formatTime(elapsedSeconds)}
            </Text>

            <Text style={styles.timerCaption}>
              {completed ? "Total workout time" : "Elapsed workout time"}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.sessionStats}>
              <Text style={styles.sessionStatText}>
                Target: {selectedWorkout.duration}
              </Text>

              <Text style={styles.sessionStatText}>
                Est. {currentEstimatedCalories} kcal
              </Text>
            </View>

            {!completed ? (
              <>
                {isRunning ? (
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={pauseWorkout}
                  >
                    <Ionicons
                      name="pause"
                      size={18}
                      color={WHITE}
                    />
                    <Text style={styles.pauseText}>Pause Workout</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={resumeWorkout}
                  >
                    <Ionicons
                      name="play"
                      size={18}
                      color="#101311"
                    />
                    <Text style={styles.completeText}>Resume Workout</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={finishWorkout}
                  disabled={elapsedSeconds < 1}
                >
                  <Text style={styles.finishText}>
                    Complete Workout
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelWorkout}
                >
                  <Text style={styles.cancelText}>Cancel Workout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={resetWorkout}
              >
                <Text style={styles.completeText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* WORKOUT CATEGORIES */}
        <Text style={styles.sectionTitle}>Choose Your Workout</Text>

        <View style={styles.categories}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryButton,
                category === item && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* EXERCISE LIST */}
        {filteredExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseIcon}>
              <Ionicons
                name={exercise.icon}
                size={27}
                color={GREEN}
              />
            </View>

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {exercise.name}
              </Text>

              <Text style={styles.exerciseDetails}>
                {exercise.duration} • {exercise.calories} kcal*
              </Text>

              <Text style={styles.level}>
                {exercise.level}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                selectedWorkout && !completed && styles.disabledButton,
              ]}
              onPress={() => startWorkout(exercise)}
              disabled={Boolean(selectedWorkout && !completed)}
            >
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* RECENT COMPLETED WORKOUTS */}
        <Text style={styles.sectionTitle}>Recent Workouts</Text>

        {workoutHistory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="fitness-outline"
              size={30}
              color={GRAY}
            />

            <Text style={styles.emptyTitle}>
              No workouts completed yet
            </Text>

            <Text style={styles.emptyText}>
              Start your first workout and your records will appear here.
            </Text>
          </View>
        ) : (
          workoutHistory.slice(0, 5).map((record) => (
            <View key={record.id} style={styles.historyCard}>
              <View style={styles.historyIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={23}
                  color={GREEN}
                />
              </View>

              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>
                  {record.name}
                </Text>

                <Text style={styles.historyDetails}>
                  {formatTime(Number(record.durationSeconds) || 0)} •{" "}
                  {record.calories} estimated kcal
                </Text>
              </View>

              <Text style={styles.historyDate}>
                {new Date(record.date).toLocaleDateString("en-IN")}
              </Text>
            </View>
          ))
        )}

        {/* INFORMATION */}
        <Text style={styles.note}>
          *Calorie values are estimates, not medical measurements.
          Workout duration is measured by the in-app timer. Records
          are currently saved on this device.
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101311",
  },

  scrollContent: {
    paddingBottom: 25,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 24,
  },

  subtitle: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },

  heading: {
    color: WHITE,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 9,
  },

  description: {
    color: GRAY,
    fontSize: 12,
    marginTop: 8,
  },

  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: "#273329",
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  summaryValue: {
    color: WHITE,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 9,
  },

  summaryText: {
    color: GRAY,
    fontSize: 12,
    marginTop: 5,
  },

  summaryIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#394A35",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginTop: 14,
  },

  smallCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#303831",
  },

  smallValue: {
    color: WHITE,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 12,
  },

  smallLabel: {
    color: GRAY,
    fontSize: 11,
    marginTop: 5,
  },

  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 22,
    marginTop: 30,
    marginBottom: 15,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 17,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: CARD,
  },

  activeCategory: {
    backgroundColor: GREEN,
  },

  categoryText: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "700",
  },

  activeCategoryText: {
    color: "#101311",
  },

  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: CARD,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303831",
  },

  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#354332",
    justifyContent: "center",
    alignItems: "center",
  },

  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },

  exerciseName: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
  },

  exerciseDetails: {
    color: GRAY,
    fontSize: 11,
    marginTop: 5,
  },

  level: {
    color: GREEN,
    fontSize: 10,
    marginTop: 5,
  },

  startButton: {
    backgroundColor: "#354332",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },

  disabledButton: {
    opacity: 0.35,
  },

  startText: {
    color: GREEN,
    fontWeight: "800",
    fontSize: 12,
  },

  sessionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#273329",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: GREEN,
  },

  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sessionTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "800",
  },

  statusBadge: {
    backgroundColor: "#354332",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  completedBadge: {
    backgroundColor: "#3B5836",
  },

  statusText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "900",
  },

  sessionName: {
    color: WHITE,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 14,
  },

  sessionDetails: {
    color: GRAY,
    fontSize: 12,
    marginTop: 7,
  },

  timerText: {
    color: WHITE,
    fontSize: 48,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    fontVariant: ["tabular-nums"],
  },

  timerCaption: {
    color: GRAY,
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },

  progressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: "#405043",
    overflow: "hidden",
    marginTop: 20,
  },

  progressFill: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 10,
  },

  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  sessionStatText: {
    color: GRAY,
    fontSize: 11,
  },

  pauseButton: {
    backgroundColor: "#465348",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },

  pauseText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "900",
  },

  completeButton: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },

  completeText: {
    color: "#101311",
    fontSize: 13,
    fontWeight: "900",
  },

  finishButton: {
    borderWidth: 1,
    borderColor: GREEN,
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 10,
  },

  finishText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 3,
  },

  cancelText: {
    color: "#F28B82",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyCard: {
    marginHorizontal: 20,
    padding: 22,
    backgroundColor: CARD,
    borderRadius: 17,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303831",
  },

  emptyTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyText: {
    color: GRAY,
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },

  historyCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 13,
    backgroundColor: CARD,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303831",
  },

  historyIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#354332",
    alignItems: "center",
    justifyContent: "center",
  },

  historyInfo: {
    flex: 1,
    marginLeft: 11,
  },

  historyName: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
  },

  historyDetails: {
    color: GRAY,
    fontSize: 10,
    marginTop: 5,
  },

  historyDate: {
    color: GRAY,
    fontSize: 9,
  },

  note: {
    color: GRAY,
    fontSize: 10,
    lineHeight: 17,
    marginHorizontal: 22,
    marginTop: 18,
  },
});
