import { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { getHabits, getCompletions } from "@/lib/storage";
import { enrichHabitWithStats, formatDate } from "@/lib/habit-utils";
import { getAllMaxPRs } from "@/lib/pr-storage";
import type { HabitWithStats, HabitCompletion, PersonalRecord } from "@/lib/types";
import { MAJOR_LIFTS } from "@/lib/types";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export default function StatisticsScreen() {
  const colors = useColors();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [maxPRs, setMaxPRs] = useState<Map<string, PersonalRecord>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const allHabits = await getHabits();
      const allCompletions = await getCompletions();
      const prs = await getAllMaxPRs();

      const enrichedHabits = allHabits.map((habit) =>
        enrichHabitWithStats(habit, allCompletions)
      );

      enrichedHabits.sort((a, b) => b.currentStreak - a.currentStreak);

      setHabits(enrichedHabits);
      setCompletions(allCompletions);
      setMaxPRs(prs);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const totalHabits = habits.length;
  const activeStreaks = habits.filter((h) => h.currentStreak > 0).length;
  const totalCompletions = completions.filter((c) => c.completed).length;
  const averageCompletionRate =
    totalHabits > 0
      ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / totalHabits)
      : 0;

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getCompletionCountForDate = (date: Date) => {
    const dateString = formatDate(date);
    return completions.filter((c) => c.date === dateString && c.completed).length;
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading statistics...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Statistics</Text>
          <Text className="text-base text-muted mt-1">Track your progress</Text>
        </View>

        {habits.length === 0 && maxPRs.size === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">📊</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">No data yet</Text>
            <Text className="text-base text-muted text-center px-8">
              Start tracking habits and logging PRs to see your statistics
            </Text>
          </View>
        ) : (
          <>
            {/* Overview Cards */}
            <View className="mb-6">
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">Total Habits</Text>
                  <Text className="text-3xl font-bold text-foreground">{totalHabits}</Text>
                </View>
                <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">Active Streaks</Text>
                  <Text className="text-3xl font-bold text-foreground">{activeStreaks}</Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">Total Completions</Text>
                  <Text className="text-3xl font-bold text-foreground">{totalCompletions}</Text>
                </View>
                <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-1">PRs Logged</Text>
                  <Text className="text-3xl font-bold text-foreground">{maxPRs.size}</Text>
                </View>
              </View>
            </View>

            {/* Top PRs */}
            {maxPRs.size > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">Top Lifts</Text>
                <View className="flex-row flex-wrap gap-2">
                  {Array.from(maxPRs.entries())
                    .sort((a, b) => b[1].weight - a[1].weight)
                    .slice(0, 3)
                    .map(([liftId, pr]) => {
                      const lift = MAJOR_LIFTS.find((l) => l.id === liftId);
                      return (
                        <View
                          key={liftId}
                          className="flex-1 bg-surface rounded-xl p-3 border"
                          style={{ borderColor: colors.primary }}
                        >
                          <Text className="text-sm text-muted">{lift?.name}</Text>
                          <Text
                            className="text-2xl font-bold mt-1"
                            style={{ color: colors.primary }}
                          >
                            {pr.weight} {pr.unit}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            )}

            {/* 7-Day Calendar */}
            {habits.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">Last 7 Days</Text>
                <View className="bg-surface rounded-xl p-4 border border-border">
                  <View className="flex-row justify-between">
                    {last7Days.map((date, index) => {
                      const completionCount = getCompletionCountForDate(date);
                      const isToday = formatDate(date) === formatDate(new Date());

                      return (
                        <View key={index} className="items-center">
                          <Text className="text-xs text-muted mb-2">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </Text>
                          <View
                            className={cn(
                              "w-10 h-10 rounded-full items-center justify-center",
                              completionCount > 0 ? "bg-success" : "bg-muted/20",
                              isToday && "border-2 border-primary"
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm font-semibold",
                                completionCount > 0 ? "text-white" : "text-muted"
                              )}
                            >
                              {date.getDate()}
                            </Text>
                          </View>
                          {completionCount > 0 && (
                            <Text className="text-xs text-success font-semibold mt-1">
                              {completionCount}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* Habits List with Stats */}
            {habits.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">Habit Details</Text>
                {habits.map((habit) => (
                  <View
                    key={habit.id}
                    className="bg-surface rounded-xl p-4 mb-3 border border-border"
                  >
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-xl">{habit.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {habit.name}
                        </Text>
                        <Text className="text-sm text-muted">
                          {habit.frequency === "daily" ? "Daily" : "Custom schedule"}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between">
                      <View className="flex-1">
                        <Text className="text-xs text-muted mb-1">Current Streak</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {habit.currentStreak > 0 ? `🔥 ${habit.currentStreak}` : "0"} days
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted mb-1">Longest Streak</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {habit.longestStreak} days
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted mb-1">Completion</Text>
                        <Text className="text-lg font-bold text-foreground">
                          {habit.completionRate}%
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
