import { useState } from "react";

export type InputMethod =
  | "voice"
  | "csv"
  | "matrix"
  | "wizard"
  | "manual"
  | "device";

export type FlowMode = "step2" | "step3";

const methods: Array<{
  id: InputMethod;
  title: string;
  subtitle: string;
}> = [
  {
    id: "voice",
    title: "Nhập bằng giọng nói",
    subtitle: "Nói số liệu, app nhận diện và ghi lại.",
  },
  {
    id: "csv",
    title: "Import từ CSV",
    subtitle: "Tải file dữ liệu từ máy đo.",
  },
  {
    id: "matrix",
    title: "Nhập theo ma trận",
    subtitle: "Bảng PRE / POST hoặc SLEEP / MORNING.",
  },
  {
    id: "wizard",
    title: "Wizard từng bước",
    subtitle: "Chia nhỏ form theo nhóm chỉ số.",
  },
  {
    id: "manual",
    title: "Nhập thủ công bằng form",
    subtitle: "Điền trực tiếp 11 chỉ số.",
  },
  {
    id: "device",
    title: "Kết nối thiết bị",
    subtitle: "Lấy dữ liệu tự động từ thiết bị.",
  },
];

type Props = {
  selectedMethod: InputMethod | null;
  flowMode: FlowMode;
  onSelectMethod: (method: InputMethod) => void;
  onChangeFlowMode: (mode: FlowMode) => void;
  onBack: () => void;
};

export default function DataInputMethodScreen({
  selectedMethod,
  flowMode,
  onSelectMethod,
  onChangeFlowMode,
  onBack,
}: Props) {
  const [fabOpen, setFabOpen] = useState(false);

  const modeDescription =
    flowMode === "step2"
      ? "Step 2: So sánh Trước ăn / Sau ăn để đánh giá phản ứng bài ăn và tình trạng khí huyết."
      : "Step 3: So sánh Trước ngủ / Sáng để đánh giá chất lượng giấc ngủ và phục hồi sáng hôm sau.";

  return (
    <section className="pageCard">
      <div className="headerBlock">
        <p className="kicker">Nhập liệu 11 chỉ số</p>
        <h1>Chọn cách nhập</h1>
        <p className="description">
          Chọn phương thức phù hợp rồi điền dữ liệu PRE / POST hoặc SLEEP / MORNING.
        </p>

        <div className="flowToggle">
          <button
            className={flowMode === "step2" ? "tabActive" : "tabButton"}
            type="button"
            onClick={() => onChangeFlowMode("step2")}
          >
            Step 2
          </button>
          <button
            className={flowMode === "step3" ? "tabActive" : "tabButton"}
            type="button"
            onClick={() => onChangeFlowMode("step3")}
          >
            Step 3
          </button>
        </div>

        <p className="description">{modeDescription}</p>
      </div>

      <div className="methodGrid">
        {methods.map((method) => (
          <button
            key={method.id}
            className={`methodCard ${
              selectedMethod === method.id ? "methodCardActive" : ""
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="methodIcon">{method.id.toUpperCase()}</div>
            <div>
              <h2>{method.title}</h2>
              <p>{method.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="footerRow">
        <button className="ghostButton" onClick={onBack}>
          Quay lại
        </button>
        <button
          className="fabButton"
          onClick={() => setFabOpen(!fabOpen)}
          aria-label="Mở menu phương thức nhập"
        >
          +
        </button>
      </div>

      {fabOpen ? (
        <div className="fabMenu">
          {methods.map((method) => (
            <button
              key={method.id}
              className="fabMenuItem"
              onClick={() => {
                setFabOpen(false);
                onSelectMethod(method.id);
              }}
            >
              <span>{method.title}</span>
              <small>{method.subtitle}</small>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}