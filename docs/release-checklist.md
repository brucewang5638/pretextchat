# PretextChat Release Checklist

## 1. Release Goal

这份清单用于确保每次公开发布都具备：

- 可下载
- 可理解
- 可安装
- 可传播
- 可收集反馈

## 2. Versioning

建议版本规则：

- 内部试跑：`v0.1.0-beta.1`
- beta 修复版：`v0.1.0-beta.2`
- 正式版：`v0.1.0`

带连字符的 tag 会被 release workflow 视为 prerelease。

## 3. Product Readiness

- [ ] 关键主流程可用：打开应用、创建实例、切换实例、关闭实例、重命名实例
- [ ] 会话恢复可用
- [ ] 最近任务重开可用
- [ ] 主要 AI 站点登录链路可用
- [ ] 没有已知 blocker 级崩溃问题
- [ ] 文案和产品定位一致

## 4. QA Readiness

- [ ] 本地跑过 `npm run lint`
- [ ] 至少做过一次完整冷启动测试
- [ ] 至少做过一次关闭后恢复测试
- [ ] 至少验证过 3 个核心 AI 站点
- [ ] 检查应用卡片、标签页、主工作区是否存在明显 UI 破损
- [ ] 检查打包流程是否成功产出安装包

## 5. Docs Readiness

- [ ] `README.md` 已更新
- [ ] `docs/positioning.md` 已更新
- [ ] `docs/go-to-market.md` 已更新
- [ ] `docs/launch-copy.md` 已更新
- [ ] 发布说明与当前版本功能一致
- [ ] 已知限制写清楚，没有夸大能力

## 6. Asset Readiness

- [ ] 1 个主视觉封面
- [ ] 3 张产品截图
- [ ] 1 段 15-30 秒演示视频
- [ ] 1 条英文发布文案
- [ ] 1 条中文发布文案
- [ ] 1 条 Product Hunt 简介
- [ ] 1 条 `Show HN` 草稿

## 7. Release Operations

- [ ] 确认 GitHub Actions `release.yml` 可用
- [ ] Windows 安装器已按预期生成 NSIS 向导安装版与 portable 版
- [ ] 打 tag 前确认工作树干净
- [ ] 创建并推送版本 tag
- [ ] 等待 CI 构建完成
- [ ] 检查 GitHub Release 中所有目标平台产物是否齐全
- [ ] 校验 prerelease / release 标记是否正确
- [ ] 补充 release 标题和说明

## 8. Install Verification

- [ ] 至少在 1 台 macOS 设备验证下载与打开
- [ ] 至少在 1 台 Windows 设备验证下载与安装
- [ ] 至少在 1 台 Linux 设备验证包可用性
- [ ] 验证首次启动时窗口、图标、标题是否正确

## 9. Launch Readiness

- [ ] GitHub Release 已可公开访问
- [ ] 首页文案与 README 一致
- [ ] Product Hunt 页面素材准备完毕
- [ ] 社交平台短视频准备完毕
- [ ] 评论回复模板准备完毕
- [ ] 反馈收集入口准备完毕

## 10. Post-Launch Actions

- [ ] 24 小时内收集所有公开反馈
- [ ] 标注 blocker / confusion / praise 三类反馈
- [ ] 48 小时内给出第一轮修复计划
- [ ] 7 天内发布一版快速修复更新
- [ ] 总结本次发布的下载、留存和反馈数据

## 11. Release Notes Structure

建议每次 release notes 使用以下结构：

### What’s new

- 本版本新增了什么

### Why it matters

- 这些变化对用户有什么实际价值

### Known limitations

- 还有哪些已知限制

### Download

- 不同平台如何获取安装包

### Feedback wanted

- 当前最希望用户反馈什么
