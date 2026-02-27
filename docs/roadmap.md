# Claw Leaves — Roadmap

## 里程碑 1：核心骨架

目标：应用能跑起来，托盘图标可见，Dashboard 有基础 UI，Gateway 健康状态可观测。

- [x] 安装所需 Tauri 插件（store、notification、autostart）
- [x] 系统托盘图标 + 右键菜单（退出、显示主窗口）
- [x] 主窗口基础 UI（Discord / Telegram 风格）
  - [x] 侧边栏导航（Overview / Config / Exec / Log）
  - [x] 状态总览面板（Gateway 连接状态卡片）
- [x] `tauri-plugin-store` 配置持久化基础
- [x] Gateway 健康检查（HTTP/WS 探测）+ 状态展示

---

## 里程碑 2：SSH 隧道 + Node 连接 + Exec 宿主（⭐ 核心功能）

目标：能通过 SSH 隧道连接远程 Gateway，作为 node 注册，并响应 exec 指令。

**SSH 隧道管理器**

- [ ] 启动 / 停止 `ssh -N -L 18789:127.0.0.1:18789 user@host` 子进程
- [ ] 自动重连（指数退避策略）
- [ ] 向前端广播隧道状态事件（connecting / connected / error）

**WebSocket Node 客户端**

- [ ] 连接 Gateway WS 作为 node（`ws://127.0.0.1:18789`）
- [ ] 处理 `node.*` RPC 握手 + 保持心跳
- [ ] 节点配对流程 UI（approval prompt）

**设置页**

- [ ] SSH 目标：host / user / port / identity file
- [ ] 连接模式切换（SSH 隧道 / Local / Direct WS）

**Exec 宿主**

- [ ] 响应 `system.run` RPC（在本机执行命令）
- [ ] 响应 `system.which` RPC
- [ ] 读写 `exec-approvals.json` 允许列表
- [ ] Exec 允许列表 GUI 管理页

---

## 里程碑 3：通知 + 自动启动 + 状态广播

目标：完整的后台体验，节点能力对 Gateway 透明。

- [ ] 系统通知集成（`tauri-plugin-notification`，支持声音）
- [ ] Node 权限 / 能力状态向 Gateway 广播
- [ ] 开机自动启动（`tauri-plugin-autostart`）

---

## 里程碑 4：可选扩展

优先级视需求而定，不阻塞前三个里程碑发布。

- [ ] mDNS / 局域网 Gateway 自动发现
- [ ] 内嵌 Web Chat WebView
- [ ] 渠道状态监控面板（WhatsApp / Telegram 连接健康）
- [ ] Remote 直连模式（`ws://` / `wss://`，配合 Tailscale）
- [ ] Node 管理 UI（`openclaw devices list/approve`）
- [ ] UI 自动化节点（鼠标/键盘/截图，通过 `node.*` 协议）
