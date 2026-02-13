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

export type PersonalRecord = {
  id: string;
  liftId: string; // references MAJOR_LIFTS
  weight: number; // in lbs or kg
  unit: "lbs" | "kg";
  date: string; // ISO date string
  notes?: string;
};

export const MAJOR_LIFTS = [
  { id: "bench", name: "Bench Press", icon: "🏋️" },
  { id: "squat", name: "Squat", icon: "🦵" },
  { id: "deadlift", name: "Deadlift", icon: "💪" },
  { id: "overhead", name: "Overhead Press", icon: "⬆️" },
  { id: "barrow", name: "Barbell Row", icon: "↔️" },
  { id: "pullup", name: "Pull-ups", icon: "🧗" },
  { id: "dips", name: "Dips", icon: "🧗‍♂️" },
  { id: "legpress", name: "Leg Press", icon: "📈" },
  { id: "incline", name: "Incline Bench", icon: "📊" },
  { id: "curl", name: "Barbell Curl", icon: "💪" },
] as const;
