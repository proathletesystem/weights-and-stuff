import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { PRModal } from "@/components/pr-modal";
import { PRDisplay } from "@/components/pr-display";
import { getPersonalRecords, savePR, deletePR, getAllMaxPRs } from "@/lib/pr-storage";
import { MAJOR_LIFTS, type PersonalRecord } from "@/lib/types";
import { useColors } from "@/hooks/use-colors";

export default function PRsScreen() {
  const colors = useColors();
  const [maxPRs, setMaxPRs] = useState<Map<string, PersonalRecord>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);

  const loadPRs = useCallback(async () => {
    try {
      const prs = await getAllMaxPRs();
      setMaxPRs(prs);
    } catch (error) {
      console.error("Error loading PRs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPRs();
  }, [loadPRs]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPRs();
  }, [loadPRs]);

  const handleAddPR = () => {
    setEditingPR(null);
    setModalVisible(true);
  };

  const handleEditPR = (liftId: string) => {
    const pr = maxPRs.get(liftId);
    if (pr) {
      setEditingPR(pr);
      setModalVisible(true);
    }
  };

  const handleDeletePR = (liftId: string) => {
    const pr = maxPRs.get(liftId);
    if (!pr) return;

    Alert.alert(
      "Delete PR",
      `Are you sure you want to delete this PR for ${MAJOR_LIFTS.find((l) => l.id === liftId)?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePR(pr.id);
              await loadPRs();
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error("Error deleting PR:", error);
              Alert.alert("Error", "Failed to delete PR");
            }
          },
        },
      ]
    );
  };

  const handleSavePR = async (prData: Omit<PersonalRecord, "id">) => {
    try {
      const pr: PersonalRecord = editingPR
        ? { ...editingPR, ...prData }
        : {
            ...prData,
            id: Date.now().toString(),
          };

      await savePR(pr);
      await loadPRs();

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error saving PR:", error);
      Alert.alert("Error", "Failed to save PR");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Loading PRs...</Text>
      </ScreenContainer>
    );
  }

  const totalPRs = maxPRs.size;

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
          <Text className="text-3xl font-bold text-foreground">Personal Records</Text>
          <Text className="text-base text-muted mt-1">Track your best lifts</Text>
          {totalPRs > 0 && (
            <View className="mt-3 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm text-muted">PRs Recorded</Text>
              <Text className="text-3xl font-bold text-foreground mt-1">{totalPRs}</Text>
            </View>
          )}
        </View>

        {/* PRs List */}
        {totalPRs === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">🏋️</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">
              No PRs yet
            </Text>
            <Text className="text-base text-muted text-center mb-6 px-8">
              Start logging your personal records to track your progress
            </Text>
            <TouchableOpacity
              onPress={handleAddPR}
              className="px-6 py-3 rounded-full active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-black font-semibold">Log Your First PR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {MAJOR_LIFTS.map((lift) => (
              <PRDisplay
                key={lift.id}
                lift={lift}
                personalRecord={maxPRs.get(lift.id) || null}
                onEdit={() => handleEditPR(lift.id)}
                onDelete={() => handleDeletePR(lift.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <PRModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingPR(null);
        }}
        onSave={handleSavePR}
        editingPR={editingPR}
      />

      {/* Floating Action Button */}
      {totalPRs > 0 && (
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={handleAddPR}
            className="w-14 h-14 rounded-full items-center justify-center active:opacity-80 shadow-lg"
            style={{
              backgroundColor: colors.primary,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-black text-3xl font-light">+</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
