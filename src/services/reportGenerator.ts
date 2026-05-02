import type { ManualStageValues } from "@/components/DataInputManualForm";
import type { MorningValues, SleepValues } from "./ruleEngine.types";
import { buildSummaryPrePost, buildSummarySleepMorning } from "./summary";
import { getThresholds } from "./thresholds";

export type ReportStep2 = {
  generatedAt: string;
  age: number;
  thresholds: NonNullable<ReturnType<typeof getThresholds>>;
  pre: ManualStageValues;
  post: ManualStageValues;
  summary: ReturnType<typeof buildSummaryPrePost>;
};

export type ReportStep3 = {
  generatedAt: string;
  age: number;
  thresholds: NonNullable<ReturnType<typeof getThresholds>>;
  sleep: SleepValues;
  morning: MorningValues;
  summary: ReturnType<typeof buildSummarySleepMorning>;
};

export async function writeReportJson(report: unknown, path = "report.json") {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = path;
  link.click();

  URL.revokeObjectURL(url);
}

export function buildStep2Report(
  pre: ManualStageValues,
  post: ManualStageValues,
  age: number,
): ReportStep2 {
  const thresholds = getThresholds(age);
  if (!thresholds) {
    throw new Error("Tuổi không hợp lệ");
  }

  const summary = buildSummaryPrePost(
    {
      SBP_L_PRE: Number(pre.SBP),
      DBP_L_PRE: Number(pre.DBP),
      HR_L_PRE: Number(pre.HR),
      SBP_R_PRE: Number(pre.SBP),
      DBP_R_PRE: Number(pre.DBP),
      HR_R_PRE: Number(pre.HR),
      GLU_PRE: Number(pre.GLU),
      TEMP_F_PRE: Number(pre.TEMP_F),
      TEMP_H_PRE: Number(pre.TEMP_H),
      TEMP_T_PRE: Number(pre.TEMP_T),
      pH_PRE: Number(pre.pH),
      SBP_L_POST: Number(post.SBP),
      DBP_L_POST: Number(post.DBP),
      HR_L_POST: Number(post.HR),
      SBP_R_POST: Number(post.SBP),
      DBP_R_POST: Number(post.DBP),
      HR_R_POST: Number(post.HR),
      GLU_POST: Number(post.GLU),
      TEMP_F_POST: Number(post.TEMP_F),
      TEMP_H_POST: Number(post.TEMP_H),
      TEMP_T_POST: Number(post.TEMP_T),
      pH_POST: Number(post.pH),
    },
    thresholds,
  );

  return {
    generatedAt: new Date().toISOString(),
    age,
    thresholds,
    pre,
    post,
    summary,
  };
}

export function buildStep3Report(
  sleep: SleepValues,
  morning: MorningValues,
  age: number,
): ReportStep3 {
  const thresholds = getThresholds(age);
  if (!thresholds) {
    throw new Error("Tuổi không hợp lệ");
  }

  const summary = buildSummarySleepMorning(sleep, morning, thresholds);

  return {
    generatedAt: new Date().toISOString(),
    age,
    thresholds,
    sleep,
    morning,
    summary,
  };
}