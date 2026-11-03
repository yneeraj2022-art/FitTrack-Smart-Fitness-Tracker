import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthScreen from "./AuthScreen";
import ActivityScreen from "./ActivityScreen";
import HistoryScreen from "./HistoryScreen";
import ProfileScreen from "./ProfileScreen";
import BMIScreen from "./BMIScreen";
import WaterScreen from "./WaterScreen";

const COLORS = {
  background: "#071109",
  card: "#142619",
  accent: "#B8F36B",
  white: "#FFFFFF",
  muted: "#9BA99C",
  border: "#263A2A",
};

const HISTORY_KEY = "fittrack_workout_history";

const tabs = [
  { name: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "Activity", icon: "barbell-outline", activeIcon: "barbell" },
  { name: "History", icon: "calendar-outline", activeIcon: "calendar" },
  { name: "BMI", icon: "fitness-outline", activeIcon: "fitness" },
  { name: "Water", icon: "water-outline", activeIcon: "water" },
  { name: "Profile", icon: "person-outline", activeIcon: "person" },
];

// Local date helpers
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getWorkoutDate = (workout) => {
  const date = new Date(workout.date);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDuration = (seconds) => {
  const minutes = Math.floor((seconds || 0) / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) return `${hours}h ${remainingMinutes}m`;

  return `${minutes} min`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workouts, setWorkouts] = useState([]);

  // Load workout history whenever Home is opened
  const loadWorkouts = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(HISTORY_KEY);
      const parsed = saved ? JSON.parse(saved) : [];

      if (Array.isArray(parsed)) {
        setWorkouts(parsed);
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      console.log("Dashboard history error:", error);
      setWorkouts([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === "Home") {
      loadWorkouts();
    }
  }, [isAuthenticated, activeTab, loadWorkouts]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("Home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("Home");
    setWorkouts([]);
  };

  const todayKey = getDateKey(new Date());

  const todayWorkouts = workouts.filter((workout) => {
    const date = getWorkoutDate(workout);

    return date && getDateKey(date) === todayKey;
  });

  const totalCalories = todayWorkouts.reduce(
    (sum, workout) => sum + (Number(workout.calories) || 0),
    0
  );

  const todaySeconds = todayWorkouts.reduce(
    (sum, workout) =>
      sum + (Number(workout.durationSeconds) || 0),
    0
  );

  const totalSeconds = workouts.reduce(
    (sum, workout) =>
      sum + (Number(workout.durationSeconds) || 0),
    0
  );

  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const key = getDateKey(date);

    const seconds = workouts.reduce((sum, workout) => {
      const workoutDate = getWorkoutDate(workout);

      if (workoutDate && getDateKey(workoutDate) === key) {
        return sum + (Number(workout.durationSeconds) || 0);
      }

      return sum;
    }, 0);

    return {
      day: date
        .toLocaleDateString("en-US", { weekday: "short" })
        .slice(0, 1),
      minutes: Math.round(seconds / 60),
    };
  });

  const weeklyMinutes = weeklyData.reduce(
    (sum, item) => sum + item.minutes,
    0
  );

  const maxWeeklyMinutes = Math.max(
    ...weeklyData.map((item) => item.minutes),
    30
  );

  const recentWorkouts = [...workouts]
    .sort((a, b) => {
      return (
        (getWorkoutDate(b)?.getTime() || 0) -
        (getWorkoutDate(a)?.getTime() || 0)
      );
    })
    .slice(0, 3);

  // Home Dashboard
  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <ImageBackground
        source={require("./assets/fittrack-runner-header.png")}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay}>
          <View style={styles.topBar}>
            <View style={styles.brandContainer}>
              <View style={styles.logoIcon}>
                <Ionicons
                  name="fitness"
                  size={22}
                  color={COLORS.background}
                />
              </View>

              <Text style={styles.logoText}>FitTrack</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.white}
                />

                <View style={styles.notificationDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => setActiveTab("Profile")}
              >
                <Ionicons
                  name="person"
                  size={21}
                  color={COLORS.accent}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Good to see you,</Text>

            <Text style={styles.greetingName}>
              Let's get moving!
            </Text>

            <Text style={styles.greetingSubtitle}>
              Every workout brings you closer to your goals.
            </Text>
          </View>

          <View style={styles.datePill}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={COLORS.accent}
            />

            <Text style={styles.dateText}>
              YOUR DAILY FITNESS
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* Today's Workout Summary */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <Text style={styles.sectionSubtitle}>Real workout data</Text>
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityTop}>
          <View>
            <Text style={styles.cardLabel}>
              COMPLETED WORKOUTS
            </Text>

            <Text style={styles.stepNumber}>
              {todayWorkouts.length}
            </Text>

            <Text style={styles.goalText}>
              {todayWorkouts.length === 1
                ? "Workout completed"
                : "Workouts completed"}
            </Text>
          </View>

          <View style={styles.stepIconCircle}>
            <Ionicons
              name="barbell"
              size={30}
              color={COLORS.accent}
            />
          </View>
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>
            Active time: {formatDuration(todaySeconds)}
          </Text>

          <Text style={styles.progressText}>
            {totalCalories} kcal burned
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>

        <Text style={styles.sectionSubtitle}>
          Based on saved workouts
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="flame-outline"
          label="Today's Calories"
          value={totalCalories}
          unit="kcal"
          color="#FF9D5C"
        />

        <StatCard
          icon="barbell-outline"
          label="Total Workouts"
          value={workouts.length}
          unit="workouts"
          color="#72C7FF"
        />

        <StatCard
          icon="time-outline"
          label="Today's Active Time"
          value={Math.round(todaySeconds / 60)}
          unit="min"
          color="#B8F36B"
        />

        <StatCard
          icon="trophy-outline"
          label="Total Active Time"
          value={Math.round(totalSeconds / 60)}
          unit="min"
          color="#D59BFF"
        />
      </View>

      {/* Weekly Progress */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>

        <TouchableOpacity
          onPress={() => setActiveTab("History")}
        >
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartValue}>
              {weeklyMinutes} min
            </Text>

            <Text style={styles.chartCaption}>
              Workout time in the last 7 days
            </Text>
          </View>

          <View style={styles.chartBadge}>
            <Ionicons
              name="trending-up"
              size={15}
              color={COLORS.accent}
            />

            <Text style={styles.chartBadgeText}>
              This week
            </Text>
          </View>
        </View>

        <View style={styles.chart}>
          {weeklyData.map((item, index) => (
            <View
              style={styles.barColumn}
              key={`${item.day}-${index}`}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${
                        item.minutes > 0
                          ? Math.max(
                              (item.minutes / maxWeeklyMinutes) * 100,
                              5
                            )
                          : 0
                      }%`,
                      backgroundColor:
                        index === 6
                          ? COLORS.accent
                          : "#36523A",
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.barLabel,
                  index === 6 && styles.activeBarLabel,
                ]}
              >
                {item.day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>

        <TouchableOpacity
          onPress={() => setActiveTab("History")}
        >
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {recentWorkouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="fitness-outline"
            size={35}
            color={COLORS.accent}
          />

          <Text style={styles.emptyTitle}>
            No workouts yet
          </Text>

          <Text style={styles.emptyText}>
            Complete your first workout and it will appear here.
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setActiveTab("Activity")}
          >
            <Text style={styles.startButtonText}>
              Start Workout
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color={COLORS.background}
            />
          </TouchableOpacity>
        </View>
      ) : (
        recentWorkouts.map((workout, index) => {
          const date = getWorkoutDate(workout);

          return (
            <View
              style={styles.recentCard}
              key={workout.id || index}
            >
              <View style={styles.workoutIcon}>
                <Ionicons
                  name="barbell-outline"
                  size={25}
                  color={COLORS.accent}
                />
              </View>

              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>
                  {workout.name || "Workout"}
                </Text>

                <Text style={styles.workoutSubtitle}>
                  {workout.category || "Fitness"} •{" "}
                  {date
                    ? date.toLocaleDateString()
                    : "Date unavailable"}
                </Text>

                <Text style={styles.workoutDetails}>
                  {formatDuration(workout.durationSeconds)} •{" "}
                  {Number(workout.calories) || 0} kcal
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.accent}
              />
            </View>
          );
        })
      )}

      {/* Start Workout */}
      <View style={styles.workoutCard}>
        <View style={styles.workoutIcon}>
          <Ionicons
            name="barbell-outline"
            size={30}
            color={COLORS.accent}
          />
        </View>

        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>
            Ready for more?
          </Text>

          <Text style={styles.workoutSubtitle}>
            Start your next workout
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setActiveTab("Activity")}
        >
          <Text style={styles.startButtonText}>Start</Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color={COLORS.background}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Keep going! Small progress is still progress.
      </Text>
    </ScrollView>
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return renderHome();

      case "Activity":
        return <ActivityScreen />;

      case "History":
        return <HistoryScreen />;

      case "BMI":
        return <BMIScreen />;

      case "Water":
        return <WaterScreen />;

      case "Profile":
        return <ProfileScreen onLogout={handleLogout} />;

      default:
        return renderHome();
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      <View style={styles.bottomNavigation}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.name)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={
                  isActive ? COLORS.accent : COLORS.muted
                }
              />

              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}
              >
                {tab.name}
              </Text>

              {isActive && (
                <View style={styles.activeTabDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Statistics Card
function StatCard({ icon, label, value, unit, color }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <View
          style={[
            styles.statIcon,
            { backgroundColor: `${color}18` },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={color}
          />
        </View>

        <Ionicons
          name="ellipsis-horizontal"
          size={18}
          color={COLORS.muted}
        />
      </View>

      <Text style={styles.statLabel}>{label}</Text>

      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screenContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },

  headerBackground: {
    height: 260,
    marginHorizontal: -16,
    marginBottom: 22,
    overflow: "hidden",
    backgroundColor: "#102016",
    justifyContent: "flex-start",
  },

  headerImage: {
    opacity: 0.9,
  },

  headerOverlay: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 42,
    backgroundColor: "rgba(4, 12, 6, 0.28)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  greetingContainer: {
    marginTop: 30,
  },

  greeting: {
    color: "#E4EAE4",
    fontSize: 17,
    fontWeight: "500",
  },

  greetingName: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 3,
  },

  greetingSubtitle: {
    color: "#D0D8D0",
    fontSize: 12,
    marginTop: 7,
  },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(8,20,10,0.7)",
    marginTop: 15,
  },

  dateText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 7,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
  },

  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 23,
  },

  activityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  stepNumber: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
  },

  goalText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },

  stepIconCircle: {
    width: 57,
    height: 57,
    borderRadius: 30,
    backgroundColor: "#293E2B",
    alignItems: "center",
    justifyContent: "center",
  },

  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 17,
  },

  progressText: {
    color: COLORS.muted,
    fontSize: 10,
  },

  // Statistics
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
    rowGap: 11,
  },

  statCard: {
    width: "48.3%",
    minHeight: 119,
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
  },

  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 9,
  },

  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginTop: 2,
  },

  statValue: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "800",
  },

  statUnit: {
    color: COLORS.muted,
    fontSize: 10,
  },

  // Weekly Chart
  seeAll: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "700",
  },

  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chartValue: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "800",
  },

  chartCaption: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  chartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#293E2B",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  chartBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
  },

  chart: {
    height: 125,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginTop: 18,
  },

  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },

  barTrack: {
    height: 100,
    width: 17,
    borderRadius: 10,
    backgroundColor: "#233527",
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  bar: {
    width: "100%",
    borderRadius: 10,
  },

  barLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 8,
  },

  activeBarLabel: {
    color: COLORS.accent,
    fontWeight: "800",
  },

  // Empty State
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
  },

  // Workout Cards
  recentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  workoutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  workoutIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: "#293E2B",
    alignItems: "center",
    justifyContent: "center",
  },

  workoutInfo: {
    flex: 1,
    marginLeft: 12,
  },

  workoutTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  workoutSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },

  workoutDetails: {
    color: COLORS.accent,
    fontSize: 11,
    marginTop: 5,
    fontWeight: "700",
  },

  startButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  startButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "800",
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 8,
  },

  // Bottom Navigation
  bottomNavigation: {
    height: 68,
    backgroundColor: "#101B12",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    height: "100%",
  },

  tabLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "500",
  },

  activeTabLabel: {
    color: COLORS.accent,
    fontWeight: "800",
  },

  activeTabDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 1,
  },
});