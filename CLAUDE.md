# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run preview   # preview production build
```

## Architecture

**Nuxt 4 SPA** (SSR disabled) with Vite + Tailwind CSS v4 + Pinia. All state is persisted to `localStorage`.

### Directory layout (`app/`)

Nuxt 4 uses `app/` as the application root — all source lives inside it.

- `app/data/vocabulary/` — static JSON word lists per CEFR level (A1–C1), imported as ES modules
- `app/composables/useSpacedRepetition.ts` — SM-2 algorithm: `updateCard()`, `isDue()`, `isMastered()`, rating types
- `app/stores/progress.ts` — Pinia store: loads/saves progress to `localStorage`, exposes `rateCard()`, `statsForLevel()`, `dueIds()`
- `app/components/FlashCard.vue` — flip-card UI, emits `rate` event with a `Rating` (0–3)
- `app/components/ProgressRing.vue` — SVG circular progress indicator
- `app/components/BottomNav.vue` — fixed bottom nav (Home / Lernen / Fortschritt)
- `app/pages/index.vue` — dashboard with per-level progress rings and due-card counts
- `app/pages/learn.vue` — flashcard session; accepts `?level=A1` query param to filter
- `app/pages/progress.vue` — detailed stats table per level

### Key data model

Each vocabulary word has an `id` like `a1_001`. The store maps word IDs to `CardState` objects (SM-2 fields). A card is "mastered" when `interval >= 21` days.

### Tailwind custom colors

Defined via `@theme` in `app/assets/css/main.css`:
- `swedish-blue` = `#006AA7`
- `swedish-yellow` = `#FECC02`
