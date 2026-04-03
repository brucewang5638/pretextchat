# PretextChat

[English README](README.md)

PretextChat 是一个面向重度 AI 用户的 AI-only 多实例桌面客户端。

它不是把 ChatGPT、Claude、Gemini、Perplexity、DeepSeek、Kimi 等 AI 产品继续塞进一堆普通浏览器标签页里，而是把它们变成可以快速新建、重命名、恢复和切换的任务工作位。

## 为什么是 PretextChat

重度 AI 用户的真实工作方式，并不像普通网页浏览。

他们往往会：

- 同时打开多个 AI 产品
- 在同一个 AI 产品里维护多个任务上下文
- 高频切换长会话
- 横向比较不同工具的回答
- 在浏览器标签页越来越多后失去秩序

PretextChat 就是为这种工作方式设计的。

核心产品判断：

- 它是 AI-only 客户端，不是通用浏览器
- 它默认支持多实例，而不是默认只有一个标签
- 它按任务组织，而不是按网站组织
- 它围绕高频文本交互做专项优化

## 为什么是 Pretext

这个项目由 [Pretext](https://github.com/chenglou/pretext) 提供关键能力支持。Pretext 是一个用于多行文本测量与布局的库，可以在不依赖昂贵 DOM reflow 的情况下做更稳定的文本尺寸预测和布局计算。

在 PretextChat 里，Pretext 不是噱头，也不是装饰性命名。

它是产品方向的一部分，会持续支撑这些能力：

- 更稳定的 Prompt 输入区域尺寸变化
- 更可预测的长文本布局
- 更少的界面跳动和布局抖动
- 更稳的标签、卡片和分屏文本行为
- 未来聊天列表和工作台布局的虚拟化与估高

目前第一步真实接入已经落在应用卡片文案布局上，后续会进一步深入到工作台主链路。

## 当前状态

PretextChat 目前仍处于早期开发阶段。

当前已经具备：

- 预置 AI 应用目录
- 点击即进入 AI 独立实例
- 同一 AI 支持多开多个实例
- 基于标签页的实例切换
- 实例重命名 / 关闭
- 最近任务重开
- 会话恢复
- 基于 Electron partition 的登录态保持
- 第一版 renderer 侧 Pretext 文本布局接入

当前还没有做的事情：

- 统一 Prompt Bar
- 分屏工作台
- 一问多发
- 多实例对比视图
- 云同步
- 插件 / agent 平台

更多信息见：

- [PRD](docs/prd.md)
- [Roadmap](docs/roadmap.md)
- [Positioning](docs/positioning.md)
- [Go-To-Market Plan](docs/go-to-market.md)
- [Release Checklist](docs/release-checklist.md)

## 当前支持的 AI 应用

当前内置目录已覆盖主要的全球和中文 AI 产品，包括：

- ChatGPT
- Claude
- Gemini
- Perplexity
- DeepSeek
- Kimi
- 豆包
- 通义千问
- 智谱清言
- 腾讯元宝
- 秘塔 AI 搜索

这些应用配置位于 [data/ai-apps.json](data/ai-apps.json)。

## 产品定位

一句话定位：

> PretextChat 是一个为每天同时使用多个 AI 工具和多个 AI 任务的人设计的桌面工作客户端。

它是什么：

- AI 工作入口
- 多实例 AI 客户端
- 面向 AI 网站的任务化桌面壳层

它不是什么：

- 通用浏览器
- LLM API 平台
- 大而全的 agent / 插件市场

## 技术栈

- Electron
- React 19
- TypeScript
- Zustand
- Electron Forge
- Vite
- Pretext

## 本地开发

### 环境要求

- Node.js 22
- npm

### 安装依赖

```bash
npm ci
```

### 启动应用

```bash
npm run start
```

### 类型检查

```bash
npm run lint
```

### 打包发布产物

```bash
# macOS / Linux
npm run make

# Windows NSIS / portable
npm run dist:win
```

## Release 流程

这个仓库通过 GitHub Releases 分发桌面二进制安装包。

当前发布流程是：

1. 更新产品与文档
2. 本地完成验证
3. 推送版本 tag，例如 `v0.1.0-beta.1` 或 `v0.1.0`
4. GitHub Actions 构建各平台产物
5. workflow 自动发布 GitHub Release 并附上安装包

workflow 文件位于 [.github/workflows/release.yml](.github/workflows/release.yml)。

每次对外发布前，请先过一遍 [docs/release-checklist.md](docs/release-checklist.md)。

当前 Windows 分发采用传统安装向导路线：

- 主安装包：`NSIS` 向导安装版
- 补充安装包：`portable` 便携版
- 安装器与应用图标使用品牌 `icon.ico`

当前打包职责拆分为：

- 本地开发：Electron Forge + Vite
- macOS / Linux 打包：Electron Forge makers
- Windows 打包：通过 `npm run dist:win` 调用 `electron-builder`

这样更符合普通 Windows 用户对“下一步安装、可选安装路径”的预期。

## 文档导航

- [docs/prd.md](docs/prd.md)：产品需求与范围
- [docs/roadmap.md](docs/roadmap.md)：分阶段路线图
- [docs/positioning.md](docs/positioning.md)：对外定位与叙事
- [docs/go-to-market.md](docs/go-to-market.md)：发布与增长策略
- [docs/release-checklist.md](docs/release-checklist.md)：发布检查清单
- [docs/launch-copy.md](docs/launch-copy.md)：可直接使用的首发文案模板

## 适合谁

PretextChat 尤其适合：

- 需要比较多个 coding assistant 的开发者
- 需要在多个 AI 之间比对结果的 PM 和研究者
- 同时运行多种风格 / 多种语言工作流的写作者和翻译用户
- 把 AI 当作日常主工作界面的重度用户

它目前不优先服务：

- 偶尔只开一个 AI 标签页的轻度用户
- 需要任意网页浏览的用户
- 更关心模型 API 而不是交互工作流的团队

## 对外发布策略

PretextChat 不应该被包装成“又一个 AI App”。

更准确的发布方式是：

- 它为已经在多个 AI 产品间频繁切换的人提供更好的工作流
- 它把混乱的 AI 标签页变成有结构的任务位
- 它追求的“快”不是模型回答更快，而是切换更快、恢复更快、抖动更少

详细发布与增长方案见 [docs/go-to-market.md](docs/go-to-market.md)。

## 参与贡献

这个项目目前仍处在产品方向收敛阶段，因此最有价值的贡献包括：

- 来自重度 AI 用户的真实工作流反馈
- 登录、导航、标签管理相关 bug 报告
- 不同系统上的 release 验证
- 工作台交互层的 UX 建议
- 更深入的 Pretext 文本布局能力接入

如果你希望贡献代码，建议先阅读现有文档，并在 issue 或 discussion 中说明：

- 你想优化的工作流是什么
- 你观察到的用户问题是什么
- 预期的 before / after 行为是什么

## 反馈重点

如果你正在测试 PretextChat 的 beta 版本，最有价值的反馈包括：

- 你会并行使用哪些 AI 工具
- 你通常同时开多少个任务
- 浏览器标签页在哪一步开始失控
- 会话恢复和最近任务重开是否足以改变你的默认工作方式

## 长期愿景

Phase 1 要证明：用户愿意把它当作 AI-only 多实例客户端来使用。

Phase 2 要证明：用户愿意在里面持续长时间工作。

Phase 3 要把它推进成真正的 AI 工作操作系统，包括一问多发、对比视图和多工作区结构。
