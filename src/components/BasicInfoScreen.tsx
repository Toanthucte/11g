import type { Dispatch, SetStateAction } from "react";

type BasicInfo = {
  age: string;
  gender: string;
  weight: string;
  height: string;
};

type Props = {
  value: BasicInfo;
  onChange: Dispatch<SetStateAction<BasicInfo>>;
  onNext: () => void;
};

export default function BasicInfoScreen({ value, onChange, onNext }: Props) {
  return (
    <section className="pageCard">
      <div className="headerBlock">
        <p className="kicker">Thông tin cơ bản</p>
        <h1>Nhập thông tin để xác định ngưỡng</h1>
        <p className="description">
          Điền tuổi, giới tính, cân nặng và chiều cao. Dữ liệu này dùng cho
          cảnh báo và ngưỡng SBP/DBP/HR.
        </p>
      </div>

      <div className="formGrid">
        <label className="fieldCard">
          <span>Tuổi</span>
          <input
            type="number"
            value={value.age}
            onChange={(event) => onChange({ ...value, age: event.target.value })}
            placeholder="35"
          />
        </label>

        <label className="fieldCard">
          <span>Giới tính</span>
          <select
            value={value.gender}
            onChange={(event) => onChange({ ...value, gender: event.target.value })}
          >
            <option value="">Chọn</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </label>

        <label className="fieldCard">
          <span>Cân nặng (kg)</span>
          <input
            type="number"
            value={value.weight}
            onChange={(event) => onChange({ ...value, weight: event.target.value })}
            placeholder="62"
          />
        </label>

        <label className="fieldCard">
          <span>Chiều cao (cm)</span>
          <input
            type="number"
            value={value.height}
            onChange={(event) => onChange({ ...value, height: event.target.value })}
            placeholder="168"
          />
        </label>
      </div>

      <button className="primaryButton" onClick={onNext}>
        Tiếp theo
      </button>
    </section>
  );
}