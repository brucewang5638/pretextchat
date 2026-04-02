# PretextChat Go-To-Market Plan

## 1. Objective

目标不是“一次爆红”。

更现实也更重要的目标是：

- 获得第一批高匹配的重度用户
- 让这些用户形成可重复使用习惯
- 收集高质量工作流反馈
- 建立可持续传播素材，而不是只打一波热度

## 2. Success Definition

`v0.1.0-beta` 的成功标准应该是：

- 有一批真实用户完成下载安装和首次使用
- 有用户在一周内重复打开产品
- 有用户明确表示愿意用它替代部分 AI 浏览器标签页
- 有用户愿意公开转发、录屏或推荐

如果只有曝光、没有留存，不算成功。

## 3. Target Users

优先顺序建议如下：

### Tier 1

- 开发者
- AI 重度用户
- 研究型用户

原因：

- 他们最容易理解“多 AI、多任务、多上下文”的痛点
- 他们愿意尝试早期桌面工具
- 他们更可能给出结构化反馈

### Tier 2

- PM
- 创作者
- 翻译用户

### Tier 3

- 轻度普通用户

不建议在 `v0.1.0-beta` 阶段就把传播重点放到 Tier 3。

## 4. Positioning Strategy

对外核心表达：

> PretextChat helps heavy AI users replace chaotic browser tabs with organized AI workspaces.

避免的表达：

- 又一个 AI 聚合器
- 又一个 AI 浏览器
- 又一个模型大全

应该反复强调的三个词：

- multi-instance
- task-oriented
- AI-only

## 5. Core Launch Assets

在正式推向所有人之前，至少准备以下资产：

### 必须有

- 完整 README
- 可下载的 GitHub Release
- 30 秒主演示视频
- 3 张清晰截图
- 一篇发布帖
- 一篇开发者视角的技术帖
- 一页明确的官网或 GitHub 首页说明

### 强烈建议有

- 对比图：浏览器标签页 vs PretextChat
- 一段“真实工作流演示”GIF
- FAQ
- 公开 roadmap

## 6. Best Launch Channels

### Global

- Product Hunt
- Hacker News `Show HN`
- X / Twitter
- GitHub Releases + repo README
- relevant Reddit communities
- indie maker communities

### Chinese

- V2EX
- 少数派
- 即刻
- 小红书
- Bilibili
- 微信技术社群 / AI 社群

注意：

- 每个渠道都要用原生内容，不要同一份文案到处复制。
- 目标是让用户觉得你在分享一个真实工作流，而不是在群发广告。

## 7. Channel Strategy

### Product Hunt

适合做：

- 集中曝光
- 获得第一波英文世界注意力
- 测试 public-facing messaging

不适合做：

- 把它当作唯一增长来源

执行建议：

- 用创始人账号发布，不依赖 hunter
- 上线前准备好完整首屏文案、截图、演示视频和 FAQ
- 发布日全程高频回复评论
- 不直接索要 upvote，重点是邀请真实用户给真实反馈

### Hacker News

适合做：

- 吸引开发者
- 验证“浏览器标签页不适合 AI 工作流”这个命题

执行建议：

- 标题尽量直接，不要营销腔
- 正文先讲痛点和使用方式，再讲技术
- 评论区要准备回答为什么不用浏览器、为什么不是普通 wrapper、Pretext 的意义是什么

### X / Twitter

适合做：

- 分发短视频
- 连接 AI / dev 工具圈层
- 扩散工作流片段

执行建议：

- 发短视频，不要只发截图
- 每条内容只讲一个具体场景
- 用“before / after”叙事，而不是功能列表

### GitHub

适合做：

- 接住所有来自社交平台的流量
- 建立可信度
- 让开发者快速理解并试用

执行建议：

- README 必须让陌生人 30 秒内看懂产品
- Releases 必须附上清晰的安装说明
- 文档入口必须集中且清楚

## 8. Launch Timeline

### T-14 to T-7

- 冻结 `v0.1.0-beta` 范围
- 完成 README、FAQ、发布说明、截图和视频
- 邀请 5-10 个高匹配用户内测
- 收集真实使用语句，准备放进文案

### T-6 to T-2

- 修复 blocker
- 打磨首屏文案
- 准备 Product Hunt 素材
- 准备 `Show HN` 草稿
- 准备中英文发布帖

### T-1

- 完整走一遍下载、安装、首次启动、恢复、重开流程
- 生成 release artifacts
- 确认截图、标题、描述、tagline 一致

### Launch Day

- 发布 GitHub Release
- 发布 Product Hunt
- 发布 `Show HN`
- 发布 X / Twitter 线程
- 发布中文社区版本
- 持续回复评论和问题

### T+1 to T+7

- 整理反馈
- 提炼用户真实表达
- 快速发布至少 1 个修复版本
- 把“我们认真迭代”也变成传播素材

## 9. Message Templates

### One-line pitch

PretextChat is a multi-instance desktop client for people who use multiple AI tools and tasks every day.

### Developer-facing pitch

If you already live in ChatGPT, Claude, Gemini, and Perplexity all day, browser tabs are the wrong abstraction. PretextChat turns them into task-oriented workspaces you can reopen, rename, and switch between.

### Chinese launch pitch

如果你每天都在多个 AI 之间切换，浏览器标签页其实已经不够用了。PretextChat 的目标不是替代模型，而是把 AI 网站变成可多开、可重命名、可恢复的任务工作位。

## 10. Content Strategy

最容易传播的内容不是“功能介绍”，而是“真实工作前后对比”。

优先级建议：

1. 15-30 秒短视频：多个 AI / 多个任务 / 快速切换 / 重开恢复
2. 图文对比：浏览器标签页 vs PretextChat
3. 创始人帖子：为什么为重度 AI 用户做这个产品
4. 技术帖子：为什么 Pretext 适合 AI 文本工作台

## 11. What Could Make It Spread

真正可能让它火起来的不是“支持很多 AI”。

更可能传播的是以下三类切口：

### 切口 A：Browser tabs are broken for AI work

这是最普适、最容易共鸣的切口。

### 切口 B：One AI product, multiple task slots

“我想同时开 3 个 ChatGPT 做不同任务”是非常具体的用户需求。

### 切口 C：AI workflow, not AI discovery

把产品从“发现 AI”转成“管理 AI 工作流”，更容易建立长期壁垒。

## 12. Execution Rules

- 不买假流量
- 不刷票
- 不让文案夸大当前能力
- 所有传播都必须能落回真实产品体验
- 先赢得高匹配用户，再扩大触达

## 13. Metrics To Track

`v0.1.0-beta` 阶段建议重点看：

- release downloads
- app first-open count
- second-open rate within 7 days
- session restore usage
- recent task reopen usage
- active instances per user
- public mentions / shares / comments
- qualitative feedback count

## 14. Immediate Next Actions

发布前最值得马上执行的动作：

1. 录一段 30 秒核心演示视频
2. 准备 3 张能说明问题的截图
3. 用 5-10 个目标用户做封闭 beta
4. 收集 3 句真实用户反馈作为文案素材
5. 打一个 `v0.1.0-beta.1` 试发布并验证下载链路

## 15. Reference Links

本计划参考了以下当前公开资料，并结合 PretextChat 的产品阶段做了取舍：

- GitHub Docs, About READMEs: https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- GitHub Docs, About releases: https://docs.github.com/repositories/releasing-projects-on-github/about-releases
- GitHub Docs, Automatically generated release notes: https://docs.github.com/repositories/releasing-projects-on-github/automatically-generated-release-notes
- Product Hunt Launch Guide: https://www.producthunt.com/launch
