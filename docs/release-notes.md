# PretextChat Release Notes 草稿

## 一句话摘要

这一版一手补产品稳定性，一手补官网曝光能力：优化了 OAuth 弹窗处理，同时把官网从单页展示站升级成了更适合收录、搜索承接和发布分发的多页面静态站。

## 本版亮点

- 优化 OAuth 弹窗处理，简化窗口创建逻辑，提升桌面端授权链路稳定性
- 官网从单页 landing page 升级为多页面内容型站点
- 新增 `Features / Download / FAQ / Compare / Changelog` 页面，开始承接更明确的搜索意图
- 补齐 `robots.txt`、`sitemap.xml`、`canonical`、Open Graph、JSON-LD 等曝光底座
- 接入 Google 网站验证标签，为 Search Console 收录与 sitemap 提交做好准备

## 详细更新

### 1. 桌面应用

- 优化 OAuth 弹窗处理，减少授权流程中的不稳定因素
- 简化窗口创建逻辑，让相关链路更清晰，也更适合后续继续迭代

### 2. 官网与搜索曝光

- 新增独立官网构建入口，继续保持 `website/` 与 Electron 主应用解耦
- 官网首页文案和结构重写，更集中地表达产品定位：`AI-only desktop workspace`
- 新增以下专题页面：
  - `features/`
  - `features/ai-workspace/`
  - `features/multi-instance-ai/`
  - `features/session-recovery/`
  - `compare/browser-tabs-vs-pretextchat/`
  - `download/`
  - `faq/`
  - `changelog/`
- 每个核心页面补充独立的 `title`、`description`、`canonical`、Open Graph 与 Twitter Card
- 补充结构化数据，帮助搜索引擎和 AI 工具更明确理解产品、页面类型和下载入口
- 新增 `robots.txt` 与 `sitemap.xml`，为 Google Search Console / Bing Webmaster Tools 提交做好准备
- 接入 Google 网站验证信息，便于后续正式提交站点收录

### 3. 发布承接能力

- 官网不再只承担“品牌介绍”职责，而开始承接：
  - 产品词：`AI workspace`、`desktop AI client`
  - 痛点词：`multiple ChatGPT windows`、`session recovery`
  - 对比词：`browser tabs vs AI workspace`
  - FAQ / 更新日志类内容入口
- 这意味着 PretextChat 的官网开始从“介绍页”转向“可被搜索、可被引用、可被分发的内容型官网”

## 对用户最重要的变化

- 如果你是重度 AI 用户，这一版更明确地讲清了 PretextChat 到底适合谁、为什么它不是另一个普通浏览器
- 如果你是第一次接触这个项目，现在可以通过 `Download / Features / FAQ / Compare` 这些页面更快理解产品
- 如果你是已经在试用桌面应用的用户，OAuth 相关流程会更稳一些

## 已知限制

- 当前公开分发入口仍以 GitHub Releases 为主
- 当前官网曝光底座已经补齐，但真实收录、排名和点击增长仍依赖后续提交 Search Console / Bing Webmaster Tools，以及持续内容更新
- 当前项目重点仍然是服务重度 AI 用户的多实例工作流，而不是做成大而全 AI 聚合平台

## 建议的 GitHub Release 标题

- `v0.1.5: OAuth popup improvements and a new multi-page website`
- `v0.1.5: Better OAuth flow, feature pages, FAQ, and SEO foundation`
- `v0.1.5: PretextChat website refresh and auth flow improvements`

## 可直接用于 GitHub Release 的短版正文

```md
## Highlights

- Improved OAuth popup handling and simplified the related window creation flow
- Upgraded the website from a single landing page to a multi-page static site
- Added feature pages, download page, FAQ, compare page, and changelog
- Added SEO/discovery foundations including sitemap, robots.txt, canonical tags, Open Graph, and structured data
- Added Google site verification support for Search Console setup

## Why it matters

This release makes PretextChat easier to discover, easier to understand, and more ready for public distribution. It also improves a key auth-related flow in the desktop app.
```

## 可直接用于 GitHub Release 的中文版正文

```md
## 本版亮点

- 优化 OAuth 弹窗处理，简化相关窗口创建逻辑
- 官网从单页展示站升级为多页面静态站
- 新增功能专题、下载页、FAQ、对比页和更新日志页
- 补齐 sitemap、robots.txt、canonical、Open Graph 和结构化数据等曝光底座
- 接入 Google 网站验证信息，为 Search Console 收录提交做准备

## 为什么这一版重要

这一版让 PretextChat 更适合公开发布：用户更容易理解产品，搜索引擎更容易理解站点，后续社区分发和内容传播也更容易承接。
```

## 发版前最后检查

- 确认最终版本号是否真的使用 `v0.1.5`
- 确认官网正式地址、`canonical`、`sitemap.xml` 中的域名一致
- 确认 Google 网站验证方式使用的是最终生产域名
- 确认 GitHub Release 中附带桌面应用下载入口，而不是只有源码
