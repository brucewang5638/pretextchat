# 阶段性任务清单

## Goal
- 把 `@chenglou/pretext` 真正接入当前产品，而不是只停留在概念层。
- 先完成一个对 `v0.1.0-beta` 有直接价值的最小闭环：renderer 文本测量能力 + 应用卡片描述布局稳定化。

## Phase 8: Pretext Integration (In Progress)
- [x] 安装并接入 `@chenglou/pretext` 依赖。
- [x] 在 renderer 侧封装可复用的文本测量/布局工具，避免组件直接散落调用。
- [x] 将 `LaunchPage` / `AppCard` 的描述文本改为基于 Pretext 的稳定两行布局。
- [x] 让卡片在不同宽度、不同语言文本下保持一致高度和更可控的截断表现。
- [x] 跑通 `npm run lint`，确认集成没有打破现有 Electron + Vite + React 构建。

## Next Candidates
- [ ] 把 `PretextBlock` 扩展到 `TabBar` 标签标题，在窄宽度下做更可控的单行/双行策略。
- [ ] 用 `prepare()` / `layout()` 给搜索结果或未来聊天列表做虚拟化高度预测。

## Notes
- 当前仓库已有 `task_plan.md` / `findings.md` / `progress.md`，沿用并同步更新。
- 工作树里存在与本任务无关的改动：`.github/workflows/release.yml`，不触碰。
