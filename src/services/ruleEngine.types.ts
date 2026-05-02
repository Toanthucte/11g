export type AgeGroup =
  | "Thiếu nhi"
  | "Thiếu niên"
  | "Thanh niên"
  | "Trung niên"
  | "Lão niên"
  | "Không hợp lệ";

export type EvaluationLevel = "xanh" | "vàng" | "đỏ";

export interface Range {
  min: number;
  max: number;
}

export interface Thresholds {
  SBP: Range;
  DBP: Range;
  HR: Range;
}

export interface Evaluation {
  state: string;
  level: EvaluationLevel;
  note?: string;
}

export interface Step2Values {
  SBP_L_PRE: number;
  DBP_L_PRE: number;
  HR_L_PRE: number;
  SBP_R_PRE: number;
  DBP_R_PRE: number;
  HR_R_PRE: number;
  GLU_PRE: number;
  TEMP_F_PRE: number;
  TEMP_H_PRE: number;
  TEMP_T_PRE: number;
  pH_PRE: number;

  SBP_L_POST: number;
  DBP_L_POST: number;
  HR_L_POST: number;
  SBP_R_POST: number;
  DBP_R_POST: number;
  HR_R_POST: number;
  GLU_POST: number;
  TEMP_F_POST: number;
  TEMP_H_POST: number;
  TEMP_T_POST: number;
  pH_POST: number;
}

export interface SleepValues {
  SBP_L_SLEEP: number;
  DBP_L_SLEEP: number;
  HR_L_SLEEP: number;
  SBP_R_SLEEP: number;
  DBP_R_SLEEP: number;
  HR_R_SLEEP: number;
  GLU_SLEEP: number;
  TEMP_F_SLEEP: number;
  TEMP_H_SLEEP: number;
  TEMP_T_SLEEP: number;
  pH_SLEEP: number;
}

export interface MorningValues {
  SBP_L_MORNING: number;
  DBP_L_MORNING: number;
  HR_L_MORNING: number;
  SBP_R_MORNING: number;
  DBP_R_MORNING: number;
  HR_R_MORNING: number;
  GLU_MORNING: number;
  TEMP_F_MORNING: number;
  TEMP_H_MORNING: number;
  TEMP_T_MORNING: number;
  pH_MORNING: number;
}

export interface SummaryItem {
  label: string;
  value: number | string;
  evaluation: Evaluation;
}

export interface SummaryResult {
  items: SummaryItem[];
  overall: Evaluation;
}