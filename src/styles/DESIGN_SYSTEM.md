# Design System của Y11 New

Tài liệu này tổng hợp các design token và kiểu dạng chính dùng trong app `y11-new`. Bạn có thể dùng lại cho app khác bằng cách sao chép các token và lớp thiết kế chung.

## 1. Typography

### Font families
- `--font-heading`: 'Montserrat', 'Sora', sans-serif
- `--font-body`: 'Sora', 'Trebuchet MS', 'Segoe UI', sans-serif
- `--font-data`: 'Inter', 'Roboto', 'Segoe UI', sans-serif

### Font sizes & hierarchy
- Heading lớn: `clamp(2rem, 6vw, 3rem)`
- Body text cơ bản: `1rem`
- Data / input text: `1.05rem`
- Label / kicker: `0.75rem`

### Text colors
- `--text-primary`: #ffffff
- `--text-secondary`: rgba(214, 232, 255, 0.72)
- `--text-muted`: rgba(180, 210, 255, 0.5)
- `--text-label`: rgba(200, 224, 255, 0.65)

### Text styles
- Kicker uppercase: letter-spacing `0.14em`, font-weight `700`, text-transform `uppercase`
- Heading: line-height `1.03`, letter-spacing `-0.02em`
- Input field: font-weight `600`, letter-spacing `-0.01em`

## 2. Color palette

### Primary palette
- `--navy-deepest`: #000b18
- `--navy-deep`: #001020
- `--navy-mid`: #001f3f
- `--navy-surface`: #062040

### Accent palette
- `--accent`: #3aa0ff
- `--accent-glow`: rgba(58, 160, 255, 0.45)

### Glass / surface colors
- `--glass-bg`: rgba(255, 255, 255, 0.1)
- `--glass-bg-hover`: rgba(255, 255, 255, 0.14)
- `--glass-border`: rgba(255, 255, 255, 0.18)
- `--glass-blur`: blur(10px)

## 3. Layout & spacing

### Container shells
- `.preLoginShell`, `.appPageShell`
  - `min-height: 100dvh`
  - `display: flex`
  - `align-items: stretch`
  - `padding: 1.25rem`
  - background gradient layer với radial + linear gradient

- `.preLoginScreen`, `.appPageCard`
  - `width: min(100%, 430px)`
  - `margin: 0 auto`
  - `min-height: calc(100dvh - 2.5rem)`
  - `display: flex`, `flex-direction: column`
  - `gap: 1.25rem` / `1.5rem`
  - `padding: 0.25rem 0 1.2rem`

### Spacing
- `padding` chung: `1.25rem`, `0.25rem`, `0.65rem`, `0.8rem`
- `gap` bảng: `0.5rem`, `0.75rem`, `0.8rem`, `1.25rem`, `1.5rem`
- `border-radius`: `999px` (viên thuốc / pill), `5px`, `6px`

## 4. Surfaces & components

### Glass card / panel
- `background: var(--glass-bg)`
- `border: 1px solid var(--glass-border)`
- `backdrop-filter: var(--glass-blur)`
- Kết hợp màu text nhẹ: `--text-secondary`, `--text-muted`, `--text-label`

### Button / pill control
- `.backButton`
  - `width`, `height`: `2.75rem`
  - `display: grid`, `place-items: center`
  - `border: 1px solid var(--glass-border)`
  - `border-radius: 999px`
  - `background: var(--glass-bg)`
  - `transition: background 160ms ease, border-color 160ms ease`

- Hover state
  - `background: var(--glass-bg-hover)`
  - `border-color: rgba(255, 255, 255, 0.28)`

### Smart search bar
- `.smartBar`
  - `display: grid`
  - `grid-template-columns: auto 1fr auto`
  - `align-items: center`
  - `gap: 0.8rem`
  - `min-height: 4.35rem`
  - `padding: 0.65rem 0.8rem 0.65rem 1rem`
  - `border-radius: 999px`
  - `background: #ffffff`
  - `box-shadow: 0 18px 38px rgba(1, 18, 45, 0.24)`

- `.smartBarPrefix`
  - `font-weight: 700`
  - `letter-spacing: 0.06em`
  - `color: #11315e`

- Input field trong `.smartBar`
  - `border: 0`, `background: transparent`, `outline: none`
  - `font-family: var(--font-data)`
  - `font-size: 1.05rem`, `font-weight: 600`
  - placeholder: `color: #8ca0bb`

## 5. Background styles

### Main gradient background
- `linear-gradient(160deg, var(--navy-mid) 0%, var(--navy-deep) 55%, var(--navy-deepest) 100%)`
- Kết hợp với các tia ánh sáng radial:
  - `rgba(0, 80, 160, 0.38)`
  - `rgba(0, 50, 110, 0.22)`
  - `rgba(0, 90, 180, 0.28)`
  - `rgba(0, 60, 130, 0.2)`

## 6. Motion / transition

### Page transitions
- `AnimatePresence` + `framer-motion`
- `initial`: `{ x: '100%', opacity: 0.96 }`
- `animate`: `{ x: '0%', opacity: 1 }`
- `exit`: `{ x: '-22%', opacity: 0.82 }`
- Motion timing
  - `spring` stiffness `260`, damping `28`
  - opacity duration `0.24s easeOut`
  - exit duration `0.34s ease`

### Hover transitions
- Buttons và glass surfaces sử dụng `transition: background 160ms ease, border-color 160ms ease`
- Link hover: `box-shadow` chuyển tiếp 0.3s

## 7. Patterns & component rules

### Base rules
- `* { box-sizing: border-box; }`
- `html, body, #root { margin: 0; min-height: 100%; }`
- `body { min-height: 100dvh; }`
- Root text rendering: `optimizeLegibility`, `antialiased`, `grayscale`

### Layout pattern
- Các màn hình chính đều sử dụng shell trung tâm với chiều rộng tối đa `430px`
- Khoảng cách `auto` hai bên để căn giữa
- Dùng `flex` theo cột với `gap` rõ ràng để chia sections

### Glassmorphism pattern
- Nền mờ mềm
- Viền trắng mờ
- Blur sau lớp kính
- Chữ màu sáng, độ tương phản vừa đủ

## 8. Cách dùng lại cho app khác

1. Nhập font Google trong `index.html` hoặc `index.css`:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap');
   ```
2. Đặt các token gốc trong `:root`:
   ```css
   :root {
     --navy-deepest: #000b18;
     --navy-deep: #001020;
     --navy-mid: #001f3f;
     --navy-surface: #062040;
     --glass-bg: rgba(255, 255, 255, 0.1);
     --glass-bg-hover: rgba(255, 255, 255, 0.14);
     --glass-border: rgba(255, 255, 255, 0.18);
     --glass-blur: blur(10px);
     --accent: #3aa0ff;
     --accent-glow: rgba(58, 160, 255, 0.45);
     --text-primary: #ffffff;
     --text-secondary: rgba(214, 232, 255, 0.72);
     --text-muted: rgba(180, 210, 255, 0.5);
     --text-label: rgba(200, 224, 255, 0.65);
     --font-heading: 'Montserrat', 'Sora', sans-serif;
     --font-body: 'Sora', 'Trebuchet MS', 'Segoe UI', sans-serif;
     --font-data: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
   }
   ```
3. Dùng lại các lớp layout và surface đã định nghĩa để giữ ngôn ngữ thiết kế nhất quán.

---

> File này là bản tóm tắt design system để tái sử dụng cho ứng dụng khác. Bạn có thể mở rộng thêm bằng cách chuyển các token thành `tokens.ts` hoặc `theme.css` khi chuyển hoá sang dự án React / Tailwind / Styled Components.
