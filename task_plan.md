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
