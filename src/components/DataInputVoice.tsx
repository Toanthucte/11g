import { useEffect, useState, type ChangeEvent } from "react";

export type VoiceStageValues = {
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
  valuesA: VoiceStageValues;
  valuesB: VoiceStageValues;
  onChangeA: (field: keyof VoiceStageValues, value: string) => void;
  onChangeB: (field: keyof VoiceStageValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const fields: Array<{
  key: keyof VoiceStageValues;
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

const patterns: Array<{
  regex: RegExp;
  key: keyof VoiceStageValues;
}> = [
  { regex: /sbp(?:\s*trái|\s*trai)?\s*[:\-]?\s*([\d.]+)/i, key: "SBP_L" },
  { regex: /dbp(?:\s*trái|\s*trai)?\s*[:\-]?\s*([\d.]+)/i, key: "DBP_L" },
  { regex: /hr(?:\s*trái|\s*trai)?\s*[:\-]?\s*([\d.]+)/i, key: "HR_L" },
  { regex: /sbp(?:\s*phải|\s*phai)?\s*[:\-]?\s*([\d.]+)/i, key: "SBP_R" },
  { regex: /dbp(?:\s*phải|\s*phai)?\s*[:\-]?\s*([\d.]+)/i, key: "DBP_R" },
  { regex: /hr(?:\s*phải|\s*phai)?\s*[:\-]?\s*([\d.]+)/i, key: "HR_R" },
  { regex: /glu\s*[:\-]?\s*([\d.]+)/i, key: "GLU" },
  { regex: /temp(?:\s*trán|\s*tran)?\s*[:\-]?\s*([\d.]+)/i, key: "TEMP_F" },
  { regex: /temp(?:\s*tay)?\s*[:\-]?\s*([\d.]+)/i, key: "TEMP_H" },
  { regex: /temp(?:\s*chân|\s*chan)?\s*[:\-]?\s*([\d.]+)/i, key: "TEMP_T" },
  { regex: /ph\s*[:\-]?\s*([\d.]+)/i, key: "pH" },
];

function parseSpeechToValues(text: string): VoiceStageValues {
  const normalized = text
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/điểm/g, "")
    .replace(/độ/g, "")
    .replace(/phương|phương pháp/g, "ph");

  const result: VoiceStageValues = {
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

  let matched = false;

  patterns.forEach(({ regex, key }) => {
    const match = normalized.match(regex);
    if (match?.[1]) {
      result[key] = match[1];
      matched = true;
    }
  });

  if (!matched) {
    const numbers = normalized.match(/[\d.]+/g) || [];
    const order: Array<keyof VoiceStageValues> = [
      "SBP_L",
      "DBP_L",
      "HR_L",
      "SBP_R",
      "DBP_R",
      "HR_R",
      "GLU",
      "TEMP_F",
      "TEMP_H",
      "TEMP_T",
      "pH",
    ];
    numbers.slice(0, order.length).forEach((value, index) => {
      result[order[index]] = value;
    });
  }

  return result;
}

export default function DataInputVoice({
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
  const [activeStage, setActiveStage] = useState<"A" | "B">("A");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState(
    "Nhấn micro và đọc: SBP trái 118, DBP trái 72, HR trái 68...",
  );
  const [previewValues, setPreviewValues] = useState<VoiceStageValues>({
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
  });

  useEffect(() => {
    if (!isListening) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null;

    if (!SpeechRecognition) {
      setMessage("Trình duyệt không hỗ trợ giọng nói.");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setMessage("Đã nhận diện giọng nói. Hiển thị xem trước...");
      const parsed = parseSpeechToValues(text);
      setPreviewValues(parsed);
    };

    recognition.onerror = () => {
      setMessage("Không nhận diện được. Vui lòng thử lại.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    return () => recognition.stop();
  }, [isListening, activeStage, onChangeA, onChangeB]);

  const currentValues = activeStage === "A" ? valuesA : valuesB;
  const currentSetter = activeStage === "A" ? onChangeA : onChangeB;

  return (
    <section className="manualFormCard">
      <div className="sectionHeader">
        <p className="kicker">Nhập bằng giọng nói</p>
        <h1>{title}</h1>
        <p className="description">
          Nói các chỉ số theo thứ tự hoặc theo từ khoá. App sẽ tự ghi lại.
        </p>
      </div>

      <div className="stageSwitch">
        <button
          className={activeStage === "A" ? "tabActive" : "tabButton"}
          type="button"
          onClick={() => setActiveStage("A")}
        >
          {stageAName}
        </button>
        <button
          className={activeStage === "B" ? "tabActive" : "tabButton"}
          type="button"
          onClick={() => setActiveStage("B")}
        >
          {stageBName}
        </button>
      </div>

      <div className="voicePanel">
        <button
          className={`fabButton ${isListening ? "listening" : ""}`}
          type="button"
          onClick={() => setIsListening((prev) => !prev)}
        >
          {isListening ? "Đang nghe..." : "Nói"}
        </button>
        <p className="voiceMessage">{message}</p>
      </div>

      <div className="transcriptBlock">
        <label className="fieldRow">
          <span className="fieldLabel">Phiên ghi âm</span>
          <textarea
            className="fieldInput"
            rows={4}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />
        </label>
      </div>

      <div className="fieldGroup">
        {fields.map((field) => (
          <label className="fieldRow" key={field.key}>
            <span className="fieldLabel">
              {field.label}
              {field.unit ? ` (${field.unit})` : ""}
            </span>
            <input
              className="fieldInput"
              type="text"
              value={currentValues[field.key]}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                currentSetter(field.key, event.target.value)
              }
              placeholder={`Nhập ${field.label}`}
            />
          </label>
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

      <div className="previewCard">
        <div className="fieldRow">
          <button type="button" className="ghostButton" onClick={() => {
            const parsed = parseSpeechToValues(transcript);
            setPreviewValues(parsed);
            setMessage("Xem trước đã cập nhật.");
          }}>
            Xem trước
          </button>
          <button
            type="button"
            className="primaryButton"
            onClick={() => {
              const setter = activeStage === "A" ? onChangeA : onChangeB;
              (Object.keys(previewValues) as Array<keyof VoiceStageValues>).forEach((key) => {
                setter(key, previewValues[key]);
              });
              setMessage("Đã áp dụng dữ liệu xem trước vào form.");
            }}
          >
            Áp dụng
          </button>
        </div>

        <div className="previewGrid">
          {Object.entries(previewValues).map(([key, value]) => (
            <div className="previewRow" key={key}>
              <span className="previewLabel">{key}</span>
              <span className="previewValue">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}