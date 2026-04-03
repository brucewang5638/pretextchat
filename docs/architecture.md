# PretextChat 架构说明

## 1. 工具链拆分

PretextChat 有意采用拆分工具链：

- 本地开发：`Electron Forge` + `@electron-forge/plugin-vite`
- macOS / Linux 打包：Electron Forge makers
- Windows 打包：`electron-builder`

这不是偶然混搭，而是明确分工：

- Forge 负责开发体验与 Vite 集成
- Builder 负责 Windows 安装器输出，尤其是 `NSIS` 与 `portable`

## 2. AI 内容承载方式

PretextChat 当前统一通过 `WebContentsView` 承载 AI 网站。

基本规则：

- 所有 AI 网站统一走 `WebContentsView`
- 主 renderer 窗口保持标准 `webSecurity`
- 导航策略集中在共享规则与主进程统一拦截中实现

## 3. 运行时资源策略

原生 `WebContentsView` 的资源状态遵循以下规则：

- 当前激活实例保持正常渲染优先级
- 隐藏实例会被移出可视区域
- 隐藏实例会被 background throttle 且静音
- 长时间未激活的实例会被释放，后续按需懒重建
- 运行态区分 `active`、`throttled`、`released`

## 4. 状态模型

主进程是真相源，renderer 是展示层。

关键边界：

- `PersistedWorkspaceState`：只保存可恢复的实例元数据
- `RuntimeInstanceState`：保存当前进程内的运行时状态
- renderer 不持有业务真相源，只消费主进程快照

启动偏好只保留一个来源：

- `startupMode: 'home' | 'restoreLastSession'`

不要重新引入平行布尔值，例如 `restoreOnStartup`。

## 5. 会话恢复原则

恢复策略采用：

- 恢复 metadata
- 懒创建 view
- 优先恢复当前激活实例

这样做的原因是：

- 启动更快
- 不会一次性把所有历史网页全部拉起
- 更适合多实例桌面工作流

## 6. 导航与安全约束

导航判定统一分为：

- `allow`
- `external`
- `deny`
- `popup`

AI 网站自己的站内跳转、OAuth 弹窗、外部链接，都应走统一规则，不允许每个站点各写一套分叉逻辑。

## 7. 维护原则

在增加依赖、增加第二条实现路径，或引入额外状态前，请先问：

1. 现有依赖是否已经能解决？
2. 这是临时路径还是永久路径？
3. 如果是临时路径，移除条件写清楚了吗？
4. 它是否会引入第二真相源？

如果答案会增加打包重复、运行时分叉或状态重复，应优先考虑简化。
