import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { HabitCard } from "@/components/habit-card";
import { AddHabitModal } from "@/components/add-habit-modal";
import { getHabits, getCompletions, toggleCompletion, deleteHabit, saveHabit } from "@/lib/storage";
import { enrichHabitWithStats, getTodayString, isHabitScheduledForDate } from "@/lib/habit-utils";
import type { Habit, HabitCompletion, HabitWithStats } from "@/lib/types";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      const allHabits = await getHabits();
      const completions = await getCompletions();
      
      // Filter habits scheduled for today
      const today = new Date();
      const todayHabits = allHabits.filter((habit) =>
        isHabitScheduledForDate(habit, today)
      );
      
      const enrichedHabits = todayHabits.map((habit) =>
        enrichHabitWithStats(habit, completions)
      );
      
      // Sort: incomplete first, then completed
      enrichedHabits.sort((a, b) => {
        if (a.isCompletedToday === b.isCompletedToday) return 0;
        return a.isCompletedToday ? 1 : -1;
      });
      
      setHabits(enrichedHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHabits();
  }, [loadHabits]);

  const handleToggle = useCallback(
    async (habitId: string) => {
      try {
        const today = getTodayString();
        await toggleCompletion(habitId, today);
        await loadHabits();
      } catch (error) {
        console.error("Error toggling habit:", error);
        Alert.alert("Error", "Failed to update habit completion");
      }
    },
    [loadHabits]
  );

  const handleEdit = useCallback(async (habitId: string) => {
    const allHabits = await getHabits();
    const habit = allHabits.find((h) => h.id === habitId);
    if (habit) {
      setEditingHabit(habit);
      setModalVisible(true);
    }
  }, []);

  const handleDelete = useCallback(
    (habitId: string) => {
      Alert.alert(
        "Delete Habit",
        "Are you sure you want to delete this habit? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteHabit(habitId);
                await loadHabits();
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (error) {
                console.error("Error deleting habit:", error);
                Alert.alert("Error", "Failed to delete habit");
              }
            },
          },
        ]
      );
    },
    [loadHabits]
  );

  const handleAddHabit = () => {
    setEditingHabit(null);
    setModalVisible(true);
  };

  const handleSaveHabit = async (habitData: Omit<Habit, "id" | "createdAt">) => {
    try {
      const habit: Habit = editingHabit
        ? { ...editingHabit, ...habitData }
        : {
            ...habitData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
      
      await saveHabit(habit);
      await loadHabits();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error saving habit:", error);
      Alert.alert("Error", "Failed to save habit");
    }
  };

  const completedCount = habits.filter((h) => h.isCompletedToday).length;
  const totalCount = habits.length;

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading habits...</Text>
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
          <Text className="text-3xl font-bold text-foreground">Today</Text>
          <Text className="text-base text-muted mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          {totalCount > 0 && (
            <View className="mt-3 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-muted">Progress</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {completedCount} / {totalCount}
              </Text>
              <View className="mt-2 h-2 bg-muted/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-success rounded-full"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Habits List */}
        {habits.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">No habits yet</Text>
            <Text className="text-base text-muted text-center mb-6 px-8">
              Start building better habits by adding your first one
            </Text>
            <TouchableOpacity
              onPress={handleAddHabit}
              className="bg-primary px-6 py-3 rounded-full active:opacity-80"
            >
              <Text className="text-white font-semibold">Add Your First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddHabitModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      {/* Floating Action Button */}
      {habits.length > 0 && (
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={handleAddHabit}
            className="bg-primary w-14 h-14 rounded-full items-center justify-center active:opacity-80 shadow-lg"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
