import type { Habit, HabitCompletion, HabitWithStats } from "./types";

/**
 * Utility functions for habit tracking and calculations
 */

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function getDayOfWeek(date: Date): number {
  return date.getDay(); // 0-6, Sunday-Saturday
}

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  if (habit.frequency === "daily") {
    return true;
  }
  
  if (habit.frequency === "custom" && habit.customDays) {
    const dayOfWeek = getDayOfWeek(date);
    return habit.customDays.includes(dayOfWeek);
  }
  
  return false;
}

export function calculateCurrentStreak(
  habit: Habit,
  completions: HabitCompletion[]
): number {
  const sortedCompletions = completions
    .filter((c) => c.habitId === habit.id && c.completed)
    .map((c) => parseDate(c.date))
    .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

  if (sortedCompletions.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentDate = new Date(today);
  
  // Check if today or yesterday was completed
  const mostRecentCompletion = sortedCompletions[0];
  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - mostRecentCompletion.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // If last completion was more than 1 day ago, streak is broken
  if (daysSinceLastCompletion > 1) {
    return 0;
  }
  
  // Start from today or yesterday
  if (daysSinceLastCompletion === 1) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count consecutive days backwards
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = sortedCompletions[i];
    completionDate.setHours(0, 0, 0, 0);
    
    // Skip days when habit is not scheduled
    while (!isHabitScheduledForDate(habit, currentDate) && streak < 365) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    if (formatDate(completionDate) === formatDate(currentDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(
  habit: Habit,
  completions: HabitCompletion[]
): number {
  const sortedCompletions = completions
    .filter((c) => c.habitId === habit.id && c.completed)
    .map((c) => parseDate(c.date))
    .sort((a, b) => a.getTime() - b.getTime()); // Oldest first

  if (sortedCompletions.length === 0) {
    return 0;
  }

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDate = new Date(sortedCompletions[i - 1]);
    const currDate = new Date(sortedCompletions[i]);
    
    // Find next scheduled day after prevDate
    let nextScheduledDate = new Date(prevDate);
    nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
    
    while (!isHabitScheduledForDate(habit, nextScheduledDate) && currentStreak < 365) {
      nextScheduledDate.setDate(nextScheduledDate.getDate() + 1);
    }
    
    if (formatDate(currDate) === formatDate(nextScheduledDate)) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

export function calculateCompletionRate(
  habit: Habit,
  completions: HabitCompletion[]
): number {
  const habitCompletions = completions.filter((c) => c.habitId === habit.id);
  
  if (habitCompletions.length === 0) {
    return 0;
  }
  
  const createdDate = parseDate(habit.createdAt);
  const today = new Date();
  const daysSinceCreation = Math.floor(
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  
  // Count scheduled days
  let scheduledDays = 0;
  for (let i = 0; i < daysSinceCreation; i++) {
    const checkDate = new Date(createdDate);
    checkDate.setDate(checkDate.getDate() + i);
    if (isHabitScheduledForDate(habit, checkDate)) {
      scheduledDays++;
    }
  }
  
  const completedCount = habitCompletions.filter((c) => c.completed).length;
  
  if (scheduledDays === 0) {
    return 0;
  }
  
  return Math.round((completedCount / scheduledDays) * 100);
}

export function isCompletedToday(
  habitId: string,
  completions: HabitCompletion[]
): boolean {
  const today = getTodayString();
  const todayCompletion = completions.find(
    (c) => c.habitId === habitId && c.date === today
  );
  return todayCompletion?.completed ?? false;
}

export function enrichHabitWithStats(
  habit: Habit,
  completions: HabitCompletion[]
): HabitWithStats {
  return {
    ...habit,
    currentStreak: calculateCurrentStreak(habit, completions),
    longestStreak: calculateLongestStreak(habit, completions),
    completionRate: calculateCompletionRate(habit, completions),
    isCompletedToday: isCompletedToday(habit.id, completions),
  };
}
