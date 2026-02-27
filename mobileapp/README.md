# Kollapp Mobile App

SvelteKit-based mobile application for Kollapp, built with Ionic components and Capacitor for native Android deployment.

## Project Structure

```
src/
├── lib/
│   ├── api/           - API services, DTOs, and schemas
│   ├── assets/        - Static assets
│   ├── components/    - Reusable Svelte components
│   ├── environment/   - Environment configuration
│   ├── ionic/         - Ionic integration utilities
│   ├── locales/       - i18n translation files
│   ├── models/        - Data models (API, storage, stores, UI, OSM)
│   ├── stores/        - Svelte stores for state management
│   └── utility/       - Helper utilities and scripts
├── routes/
│   ├── account/       - Account management pages
│   ├── auth/          - Authentication pages
│   ├── organization/  - Organization pages
│   └── showcase/      - Component showcase
└── test/              - Unit tests
```

## Tech Stack

- **Framework**: SvelteKit 2 (Svelte 5 with Runes)
- **UI Components**: Ionic 8
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5 (strict mode)
- **Native Runtime**: Capacitor 8 (Android)
- **Charts**: ApexCharts
- **Maps**: Leaflet
- **i18n**: sveltekit-i18n
- **Validation**: Yup
- **Testing**: Vitest + Testing Library
- **Documentation**: TypeDoc

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm

### Initial Setup

1. **Install pnpm globally**:

   ```bash
   npm i -g pnpm
   ```

2. **Install dependencies**:

   ```bash
   pnpm i --frozen-lockfile
   ```

3. **Run in development mode**:
   ```bash
   pnpm dev
   ```

## Development

### Available Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `pnpm dev`           | Start development server                 |
| `pnpm build`         | Production build (runs validation first) |
| `pnpm preview`       | Preview production build                 |
| `pnpm build-android` | Build Android APK                        |
| `pnpm run-android`   | Build and run on Android device/emulator |
| `pnpm build-web`     | Build for web deployment (Node adapter)  |

### Adapters

The project supports two SvelteKit adapters, selected via the `ADAPTER` environment variable:

- **`node`** (default) — Server-side rendering with `@sveltejs/adapter-node`
- **`static`** — Static site generation with `@sveltejs/adapter-static` (used for Android builds)

## Testing

```bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

- **Framework**: Vitest with jsdom environment
- **Component Testing**: @testing-library/svelte
- **Coverage**: V8 provider, scoped to `src/lib/components/**/*.svelte`
- **Test Location**: `src/test/unit/**/*.test.ts`

## Code Quality

### Formatting

```bash
# Format project (Prettier + ESLint autofix)
pnpm format
```

- **Prettier** with Svelte and Tailwind CSS plugins

### Linting

```bash
# Check formatting and lint
pnpm lint

# Full validation (type check + lint + i18n check)
pnpm validate
```

- **ESLint 9** with flat config
- **Plugins**: TypeScript, Svelte, Unicorn, SonarJS, Perfectionist, Import
- **Type Checking**: `svelte-check` with strict TypeScript

### i18n Validation

```bash
# Check for unused/missing translations
pnpm i18n
```

Uses `i18n-unused` to detect unused and missing translation keys across `src/lib/locales`.

## Documentation

```bash
# Generate and serve docs with live reload
pnpm doc
```

- Visit http://localhost:1234
- Generated with TypeDoc into `docs/`
- Covers: utilities, models, stores, locales, API services, DTOs, and schemas

## Android Build

### Build APK

```bash
pnpm build-android
```

This command:

1. Builds the SvelteKit app with the static adapter
2. Syncs the build output to the Capacitor Android project
3. Runs Gradle `assembleDebug` to produce an APK

### Run on Device

```bash
pnpm run-android
```

### Capacitor Config

- **App ID**: `org.kollapp.app`
- **Web Dir**: `build/`

## Docker

### Build Image

```bash
docker build -t kollapp/mobileapp:latest .
```

The Dockerfile uses:

- Multi-stage build (Node 24 Alpine)
- Production-only dependencies in final image
- Exposes port 3000

### Run Container

```bash
docker run -p 3000:3000 kollapp/mobileapp:latest
```

## Dependency Graph

```bash
pnpm visualize
```

Generates a dependency graph image at `visualize/dependency-graph.png` using Madge.

## Configuration

Key configuration files:

| File                     | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `svelte.config.js`       | SvelteKit adapter and preprocessor config |
| `vite.config.ts`         | Vite plugins (SvelteKit, Tailwind CSS)    |
| `vitest.config.ts`       | Test runner configuration                 |
| `tsconfig.json`          | TypeScript strict mode settings           |
| `eslint.config.js`       | ESLint flat config with plugins           |
| `capacitor.config.ts`    | Capacitor native app settings             |
| `tailwind.config.ts`     | Tailwind CSS customization                |
| `typedoc.config.js`      | Documentation generation settings         |
| `i18n-unused.config.cjs` | Translation key validation                |
