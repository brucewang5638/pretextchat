# Findings

## Current State

- Phase 1 skeleton exists: app registry, instance lifecycle, tab bar, local persistence, navigation policy.
- Default naming strategy already exists in `src/main/instance-store.ts`.
- Recent apps already exist, but recent instances do not.
- Session restore is not wired into renderer state initialization, so restore UX is incomplete.
- Workbench `+` button is a stub, which weakens the multi-instance flow.

## Phase 1 P1 Gaps To Implement

- Added recent instance persistence and reopen flow.
- Added startup preference for home vs auto-restore and surfaced it in the launch UI.
- Fixed restore flow by loading initial state from main and syncing renderer after restore.
- Replaced generic placeholders with a shared app icon system and workbench quick-create menu.

## Remaining Caveats

- Quick reopen for a recent instance restores the app/task shell and title, not the remote website conversation contents.
- There is still no automated test suite beyond typechecking.
