# Pretext 在 PretextChat 中的接入评估报告

更新日期：2026-04-06

## 1. 结论摘要

可以用，而且值得用，但应当明确边界：

- `PretextChat` 当前已经安装了 `@chenglou/pretext` 依赖，见 [package.json](../package.json)。
- 但截至本报告编写时，主项目 `src/` 中没有实际运行中的 `pretext` 调用，属于“已引入依赖、尚未正式接入产品代码”的状态。
- `pretext` 最适合接入 PretextChat 自己控制的 renderer UI 文本层。
- `pretext` 不适合直接接管 ChatGPT、Claude、Gemini 等远端网页中的聊天正文，因为这些内容运行在独立的 `WebContentsView` 里，不属于我们自己的 React 渲染树。

一句话判断：

> Pretext 在 PretextChat 中的正确角色，不是“替代 AI 网站的文字排版引擎”，而是“优化 PretextChat 自有壳层 UI 的文本测量、估高、断行和重排”。

## 2. 当前代码现状

### 2.1 已满足的前提

- 项目已经安装 `@chenglou/pretext`，见 [package.json](../package.json)。
- renderer 使用 React + Vite，具备直接在浏览器环境中使用 canvas / DOM 测量能力。
- 全局字体令牌已经集中定义，见 [src/renderer/assets/index.css](../src/renderer/assets/index.css)。
- 项目产品定位和 PRD 已把 Pretext 视为核心技术方向，见 [docs/prd.md](./prd.md)。

### 2.2 当前真正的 UI 承载边界

PretextChat 当前是“壳层 UI + 远端 AI 网页”的双层结构：

- 自有 renderer 负责：
  - 启动页
  - 侧边栏
  - 标签栏
  - 自定义应用表单
  - 状态提示等壳层界面
- 真正的 AI 网页内容由 main 进程创建的 `WebContentsView` 承载，见 [src/renderer/features/workbench/WorkbenchPage.tsx](../src/renderer/features/workbench/WorkbenchPage.tsx) 和 [src/main/app/createMainWindow.ts](../src/main/app/createMainWindow.ts)。

这意味着：

- 我们可以精确控制 PretextChat 自己的卡片、标题、输入区、列表项。
- 我们不能直接用 `pretext` 重排远端 AI 网站里的消息 DOM。

### 2.3 为什么更适合放在 renderer，而不是 main

`pretext` 的测量依赖浏览器侧的 `OffscreenCanvas` 或 DOM canvas。上游实现里如果两者都不存在会直接抛错，见 [pretext/src/measurement.ts](../pretext/src/measurement.ts)。

因此在本项目里：

- renderer 是自然接入点
- main 进程不是合适接入点

这也和当前 PretextChat 的架构相符：renderer 是展示层，main 负责实例与 `WebContentsView` 生命周期管理，见 [docs/architecture.md](./architecture.md)。

## 3. 适合接入的场景

下面按“收益 / 风险 / 实施难度”综合排序。

### 3.1 启动页应用卡片描述

这是当前最合适的第一个接入点。

原因：

- 当前实现仍然是 CSS `-webkit-line-clamp: 2`，见 [src/renderer/features/launch/components/AppCard/AppCardPreview.tsx](../src/renderer/features/launch/components/AppCard/AppCardPreview.tsx)。
- 它能视觉截断，但不能提供更稳定的可预测高度、行内容和更精细的截断控制。
- `pretext` 非常适合做“两行高度保留 + 真实断行 + 可控截断”。

落地后可获得的收益：

- 卡片高度更稳定
- 窄宽度下的描述布局更可预测
- 后续如果要做“最后一行精确省略”会更容易
- 不再完全依赖浏览器私有的 `-webkit-line-clamp`

### 3.2 未来统一 Prompt Bar / 自有输入区

这是中期最有价值的接入点。

当前版本还没有统一 Prompt Bar，但路线图已经把它列为工作台阶段的重要方向，见 [docs/roadmap.md](./roadmap.md)。

如果未来 PretextChat 自己实现统一输入区，那么 `pretext` 很适合用于：

- 多行输入框高度预测
- 宽度变化时快速重布局
- 长 prompt 编辑时减少依赖 DOM 实时估高

这是 `pretext` 最典型、也最匹配产品叙事的使用方式。

### 3.3 未来自有消息列表 / 对比视图 / 虚拟列表

如果后续产品从“嵌入远端网页”进一步走向“自有统一消息层”或“多 AI 对比结果视图”，那么 `pretext` 的价值会显著提升。

适用能力包括：

- 消息块高度预估
- 虚拟列表提前布局
- 宽度切换时仅重跑 `layout()` 热路径
- 对比视图中的多列文本同步重排

但要强调：这是未来能力，不是当前代码路径。

### 3.4 多行标题、说明文案、摘要列表

适合作为辅助场景，而不是首个主场景。

比如：

- 启动页更丰富的应用摘要
- 最近任务列表的说明文案
- 未来分栏卡片中的多行元信息

只要场景满足“多行文本 + 高度稳定性重要 + 宽度经常变化”，`pretext` 就有价值。

## 4. 不适合接入的场景

### 4.1 远端 AI 网站正文

不建议，也基本不现实。

原因：

- ChatGPT / Claude / Gemini 页面运行在独立的远端网站中
- 当前项目是通过 `WebContentsView` 嵌入它们，而不是自己渲染消息节点
- 我们没有这些页面的可靠 DOM 主导权
- 即使注入脚本，也会带来高维护成本、兼容性和风控问题

因此不要把 `pretext` 方案理解为：

- 改造远端 AI 网站内部聊天消息排版
- 接管远端站点输入框的高度计算
- 替换远端网页自己的 CSS 断行逻辑

### 4.2 main 进程布局

不建议在 main 中做文本测量。

原因：

- `pretext` 的测量模型天然更适合 renderer
- main 进程当前职责是窗口、视图、导航和实例状态管理
- 把文本布局逻辑塞进 main 会破坏现有边界

### 4.3 纯单行截断且视觉要求不高的文本

例如当前标签标题：

- 现在是单行 `truncate`，见 [src/renderer/features/workbench/tab-bar/TabItem.tsx](../src/renderer/features/workbench/tab-bar/TabItem.tsx)
- 如果需求仍然只是单行省略，直接用 CSS 足够

只有当标签演进为：

- 双行标题
- 紧凑模式下的多行可读标签
- 需要更稳定的重命名预览

这时再考虑 `pretext` 才更划算。

## 5. 为什么它和产品方向是匹配的

PretextChat 的产品叙事里，Pretext 的价值一直不是“让模型回答更快”，而是“让高频文本交互的客户端更顺”，见 [docs/prd.md](./prd.md)。

从当前产品路线看，这个判断是成立的：

- 启动页卡片、标签、摘要列表都属于自有文本 UI
- 未来统一 Prompt Bar、分栏工作台、对比视图都属于强文本交互界面
- 这些都比“直接改造远端 AI 网站”更现实，也更可控

换句话说，Pretext 和 PretextChat 的契合点在“工作台壳层”而不在“远端网页内部”。

## 6. 推荐接入方式

建议采用 renderer 层的小步接入，而不是一开始就把它做成大范围基础设施重构。

### 6.1 接入原则

- 只在 renderer 使用
- 只处理 PretextChat 自己渲染的文本
- 先解决多行文本高度预测和稳定布局
- 不为了“用了 Pretext”而强行替换已经足够好的 CSS 单行场景

### 6.2 建议的实现形态

建议新增一个 renderer 内部适配层，例如：

- `src/renderer/shared/pretext/font.ts`
- `src/renderer/shared/pretext/cache.ts`
- `src/renderer/shared/pretext/usePretextLayout.ts`
- `src/renderer/shared/pretext/PretextTextBlock.tsx`

建议职责如下：

- `font.ts`
  - 将 CSS 字体令牌转换为 `pretext` 需要的 canvas font shorthand
- `cache.ts`
  - 缓存 `prepare()` / `prepareWithSegments()` 结果
- `usePretextLayout.ts`
  - 监听容器宽度变化
  - 宽度变化时只重跑 `layout()` 或 `layoutWithLines()`
- `PretextTextBlock.tsx`
  - 提供统一的多行文本块组件
  - 支持固定行数、保底高度、可选省略

### 6.3 API 选择建议

不同需求对应不同 API：

- 只关心高度：
  - 用 `prepare()` + `layout()`
- 需要真实断行内容：
  - 用 `prepareWithSegments()` + `layoutWithLines()`
- 未来要做复杂异形流动或逐行布局：
  - 用 `layoutNextLineRange()` 或 `layoutNextLine()`

对于 PretextChat 当前阶段：

- 启动页卡片更适合 `prepareWithSegments()` + `layoutWithLines()`
- 未来统一 Prompt Bar 更适合 `prepare()` + `layout()`

## 7. 接入时要注意的技术点

### 7.1 字体必须和 CSS 完全对齐

这是最重要的实现细节。

当前全局字体令牌定义在 [src/renderer/assets/index.css](../src/renderer/assets/index.css)：

- `--font-sans: "Inter", "IBM Plex Sans", "Segoe UI", sans-serif`
- `--font-display: "Inter", sans-serif`
- `--font-mono: "JetBrains Mono", "Fira Code", monospace`

`pretext` 的测量精度依赖传入的 `font` 字符串和实际 CSS 一致。否则会出现：

- 实际显示两行，但测量结果是一行
- 实际行高和预留高度不一致
- 首屏加载时出现轻微跳动

因此实现时不要在组件里手写零散 font 字符串，应该集中构造。

### 7.2 不要让组件层重复 `prepare()`

`pretext` 的性能模型是：

- `prepare()` 做一次冷路径预处理
- 宽度变化时优先重复 `layout()`

所以适配层必须负责缓存，组件层不要每次 render 都重新 prepare。

### 7.3 字体加载时机要考虑

如果某些文本依赖特定字体首屏精度，建议在关键场景里考虑：

- 首次布局前等待 `document.fonts.ready`
- 或先走保守 fallback，再在字体 ready 后刷新一次布局

否则首屏可能会先按 fallback font 测量，再因真实字体到位而重排。

### 7.4 省略号不是自动送的

`pretext` 擅长：

- 断行
- 估高
- 宽度测量

但“最后一行精确省略并补 `...`”通常仍需要我们自己在组件层补一层逻辑。

所以第一阶段建议先做：

- 稳定多行布局
- 固定高度
- 可接受的截断策略

不要一开始就把“像原生排版引擎一样的精确 ellipsis”当成接入门槛。

## 8. 建议的落地优先级

### Phase A：最小可行接入

目标：

- 在一个真实 UI 场景中验证 `pretext` 的收益和维护成本

推荐落点：

- 启动页应用卡片描述，见 [src/renderer/features/launch/components/AppCard/AppCardPreview.tsx](../src/renderer/features/launch/components/AppCard/AppCardPreview.tsx)

验收标准：

- 卡片描述在不同宽度下两行高度稳定
- 不引入明显闪烁
- `npm run lint` 通过
- 不增加 renderer 明显卡顿

### Phase B：扩到未来统一 Prompt Bar

前提：

- 产品进入 Phase 2 工作台能力建设
- 出现自有多行输入区

目标：

- 用 `pretext` 做输入区估高和重排优化

### Phase C：扩到自有消息层 / 对比工作台

前提：

- 产品开始自绘消息列表或对比结果视图

目标：

- 用 `pretext` 支撑高度预测、虚拟列表和宽度变化重布局

## 9. 不建议现在做的事

- 不要尝试注入远端 AI 网站并接管其聊天正文排版
- 不要把 `pretext` 放到 main 进程做测量
- 不要一开始就把所有标题、所有标签、所有表单都迁移到 `pretext`
- 不要在没有统一适配层的前提下让多个组件各自直接调用 `prepareWithSegments()`

## 10. 最终建议

建议正式采用以下决策：

1. 把 `pretext` 视为 PretextChat renderer 自有文本层的专项能力，而不是远端网页改造工具。
2. 第一阶段只做一个小而真实的接入点：启动页应用卡片描述。
3. 在此基础上沉淀统一适配层，再等待统一 Prompt Bar 或自有消息层出现时扩大使用范围。
4. 当前对外表述应保持准确：PretextChat 已以 Pretext 为技术方向，但当前产品代码尚未在主路径中大规模使用该库。

如果后续要真正开始做接入，最稳的第一步不是“先改很多地方”，而是：

> 先做一个 renderer 内的 `PretextTextBlock`，只替换启动页卡片描述，跑通缓存、字体对齐和宽度变化重布局链路。
