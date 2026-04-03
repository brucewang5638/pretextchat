# 阶段性任务清单

## Goal
- 补全对外发布所需的核心文档体系，让第一次看到仓库的人能快速理解产品、安装、运行、发布和路线图。
- 形成一份可以直接执行的增长与传播方案，支撑 `v0.1.0-beta` 发布后的冷启动。

## Phase 9: Public Docs & GTM (In Progress)
- [x] 审核当前 README / PRD / roadmap，识别公开文档缺口。
- [x] 研究当前 GitHub Releases / README / Product Hunt Launch Guide 等最佳实践。
- [x] 重写 `README.md`，补齐项目介绍、价值主张、安装运行、发布、路线图、贡献入口。
- [x] 新增 `docs/go-to-market.md`，明确定位、渠道、内容策略、上线节奏和执行动作。
- [x] 新增 `docs/release-checklist.md`，把 beta 发布前、中、后的动作标准化。
- [x] 新增 `docs/positioning.md`，统一产品对外叙事与信息架构。
- [x] 新增 `docs/launch-copy.md`，提供可直接发布的首发文案模板。
- [x] 新增 `README.zh-CN.md`，补齐中文公开入口，并与英文 README 双向链接。
- [x] 更新 `findings.md` / `progress.md` 记录这轮结论和产物。

## Notes
- 当前仓库文档严重不足：根 README 几乎为空，无法支撑公开访问者快速理解产品。
- 文档将优先服务三类读者：首次访问者、早期测试用户、潜在传播者/合作方。
- Windows 分发已新增 `electron-builder` 路线，目标是提供 NSIS 向导安装体验，同时保留现有 Forge 开发流。

## Phase 10: 文档中文化与收敛整理 (In Progress)
- [x] 审核 `README.md`、`docs/`、`public/images/product/` 的现状与重复内容。
- [x] 重写 `README.md` 为中文主入口，并插入产品示例图。
- [x] 合并 `docs/positioning.md`、`docs/go-to-market.md`、`docs/launch-copy.md` 中的重叠内容。
- [x] 将 `docs/roadmap.md` 从讨论稿整理为正式中文路线图。
- [x] 删除或下线冗余英文文档与重复文档入口。
- [x] 更新 `findings.md` / `progress.md` 记录这轮文档结构调整结论。

## Phase 10 Notes
- 本轮目标是把文档体系从“公开发布准备期的堆叠文档”收敛为“中文优先、结构清楚、可持续维护”的版本。
- README 作为外部主入口，应承担产品说明、截图展示、快速开始和文档导航四个职责。
- `docs/` 中保留的文档应按用途拆分，而不是按撰写阶段拆分。

## Phase 11: 组件目录化与重复抽取 (In Progress)
- [x] 审核当前 renderer 页面与组件，识别过大的 `tsx` 文件和重复交互片段。
- [x] 确认当前工作区已有用户进行中的改动，重构时必须在其基础上演进，避免覆盖。
- [x] 为复杂页面/组件建立统一目录约定：主组件 + `components`/`hooks`/`constants`/`types`/`utils`。
- [x] 拆分 `src/renderer/pages/LaunchPage/LaunchPage.tsx`，把 hero、搜索、分类列表、空状态、自定义应用接线拆开。
- [x] 拆分 `src/renderer/components/Sidebar/Sidebar.tsx`，把品牌入口、应用列表、单项视图与排序/关闭动作分离。
- [x] 拆分 `src/renderer/components/AppCard/AppCard.tsx` 与 `src/renderer/components/TabBar/*`，抽取重复动作按钮与展示片段。
- [x] 跑 `lint` 或类型检查验证重构结果，并更新 `findings.md` / `progress.md`。

## Phase 11 Notes
- 本轮重点是“结构可读性”而不是视觉改版，行为应保持不变。
- 目录化拆分优先覆盖大体积 `tsx` 文件，以及同时承担“状态管理 + 视图布局 + 细节动作”的组件。
- 共享抽取优先考虑 hover 操作按钮、重复 icon 按钮、卡片头部动作区、列表/空状态容器等横向复用片段。
- 对简单且职责单一的组件仍保留单文件，避免为了“看起来模块化”而过度拆分。

## Phase 12: renderer 目录边界澄清 (In Progress)
- [x] 审核 `renderer` 内 `pages / components / hooks / lib / types / utils` 的边界冲突。
- [x] 收敛顶层目录为 `app / features / shared`，移除已经空掉的旧目录。
- [x] 将 Launch / Workbench 私有组件迁移为 feature-owned 结构，避免继续挂在全局 `components/` 下。
- [x] 把 `useIpc.ts` 升级为更明确的 app 级 `useAppBootstrap.ts`。
- [x] 将泛名文件重命名为领域名：如 `launch.helpers.ts`、`launch.types.ts`、`sidebar.helpers.ts`、`tab-bar.types.ts`。
- [x] 跑类型检查验证目录调整后 import 与行为仍然正确。
- [x] 在 `findings.md` / `progress.md` 中记录新的 renderer 边界规则。

## Phase 12 Notes
- `src/shared/*` 继续表示跨进程共享契约与常量，不承载 renderer 私有实现。
- `src/renderer/shared/*` 只放 renderer 内跨 feature 复用的 UI 原语或平台适配。
- `src/renderer/features/*` 各自拥有自己的页面、局部组件、私有类型与 helpers。
- `src/renderer/app/*` 只承载启动接线、全局状态接入等应用级逻辑。

## Phase 13: main 目录边界与 IPC 拆分 (In Progress)
- [x] 审核 `src/main` 中的大文件与职责混杂点，确认 `view-manager.ts`、`ipc-handlers.ts`、`instance-store.ts` 为主要整理目标。
- [x] 引入更清晰的主进程目录：`app / catalog / ipc / persistence / runtime / workspace`。
- [x] 将 `ipc-handlers.ts` 拆成按域注册的模块，并保留一个总装配入口。
- [x] 更新主进程内部 import 路径并通过类型检查验证。
- [x] 在 `findings.md` / `progress.md` 中补充新的 main 边界规则与本轮结论。

## Phase 13 Notes
- `src/main/app/*` 承载窗口创建与应用生命周期入口。
- `src/main/catalog/*` 管理应用目录与自定义应用辅助逻辑。
- `src/main/ipc/*` 只负责跨进程接口注册，不直接承担底层状态存储职责。
- `src/main/persistence/*` 管理落盘状态。
- `src/main/runtime/*` 管理 Electron 平台能力与运行时策略。
- `src/main/workspace/*` 管理实例真相源与 WebContentsView 生命周期。
