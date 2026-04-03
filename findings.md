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
- 仅有策略文档还不够，真正能提高执行效率的是 ready-to-post 文案模板；更合适的落点是把它并入统一的 `docs/launch-plan.md`。
- 当前仓库更适合采用中文主 README，避免把有限维护精力分散到多份公开入口。

## Windows White Screen Findings

- 从截图看，主进程窗口已经正常打开，但 renderer 内容区没有成功渲染，属于 renderer 初始化阶段异常，而不是窗口创建失败。
- `src/renderer/pages/LaunchPage/LaunchPage.tsx` 原先在 `if (!snapshot) return ...` 之后才调用 `useMemo`，违反 React hooks 顺序规则，容易在生产包里表现为白屏。
- 已将 `LaunchPage` 的 hooks 调整为始终按固定顺序调用，并新增 renderer 级 `AppErrorBoundary`，避免未来再出现纯白屏且无提示的情况。

## Windows Distribution Findings

- 现有 Electron Forge `maker-squirrel` 更偏一键安装，不符合“选择安装路径 + 下一步”式安装向导预期。
- Cherry Studio 的 Windows 分发参考方案是 `electron-builder`，同时输出 `NSIS` 安装版和 `portable` 版。
- 本项目已采用桥接路线：继续使用 Electron Forge 负责预打包 app，再由 `electron-builder` 基于 prepackaged 目录生成 Windows 安装器。
- 这样可以保留现有本地开发和非 Windows 打包链路，同时把 Windows 分发升级为更符合大众预期的传统安装体验。

## Documentation Restructure Findings

- 当前 `README.md` 已经是中文主文档，但仍保留了不少“面向公开发布准备阶段”的冗余段落，信息密度偏高，缺少截图展示。
- `docs/positioning.md`、`docs/go-to-market.md`、`docs/launch-copy.md` 三份文档有明显内容重叠：定位、首发叙事、渠道文案互相重复。
- 已将上述三份文档合并为 `docs/launch-plan.md`，作为统一的对外定位与发布文档。
- `docs/roadmap.md` 仍然带有明显讨论稿口吻，不适合继续作为正式文档保留原样。
- `docs/chat-streaming-performance-roadmap.md` 更像专项技术备忘录，适合保留，但不应在 README 顶层导航中与产品文档并列强调。
- `docs/reading-order.md` 与 `docs/architecture.md` 的边界比较清晰，适合保留为开发者文档。
- `public/images/product/1.png` 与 `public/images/product/2.png` 适合作为 README 的首屏产品示例图，优先承担“让陌生人快速看懂产品界面”的职责。
- 这轮更稳的文档结构应收敛为：`README.md`、`docs/prd.md`、`docs/roadmap.md`、`docs/architecture.md`、`docs/reading-order.md`、`docs/release-checklist.md`，其余内容并入这几份主文档。

## Component Refactor Findings

- 当前 renderer 中最需要拆分的文件是 `src/renderer/pages/LaunchPage/LaunchPage.tsx`、`src/renderer/components/Sidebar/Sidebar.tsx`、`src/renderer/components/AppCard/AppCard.tsx` 和 `src/renderer/components/TabBar/TabItem.tsx`。
- `LaunchPage` 同时承担页面布局、搜索过滤、分类聚合、更新检查状态、自定义应用弹窗状态与卡片渲染，已经超出单文件适合维护的复杂度。
- `Sidebar` 同时承担数据筛选、排序、拖拽、关闭逻辑和单项视图展示，适合拆成“容器 + 列表项 + 纯函数辅助”结构。
- `AppCard` 与 `Sidebar`、`TabItem`、`CustomAppModal` 中都出现了类似的图标动作按钮/关闭按钮模式，适合抽出共享的 icon action 组件。
- 当前工作区里 `LaunchPage`、`ipc-handlers` 及若干新组件文件已存在未提交修改，说明仓库并非干净状态；重构时必须以现有改动为基础，不能回退或覆盖。
- 对这个仓库来说，更合适的统一规则是：简单组件维持单文件；一旦组件同时包含多段 UI 区块、多个事件处理器或复用子片段，就升级为目录结构。
- 实际拆分后，`LaunchPage.tsx` 从 390 行降到 99 行，`TabBar.tsx` 从 56 行降到 28 行，目录中的主文件明显更聚焦于“接线”和“组合”。
- 这轮最适合横向共享的内容并不是“超级通用业务组件”，而是更轻量的 `IconButton` 和共享 SVG icons；它们显著减少了多个文件中的内联 SVG 噪音。
- `LaunchPage` 和 `TabBar` 的数据准备逻辑在拆分后顺手改成了更集中、可复用的 map/group helper，也顺带消除了渲染期的一些重复查找与重复过滤。

## Renderer Structure Findings

- 原先 `renderer` 顶层同时存在 `pages`、`components`、`hooks`、`lib`，但其中很多文件实际已经是 feature 私有内容，导致“全局共享”和“局部实现”混放。
- `AppCard` 只服务于 Launch 页面，`Sidebar` / `TabBar` 只服务于 Workbench，但之前都挂在全局 `components/` 下，会误导后续开发者把它们当成跨页面公共组件。
- `lib/assets.ts` 只有 renderer 内平台适配职责，更适合归到 `src/renderer/shared/asset-path.ts`，而不是一个泛泛的 `lib` 目录。
- `useIpc.ts` 实际承担的是应用启动与状态接线，不是一个可随处复用的通用 hook 集；改名为 `useAppBootstrap.ts` 后语义更清楚。
- 对这个仓库更稳的 renderer 结构是：
- `src/renderer/app/*`：应用级接线。
- `src/renderer/features/*`：功能域自有页面、局部组件、私有 helpers/types。
- `src/renderer/shared/*`：renderer 内跨 feature 复用的 UI 原语和适配层。
- `src/shared/*`：main / preload / renderer 之间共享的跨进程契约。

## Main Structure Findings

- 原先 `src/main` 基本是所有主进程模块平铺在根目录，文件名本身虽然不差，但职责边界需要靠通读代码才能理解。
- `ipc-handlers.ts` 的主要问题不是代码错误，而是它同时承担了状态快照、运行时校验、实例流转、偏好设置、自定义应用、系统能力等多个域。
- 对这个项目更清晰的 main 结构是：
- `src/main/app/*`：应用生命周期和窗口创建。
- `src/main/catalog/*`：应用目录和自定义应用辅助逻辑。
- `src/main/ipc/*`：跨进程接口注册与快照同步辅助。
- `src/main/persistence/*`：本地持久化。
- `src/main/runtime/*`：更新、托盘、导航策略、事件日志等 Electron 运行时能力。
- `src/main/workspace/*`：实例状态和 `WebContentsView` 生命周期。
- `registerIpcHandlers.ts` 拆分后，真正的总装配文件已经只剩注册顺序和 `instanceStore.onChange(syncState)` 这类应用级接线，阅读成本明显下降。
