import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Habit, HabitCompletion } from "./types";

const HABITS_KEY = "habits";
const COMPLETIONS_KEY = "completions";

/**
 * Storage service for managing habits and completions using AsyncStorage
 */

// Habits CRUD
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading habits:", error);
    return [];
  }
}

export async function saveHabit(habit: Habit): Promise<void> {
  try {
    const habits = await getHabits();
    const existingIndex = habits.findIndex((h) => h.id === habit.id);
    
    if (existingIndex >= 0) {
      habits[existingIndex] = habit;
    } else {
      habits.push(habit);
    }
    
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Error saving habit:", error);
    throw error;
  }
}

export async function deleteHabit(habitId: string): Promise<void> {
  try {
    const habits = await getHabits();
    const filtered = habits.filter((h) => h.id !== habitId);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
    
    // Also delete all completions for this habit
    const completions = await getCompletions();
    const filteredCompletions = completions.filter((c) => c.habitId !== habitId);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filteredCompletions));
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
}

// Completions CRUD
export async function getCompletions(): Promise<HabitCompletion[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading completions:", error);
    return [];
  }
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
  try {
    const completions = await getCompletions();
    const existing = completions.find(
      (c) => c.habitId === habitId && c.date === date
    );
    
    if (existing) {
      // Toggle existing completion
      existing.completed = !existing.completed;
    } else {
      // Create new completion
      completions.push({ habitId, date, completed: true });
    }
    
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    
    // Return the new completion state
    const updated = completions.find((c) => c.habitId === habitId && c.date === date);
    return updated?.completed ?? false;
  } catch (error) {
    console.error("Error toggling completion:", error);
    throw error;
  }
}

export async function getCompletionsForHabit(habitId: string): Promise<HabitCompletion[]> {
  const completions = await getCompletions();
  return completions.filter((c) => c.habitId === habitId);
}

export async function getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
  const completions = await getCompletions();
  return completions.filter((c) => c.date === date);
}
