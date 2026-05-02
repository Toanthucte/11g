import type { ChangeEvent } from "react";

export type MatrixStageValues = {
  SBP_L: string;
  DBP_L: string;
  HR_L: string;
  SBP_R: string;
  DBP_R: string;
  HR_R: string;
  GLU: string;
  TEMP_F: string;
  TEMP_H: string;
  TEMP_T: string;
  pH: string;
};

type Props = {
  title: string;
  stageAName: string;
  stageBName: string;
  valuesA: MatrixStageValues;
  valuesB: MatrixStageValues;
  onChangeA: (field: keyof MatrixStageValues, value: string) => void;
  onChangeB: (field: keyof MatrixStageValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const rows: Array<{
  key: keyof MatrixStageValues;
  label: string;
  unit: string;
}> = [
  { key: "SBP_L", label: "SBP tay trái", unit: "mmHg" },
  { key: "DBP_L", label: "DBP tay trái", unit: "mmHg" },
  { key: "HR_L", label: "HR tay trái", unit: "bpm" },
  { key: "SBP_R", label: "SBP tay phải", unit: "mmHg" },
  { key: "DBP_R", label: "DBP tay phải", unit: "mmHg" },
  { key: "HR_R", label: "HR tay phải", unit: "bpm" },
  { key: "GLU", label: "GLU", unit: "mg/dl" },
  { key: "TEMP_F", label: "TEMP trán", unit: "°C" },
  { key: "TEMP_H", label: "TEMP tay", unit: "°C" },
  { key: "TEMP_T", label: "TEMP chân", unit: "°C" },
  { key: "pH", label: "pH", unit: "" },
];

function renderCell(
  value: string,
  onChange: (field: keyof MatrixStageValues, value: string) => void,
  field: keyof MatrixStageValues,
) {
  return (
    <input
      type="number"
      value={value}
      step={field === "pH" || field.startsWith("TEMP") ? "0.1" : "1"}
      min="0"
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(field, event.target.value)
      }
      className="matrixInput"
    />
  );
}

export default function DataInputMatrix({
  title,
  stageAName,
  stageBName,
  valuesA,
  valuesB,
  onChangeA,
  onChangeB,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <section className="manualFormCard">
      <div className="sectionHeader">
        <p className="kicker">Nhập theo ma trận</p>
        <h1>{title}</h1>
        <p className="description">
          Nhập dữ liệu theo bảng để dễ so sánh PRE / POST hoặc SLEEP / MORNING.
        </p>
      </div>

      <div className="matrixTable">
        <div className="matrixRow header">
          <div></div>
          <div>{stageAName}</div>
          <div>{stageBName}</div>
        </div>

        {rows.map((row) => (
          <div className="matrixRow" key={row.key}>
            <div className="matrixLabel">
              {row.label}
              {row.unit && ` (${row.unit})`}
            </div>
            <div>{renderCell(valuesA[row.key], onChangeA, row.key)}</div>
            <div>{renderCell(valuesB[row.key], onChangeB, row.key)}</div>
          </div>
        ))}
      </div>

      <div className="actionRow">
        <button className="ghostButton" type="button" onClick={onCancel}>
          Quay lại
        </button>
        <button className="primaryButton" type="button" onClick={onSubmit}>
          Lưu và đánh giá
        </button>
      </div>
    </section>
  );
}