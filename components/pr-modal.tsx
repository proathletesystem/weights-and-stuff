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
import { MAJOR_LIFTS, type PersonalRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type LiftId = typeof MAJOR_LIFTS[number]["id"];

interface PRModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (pr: Omit<PersonalRecord, "id">) => void;
  editingPR?: PersonalRecord | null;
}

export function PRModal({ visible, onClose, onSave, editingPR }: PRModalProps) {
  const colors = useColors();
  const [selectedLift, setSelectedLift] = useState<LiftId>(MAJOR_LIFTS[0].id);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingPR) {
      setSelectedLift(editingPR.liftId as LiftId);
      setWeight(editingPR.weight.toString());
      setUnit(editingPR.unit);
      setNotes(editingPR.notes || "");
    } else {
      setSelectedLift(MAJOR_LIFTS[0].id);
      setWeight("");
      setUnit("lbs");
      setNotes("");
    }
  }, [editingPR, visible]);

  const handleSave = () => {
    if (!weight.trim()) {
      Alert.alert("Error", "Please enter a weight");
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert("Error", "Please enter a valid weight");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    onSave({
      liftId: selectedLift,
      weight: weightNum,
      unit,
      date: new Date().toISOString(),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const selectedLiftName =
    MAJOR_LIFTS.find((l) => l.id === selectedLift)?.name || "Select Lift";

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
              <Text className="text-base" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              {editingPR ? "Edit PR" : "Log PR"}
            </Text>
            <TouchableOpacity onPress={handleSave} className="py-2">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.primary }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 py-6">
            {/* Lift Selection */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">
                Select Lift
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {MAJOR_LIFTS.map((lift) => (
                  <TouchableOpacity
                    key={lift.id}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedLift(lift.id as LiftId);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-full",
                      selectedLift === lift.id ? "bg-primary" : "bg-surface"
                    )}
                    style={{
                      borderWidth: 1,
                      borderColor:
                        selectedLift === lift.id ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        selectedLift === lift.id ? "text-black" : "text-foreground"
                      )}
                    >
                      {lift.icon} {lift.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Weight Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Weight
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter weight"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="flex-1 text-base text-foreground bg-surface rounded-xl px-4 py-3 border"
                  style={{ borderColor: colors.border }}
                  returnKeyType="done"
                />
                <View className="flex-row gap-2">
                  {(["lbs", "kg"] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setUnit(u);
                      }}
                      className={cn(
                        "px-4 py-3 rounded-xl",
                        unit === u ? "bg-primary" : "bg-surface"
                      )}
                      style={{
                        borderWidth: 1,
                        borderColor: unit === u ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        className={cn(
                          "font-semibold",
                          unit === u ? "text-black" : "text-foreground"
                        )}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g., 3x5 reps, felt strong"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                className="text-base text-foreground bg-surface rounded-xl px-4 py-3 border"
                style={{ borderColor: colors.border }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
