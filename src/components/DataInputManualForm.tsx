import type { ChangeEvent } from "react";

export type ManualStageValues = {
  SBP: string;
  DBP: string;
  HR: string;
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
  valuesA: ManualStageValues;
  valuesB: ManualStageValues;
  onChangeA: (field: keyof ManualStageValues, value: string) => void;
  onChangeB: (field: keyof ManualStageValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const fieldRows: Array<{
  key: keyof ManualStageValues;
  label: string;
  placeholder: string;
  unit: string;
}> = [
  { key: "SBP", label: "SBP", placeholder: "115", unit: "mmHg" },
  { key: "DBP", label: "DBP", placeholder: "72", unit: "mmHg" },
  { key: "HR", label: "HR", placeholder: "68", unit: "bpm" },
  { key: "GLU", label: "GLU", placeholder: "180", unit: "mg/dl" },
  { key: "TEMP_F", label: "TEMP trán", placeholder: "36.4", unit: "°C" },
  { key: "TEMP_H", label: "TEMP tay", placeholder: "36.2", unit: "°C" },
  { key: "TEMP_T", label: "TEMP chân", placeholder: "36.5", unit: "°C" },
  { key: "pH", label: "pH", placeholder: "6.7", unit: "" },
];

function renderField(
  stage: "A" | "B",
  field: typeof fieldRows[number],
  value: string,
  onChange: (field: keyof ManualStageValues, value: string) => void,
) {
  return (
    <label className="fieldRow" key={`${stage}-${field.key}`}>
      <span className="fieldLabel">
        {field.label}
        {field.unit ? ` (${field.unit})` : ""}
      </span>
      <input
        type="number"
        value={value}
        step={field.key === "pH" || field.key.startsWith("TEMP") ? "0.1" : "1"}
        min="0"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(field.key, event.target.value)
        }
        placeholder={field.placeholder}
        className="fieldInput"
      />
    </label>
  );
}

export default function DataInputManualForm({
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
        <p className="kicker">Nhập tay</p>
        <h1>{title}</h1>
        <p className="description">
          Điền đủ 11 chỉ số cho mỗi giai đoạn để app đánh giá chính xác.
        </p>
      </div>

      <div className="stageGrid">
        <div className="stageCard">
          <h2>{stageAName}</h2>
          {fieldRows.map((field) =>
            renderField("A", field, valuesA[field.key], onChangeA),
          )}
        </div>

        <div className="stageCard">
          <h2>{stageBName}</h2>
          {fieldRows.map((field) =>
            renderField("B", field, valuesB[field.key], onChangeB),
          )}
        </div>
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