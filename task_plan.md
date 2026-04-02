# PretextChat Management Dashboard Redesign

**Goal**: Transform the LaunchPage from a basic dark-theme grid to a professional, light-themed management dashboard inspired by Termius. 

## Phase 1: Theme & Data Models 
- [x] Define light-theme CSS variables in `index.css` (bg-page, bg-sidebar, text-primary, text-secondary).
- [x] Add `category` field to `Application` interface in `src/shared/types.ts`.
- [x] Update `data/ai-apps.json` to assign apps to categories (e.g., "AI Assistant", "Search Engine").

## Phase 2: Component Architecture
- [x] Create `Sidebar.tsx` component for left navigation.
- [x] Refactor `LaunchPage.tsx` layout structure (Grid/Flex splitting Sidebar and Main Content).
- [x] Implement Top Header (Search bar mock & Action bar).

## Phase 3: Card UI & Aesthetics 
- [x] Redesign `<AppCard />` to match Termius host cards (horizontal layout, left squircle icon, right text).
- [x] Build `<CategoryCard />` for the horizontal groups section.
- [x] Refine borders, soft shadows, typography (inter/system-ui), and hover states.

## Phase 4: Integration & Polish
- [x] Ensure click actions correctly open Workbench tabs (preserve existing logic).
- [x] Clean up obsolete dark-theme styles.
- [x] Final UI/UX review for elegant light-theme contrast.

## Phase 6: Narrow Sidebar & Tab Isolation
- [x] Add `image` string support to `src/shared/types.ts` and `ai-apps.json`.
- [x] Generate solid-color geometric SVG placeholders in `public/images/`.
- [x] Adjust `src/main/window.ts` bounds to 68px instead of 260px.
- [x] Redesign `Sidebar.tsx` to 68px wide with image icons.
- [x] Add `activeAppFilter` state in `src/renderer/store/index.ts`.
- [x] Refactor `TabBar.tsx` to filter tabs using `activeAppFilter`.
- [x] Add explicit "New Tab" button directly within `TabBar.tsx` for the current isolated app.
