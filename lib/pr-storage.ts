import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersonalRecord } from "./types";

const PR_KEY = "personal_records";

/**
 * Storage service for managing personal records (PRs) using AsyncStorage
 */

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  try {
    const data = await AsyncStorage.getItem(PR_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading personal records:", error);
    return [];
  }
}

export async function savePR(pr: PersonalRecord): Promise<void> {
  try {
    const records = await getPersonalRecords();
    const existingIndex = records.findIndex((r) => r.id === pr.id);

    if (existingIndex >= 0) {
      records[existingIndex] = pr;
    } else {
      records.push(pr);
    }

    await AsyncStorage.setItem(PR_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Error saving PR:", error);
    throw error;
  }
}

export async function deletePR(prId: string): Promise<void> {
  try {
    const records = await getPersonalRecords();
    const filtered = records.filter((r) => r.id !== prId);
    await AsyncStorage.setItem(PR_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting PR:", error);
    throw error;
  }
}

export async function getPRsForLift(liftId: string): Promise<PersonalRecord[]> {
  const records = await getPersonalRecords();
  return records.filter((r) => r.liftId === liftId).sort((a, b) => {
    // Sort by weight descending (highest first)
    return b.weight - a.weight;
  });
}

export async function getMaxPRForLift(liftId: string): Promise<PersonalRecord | null> {
  const records = await getPRsForLift(liftId);
  return records.length > 0 ? records[0] : null;
}

export async function getAllMaxPRs(): Promise<Map<string, PersonalRecord>> {
  const records = await getPersonalRecords();
  const maxPRs = new Map<string, PersonalRecord>();

  // Group by lift and get max weight for each
  const byLift = new Map<string, PersonalRecord[]>();
  records.forEach((pr) => {
    if (!byLift.has(pr.liftId)) {
      byLift.set(pr.liftId, []);
    }
    byLift.get(pr.liftId)!.push(pr);
  });

  // Get max for each lift
  byLift.forEach((prs, liftId) => {
    const maxPR = prs.reduce((max, current) =>
      current.weight > max.weight ? current : max
    );
    maxPRs.set(liftId, maxPR);
  });

  return maxPRs;
}
