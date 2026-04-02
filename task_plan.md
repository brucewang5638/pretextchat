# 阶段性任务清单

## Phase 7: Active-Only Sidebar & Grouped Dashboard (Approved)
- [x] Update `Sidebar.tsx` to ONLY render app icons for applications that have active instances in `workspace.instances`.
- [x] Ensure `Sidebar.tsx` adds `overflow-y: auto` with hidden scrollbars for infinite scalability.
- [x] Update `AppCard.tsx` / `AppIcon.tsx` to support the new `image` fields natively.
- [x] Overhaul `LaunchPage.tsx` to group the apps by `category` (AI 助手、搜索引擎).
- [x] For each group in `LaunchPage`, render a clear section title.
- [x] Under each app card, render the `description` string prominently so users clearly understand its use case.
