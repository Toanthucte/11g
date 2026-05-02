import { writeFile } from "node:fs/promises";
import { getThresholds } from "./thresholds";
import { validateStep2, validateStep3 } from "./validators";
import { buildSummaryPrePost, buildSummarySleepMorning } from "./summary";
import type {
  Step2Values,
  SleepValues,
  MorningValues,
  SummaryResult,
} from "./ruleEngine.types";

const age = 35;
const resolvedThresholds: NonNullable<ReturnType<typeof getThresholds>> = (() => {
  const thresholds = getThresholds(age);
  if (!thresholds) {
    throw new Error("Tuổi không hợp lệ, không thể xác định ngưỡng.");
  }
  return thresholds;
})();

const step2Data: Step2Values = {
  SBP_L_PRE: 115,
  DBP_L_PRE: 72,
  HR_L_PRE: 68,
  SBP_R_PRE: 112,
  DBP_R_PRE: 70,
  HR_R_PRE: 67,
  GLU_PRE: 120,
  TEMP_F_PRE: 36.2,
  TEMP_H_PRE: 36.1,
  TEMP_T_PRE: 36.3,
  pH_PRE: 6.8,

  SBP_L_POST: 118,
  DBP_L_POST: 74,
  HR_L_POST: 72,
  SBP_R_POST: 116,
  DBP_R_POST: 73,
  HR_R_POST: 71,
  GLU_POST: 185,
  TEMP_F_POST: 36.4,
  TEMP_H_POST: 36.2,
  TEMP_T_POST: 36.5,
  pH_POST: 6.7,
};

const sleepData: SleepValues = {
  SBP_L_SLEEP: 120,
  DBP_L_SLEEP: 78,
  HR_L_SLEEP: 70,
  SBP_R_SLEEP: 118,
  DBP_R_SLEEP: 76,
  HR_R_SLEEP: 70,
  GLU_SLEEP: 190,
  TEMP_F_SLEEP: 36.1,
  TEMP_H_SLEEP: 36.0,
  TEMP_T_SLEEP: 35.8,
  pH_SLEEP: 6.3,
};

const morningData: MorningValues = {
  SBP_L_MORNING: 116,
  DBP_L_MORNING: 74,
  HR_L_MORNING: 68,
  SBP_R_MORNING: 114,
  DBP_R_MORNING: 72,
  HR_R_MORNING: 68,
  GLU_MORNING: 125,
  TEMP_F_MORNING: 36.3,
  TEMP_H_MORNING: 36.2,
  TEMP_T_MORNING: 36.0,
  pH_MORNING: 6.6,
};

function printSummary(title: string, summary: SummaryResult) {
  console.log(`\n=== ${title} ===`);
  console.table(
    summary.items.map((item) => ({
      label: item.label,
      value: item.value,
      state: item.evaluation.state,
      level: item.evaluation.level,
      note: item.evaluation.note ?? "",
    })),
  );
  console.log("Overall:", summary.overall);
}

function buildReport(
  summary2: SummaryResult,
  summary3: SummaryResult,
  age: number,
) {
  return {
    generatedAt: new Date().toISOString(),
    age,
    thresholds: resolvedThresholds,
    step2: summary2,
    step3: summary3,
  };
}

async function main() {
  if (!validateStep2(step2Data)) {
    console.error("Dữ liệu Bước 2 không hợp lệ. Vui lòng kiểm tra lại các giá trị nhập.");
    return;
  }

  const summary2 = buildSummaryPrePost(step2Data, resolvedThresholds);
  printSummary("Summary Bước 2", summary2);

  const combinedStep3 = { ...sleepData, ...morningData };
  if (!validateStep3(combinedStep3)) {
    console.error("Dữ liệu Bước 3 không hợp lệ. Vui lòng kiểm tra lại các giá trị nhập.");
    return;
  }

  const summary3 = buildSummarySleepMorning(sleepData, morningData, resolvedThresholds);
  printSummary("Summary Bước 3", summary3);

  const report = buildReport(summary2, summary3, age);
  const json = JSON.stringify(report, null, 2);

  await writeFile("report.json", json, "utf-8");
  console.log("\n=== JSON Report ===");
  console.log(json);
  console.log("\nĐã lưu report vào report.json");
}

main().catch((err) => {
  console.error("Lỗi khi chạy index.ts:", err);
});