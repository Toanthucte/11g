import type { Step2Values, SleepValues, MorningValues } from "./ruleEngine.types";

export function isNumeric(value: unknown): boolean {
  return value !== null && value !== undefined && !Number.isNaN(Number(value));
}

const step2RequiredKeys: Array<keyof Step2Values> = [
  "SBP_L_PRE",
  "DBP_L_PRE",
  "HR_L_PRE",
  "SBP_R_PRE",
  "DBP_R_PRE",
  "HR_R_PRE",
  "GLU_PRE",
  "TEMP_F_PRE",
  "TEMP_H_PRE",
  "TEMP_T_PRE",
  "pH_PRE",
  "SBP_L_POST",
  "DBP_L_POST",
  "HR_L_POST",
  "SBP_R_POST",
  "DBP_R_POST",
  "HR_R_POST",
  "GLU_POST",
  "TEMP_F_POST",
  "TEMP_H_POST",
  "TEMP_T_POST",
  "pH_POST",
];

export function validateStep2(inputs: Partial<Step2Values>): boolean {
  return step2RequiredKeys.every((key) => isNumeric(inputs[key]));
}

const step3RequiredKeys: Array<keyof SleepValues | keyof MorningValues> = [
  "SBP_L_SLEEP",
  "DBP_L_SLEEP",
  "HR_L_SLEEP",
  "SBP_R_SLEEP",
  "DBP_R_SLEEP",
  "HR_R_SLEEP",
  "GLU_SLEEP",
  "TEMP_F_SLEEP",
  "TEMP_H_SLEEP",
  "TEMP_T_SLEEP",
  "pH_SLEEP",
  "SBP_L_MORNING",
  "DBP_L_MORNING",
  "HR_L_MORNING",
  "SBP_R_MORNING",
  "DBP_R_MORNING",
  "HR_R_MORNING",
  "GLU_MORNING",
  "TEMP_F_MORNING",
  "TEMP_H_MORNING",
  "TEMP_T_MORNING",
  "pH_MORNING",
];

export function validateStep3(inputs: Partial<SleepValues & MorningValues>): boolean {
  return step3RequiredKeys.every((key) => isNumeric(inputs[key]));
}