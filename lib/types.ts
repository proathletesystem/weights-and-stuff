/**
 * Core data types for the Habit Tracker app
 */

export type Habit = {
  id: string;
  name: string;
  icon: string; // emoji or icon name
  frequency: "daily" | "custom";
  customDays?: number[]; // 0-6, Sunday-Saturday
  createdAt: string; // ISO date string
};

export type HabitCompletion = {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
};

export type HabitWithStats = Habit & {
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-100
  isCompletedToday: boolean;
};
