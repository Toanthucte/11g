# App Core 304 (React + TypeScript + Vite)

## Chay nhanh

### 1) Cai dependency

```bash
npm install
```

### 2) Chay dev server

```bash
npm run dev
```

App se mo tren local network host do `vite --host`.

### 3) Kiem tra type + build deploy

```bash
npm run deploy:check
```

### 4) Build production

```bash
npm run build:deploy
```

Ket qua build nam trong thu muc `dist/`.

### 5) Preview ban build

```bash
npm run preview
```

Mac dinh preview chay cong `4173`.

## Scripts

- `npm run dev`: Chay local dev server.
- `npm run clean`: Xoa thu muc build tam `dist`.
- `npm run typecheck`: Kiem tra TypeScript khong emit file.
- `npm run build`: Clean + build thong thuong.
- `npm run build:deploy`: Clean + production build.
- `npm run preview`: Preview ban build.
- `npm run deploy:check`: Typecheck + build deploy.

## Cau truc thu muc

- `src/components`: UI components.
- `src/services`: Rule engine, evaluators, report generator.
- `src/styles`: Styles va design docs.
- `src/data`: JSON data files.
- `src/App.tsx`: App shell va routing flow.
- `src/main.tsx`: Entry point.

## Alias import

Du an da cau hinh alias:

- `@/components/*`
- `@/services/*`
- `@/styles/*`
- `@/data/*`

Config nam tai:

- `tsconfig.json`
- `vite.config.ts`
