import type { AgeGroup, Thresholds } from "./ruleEngine.types";

export const ageThresholds: Record<AgeGroup, Thresholds> = {
  "Thiếu nhi": {
    SBP: { min: 95, max: 100 },
    DBP: { min: 60, max: 65 },
    HR: { min: 60, max: 120 },
  },
  "Thiếu niên": {
    SBP: { min: 100, max: 110 },
    DBP: { min: 60, max: 65 },
    HR: { min: 60, max: 70 },
  },
  "Thanh niên": {
    SBP: { min: 110, max: 120 },
    DBP: { min: 65, max: 70 },
    HR: { min: 65, max: 70 },
  },
  "Trung niên": {
    SBP: { min: 120, max: 130 },
    DBP: { min: 70, max: 80 },
    HR: { min: 70, max: 75 },
  },
  "Lão niên": {
    SBP: { min: 130, max: 140 },
    DBP: { min: 80, max: 90 },
    HR: { min: 70, max: 80 },
  },
  "Không hợp lệ": {
    SBP: { min: 0, max: 0 },
    DBP: { min: 0, max: 0 },
    HR: { min: 0, max: 0 },
  },
};

export function getAgeGroup(age: number): AgeGroup {
  if (age >= 60) return "Lão niên";
  if (age >= 41) return "Trung niên";
  if (age >= 18) return "Thanh niên";
  if (age >= 13) return "Thiếu niên";
  if (age >= 5) return "Thiếu nhi";
  return "Không hợp lệ";
}

export function getThresholds(age: number): Thresholds | null {
  const ageGroup = getAgeGroup(age);
  if (ageGroup === "Không hợp lệ") return null;
  return ageThresholds[ageGroup];
}