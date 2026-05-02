import { useState, type ChangeEvent } from "react";

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
  stageName: string;
  values: MatrixStageValues;
  onFill: (values: MatrixStageValues) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const defaultValues: MatrixStageValues = {
  SBP_L: "",
  DBP_L: "",
  HR_L: "",
  SBP_R: "",
  DBP_R: "",
  HR_R: "",
  GLU: "",
  TEMP_F: "",
  TEMP_H: "",
  TEMP_T: "",
  pH: "",
};

export default function DataInputCSV({
  title,
  stageName,
  values,
  onFill,
  onConfirm,
  onCancel,
}: Props) {
  const [preview, setPreview] = useState<MatrixStageValues | null>(null);
  const [fileName, setFileName] = useState("");

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseCsv(text);
      setPreview(parsed);
    };
    reader.readAsText(file);
  }

  function parseCsv(csv: string): MatrixStageValues {
    const rows = csv
      .trim()
      .split("\n")
      .map((line) => line.split(",").map((cell) => cell.trim()));

    const header = rows[0].map((cell) => cell.toLowerCase());

    const row = rows[1] || [];
    const mapped = { ...defaultValues };

    const mapFields: Record<string, keyof MatrixStageValues> = {
      sbp_l: "SBP_L",
      dbp_l: "DBP_L",
      hr_l: "HR_L",
      sbp_r: "SBP_R",
      dbp_r: "DBP_R",
      hr_r: "HR_R",
      glu: "GLU",
      temp_f: "TEMP_F",
      temp_h: "TEMP_H",
      temp_t: "TEMP_T",
      ph: "pH",
    };

    header.forEach((col, index) => {
      const field = mapFields[col];
      if (field) {
        mapped[field] = row[index] ?? "";
      }
    });

    return mapped;
  }

  return (
    <section className="manualFormCard">
      <div className="sectionHeader">
        <p className="kicker">Import CSV</p>
        <h1>{title}</h1>
        <p className="description">
          Chọn file CSV chứa 11 chỉ số và map dữ liệu vào stage {stageName}.
        </p>
      </div>

      <div className="fileBlock">
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
        {fileName ? <p>File: {fileName}</p> : null}
      </div>

      {preview ? (
        <div className="previewCard">
          <h2>Preview dữ liệu</h2>
          <table className="previewTable">
            <tbody>
              {Object.entries(preview).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="primaryButton"
            type="button"
            onClick={() => onFill(preview)}
          >
            Áp dụng dữ liệu
          </button>
        </div>
      ) : (
        <p className="description">
          File cần có header dạng SBP_L, DBP_L, HR_L, SBP_R, DBP_R, HR_R, GLU,
          TEMP_F, TEMP_H, TEMP_T, pH
        </p>
      )}

      <div className="actionRow">
        <button className="ghostButton" type="button" onClick={onCancel}>
          Quay lại
        </button>
        <button
          className="primaryButton"
          type="button"
          onClick={onConfirm}
          disabled={!preview}
        >
          Tiếp tục
        </button>
      </div>
    </section>
  );
}