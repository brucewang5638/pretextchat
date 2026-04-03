# PretextChat 阅读顺序指南

这份文档的目标只有一个：

- 让新开发者用最短路径看懂项目主链路

不要从零散组件开始翻。
先建立“主进程真相源 + renderer 展示层 + 两种页面承载方式”的总脑图，再往下读细节，理解成本最低。

## 1. 第一层：先建立总脑图

按这个顺序先读 3 个文件：

1. [src/main/main.ts](../src/main/main.ts)
2. [src/main/window.ts](../src/main/window.ts)
3. [src/renderer/App.tsx](../src/renderer/App.tsx)

读完后你应该知道：

- Electron 主进程什么时候启动
- 主窗口是谁创建的
- renderer 根组件什么时候切到启动页 / 工作台
- 这个项目不是纯前端 SPA，而是主进程驱动状态的桌面应用

## 2. 第二层：看清跨进程边界

接着读：

1. [src/preload/preload.ts](../src/preload/preload.ts)
2. [src/shared/constants.ts](../src/shared/constants.ts)
3. [src/shared/types.ts](../src/shared/types.ts)

重点理解：

- renderer 真正能调用的能力只有 `window.api`
- IPC 通道名都集中定义在 `constants.ts`
- `StateSnapshot` 是主进程推给 renderer 的完整只读快照

读完后你应该知道：

- renderer 能做什么，不能做什么
- 主进程发给 renderer 的核心数据结构长什么样

## 3. 第三层：看业务真相源

然后读：

1. [src/main/instance-store.ts](../src/main/instance-store.ts)
2. [src/main/local-store.ts](../src/main/local-store.ts)
3. [src/main/app-registry.ts](../src/main/app-registry.ts)

重点看这些概念：

- `PersistedWorkspaceState`
- `RuntimeInstanceState`
- `startupMode`
- 应用目录校验

重点理解：

- 实例状态的真相源在主进程
- 持久化层只保存可恢复 metadata，不保存真实网页对象
- `webview` 是受控特例，不是常规承载方式

## 4. 第四层：看 IPC 如何把链路串起来

继续读：

1. [src/main/ipc-handlers.ts](../src/main/ipc-handlers.ts)

这里是项目最关键的链路文件之一。

先看这些 helper：

- `buildStateSnapshot`
- `syncState`
- `activateInstance`
- `showCurrentActiveInstance`

再看这些 handler：

- `CREATE_INSTANCE`
- `SWITCH_INSTANCE`
- `CLOSE_INSTANCE`
- `RESTORE_SESSION`

读完后你应该知道：

- renderer 发起一个动作后，主进程具体会怎么处理
- 为什么“激活实例”是当前项目的主链路收敛点

## 5. 第五层：看页面承载、导航和安全

再读：

1. [src/main/view-manager.ts](../src/main/view-manager.ts)
2. [src/main/navigation-policy.ts](../src/main/navigation-policy.ts)
3. [src/shared/navigation-rules.ts](../src/shared/navigation-rules.ts)
4. [src/shared/app-runtime.ts](../src/shared/app-runtime.ts)

重点理解：

- 所有 AI 网站为什么统一走 `WebContentsView`
- `allow / external / deny / popup` 这套导航判定如何服务统一承载链路
- 隐藏实例为什么会先节流、再释放

## 6. 第六层：回到 renderer，看它如何消费状态

继续读：

1. [src/renderer/hooks/useIpc.ts](../src/renderer/hooks/useIpc.ts)
2. [src/renderer/store.ts](../src/renderer/store.ts)
3. [src/renderer/pages/LaunchPage/LaunchPage.tsx](../src/renderer/pages/LaunchPage/LaunchPage.tsx)
4. [src/renderer/pages/WorkbenchPage/WorkbenchPage.tsx](../src/renderer/pages/WorkbenchPage/WorkbenchPage.tsx)

重点理解：

- renderer 的 store 是 UI 派生态，不是业务真相源
- LaunchPage 只是应用目录和入口页
- WorkbenchPage 是页面承载分流点

## 7. 第七层：看高频交互组件

最后看这些组件：

1. [src/renderer/components/Sidebar/Sidebar.tsx](../src/renderer/components/Sidebar/Sidebar.tsx)
2. [src/renderer/components/TabBar/TabBar.tsx](../src/renderer/components/TabBar/TabBar.tsx)
3. [src/renderer/components/TabBar/TabItem.tsx](../src/renderer/components/TabBar/TabItem.tsx)
4. [src/renderer/components/AppCard/AppCard.tsx](../src/renderer/components/AppCard/AppCard.tsx)
5. [src/renderer/components/PretextBlock/PretextBlock.tsx](../src/renderer/components/PretextBlock/PretextBlock.tsx)
6. [src/renderer/components/AppIcon/AppIcon.tsx](../src/renderer/components/AppIcon/AppIcon.tsx)
7. [src/renderer/components/AppErrorBoundary/AppErrorBoundary.tsx](../src/renderer/components/AppErrorBoundary/AppErrorBoundary.tsx)

这层主要回答：

- 用户点哪里会触发创建 / 切换 / 关闭实例
- 哪些组件只是展示，哪些组件会真正发起业务动作

## 8. 第八层：看工具层和补充文件

这些文件最后看即可：

1. [src/renderer/lib/assets.ts](../src/renderer/lib/assets.ts)
2. [src/renderer/lib/pretext.ts](../src/renderer/lib/pretext.ts)
3. [src/renderer/hooks/useElementWidth.ts](../src/renderer/hooks/useElementWidth.ts)

这些文件属于“工具层 / 类型补充”，不是理解主业务链路的第一优先级。

## 9. 最短阅读路径

如果时间很少，只读这 10 个文件：

1. [src/main/main.ts](../src/main/main.ts)
2. [src/main/window.ts](../src/main/window.ts)
3. [src/preload/preload.ts](../src/preload/preload.ts)
4. [src/shared/types.ts](../src/shared/types.ts)
5. [src/main/instance-store.ts](../src/main/instance-store.ts)
6. [src/main/ipc-handlers.ts](../src/main/ipc-handlers.ts)
7. [src/main/view-manager.ts](../src/main/view-manager.ts)
8. [src/shared/navigation-rules.ts](../src/shared/navigation-rules.ts)
9. [src/renderer/App.tsx](../src/renderer/App.tsx)
10. [src/renderer/pages/WorkbenchPage/WorkbenchPage.tsx](../src/renderer/pages/WorkbenchPage/WorkbenchPage.tsx)

读完这 10 个文件，基本就能把项目主链路讲清楚。

## 10. 读完后应能回答的 6 个问题

读完这份顺序里的文件后，你应该能回答：

1. 实例的真相源存在哪里？
2. renderer 为什么不自己维护业务状态？
3. 为什么所有站点统一走 `WebContentsView`？
4. 导航和弹窗规则由谁统一控制？
5. 为什么隐藏实例会先节流、再释放？
6. 从点击应用卡片到显示工作台，中间经过了哪些文件？
