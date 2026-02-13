import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { MAJOR_LIFTS, type PersonalRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PRDisplayProps {
  lift: (typeof MAJOR_LIFTS)[number];
  personalRecord: PersonalRecord | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PRDisplay({ lift, personalRecord, onEdit, onDelete }: PRDisplayProps) {
  const colors = useColors();

  if (!personalRecord) {
    return (
      <View
        className="rounded-xl p-4 mb-3 border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center mb-2">
          <Text className="text-2xl mr-3">{lift.icon}</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{lift.name}</Text>
            <Text className="text-sm text-muted">No PR recorded</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="rounded-xl p-4 mb-3 border overflow-hidden"
      style={{ borderColor: colors.primary, backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{lift.icon}</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{lift.name}</Text>
            <Text className="text-sm text-muted">
              {new Date(personalRecord.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
            {personalRecord.weight}
          </Text>
          <Text className="text-sm text-muted">{personalRecord.unit}</Text>
        </View>
      </View>

      {personalRecord.notes && (
        <View className="mt-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
          <Text className="text-xs text-muted italic">{personalRecord.notes}</Text>
        </View>
      )}

      {(onEdit || onDelete) && (
        <View className="flex-row gap-2 mt-3">
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="flex-1 py-2 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-semibold text-black">Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="flex-1 py-2 rounded-lg items-center bg-error"
            >
              <Text className="text-sm font-semibold text-white">Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
