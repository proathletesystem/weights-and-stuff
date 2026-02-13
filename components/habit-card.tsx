import { Text, View, Pressable, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import type { HabitWithStats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: string) => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const colors = useColors();
  
  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(habit.id);
  };

  return (
    <View className="mb-3">
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <View className="flex-row items-center flex-1">
          {/* Icon/Emoji */}
          <View
            className={cn(
              "w-12 h-12 rounded-full items-center justify-center mr-3",
              habit.isCompletedToday ? "bg-success" : "bg-muted/20"
            )}
          >
            <Text className="text-2xl">{habit.icon}</Text>
          </View>

          {/* Habit Info */}
          <View className="flex-1">
            <Text
              className={cn(
                "text-base font-semibold",
                habit.isCompletedToday ? "text-muted line-through" : "text-foreground"
              )}
            >
              {habit.name}
            </Text>
            <Text className="text-sm text-muted mt-0.5">
              {habit.currentStreak > 0 ? `🔥 ${habit.currentStreak} day streak` : "Start your streak!"}
            </Text>
          </View>

          {/* Completion Indicator */}
          <View
            className={cn(
              "w-8 h-8 rounded-full items-center justify-center border-2",
              habit.isCompletedToday
                ? "bg-success border-success"
                : "bg-transparent border-muted"
            )}
          >
            {habit.isCompletedToday && (
              <Text className="text-white text-lg font-bold">✓</Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
