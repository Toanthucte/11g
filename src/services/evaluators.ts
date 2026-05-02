import type { Evaluation, Range } from "./ruleEngine.types";

export function evaluateSBP(value: number, threshold: Range): Evaluation {
  if (value > threshold.max) return { state: "Khí thực", level: "vàng" };
  if (value === threshold.max) return { state: "Khí đủ", level: "xanh" };
  if (value < threshold.min) return { state: "Khí hư", level: "đỏ" };
  return { state: "Khí đủ", level: "xanh" };
}

export function evaluateDBP(pre: number, post: number): Evaluation {
  const delta = post - pre;
  if (post < 60) return { state: "DBP thấp nghiêm trọng", level: "đỏ" };
  if (delta < 0) return { state: "Mất máu", level: "đỏ" };
  if (delta === 0) return { state: "Không chuyển hóa", level: "vàng" };
  return { state: "MÁU TĂNG", level: "xanh" };
}

export function evaluateDBPValue(value: number, threshold: Range): Evaluation {
  if (value < 60) return { state: "DBP thấp nghiêm trọng", level: "đỏ" };
  if (value < threshold.min) return { state: "DBP thấp", level: "vàng" };
  return { state: "DBP bình thường", level: "xanh" };
}

export function evaluateHR(value: number, threshold: Range, tempValues: number[]): Evaluation {
  const tempHigh = tempValues.some((t) => t > 37);
  if (value < threshold.min) return { state: "Thiếu đường dương", level: "vàng" };
  if (value > 90 && tempHigh) return { state: "Nhiệt thực", level: "đỏ" };
  return { state: "Nhiệt đủ", level: "xanh" };
}

export function evaluateGLU(value: number): Evaluation {
  if (value < 140) return { state: "Thiếu đường", level: "vàng" };
  if (value <= 199) return { state: "Đủ đường", level: "xanh" };
  return { state: "Cao", level: "đỏ" };
}

export function evaluatePH(value: number): Evaluation {
  if (value < 6.0) return { state: "Toan nặng", level: "đỏ" };
  if (value < 6.5) return { state: "Toan nhẹ", level: "vàng" };
  return { state: "Môi trường tốt", level: "xanh" };
}

export function evaluateTEMP(preTemps: number[], postTemps: number[]): Evaluation {
  const anyLow = postTemps.some((t) => t < 36);
  const allNormal = postTemps.every((t) => t >= 36.0 && t <= 36.6);
  const decreasedOrSame = postTemps.every((t, i) => t <= preTemps[i]);

  if (anyLow) return { state: "Nhiệt kém", level: "vàng" };
  if (allNormal) return { state: "Kinh mạch thông", level: "xanh" };
  if (decreasedOrSame) return { state: "Chuyển hóa kém", level: "vàng" };
  return { state: "Chuyển hóa thuận", level: "xanh" };
}

export function evaluateHandGap(left: number, right: number): Evaluation {
  const gap = Math.abs(left - right);
  if (gap > 15) return { state: "Chênh lệch hai tay lớn", level: "đỏ" };
  return { state: "Chênh lệch hai tay bình thường", level: "xanh" };
}

export function delta(pre: number, post: number): number {
  return post - pre;
}