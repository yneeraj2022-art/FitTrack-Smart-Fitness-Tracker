import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GREEN = "#B8F36B";
const CARD = "#1B211D";
const WHITE = "#FFFFFF";
const GRAY = "#929A94";
const BG = "#101311";
const HISTORY_KEY = "fittrack_workout_history";

const filters = ["All", "This Week", "This Month"];

const formatDuration = (seconds) => {
  const total = Number(seconds) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes} min ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getWorkoutIcon = (category) => {
  switch (category) {
    case "Cardio":
      return "walk-outline";
    case "Yoga":
      return "body-outline";
    case "Strength":
      return "barbell-outline";
    default:
      return "fitness-outline";
  }
};

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(HISTORY_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
          setWorkoutHistory(parsedData);
        } else {
          setWorkoutHistory([]);
        }
      } else {
        setWorkoutHistory([]);
      }
    } catch (error) {
      console.log("History loading error:", error);
      Alert.alert("Error", "Workout history could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const refreshHistory = async () => {
    setRefreshing(true);
    await loadHistory();
  };

  const now = new Date();

  const filteredHistory = workoutHistory
    .filter((workout) => {
      const date = new Date(workout.date);

      if (Number.isNaN(date.getTime())) return false;

      if (selectedFilter === "This Week") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        return date >= sevenDaysAgo && date <= now;
      }

      if (selectedFilter === "This Month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalWorkouts = filteredHistory.length;

  const totalCalories = filteredHistory.reduce(
    (total, workout) => total + (Number(workout.calories) || 0),
    0
  );

  const totalSeconds = filteredHistory.reduce(
    (total, workout) =>
      total + (Number(workout.durationSeconds) || 0),
    0
  );

  const deleteWorkout = (workoutId) => {
    Alert.alert(
      "Delete Workout",
      "Do you want to remove this workout from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedHistory = workoutHistory.filter(
                (workout) => workout.id !== workoutId
              );

              await AsyncStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(updatedHistory)
              );

              setWorkoutHistory(updatedHistory);
            } catch (error) {
              console.log("Delete workout error:", error);
              Alert.alert("Error", "Workout could not be deleted.");
            }
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
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Workout History</Text>
          <Text style={styles.subtitle}>
            Your fitness progress, in one place
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={refreshHistory}
        >
          <Ionicons
            name="refresh-outline"
            size={23}
            color={GREEN}
          />
        </TouchableOpacity>
      </View>

      {/* SUMMARY */}
      <Text style={styles.summaryHeading}>
        {selectedFilter === "All" ? "All Time Summary" : selectedFilter}
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="barbell-outline" size={20} color={GREEN} />
          </View>

          <Text style={styles.summaryNumber}>{totalWorkouts}</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: "#423126" }]}>
            <Ionicons name="flame-outline" size={20} color="#FF9B58" />
          </View>

          <Text style={styles.summaryNumber}>
            {totalCalories.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.summaryLabel}>Est. Calories</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: "#293747" }]}>
            <Ionicons name="time-outline" size={20} color="#79C9FF" />
          </View>

          <Text style={styles.summaryNumber}>
            {totalSeconds >= 3600
              ? `${(totalSeconds / 3600).toFixed(1)}h`
              : `${Math.floor(totalSeconds / 60)}m`}
          </Text>
          <Text style={styles.summaryLabel}>Duration</Text>
        </View>
      </View>

      {/* FILTERS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Activities</Text>
        <Text style={styles.recordCount}>
          {filteredHistory.length} records
        </Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilter,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.emptyText}>Loading workout history...</Text>
        </View>
      ) : filteredHistory.length === 0 ? (
        /* EMPTY STATE */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="calendar-outline"
              size={35}
              color={GREEN}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No workouts found
          </Text>

          <Text style={styles.emptyText}>
            Complete a workout in the Activity tab. Your completed
            workouts will automatically appear here.
          </Text>
        </View>
      ) : (
        /* WORKOUT LIST */
        filteredHistory.map((workout) => (
          <View key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutIcon}>
              <Ionicons
                name={getWorkoutIcon(workout.category)}
                size={24}
                color={GREEN}
              />
            </View>

            <View style={styles.workoutDetails}>
              <Text style={styles.workoutName}>
                {workout.name || "Workout"}
              </Text>

              <Text style={styles.workoutDate}>
                {formatDate(workout.date)}
              </Text>

              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={GRAY}
                  />
                  <Text style={styles.statText}>
                    {formatDuration(workout.durationSeconds)}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons
                    name="flame-outline"
                    size={13}
                    color={GRAY}
                  />
                  <Text style={styles.statText}>
                    {workout.calories || 0} kcal*
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteWorkout(workout.id)}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#F28B82"
              />
            </TouchableOpacity>

            <View style={styles.completedIcon}>
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={GREEN}
              />
            </View>
          </View>
        ))
      )}

      {/* INFORMATION */}
      <View style={styles.noteCard}>
        <Ionicons
          name="information-circle-outline"
          size={21}
          color={GREEN}
        />

        <Text style={styles.noteText}>
          Workout records are saved locally on this device. Calories
          are estimates, not direct measurements. Deleting a record
          also removes it from the Activity summary.
        </Text>
      </View>

      <View style={{ height: 30 }} />
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },

  heading: {
    color: WHITE,
    fontSize: 25,
    fontWeight: "bold",
  },

  subtitle: {
    color: GRAY,
    fontSize: 12,
    marginTop: 5,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryHeading: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 11,
    minHeight: 125,
    borderWidth: 1,
    borderColor: "#303831",
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#29332A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  summaryNumber: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },

  summaryLabel: {
    color: GRAY,
    fontSize: 10,
    marginTop: 5,
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
  },

  recordCount: {
    color: GRAY,
    fontSize: 11,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: CARD,
  },

  activeFilter: {
    backgroundColor: GREEN,
  },

  filterText: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "700",
  },

  activeFilterText: {
    color: "#101311",
  },

  loadingContainer: {
    padding: 35,
    alignItems: "center",
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303831",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: "#29332A",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 15,
  },

  emptyText: {
    color: GRAY,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },

  workoutCard: {
    marginBottom: 11,
    padding: 13,
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#303831",
  },

  workoutIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#354332",
    justifyContent: "center",
    alignItems: "center",
  },

  workoutDetails: {
    flex: 1,
    marginLeft: 11,
  },

  workoutName: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
  },

  workoutDate: {
    color: GRAY,
    fontSize: 10,
    marginTop: 4,
  },

  workoutStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 7,
    flexWrap: "wrap",
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    color: GRAY,
    fontSize: 10,
  },

  deleteButton: {
    padding: 7,
    marginRight: 3,
  },

  completedIcon: {
    marginLeft: 2,
  },

  noteCard: {
    backgroundColor: "#202B21",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 20,
  },

  noteText: {
    color: GRAY,
    fontSize: 10,
    lineHeight: 17,
    flex: 1,
  },
});
