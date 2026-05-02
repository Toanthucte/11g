import { useState, type ChangeEvent } from "react";

export type WizardValues = {
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
  stageName: string;
  initialValues: WizardValues;
  onSave: (values: WizardValues) => void;
  onCancel: () => void;
};

const stepFields: Array<{
  label: string;
  keys: Array<keyof WizardValues>;
}> = [
  {
    label: "Bước 1 - Huyết áp và nhịp tim",
    keys: ["SBP_L", "DBP_L", "HR_L", "SBP_R", "DBP_R", "HR_R"],
  },
  {
    label: "Bước 2 - Đường và nhiệt độ",
    keys: ["GLU", "TEMP_F", "TEMP_H", "TEMP_T"],
  },
  {
    label: "Bước 3 - pH và kiểm tra",
    keys: ["pH"],
  },
];

const fieldMeta: Record<keyof WizardValues, { label: string; unit: string }> = {
  SBP_L: { label: "SBP tay trái", unit: "mmHg" },
  DBP_L: { label: "DBP tay trái", unit: "mmHg" },
  HR_L: { label: "HR tay trái", unit: "bpm" },
  SBP_R: { label: "SBP tay phải", unit: "mmHg" },
  DBP_R: { label: "DBP tay phải", unit: "mmHg" },
  HR_R: { label: "HR tay phải", unit: "bpm" },
  GLU: { label: "GLU", unit: "mg/dl" },
  TEMP_F: { label: "TEMP trán", unit: "°C" },
  TEMP_H: { label: "TEMP tay", unit: "°C" },
  TEMP_T: { label: "TEMP chân", unit: "°C" },
  pH: { label: "pH", unit: "" },
};

export default function DataInputWizard({
  title,
  stageName,
  initialValues,
  onSave,
  onCancel,
}: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>(initialValues);

  function handleChange(field: keyof WizardValues, value: string) {
    setValues({ ...values, [field]: value });
  }

  const currentStep = stepFields[step];

  return (
    <section className="manualFormCard">
      <div className="sectionHeader">
        <p className="kicker">Wizard nhập liệu</p>
        <h1>{title}</h1>
        <p className="description">
          Nhập dữ liệu cho giai đoạn <strong>{stageName}</strong>. Điền theo từng
          bước, mỗi bước chỉ hiển thị một nhóm chỉ số.
        </p>
      </div>

      <div className="wizardStep">
        <h2>{currentStep.label}</h2>
        <div className="fieldGroup">
          {currentStep.keys.map((key) => (
            <label className="fieldRow" key={key}>
              <span className="fieldLabel">
                {fieldMeta[key].label}
                {fieldMeta[key].unit ? ` (${fieldMeta[key].unit})` : ""}
              </span>
              <input
                type="number"
                value={values[key]}
                step={key === "pH" || key.startsWith("TEMP") ? "0.1" : "1"}
                min="0"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(key, event.target.value)
                }
                className="fieldInput"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="actionRow">
        <button
          className="ghostButton"
          type="button"
          onClick={step === 0 ? onCancel : () => setStep(step - 1)}
        >
          {step === 0 ? "Quay lại" : "Bước trước"}
        </button>

        {step < stepFields.length - 1 ? (
          <button
            className="primaryButton"
            type="button"
            onClick={() => setStep(step + 1)}
          >
            Bước tiếp
          </button>
        ) : (
          <button className="primaryButton" type="button" onClick={() => onSave(values)}>
            Hoàn tất
          </button>
        )}
      </div>
    </section>
  );
}