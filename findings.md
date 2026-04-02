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

## Pretext Integration Findings

- `pretext` 是一个纯 JS/TS 的多行文本测量与布局库，不是嵌入式 Web 产品。
- README 里最直接的能力是 `prepare(text, font)` + `layout(prepared, width, lineHeight)`，适合先用于 UI 文本高度预测。
- `prepare()` 应该只做一次预处理；容器宽度变化时应优先重复调用 `layout()`，这是它的性能模型。
- 当前项目最合适的首个接入点在 renderer，而不是 Electron main 的 `WebContentsView` 容器层。
- `src/renderer/components/AppCard/AppCard.module.css` 目前用 `-webkit-line-clamp: 2` 处理描述文本，能截断但不能提供可预测高度和更细的布局控制。
- `src/renderer/components/TabBar/TabBar.module.css` 的 tab 标题是单行省略，暂时不是 `pretext` 的最佳首个落点。
- 全局字体通过 `--font-sans` 定义为 `Inter`, `IBM Plex Sans`, `Segoe UI`, sans-serif；接入时需要构造和 CSS 对齐的 canvas font shorthand。
- 实际落地时新增了 `src/renderer/lib/pretext.ts` 作为缓存与 font-shorthand 适配层，避免组件层直接重复 `prepareWithSegments()`。
- `PretextBlock` 通过 `ResizeObserver` 读取容器宽度，只在宽度变化时重新 `layoutWithLines()`，符合 `pretext` 推荐的热路径用法。
- 当前版本先实现了“基于 Pretext 的行切分 + 固定两行高度 + 截断提示”，还没有做最后一行精确 ellipsis fitting。

## Public Docs & GTM Findings

- 当前根 `README.md` 基本为空，这会直接削弱 GitHub 访客的理解、转化与传播。
- GitHub 官方建议 README 至少覆盖：项目做什么、为什么有用、如何开始、如何获得帮助、谁在维护。
- GitHub Releases 官方能力适合承接桌面应用二进制分发，且支持自动生成 release notes。
- Product Hunt 官方 Launch Guide 当前仍强调：自己发布即可、不需要 hunter、不能直接索要 upvote、`12:01 am PT` 是适合充分准备团队的常见起点。
- 对 PretextChat 这种桌面 AI 工具，最有效的冷启动叙事不是“又一个 AI 聚合器”，而是“AI-only multi-instance work client”。
- 这类产品的传播素材要优先展示真实工作流，而不是抽象功能点；最值得拍的是“同一任务在多个 AI 间并行”的 15-30 秒演示。
- 仅有策略文档还不够，真正能提高执行效率的是 ready-to-post 文案模板，因此补一份 `docs/launch-copy.md` 很有必要。
- 公开仓库首页不应只保留英文；对于 PretextChat 这类同时覆盖中文和全球 AI 产品的项目，采用 `README.md` + `README.zh-CN.md` 双入口更合理。
