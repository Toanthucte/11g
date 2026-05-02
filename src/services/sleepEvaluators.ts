import type { Evaluation, Range } from "./ruleEngine.types";

export function evaluateGLU_SLEEP(value: number): Evaluation {
  if (value < 140) return { state: "Nguy cơ đột tử đêm", level: "đỏ" };
  if (value <= 200) return { state: "Bình thường theo KCYD", level: "vàng" };
  return { state: "An toàn khi ngủ", level: "xanh" };
}

export function evaluatePH_SLEEP(value: number): Evaluation {
  if (value < 6.0) return { state: "Toan mạnh", level: "đỏ" };
  if (value < 6.5) return { state: "Toan nhẹ", level: "vàng" };
  return { state: "Bình thường", level: "xanh" };
}

export function evaluatePressureGap(left: number, right: number): Evaluation {
  const gap = Math.abs(left - right);
  if (gap > 15) return { state: "Nguy cơ đột quỵ", level: "đỏ" };
  return { state: "Bình thường", level: "xanh" };
}

export function evaluateHR_SLEEP(value: number, threshold: Range, temps: number[]): Evaluation {
  const anyCold = temps.some((t) => t < 36);
  if (value < 50) return { state: "Nguy hiểm", level: "đỏ" };
  if (anyCold && value < threshold.min) return { state: "Hàn", level: "đỏ" };
  if (value < threshold.min) return { state: "Thiếu đường/Hàn", level: "vàng" };
  return { state: "Bình thường", level: "xanh" };
}

export function evaluateGLU_MORNING(value: number, gluSleep: number): Evaluation {
  if (value < 80) return { state: "Thiếu đường nghiêm trọng", level: "đỏ" };
  if (value < gluSleep - 60) return { state: "Tiêu hao nhiều", level: "vàng" };
  return { state: "Đủ đường", level: "xanh" };
}

export function compareSleepMorning(gluSleep: number, gluMorning: number): Evaluation {
  const delta = gluSleep - gluMorning;
  if (gluMorning < 80) return { state: "Nguy hiểm", level: "đỏ" };
  if (delta > 100) return { state: "Tiêu hao nhiều", level: "vàng" };
  return { state: "Tiêu hao bình thường", level: "xanh" };
}