import type {
  Evaluation,
  Range,
  Step2Values,
  SummaryItem,
  SummaryResult,
  SleepValues,
  MorningValues,
  Thresholds,
} from "./ruleEngine.types";
import {
  evaluateSBP,
  evaluateDBP,
  evaluateDBPValue,
  evaluateHR,
  evaluateGLU,
  evaluatePH,
  evaluateTEMP,
  evaluateHandGap,
} from "./evaluators";
import {
  evaluateGLU_SLEEP,
  evaluatePH_SLEEP,
  evaluatePressureGap,
  evaluateHR_SLEEP,
  evaluateGLU_MORNING,
  compareSleepMorning,
} from "./sleepEvaluators";

const levelScore: Record<"xanh" | "vàng" | "đỏ", number> = {
  xanh: 0,
  vàng: 1,
  đỏ: 2,
};

function worstLevel(levels: Array<"xanh" | "vàng" | "đỏ">): "xanh" | "vàng" | "đỏ" {
  return levels.reduce((worst, current) =>
    levelScore[current] > levelScore[worst] ? current : worst,
  "xanh");
}

export function buildSummaryPrePost(
  values: Step2Values,
  thresholds: Thresholds,
): SummaryResult {
  const sbpLeftEval = evaluateSBP(values.SBP_L_POST, thresholds.SBP);
  const sbpRightEval = evaluateSBP(values.SBP_R_POST, thresholds.SBP);
  const dbpLeftEval = evaluateDBP(values.DBP_L_PRE, values.DBP_L_POST);
  const dbpRightEval = evaluateDBP(values.DBP_R_PRE, values.DBP_R_POST);
  const hrLeftEval = evaluateHR(
    values.HR_L_POST,
    thresholds.HR,
    [values.TEMP_F_POST, values.TEMP_H_POST, values.TEMP_T_POST],
  );
  const hrRightEval = evaluateHR(
    values.HR_R_POST,
    thresholds.HR,
    [values.TEMP_F_POST, values.TEMP_H_POST, values.TEMP_T_POST],
  );
  const gluEval = evaluateGLU(values.GLU_POST);
  const phEval = evaluatePH(values.pH_POST);
  const tempEval = evaluateTEMP(
    [values.TEMP_F_PRE, values.TEMP_H_PRE, values.TEMP_T_PRE],
    [values.TEMP_F_POST, values.TEMP_H_POST, values.TEMP_T_POST],
  );
  const sbpGapEval = evaluateHandGap(values.SBP_L_POST, values.SBP_R_POST);
  const dbpGapEval = evaluateHandGap(values.DBP_L_POST, values.DBP_R_POST);

  const items: SummaryItem[] = [
    {
      label: "SBP tay trái PRE → POST",
      value: `${values.SBP_L_PRE} → ${values.SBP_L_POST}`,
      evaluation: sbpLeftEval,
    },
    {
      label: "SBP tay phải PRE → POST",
      value: `${values.SBP_R_PRE} → ${values.SBP_R_POST}`,
      evaluation: sbpRightEval,
    },
    {
      label: "DBP tay trái PRE → POST",
      value: `${values.DBP_L_PRE} → ${values.DBP_L_POST}`,
      evaluation: dbpLeftEval,
    },
    {
      label: "DBP tay phải PRE → POST",
      value: `${values.DBP_R_PRE} → ${values.DBP_R_POST}`,
      evaluation: dbpRightEval,
    },
    {
      label: "HR tay trái PRE → POST",
      value: `${values.HR_L_PRE} → ${values.HR_L_POST}`,
      evaluation: hrLeftEval,
    },
    {
      label: "HR tay phải PRE → POST",
      value: `${values.HR_R_PRE} → ${values.HR_R_POST}`,
      evaluation: hrRightEval,
    },
    {
      label: "GLU PRE → POST",
      value: `${values.GLU_PRE} → ${values.GLU_POST}`,
      evaluation: gluEval,
    },
    {
      label: "pH PRE → POST",
      value: `${values.pH_PRE} → ${values.pH_POST}`,
      evaluation: phEval,
    },
    {
      label: "TEMP 3 điểm PRE → POST",
      value: `${values.TEMP_F_PRE}, ${values.TEMP_H_PRE}, ${values.TEMP_T_PRE} → ${values.TEMP_F_POST}, ${values.TEMP_H_POST}, ${values.TEMP_T_POST}`,
      evaluation: tempEval,
    },
    {
      label: "Chênh SBP hai tay sau ăn",
      value: Math.abs(values.SBP_L_POST - values.SBP_R_POST),
      evaluation: sbpGapEval,
    },
    {
      label: "Chênh DBP hai tay sau ăn",
      value: Math.abs(values.DBP_L_POST - values.DBP_R_POST),
      evaluation: dbpGapEval,
    }
  ];

  const overallLevel = worstLevel(items.map((item) => item.evaluation.level));
  const overall: Evaluation = {
    state:
      overallLevel === "đỏ"
        ? "Cảnh báo nghiêm trọng"
        : overallLevel === "vàng"
        ? "Cần theo dõi"
        : "Bình thường",
    level: overallLevel,
    note:
      overallLevel === "đỏ"
        ? "Một hoặc nhiều chỉ số sau ăn cần xử lý."
        : overallLevel === "vàng"
        ? "Một số chỉ số cần theo dõi."
        : "Các chỉ số trong giới hạn.",
  };

  return { items, overall };
}

export function buildSummarySleepMorning(
  sleep: SleepValues,
  morning: MorningValues,
  thresholds: Thresholds,
): SummaryResult {
  const sbpLeftSleepEval = evaluateSBP(sleep.SBP_L_SLEEP, thresholds.SBP);
  const sbpRightSleepEval = evaluateSBP(sleep.SBP_R_SLEEP, thresholds.SBP);
  const dbpLeftSleepEval = evaluateDBPValue(sleep.DBP_L_SLEEP, thresholds.DBP);
  const dbpRightSleepEval = evaluateDBPValue(sleep.DBP_R_SLEEP, thresholds.DBP);
  const hrLeftSleepEval = evaluateHR_SLEEP(
    sleep.HR_L_SLEEP,
    thresholds.HR,
    [sleep.TEMP_F_SLEEP, sleep.TEMP_H_SLEEP, sleep.TEMP_T_SLEEP],
  );
  const hrRightSleepEval = evaluateHR_SLEEP(
    sleep.HR_R_SLEEP,
    thresholds.HR,
    [sleep.TEMP_F_SLEEP, sleep.TEMP_H_SLEEP, sleep.TEMP_T_SLEEP],
  );
  const gluSleepEval = evaluateGLU_SLEEP(sleep.GLU_SLEEP);
  const phSleepEval = evaluatePH_SLEEP(sleep.pH_SLEEP);
  const sbpSleepGapEval = evaluatePressureGap(sleep.SBP_L_SLEEP, sleep.SBP_R_SLEEP);
  const dbpSleepGapEval = evaluatePressureGap(sleep.DBP_L_SLEEP, sleep.DBP_R_SLEEP);
  const gluMorningEval = evaluateGLU_MORNING(morning.GLU_MORNING, sleep.GLU_SLEEP);
  const hrLeftMorningEval = evaluateHR(
    morning.HR_L_MORNING,
    thresholds.HR,
    [morning.TEMP_F_MORNING, morning.TEMP_H_MORNING, morning.TEMP_T_MORNING],
  );
  const hrRightMorningEval = evaluateHR(
    morning.HR_R_MORNING,
    thresholds.HR,
    [morning.TEMP_F_MORNING, morning.TEMP_H_MORNING, morning.TEMP_T_MORNING],
  );
  const dbpLeftMorningEval = evaluateDBPValue(morning.DBP_L_MORNING, thresholds.DBP);
  const dbpRightMorningEval = evaluateDBPValue(morning.DBP_R_MORNING, thresholds.DBP);
  const tempMorningEval = evaluateTEMP(
    [sleep.TEMP_F_SLEEP, sleep.TEMP_H_SLEEP, sleep.TEMP_T_SLEEP],
    [morning.TEMP_F_MORNING, morning.TEMP_H_MORNING, morning.TEMP_T_MORNING],
  );
  const compareEval = compareSleepMorning(sleep.GLU_SLEEP, morning.GLU_MORNING);

  const items: SummaryItem[] = [
    {
      label: "SBP tay trái trước ngủ",
      value: sleep.SBP_L_SLEEP,
      evaluation: sbpLeftSleepEval,
    },
    {
      label: "SBP tay phải trước ngủ",
      value: sleep.SBP_R_SLEEP,
      evaluation: sbpRightSleepEval,
    },
    {
      label: "DBP tay trái trước ngủ",
      value: sleep.DBP_L_SLEEP,
      evaluation: dbpLeftSleepEval,
    },
    {
      label: "DBP tay phải trước ngủ",
      value: sleep.DBP_R_SLEEP,
      evaluation: dbpRightSleepEval,
    },
    {
      label: "HR tay trái trước ngủ",
      value: sleep.HR_L_SLEEP,
      evaluation: hrLeftSleepEval,
    },
    {
      label: "HR tay phải trước ngủ",
      value: sleep.HR_R_SLEEP,
      evaluation: hrRightSleepEval,
    },
    {
      label: "GLU trước ngủ",
      value: sleep.GLU_SLEEP,
      evaluation: gluSleepEval,
    },
    {
      label: "pH trước ngủ",
      value: sleep.pH_SLEEP,
      evaluation: phSleepEval,
    },
    {
      label: "TEMP 3 điểm trước ngủ",
      value: `${sleep.TEMP_F_SLEEP}, ${sleep.TEMP_H_SLEEP}, ${sleep.TEMP_T_SLEEP}`,
      evaluation: evaluateTEMP(
        [sleep.TEMP_F_SLEEP, sleep.TEMP_H_SLEEP, sleep.TEMP_T_SLEEP],
        [sleep.TEMP_F_SLEEP, sleep.TEMP_H_SLEEP, sleep.TEMP_T_SLEEP],
      ),
    },
    {
      label: "SBP tay trái sáng",
      value: morning.SBP_L_MORNING,
      evaluation: evaluateSBP(morning.SBP_L_MORNING, thresholds.SBP),
    },
    {
      label: "SBP tay phải sáng",
      value: morning.SBP_R_MORNING,
      evaluation: evaluateSBP(morning.SBP_R_MORNING, thresholds.SBP),
    },
    {
      label: "DBP tay trái sáng",
      value: morning.DBP_L_MORNING,
      evaluation: dbpLeftMorningEval,
    },
    {
      label: "DBP tay phải sáng",
      value: morning.DBP_R_MORNING,
      evaluation: dbpRightMorningEval,
    },
    {
      label: "HR tay trái sáng",
      value: morning.HR_L_MORNING,
      evaluation: hrLeftMorningEval,
    },
    {
      label: "HR tay phải sáng",
      value: morning.HR_R_MORNING,
      evaluation: hrRightMorningEval,
    },
    {
      label: "GLU sáng",
      value: morning.GLU_MORNING,
      evaluation: gluMorningEval,
    },
    {
      label: "pH sáng",
      value: morning.pH_MORNING,
      evaluation: evaluatePH(morning.pH_MORNING),
    },
    {
      label: "TEMP 3 điểm sáng",
      value: `${morning.TEMP_F_MORNING}, ${morning.TEMP_H_MORNING}, ${morning.TEMP_T_MORNING}`,
      evaluation: tempMorningEval,
    },
    {
      label: "Chênh SBP trước ngủ",
      value: Math.abs(sleep.SBP_L_SLEEP - sleep.SBP_R_SLEEP),
      evaluation: sbpSleepGapEval,
    },
    {
      label: "Chênh DBP trước ngủ",
      value: Math.abs(sleep.DBP_L_SLEEP - sleep.DBP_R_SLEEP),
      evaluation: dbpSleepGapEval,
    },
    {
      label: "Tiêu hao đêm GLU",
      value: sleep.GLU_SLEEP - morning.GLU_MORNING,
      evaluation: compareEval,
    }
  ];

  const overallLevel = worstLevel(items.map((item) => item.evaluation.level));
  const overall: Evaluation = {
    state:
      overallLevel === "đỏ"
        ? "Cảnh báo đêm nghiêm trọng"
        : overallLevel === "vàng"
        ? "Cần theo dõi giấc ngủ"
        : "Giấc ngủ an toàn",
    level: overallLevel,
    note:
      overallLevel === "đỏ"
        ? "Có rủi ro lớn trong giai đoạn ngủ/sáng."
        : overallLevel === "vàng"
        ? "Một số chỉ số cần theo dõi thêm."
        : "Các chỉ số đêm/sáng nằm trong giới hạn.",
  };

  return { items, overall };
}