import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, "id" | "createdAt">) => void;
  editingHabit?: Habit | null;
}

const EMOJI_OPTIONS = [
  "💪", "🏃", "📚", "💧", "🧘", "🎯",
  "✍️", "🎨", "🎵", "🌱", "☕", "🥗",
  "😴", "🧠", "❤️", "🌟", "🔥", "⭐",
  "📝", "🎮", "🏋️", "🚴", "🏊", "⚽",
];

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function AddHabitModal({ visible, onClose, onSave, editingHabit }: AddHabitModalProps) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🎯");
  const [frequency, setFrequency] = useState<"daily" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays by default

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setSelectedIcon(editingHabit.icon);
      setFrequency(editingHabit.frequency);
      setSelectedDays(editingHabit.customDays || [1, 2, 3, 4, 5]);
    } else {
      // Reset form when opening for new habit
      setName("");
      setSelectedIcon("🎯");
      setFrequency("daily");
      setSelectedDays([1, 2, 3, 4, 5]);
    }
  }, [editingHabit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (frequency === "custom" && selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onSave({
      name: name.trim(),
      icon: selectedIcon,
      frequency,
      customDays: frequency === "custom" ? selectedDays : undefined,
    });

    onClose();
  };

  const toggleDay = (day: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-5 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <TouchableOpacity onPress={onClose} className="py-2">
              <Text className="text-base text-primary">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              {editingHabit ? "Edit Habit" : "New Habit"}
            </Text>
            <TouchableOpacity onPress={handleSave} className="py-2">
              <Text className="text-base font-semibold text-primary">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 py-6">
            {/* Habit Name */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">Habit Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Morning Exercise"
                placeholderTextColor={colors.muted}
                className="text-base text-foreground bg-surface rounded-xl px-4 py-3 border"
                style={{ borderColor: colors.border }}
                returnKeyType="done"
                autoFocus
              />
            </View>

            {/* Icon Picker */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">Choose Icon</Text>
              <View className="flex-row flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedIcon(emoji);
                    }}
                    className={cn(
                      "w-14 h-14 items-center justify-center rounded-xl",
                      selectedIcon === emoji ? "bg-primary" : "bg-surface"
                    )}
                    style={{
                      borderWidth: 1,
                      borderColor: selectedIcon === emoji ? colors.primary : colors.border,
                    }}
                  >
                    <Text className="text-2xl">{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">Frequency</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setFrequency("daily");
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl items-center",
                    frequency === "daily" ? "bg-primary" : "bg-surface"
                  )}
                  style={{
                    borderWidth: 1,
                    borderColor: frequency === "daily" ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className={cn(
                      "font-semibold",
                      frequency === "daily" ? "text-white" : "text-foreground"
                    )}
                  >
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setFrequency("custom");
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl items-center",
                    frequency === "custom" ? "bg-primary" : "bg-surface"
                  )}
                  style={{
                    borderWidth: 1,
                    borderColor: frequency === "custom" ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className={cn(
                      "font-semibold",
                      frequency === "custom" ? "text-white" : "text-foreground"
                    )}
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Days Selection */}
            {frequency === "custom" && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-3">Select Days</Text>
                <View className="flex-row justify-between">
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      onPress={() => toggleDay(day.value)}
                      className={cn(
                        "w-12 h-12 items-center justify-center rounded-full",
                        selectedDays.includes(day.value) ? "bg-primary" : "bg-surface"
                      )}
                      style={{
                        borderWidth: 1,
                        borderColor: selectedDays.includes(day.value)
                          ? colors.primary
                          : colors.border,
                      }}
                    >
                      <Text
                        className={cn(
                          "text-sm font-semibold",
                          selectedDays.includes(day.value) ? "text-white" : "text-foreground"
                        )}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
