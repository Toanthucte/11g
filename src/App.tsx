import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import benhTrangData from "@/data/benh-trang-tong-hop.json";
import foodData from "@/data/thuc-pham-kiem-tri-benh.json";
import "@/styles/App.css";
import "@/styles/accordion.css";
import { getAgeGroup, getThresholds } from "@/services/thresholds";

type Page = "intro" | "basic" | "input" | "report";
type Gender = "Nam" | "Nữ" | "";

type StageKey = "beforeMeal" | "afterMeal" | "beforeSleep" | "afterSleep";

type MetricValues = {
  sbpL: string;
  dbpL: string;
  hrL: string;
  sbpR: string;
  dbpR: string;
  hrR: string;
  tempForehead: string;
  tempHand: string;
  tempFoot: string;
  glu: string;
  ph: string;
};

type MeasurementMap = Record<StageKey, MetricValues | null>;

type HighlightLevel = "green" | "yellow" | "orange" | "red";

type DiseaseRecord = {
  ma_benh: string;
  nhom_benh: string;
  ten_benh: string;
  trieu_chung: string;
  nguyen_nhan: string;
  luu_y: string;
};

type FoodRecord = {
  ma_tp: string;
  ten_thuc_pham: string;
  nhom_benh_lien_quan: string;
  chua_benh: string;
  khong_dung_cho: string;
};

type RuleSuggestion = {
  title: string;
  reason: string;
  severity: HighlightLevel;
  groups: string[];
};

type ExportPayload = {
  generatedAt: string;
  basicInfo: {
    age: number;
    gender: Gender;
    weight: string;
    height: string;
    bmi: number | null;
  };
  thresholds: {
    ageGroup: string;
    sbp: string;
    dbp: string;
    hr: string;
  };
  measurements: MeasurementMap;
  diagnosis: RuleSuggestion[];
  matchedDiseases: DiseaseRecord[];
  suggestedFoods: FoodRecord[];
  recentFoodsVoiceNote: string;
};

const stageMeta: Record<StageKey, { label: string; short: string }> = {
  beforeMeal: { label: "A. Trước ăn", short: "Trước ăn" },
  afterMeal: { label: "B. Sau ăn", short: "Sau ăn" },
  beforeSleep: { label: "C. Trước ngủ", short: "Trước ngủ" },
  afterSleep: { label: "D. Sau ngủ", short: "Sau ngủ" },
};

const stageSequence: StageKey[] = [
  "beforeMeal",
  "afterMeal",
  "beforeSleep",
  "afterSleep",
];

const emptyMetrics: MetricValues = {
  sbpL: "",
  dbpL: "",
  hrL: "",
  sbpR: "",
  dbpR: "",
  hrR: "",
  tempForehead: "",
  tempHand: "",
  tempFoot: "",
  glu: "",
  ph: "",
};

const metricFieldOrder: Array<keyof MetricValues> = [
  "sbpL",
  "dbpL",
  "hrL",
  "sbpR",
  "dbpR",
  "hrR",
  "tempForehead",
  "tempHand",
  "tempFoot",
  "glu",
  "ph",
];

const autoAdvanceThresholds: Partial<Record<keyof MetricValues, number>> = {
  sbpL: 4,
  dbpL: 4,
  hrL: 4,
  sbpR: 4,
  dbpR: 4,
  hrR: 4,
  tempForehead: 4,
  tempHand: 4,
  tempFoot: 4,
  glu: 3,
  ph: 4,
};

const autoAdvanceDelays: Partial<Record<keyof MetricValues, number>> = {
  tempForehead: 2000,
  tempHand: 2000,
  tempFoot: 2000,
  ph: 2000,
};

const decimalFields: Array<keyof MetricValues> = ["tempForehead", "tempHand", "tempFoot", "ph"];

function isValidDecimalEntry(field: keyof MetricValues, value: string) {
  if (!decimalFields.includes(field)) return false;
  if (value.endsWith(".")) return false;
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (cleaned !== value) return false;
  const numericValue = toNumber(value);
  if (numericValue === null) return false;
  if (field === "ph") {
    return /^\d(\.\d+)?$/.test(value);
  }
  return /^\d{2}\.\d$/.test(value);
}

const rememberAgeKey = "kcyd_age";

function toNumber(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function classifyBMI(bmi: number): { text: string; level: HighlightLevel } {
  if (bmi < 18.5) return { text: "Thiếu cân", level: "yellow" };
  if (bmi < 25) return { text: "Bình thường", level: "green" };
  if (bmi < 30) return { text: "Thừa cân", level: "yellow" };
  if (bmi < 35) return { text: "Béo phì độ I", level: "orange" };
  if (bmi < 40) return { text: "Béo phì độ II", level: "orange" };
  return { text: "Béo phì độ III", level: "red" };
}

function getBMIAdvice(bmi: number, height: number, weight: number) {
  const normalMin = 18.5 * height * height;
  const normalMax = 25 * height * height;
  if (bmi < 18.5) {
    const diff = normalMin - weight;
    return `Bạn cần tăng thêm ${diff.toFixed(1)} kg để đạt BMI 18.5 (cân nặng tối thiểu ${normalMin.toFixed(1)} kg).`;
  }
  if (bmi < 25) {
    return `Phạm vi cân nặng bình thường: ${normalMin.toFixed(1)} - ${normalMax.toFixed(1)} kg.`;
  }
  const diff = weight - normalMax;
  return `Bạn cần giảm ${diff.toFixed(1)} kg để đạt BMI 25 (cân nặng tối đa ${normalMax.toFixed(1)} kg).`;
}

function fieldRangeByStage(stage: StageKey, field: keyof MetricValues): { min: number; max: number } | null {
  if (field === "glu") {
    if (stage === "beforeMeal") return { min: 80, max: 130 };
    if (stage === "afterMeal") return { min: 110, max: 200 };
    if (stage === "beforeSleep") return { min: 140, max: 200 };
    return { min: 90, max: 140 };
  }
  if (field === "ph") return { min: 6.4, max: 7.4 };
  if (field === "tempForehead") return { min: 36, max: 37.3 };
  if (field === "tempHand") return { min: 35.2, max: 36.8 };
  if (field === "tempFoot") return { min: 35.0, max: 36.8 };
  return null;
}

function classifyWithRange(value: number, min: number, max: number): HighlightLevel {
  if (value >= min && value <= max) {
    return "green";
  }
  const width = Math.max(max - min, 1);
  const delta = value < min ? min - value : value - max;
  if (delta <= width * 0.2) return "yellow";
  if (delta <= width * 0.4) return "orange";
  return "red";
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.split('"').join('""')}"`;
  }
  return value;
}

export default function App() {
  const [page, setPage] = useState<Page>("intro");
  const [activeStage, setActiveStage] = useState<StageKey>("beforeMeal");

  const [age, setAge] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [rememberAge, setRememberAge] = useState(false);
  const [gender, setGender] = useState<Gender>("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [measurements, setMeasurements] = useState<MeasurementMap>({
    beforeMeal: null,
    afterMeal: null,
    beforeSleep: null,
    afterSleep: null,
  });

  const [workingMetrics, setWorkingMetrics] = useState<MetricValues>(emptyMetrics);
  const inputRefs = useRef<Partial<Record<keyof MetricValues, HTMLInputElement>>>({});
  const typingTimers = useRef<Partial<Record<keyof MetricValues, number>>>({});
  const [fabOpen, setFabOpen] = useState(false);
  const [voiceFoodNote, setVoiceFoodNote] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [diseaseAccordionOpen, setDiseaseAccordionOpen] = useState(false);
  const [foodAccordionOpen, setFoodAccordionOpen] = useState(false);

  useEffect(() => {
    const savedAge = localStorage.getItem(rememberAgeKey);
    if (savedAge) {
      setAge(savedAge);
      setRememberAge(true);
    }
  }, []);

  useEffect(() => {
    if (page !== "intro") return;
    const timer = window.setTimeout(() => {
      setPage("basic");
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    const existing = measurements[activeStage];
    if (existing) {
      setWorkingMetrics(existing);
      return;
    }
    setWorkingMetrics(emptyMetrics);
  }, [activeStage, measurements]);

  const ageNumber = useMemo(() => {
    const value = Number(age);
    return Number.isFinite(value) ? value : null;
  }, [age]);

  const bmiInfo = useMemo(() => {
    const w = Number(weight);
    const h = Number(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return null;
    }
    const bmi = w / (h * h);
    return {
      bmi,
      ...classifyBMI(bmi),
      detail: getBMIAdvice(bmi, h, w),
    };
  }, [weight, height]);

  const ageGroup = useMemo(() => {
    if (!ageNumber) return "Không hợp lệ";
    return getAgeGroup(ageNumber);
  }, [ageNumber]);

  const thresholds = useMemo(() => {
    if (!ageNumber) return null;
    return getThresholds(ageNumber);
  }, [ageNumber]);

  const filledStages = useMemo(
    () => stageSequence.filter((stage) => measurements[stage] !== null),
    [measurements],
  );

  const diagnosis = useMemo(() => {
    const list: RuleSuggestion[] = [];
    const beforeMealData = measurements.beforeMeal;
    const afterMealData = measurements.afterMeal;
    const beforeSleepData = measurements.beforeSleep;
    const afterSleepData = measurements.afterSleep;

    const all = stageSequence
      .map((stage) => measurements[stage])
      .filter((value): value is MetricValues => Boolean(value));

    const gluValues = all
      .map((item) => toNumber(item.glu))
      .filter((value): value is number => value !== null);
    const hrValues = all
      .flatMap((item) => [toNumber(item.hrL), toNumber(item.hrR)])
      .filter((value): value is number => value !== null);
    const tempFootValues = all
      .map((item) => toNumber(item.tempFoot))
      .filter((value): value is number => value !== null);

    const avgGlu = gluValues.length
      ? gluValues.reduce((sum, value) => sum + value, 0) / gluValues.length
      : null;
    const avgHr = hrValues.length
      ? hrValues.reduce((sum, value) => sum + value, 0) / hrValues.length
      : null;
    const avgTempFoot = tempFootValues.length
      ? tempFootValues.reduce((sum, value) => sum + value, 0) / tempFootValues.length
      : null;

    if ((avgGlu !== null && avgGlu < 120) || (avgHr !== null && avgHr < 65)) {
      list.push({
        title: "Nguy cơ thiếu năng lượng chuyển hóa",
        reason: "GLU trung bình thấp hoặc nhịp tim thấp kéo dài.",
        severity: "yellow",
        groups: ["Tiểu đường", "Tim mạch", "Huyết học"],
      });
    }

    if (
      afterMealData &&
      (() => {
        const postGlu = toNumber(afterMealData.glu);
        return postGlu !== null && postGlu > 200;
      })()
    ) {
      list.push({
        title: "Tăng đường huyết sau ăn",
        reason: "GLU sau ăn vượt 200 mg/dl.",
        severity: "orange",
        groups: ["Tiểu đường", "Tim mạch"],
      });
    }

    if (beforeSleepData && afterSleepData) {
      const sleepGlu = toNumber(beforeSleepData.glu);
      const morningGlu = toNumber(afterSleepData.glu);
      if (sleepGlu !== null && morningGlu !== null && sleepGlu - morningGlu > 60) {
        list.push({
          title: "Tiêu hao đường huyết ban đêm cao",
          reason: "Chênh lệch GLU trước ngủ/sau ngủ lớn hơn 60 mg/dl.",
          severity: "orange",
          groups: ["Tim mạch", "Thần kinh", "Tiểu đường"],
        });
      }
    }

    const handGapStage = all.find((item) => {
      const sbpL = toNumber(item.sbpL);
      const sbpR = toNumber(item.sbpR);
      const dbpL = toNumber(item.dbpL);
      const dbpR = toNumber(item.dbpR);
      if (sbpL === null || sbpR === null || dbpL === null || dbpR === null) return false;
      return Math.abs(sbpL - sbpR) >= 15 || Math.abs(dbpL - dbpR) >= 10;
    });

    if (handGapStage) {
      list.push({
        title: "Chênh lệch áp huyết hai tay bất thường",
        reason: "Chênh lệch SYS >= 15 hoặc DIA >= 10 giữa tay trái và tay phải.",
        severity: "orange",
        groups: ["Tim mạch", "Gan - Thận - Lách"],
      });
    }

    if ((avgHr !== null && avgHr > 95) && (avgTempFoot !== null && avgTempFoot < 35.5)) {
      list.push({
        title: "Nhịp tim cao kèm ngoại vi lạnh",
        reason: "PULSE cao nhưng TEMP chân thấp, cần theo dõi thiếu máu/thiếu năng lượng.",
        severity: "red",
        groups: ["Tim mạch", "Huyết học", "Tiểu đường"],
      });
    }

    const acidFlag = all.some((item) => {
      const phValue = toNumber(item.ph);
      return phValue !== null && phValue < 6.2;
    });
    if (acidFlag) {
      list.push({
        title: "pH nghiêng acid",
        reason: "Có chỉ số pH < 6.2.",
        severity: "yellow",
        groups: ["Tiêu hóa", "Ung thư", "Gan - Thận - Lách"],
      });
    }

    return list;
  }, [measurements]);

  const matchedDiseases = useMemo(() => {
    const records = benhTrangData as DiseaseRecord[];
    if (!diagnosis.length) return [];

    const groupSet = new Set(diagnosis.flatMap((item) => item.groups));
    const scores = new Map<string, number>();

    records.forEach((record) => {
      let score = 0;
      groupSet.forEach((group) => {
        if (record.nhom_benh?.includes(group)) {
          score += 2;
        }
      });

      const lowerText = `${record.ten_benh} ${record.trieu_chung} ${record.nguyen_nhan}`.toLowerCase();
      if (lowerText.includes("đường") && diagnosis.some((item) => item.title.includes("đường"))) {
        score += 1;
      }
      if (lowerText.includes("tim") && diagnosis.some((item) => item.groups.includes("Tim mạch"))) {
        score += 1;
      }
      if (lowerText.includes("thiếu máu") && diagnosis.some((item) => item.groups.includes("Huyết học"))) {
        score += 1;
      }

      if (score > 0) {
        scores.set(record.ma_benh, score);
      }
    });

    return records
      .filter((record) => scores.has(record.ma_benh))
      .sort((a, b) => (scores.get(b.ma_benh) ?? 0) - (scores.get(a.ma_benh) ?? 0))
      .slice(0, 8);
  }, [diagnosis]);

  const suggestedFoods = useMemo(() => {
    const foods = foodData as FoodRecord[];
    if (!diagnosis.length) return [];
    const groupSet = new Set(diagnosis.flatMap((item) => item.groups));

    return foods
      .filter((food) => {
        return Array.from(groupSet).some((group) => food.nhom_benh_lien_quan?.includes(group));
      })
      .slice(0, 10);
  }, [diagnosis]);

  function saveCurrentStage() {
    setMeasurements({
      ...measurements,
      [activeStage]: workingMetrics,
    });
  }

  function gotoStage(stage: StageKey) {
    saveCurrentStage();
    setActiveStage(stage);
    setPage("input");
    setFabOpen(false);
  }

  function handleAgeChange(value: string) {
    setAge(value);
  }

  function handleBirthYearChange(value: string) {
    setBirthYear(value);
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (Number.isFinite(year) && year > 1900 && year <= currentYear) {
      setAge(String(currentYear - year));
    }
  }

  function handleContinueBasic() {
    if (!age || Number(age) <= 0) {
      alert("Vui lòng nhập tuổi hoặc năm sinh hợp lệ.");
      return;
    }
    if (rememberAge) {
      localStorage.setItem(rememberAgeKey, age);
    } else {
      localStorage.removeItem(rememberAgeKey);
    }
    setPage("input");
  }

  function clearMetricTimer(field: keyof MetricValues) {
    const timerId = typingTimers.current[field];
    if (timerId) {
      window.clearTimeout(timerId);
      delete typingTimers.current[field];
    }
  }

  function focusNextMetricField(field: keyof MetricValues) {
    const currentIndex = metricFieldOrder.indexOf(field);
    if (currentIndex === -1) return;
    const nextField = metricFieldOrder[currentIndex + 1];
    if (!nextField) return;
    inputRefs.current[nextField]?.focus();
  }

  function shouldAutoAdvance(field: keyof MetricValues, value: string) {
    const numericValue = toNumber(value);
    if (numericValue === null) return false;
    if (isValidDecimalEntry(field, value)) {
      return true;
    }
    const maxLength = autoAdvanceThresholds[field] ?? 3;
    const cleaned = value.replace(/[^0-9.]/g, "");
    return cleaned.length >= maxLength;
  }

  function scheduleAutoAdvance(field: keyof MetricValues, value: string) {
    clearMetricTimer(field);
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (shouldAutoAdvance(field, value)) {
      focusNextMetricField(field);
      return;
    }

    if (!cleaned) return;
    if (cleaned.length < 2) return;

    const delay = autoAdvanceDelays[field] ?? 1000;
    typingTimers.current[field] = window.setTimeout(() => {
      if (inputRefs.current[field]?.value === value && value.trim()) {
        focusNextMetricField(field);
      }
    }, delay);
  }

  function updateMetric(field: keyof MetricValues, value: string) {
    setWorkingMetrics({ ...workingMetrics, [field]: value });
    scheduleAutoAdvance(field, value);
  }

  useEffect(() => {
    if (page !== "input") return;
    const timer = window.setTimeout(() => {
      inputRefs.current.sbpL?.focus();
    });
    return () => window.clearTimeout(timer);
  }, [page, activeStage]);

  function stageComparisonText() {
    const compareStage =
      activeStage === "afterMeal"
        ? measurements.beforeMeal
        : activeStage === "afterSleep"
        ? measurements.beforeSleep
        : null;

    if (!compareStage) return null;

    const currentGlu = toNumber(workingMetrics.glu);
    const compareGlu = toNumber(compareStage.glu);
    if (currentGlu === null || compareGlu === null) return null;

    const diff = currentGlu - compareGlu;
    const text = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
    return `So với ${activeStage === "afterMeal" ? "Trước ăn" : "Trước ngủ"}: GLU ${text} mg/dl`;
  }

  function classifyField(field: keyof MetricValues): HighlightLevel {
    const value = toNumber(workingMetrics[field]);
    if (value === null) return "green";

    if (field === "sbpL" || field === "sbpR") {
      if (!thresholds) return "yellow";
      return classifyWithRange(value, thresholds.SBP.min, thresholds.SBP.max);
    }
    if (field === "dbpL" || field === "dbpR") {
      if (!thresholds) return "yellow";
      return classifyWithRange(value, thresholds.DBP.min, thresholds.DBP.max);
    }
    if (field === "hrL" || field === "hrR") {
      if (!thresholds) return "yellow";
      return classifyWithRange(value, thresholds.HR.min, thresholds.HR.max);
    }

    const range = fieldRangeByStage(activeStage, field);
    if (!range) return "green";
    return classifyWithRange(value, range.min, range.max);
  }

  function fieldClass(level: HighlightLevel): string {
    if (level === "green") return "metricGreen";
    if (level === "yellow") return "metricYellow";
    if (level === "orange") return "metricOrange";
    return "metricRed";
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhập giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceListening(true);

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      setVoiceFoodNote((prev) => (prev ? `${prev}; ${transcript}` : transcript));
    };

    recognition.onerror = () => {
      alert("Không nhận diện được giọng nói, vui lòng thử lại.");
      setVoiceListening(false);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  }

  function buildExportPayload(): ExportPayload {
    return {
      generatedAt: new Date().toISOString(),
      basicInfo: {
        age: Number(age),
        gender,
        weight,
        height,
        bmi: bmiInfo ? Number(bmiInfo.bmi.toFixed(2)) : null,
      },
      thresholds: {
        ageGroup,
        sbp: thresholds ? `${thresholds.SBP.min}-${thresholds.SBP.max}` : "N/A",
        dbp: thresholds ? `${thresholds.DBP.min}-${thresholds.DBP.max}` : "N/A",
        hr: thresholds ? `${thresholds.HR.min}-${thresholds.HR.max}` : "N/A",
      },
      measurements,
      diagnosis,
      matchedDiseases,
      suggestedFoods,
      recentFoodsVoiceNote: voiceFoodNote,
    };
  }

  function downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = [
      "Stage",
      "SBP_L",
      "DBP_L",
      "HR_L",
      "SBP_R",
      "DBP_R",
      "HR_R",
      "TEMP_F",
      "TEMP_H",
      "TEMP_T",
      "GLU",
      "pH",
    ];
    const rows = [header.join(",")];

    stageSequence.forEach((stage) => {
      const m = measurements[stage];
      if (!m) return;
      rows.push(
        [
          stageMeta[stage].short,
          m.sbpL,
          m.dbpL,
          m.hrL,
          m.sbpR,
          m.dbpR,
          m.hrR,
          m.tempForehead,
          m.tempHand,
          m.tempFoot,
          m.glu,
          m.ph,
        ]
          .map((item) => csvEscape(item))
          .join(","),
      );
    });

    downloadFile(rows.join("\n"), "kcyd-report.csv", "text/csv;charset=utf-8");
  }

  function exportTxt() {
    const payload = buildExportPayload();
    const lines: string[] = [];
    lines.push("BAO CAO 11 SO VANG");
    lines.push(`Thoi gian: ${payload.generatedAt}`);
    lines.push(`Tuoi: ${payload.basicInfo.age}`);
    lines.push(`Gioi tinh: ${payload.basicInfo.gender || "Chua chon"}`);
    lines.push(`BMI: ${payload.basicInfo.bmi ?? "N/A"}`);
    lines.push(`Nhom tuoi: ${payload.thresholds.ageGroup}`);
    lines.push(`Nguong AH: SYS ${payload.thresholds.sbp} | DIA ${payload.thresholds.dbp} | HR ${payload.thresholds.hr}`);
    lines.push("");

    stageSequence.forEach((stage) => {
      const m = payload.measurements[stage];
      if (!m) return;
      lines.push(`[${stageMeta[stage].short}]`);
      lines.push(`AH-TT: ${m.sbpL}/${m.dbpL}/${m.hrL}`);
      lines.push(`AH-TP: ${m.sbpR}/${m.dbpR}/${m.hrR}`);
      lines.push(`TEMP: ${m.tempForehead} | ${m.tempHand} | ${m.tempFoot}`);
      lines.push(`GLU: ${m.glu} | pH: ${m.ph}`);
      lines.push("");
    });

    lines.push("Huong nhan dien benh trang:");
    payload.diagnosis.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title} - ${item.reason}`);
    });

    lines.push("");
    lines.push("Thuc pham goi y:");
    payload.suggestedFoods.slice(0, 8).forEach((food, index) => {
      lines.push(`${index + 1}. ${food.ten_thuc_pham} - ${food.chua_benh}`);
    });

    lines.push("");
    lines.push(`Ghi chu giong noi: ${payload.recentFoodsVoiceNote || "Khong co"}`);

    downloadFile(lines.join("\n"), "kcyd-report.txt", "text/plain;charset=utf-8");
  }

  async function exportPdf() {
    const payload = buildExportPayload();
    const doc = new jsPDF();

    try {
      const fontUrl = new URL("./fonts/NotoSans-Regular.ttf", import.meta.url);
      const response = await fetch(fontUrl.href);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const fontBase64 = window.btoa(binary);
      doc.addFileToVFS("NotoSans-Regular.ttf", fontBase64);
      doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
      doc.setFont("NotoSans");
    } catch (error) {
      console.warn("Không thể tải font PDF, sử dụng font mặc định:", error);
    }

    const textLines: string[] = [];
    textLines.push("BAO CAO 11 SO VANG");
    textLines.push(`Generated: ${payload.generatedAt}`);
    textLines.push(`Tuoi: ${payload.basicInfo.age} | Gioi tinh: ${payload.basicInfo.gender || "N/A"}`);
    textLines.push(`BMI: ${payload.basicInfo.bmi ?? "N/A"}`);
    textLines.push(`Nhom tuoi: ${payload.thresholds.ageGroup}`);
    textLines.push(`Nguong: SYS ${payload.thresholds.sbp}, DIA ${payload.thresholds.dbp}, HR ${payload.thresholds.hr}`);
    textLines.push(" ");

    stageSequence.forEach((stage) => {
      const m = payload.measurements[stage];
      if (!m) return;
      textLines.push(`[${stageMeta[stage].short}]`);
      textLines.push(`AH-TT ${m.sbpL}/${m.dbpL}/${m.hrL} | AH-TP ${m.sbpR}/${m.dbpR}/${m.hrR}`);
      textLines.push(`TEMP ${m.tempForehead}/${m.tempHand}/${m.tempFoot} | GLU ${m.glu} | pH ${m.ph}`);
    });

    textLines.push(" ");
    textLines.push("Huong nhan dien:");
    payload.diagnosis.forEach((item, index) => {
      textLines.push(`${index + 1}. ${item.title}`);
      textLines.push(`   - ${item.reason}`);
    });

    const wrapped = doc.splitTextToSize(textLines.join("\n"), 180);
    doc.text(wrapped, 12, 12);
    doc.save("kcyd-report.pdf");
  }

  async function shareReport() {
    const payload = buildExportPayload();
    const lines: string[] = [];
    lines.push(`Bao cao KCYD - ${new Date(payload.generatedAt).toLocaleString()}`);
    lines.push(`Tuoi: ${payload.basicInfo.age}`);
    lines.push(`Gioi tinh: ${payload.basicInfo.gender || "N/A"}`);
    lines.push(`Nhom tuoi: ${payload.thresholds.ageGroup}`);
    lines.push(`Chi so AH tieu chuan: SYS ${payload.thresholds.sbp}, DIA ${payload.thresholds.dbp}, HR ${payload.thresholds.hr}`);
    lines.push("");

    stageSequence.forEach((stage) => {
      const m = payload.measurements[stage];
      if (!m) return;
      lines.push(`[${stageMeta[stage].short}]`);
      lines.push(`AH-TT: ${m.sbpL}/${m.dbpL}/${m.hrL}`);
      lines.push(`AH-TP: ${m.sbpR}/${m.dbpR}/${m.hrR}`);
      lines.push(`TEMP: ${m.tempForehead} | ${m.tempHand} | ${m.tempFoot}`);
      lines.push(`GLU: ${m.glu} | pH: ${m.ph}`);
      lines.push("");
    });

    lines.push("Huong dan nhan dien:");
    if (payload.diagnosis.length) {
      payload.diagnosis.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.title} - ${item.reason}`);
      });
    } else {
      lines.push("Chua co du lieu de nhan dien.");
    }

    const shareText = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bao cao KCYD",
          text: shareText,
        });
      } catch {
        // user cancel
      }
      return;
    }

    await navigator.clipboard.writeText(shareText);
    alert("Đã sao chép nội dung báo cáo vào clipboard.");
  }

  function renderFabMenu() {
    if (!fabOpen) return null;
    return (
      <div className="fabMenuNew">
        {stageSequence.map((stage) => (
          <button
            key={stage}
            type="button"
            className="fabMenuItemNew"
            onClick={() => gotoStage(stage)}
          >
            {stageMeta[stage].label}
          </button>
        ))}
      </div>
    );
  }

  function renderIntroPage() {
    return (
      <section className="pageCard introCard">
        <div className="sectionHeader">
          <p className="kicker">11SoVang_KCYD</p>
          <h1>Màn hình giới thiệu</h1>
          <p className="description">Ứng dụng sẽ tự động chuyển sang trang nhập thông tin sau 10 giây.</p>
        </div>
        <div className="introCount">10s</div>
        <div className="actionRow">
          <button className="primaryButton" type="button" onClick={() => setPage("basic")}>
            Vào ngay
          </button>
        </div>
      </section>
    );
  }

  function renderBasicPage() {
    return (
      <section className="pageCard">
        <div className="sectionHeader">
          <p className="kicker">Trang 2</p>
          <h1>Thông tin cơ bản</h1>
          <p className="description">Ưu tiên nhập tuổi hoặc năm sinh. Các thông số phụ có thể bỏ qua.</p>
        </div>

        <div className="basicBlock">
          <h2>Khối 1 - Tuổi</h2>
          <div className="pillInputRow">
            <div className="avatarBadge">BN</div>
            <div className="pillFields">
              <input
                className="pillInput"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(event) => handleAgeChange(event.target.value)}
                placeholder="Nhập tuổi"
              />
              <input
                className="pillInput"
                type="number"
                min="1900"
                max={String(new Date().getFullYear())}
                value={birthYear}
                onChange={(event) => handleBirthYearChange(event.target.value)}
                placeholder="Hoặc nhập năm sinh"
              />
            </div>
          </div>
          <label className="rememberLine">
            <input
              type="checkbox"
              checked={rememberAge}
              onChange={(event) => setRememberAge(event.target.checked)}
            />
            Ghi nhớ số tuổi cho lần sau
          </label>
        </div>

        <div className="basicGridTwo">
          <div className="basicBlock">
            <h2>Khối 2 - Giới tính</h2>
            <div className="inlineButtonGroup">
              <button
                type="button"
                className={gender === "Nam" ? "tabActive" : "tabButton"}
                onClick={() => setGender("Nam")}
              >
                Nam
              </button>
              <button
                type="button"
                className={gender === "Nữ" ? "tabActive" : "tabButton"}
                onClick={() => setGender("Nữ")}
              >
                Nữ
              </button>
            </div>
          </div>

          <div className="basicBlock">
            <h2>Khối 3 - BMI</h2>
            <div className="bmiRow">
              <input
                className="fieldInput"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                placeholder="Cân nặng (kg)"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <input
                className="fieldInput"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Chiều cao (m)"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
            {bmiInfo ? (
              <>
                <p className={`bmiHint ${fieldClass(bmiInfo.level)}`}>
                  BMI: {bmiInfo.bmi.toFixed(1)} - {bmiInfo.text}
                </p>
                <p className={`bmiHint ${fieldClass(bmiInfo.level)}`}>
                  {bmiInfo.detail}
                </p>
              </>
            ) : (
              <p className="description">Không nhập cũng có thể bỏ qua.</p>
            )}
          </div>
        </div>

        <div className="actionRow actionRowWide">
          <button className="primaryButton" type="button" onClick={handleContinueBasic}>
            Tiếp tục nhập liệu
          </button>
          <button className="ghostButton" type="button" onClick={() => setPage("report")}>
            Xem báo cáo nhanh
          </button>
        </div>

        <div className="fabWrap">
          {renderFabMenu()}
          <button
            type="button"
            className="fabMain"
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Mở menu 4 option"
          >
            FAB
          </button>
        </div>
      </section>
    );
  }

  function renderMetricField(label: string, field: keyof MetricValues, unit: string) {
    const level = classifyField(field);
    return (
      <label className="metricField" key={field}>
        <span>
          {label}
          {unit ? ` (${unit})` : ""}
        </span>
        <input
          ref={(element) => {
            if (element) {
              inputRefs.current[field] = element;
            }
          }}
          type="number"
          inputMode={field.startsWith("temp") || field === "ph" ? "decimal" : "numeric"}
          step={field.startsWith("temp") || field === "ph" ? "0.1" : "1"}
          className={`fieldInput ${fieldClass(level)}`}
          value={workingMetrics[field]}
          onChange={(event) => updateMetric(field, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              focusNextMetricField(field);
            }
          }}
          autoFocus={field === "sbpL"}
        />
      </label>
    );
  }

  function renderInputPage() {
    const leftRightSBP = (() => {
      const left = toNumber(workingMetrics.sbpL);
      const right = toNumber(workingMetrics.sbpR);
      if (left === null || right === null) return "-";
      return `${Math.abs(left - right).toFixed(1)} mmHg`;
    })();

    const leftRightDBP = (() => {
      const left = toNumber(workingMetrics.dbpL);
      const right = toNumber(workingMetrics.dbpR);
      if (left === null || right === null) return "-";
      return `${Math.abs(left - right).toFixed(1)} mmHg`;
    })();

    return (
      <section className="manualFormCard">
        <div className="sectionHeader">
          <p className="kicker">Nhập 11 số vàng</p>
          <h3>{stageMeta[activeStage].short}</h3>
        </div>

        <div className="compareStrip">
          <span>Chênh SYS 2 tay: {leftRightSBP}</span>
          <span>Chênh DIA 2 tay: {leftRightDBP}</span>
          <span>{stageComparisonText() ?? "Chưa có dữ liệu giai đoạn đối chiếu."}</span>
        </div>

        <div className="inputGridMobile">
          <div className="metricCard">
            <h3>Áp huyết tay trái (AH-TT)</h3>
            <div className="metricRows">
              {renderMetricField("Tâm thu SYS", "sbpL", "mmHg")}
              {renderMetricField("Tâm trương DIA", "dbpL", "mmHg")}
              {renderMetricField("Nhịp tim PULSE", "hrL", "bpm")}
            </div>
          </div>

          <div className="metricCard">
            <h3>Áp huyết tay phải (AH-TP)</h3>
            <div className="metricRows">
              {renderMetricField("Tâm thu SYS", "sbpR", "mmHg")}
              {renderMetricField("Tâm trương DIA", "dbpR", "mmHg")}
              {renderMetricField("Nhịp tim PULSE", "hrR", "bpm")}
            </div>
          </div>

          <div className="metricCard">
            <h3>Nhiệt độ TEMP</h3>
            <div className="metricRows">
              {renderMetricField("Trán", "tempForehead", "°C")}
              {renderMetricField("Út tay", "tempHand", "°C")}
              {renderMetricField("Út chân", "tempFoot", "°C")}
            </div>
          </div>

          <div className="metricCard singleLineCard">
            {renderMetricField("Đường huyết GLU", "glu", "mg/dl")}
            {renderMetricField("pH", "ph", "")}
          </div>
        </div>

        <div className="navOptionsGrid">
          {stageSequence
            .filter((stage) => stage !== activeStage)
            .map((stage) => (
              <button key={stage} type="button" className="ghostButton" onClick={() => gotoStage(stage)}>
                {stageMeta[stage].label}
              </button>
            ))}
        </div>

        <div className="actionRow">
          <button className="ghostButton" type="button" onClick={() => setPage("basic")}>Quay lại trang thông tin</button>
          <button className="primaryButton" type="button" onClick={saveCurrentStage}>Lưu option hiện tại</button>
          <button
            className="primaryButton"
            type="button"
            onClick={() => {
              saveCurrentStage();
              setPage("report");
            }}
          >
            Xem báo cáo
          </button>
        </div>

        <div className="fabWrap">
          {renderFabMenu()}
          <button
            type="button"
            className="fabMain"
            onClick={() => setFabOpen(!fabOpen)}
            aria-label="Mở FAB 4 option"
          >
            FAB
          </button>
        </div>
      </section>
    );
  }

  function renderStageBlock(stage: StageKey, values: MetricValues) {
    return (
      <div key={stage} className="reportBlock">
        <h3>{stageMeta[stage].short}</h3>
        <div className="reportGrid">
          <div>AH-TT: {values.sbpL}/{values.dbpL}/{values.hrL}</div>
          <div>AH-TP: {values.sbpR}/{values.dbpR}/{values.hrR}</div>
          <div>TEMP: {values.tempForehead}/{values.tempHand}/{values.tempFoot}</div>
          <div>GLU: {values.glu} - pH: {values.ph}</div>
        </div>
      </div>
    );
  }

  function renderReportPage() {
    return (
      <section className="reportCard">
        <div className="sectionHeader">
          <p className="kicker">Trang báo cáo</p>
          <h1>Phân tích - Nhận diện - Gợi ý điều chỉnh</h1>
          <p className="description">Tập trung số liệu và đánh dấu vùng cảnh báo theo xanh/vàng/cam/đỏ.</p>
        </div>

        <div className="reportBlock">
          <h3>Khối 1 - Tuổi và tiêu chuẩn theo nhóm tuổi</h3>
          <p>Tuổi: <strong>{age || "Chưa nhập"}</strong> - Nhóm: <strong>{ageGroup}</strong></p>
          {thresholds ? (
            <p>
              SYS: {thresholds.SBP.min}-{thresholds.SBP.max} | DIA: {thresholds.DBP.min}-{thresholds.DBP.max} | PULSE: {thresholds.HR.min}-{thresholds.HR.max}
            </p>
          ) : (
            <p>Chưa đủ dữ liệu tuổi để trích ngưỡng.</p>
          )}
        </div>

        <div className="reportBlock">
          <h3>Khối 2 - Các option đã nhập</h3>
          {filledStages.length ? (
            <div className="reportStack">
              {filledStages.map((stage) => renderStageBlock(stage, measurements[stage] as MetricValues))}
            </div>
          ) : (
            <p>Chưa có dữ liệu nào được lưu.</p>
          )}
        </div>

        <div className="reportBlock">
          <h3>Khối 3 - Hướng chẩn bệnh từ công thức nhận diện</h3>
          {diagnosis.length ? (
            <div className="diagnosisList">
              {diagnosis.map((item, index) => (
                <div key={`${item.title}-${index}`} className={`diagnosisItem ${fieldClass(item.severity)}`}>
                  <strong>{item.title}</strong>
                  <p>{item.reason}</p>
                  <small>Nhóm liên quan: {item.groups.join(", ")}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa đủ dữ liệu để nhận diện bệnh trạng.</p>
          )}

          {matchedDiseases.length ? (
            <div className="diseaseRefs">
              <div className="accordionHeader" onClick={() => setDiseaseAccordionOpen((open) => !open)}>
                <h4>Tham chiếu từ dữ liệu bệnh trạng</h4>
                <button type="button" className="accordionToggle">
                  {diseaseAccordionOpen ? "Thu gọn" : "Mở rộng"}
                </button>
              </div>
              {diseaseAccordionOpen ? (
                <div className="accordionContent">
                  {matchedDiseases.map((record) => (
                    <div key={record.ma_benh} className="diseaseItem">
                      <strong>{record.ma_benh} - {record.ten_benh}</strong>
                      <p>{record.trieu_chung}</p>
                      <p><em>Lưu ý:</em> {record.luu_y}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="reportBlock">
          <h3>Khối 4 - Ghi thực phẩm bằng giọng nói</h3>
          <textarea
            className="fieldInput"
            value={voiceFoodNote}
            onChange={(event) => setVoiceFoodNote(event.target.value)}
            placeholder="Ví dụ: phở bò, nước gừng, bánh mì..."
            rows={4}
          />
          <div className="actionRow">
            <button type="button" className="ghostButton" onClick={startVoiceInput}>
              {voiceListening ? "Đang ghi..." : "Nhập giọng nói"}
            </button>
          </div>
        </div>

        <div className="reportBlock">
          <div className="accordionHeader" onClick={() => setFoodAccordionOpen((open) => !open)}>
            <h3>Khối 5 - Hướng điều chỉnh cơ thể</h3>
            <button type="button" className="accordionToggle">
              {foodAccordionOpen ? "Thu gọn" : "Mở rộng"}
            </button>
          </div>
          {foodAccordionOpen ? (
            suggestedFoods.length ? (
              <div className="foodList">
                {suggestedFoods.map((food) => (
                  <div key={food.ma_tp} className="foodItem">
                    <strong>{food.ten_thuc_pham}</strong>
                    <p>{food.chua_benh}</p>
                    <small>Không dùng cho: {food.khong_dung_cho}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có gợi ý thực phẩm do chưa đủ dữ liệu nhận diện.</p>
            )
          ) : null}
        </div>

        <div className="actionRow">
          <button className="ghostButton" type="button" onClick={shareReport}>Chia sẻ tin nhắn</button>
          <button className="ghostButton" type="button" onClick={exportCsv}>Xuất CSV</button>
          <button className="ghostButton" type="button" onClick={exportTxt}>Xuất TXT</button>
          <button className="ghostButton" type="button" onClick={exportPdf}>Xuất PDF</button>
        </div>

        <div className="actionRow">
          <button
            className="primaryButton"
            type="button"
            onClick={() => {
              setMeasurements({
                beforeMeal: null,
                afterMeal: null,
                beforeSleep: null,
                afterSleep: null,
              });
              setWorkingMetrics(emptyMetrics);
              setActiveStage("beforeMeal");
              setVoiceFoodNote("");
              setPage("basic");
            }}
          >
            Nhập liệu mới
          </button>
          <button className="ghostButton" type="button" onClick={() => setPage("intro")}>
            Quay lại trang đầu
          </button>
          <button className="ghostButton" type="button" onClick={() => setPage("input")}>
            Quay lại nhập liệu
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="appShell">
      {page === "intro" && renderIntroPage()}
      {page === "basic" && renderBasicPage()}
      {page === "input" && renderInputPage()}
      {page === "report" && renderReportPage()}
    </div>
  );
}