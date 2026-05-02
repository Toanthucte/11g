import { useState } from "react";

export type DeviceValues = {
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
  values: DeviceValues;
  onFill: (values: DeviceValues) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DataInputDevice({
  title,
  stageName,
  values,
  onFill,
  onConfirm,
  onCancel,
}: Props) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Chưa kết nối thiết bị");

  function handleConnect() {
    setStatus("Đang tìm thiết bị...");
    setTimeout(() => {
      setConnected(true);
      setStatus("Thiết bị đã kết nối");
    }, 1000);
  }

  function handleFetch() {
    setStatus("Đang lấy dữ liệu từ thiết bị...");
    setTimeout(() => {
      const deviceData: DeviceValues = {
        SBP_L: "118",
        DBP_L: "74",
        HR_L: "72",
        SBP_R: "116",
        DBP_R: "73",
        HR_R: "71",
        GLU: "185",
        TEMP_F: "36.4",
        TEMP_H: "36.2",
        TEMP_T: "36.5",
        pH: "6.7",
      };
      onFill(deviceData);
      setStatus("Đã lấy dữ liệu từ thiết bị");
    }, 1200);
  }

  return (
    <section className="manualFormCard">
      <div className="sectionHeader">
        <p className="kicker">Kết nối thiết bị</p>
        <h1>{title}</h1>
        <p className="description">
          Kết nối máy đo để tự động nhận 11 chỉ số cho stage {stageName}.
        </p>
      </div>

      <div className="devicePanel">
        <div className="deviceStatus">
          <span className={connected ? "statusGood" : "statusWarn"}>{status}</span>
        </div>

        <div className="deviceButtons">
          <button
            className="ghostButton"
            type="button"
            onClick={handleConnect}
            disabled={connected}
          >
            {connected ? "Đã kết nối" : "Kết nối thiết bị"}
          </button>
          <button
            className="primaryButton"
            type="button"
            onClick={handleFetch}
            disabled={!connected}
          >
            Lấy dữ liệu
          </button>
        </div>
      </div>

      <div className="previewCard">
        <h2>Dữ liệu hiện tại</h2>
        <div className="gridPreview">
          {Object.entries(values).map(([key, value]) => (
            <div key={key} className="previewRow">
              <span>{key}</span>
              <span>{value || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="actionRow">
        <button className="ghostButton" type="button" onClick={onCancel}>
          Quay lại
        </button>
        <button className="primaryButton" type="button" onClick={onConfirm}>
          Hoàn tất
        </button>
      </div>
    </section>
  );
}