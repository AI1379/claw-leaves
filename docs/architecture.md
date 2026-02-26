# Claw Leaves — 架构设计

## 背景

**Claw Leaves** 是一个跨平台（首期目标 Windows）的 OpenClaw Desktop 伴侣应用，功能对标官方 macOS Companion，基于 Tauri v2 + React 19 + TypeScript 构建。

OpenClaw 官方 macOS Companion 的核心能力如下：

| 能力 | 描述 |
|------|------|
| **Node 模式** | 以 WebSocket 节点身份连接 Gateway，响应 `node.*` RPC 指令 |
| **SSH 隧道管理** | `ssh -N -L 18789:127.0.0.1:18789 user@host` 自动建立/重连/销毁 |
| **Remote 直连模式** | 跳过 SSH，直接连接 `ws://` / `wss://` URL（配合 Tailscale/反代） |
| **Exec 宿主** | 处理 `system.run` / `system.which` 等工具调用，可配置允许列表 |
| **通知** | 接受 `node.invoke` 推送，展示系统通知（含声音） |
| **健康检查** | 周期性探测 Gateway 状态，UI 展示在线/离线 |
| **Web Chat 代理** | 远程模式下，通过 SSH 隧道转发 Web Chat 访问到本地 |
| **Bonjour/mDNS 发现** | 局域网内自动发现正在广播的 Gateway |
| **权限管理** | 向 Gateway 广播本地权限状态（屏幕录制、麦克风等） |

---

## 整体架构

```
┌────────────────────────────────────────────────────────────┐
│                   Claw Leaves (Tauri v2)                   │
│                                                            │
│  ┌─────────────────┐    ┌──────────────────────────────┐  │
│  │  React UI        │    │      Rust Backend (Tauri)    │  │
│  │  (前端)          │◄──►│                              │  │
│  │                  │    │  ┌────────────────────────┐  │  │
│  │  • 状态总览       │    │  │  SSH Tunnel Manager    │  │  │
│  │  • 设置页         │    │  │  (管理 ssh 子进程)      │  │  │
│  │  • Node 状态      │    │  └────────────────────────┘  │  │
│  │  • Exec 审批列表  │    │  ┌────────────────────────┐  │  │
│  │  • 通知日志       │    │  │  WS Node Client        │  │  │
│  │                  │    │  │  (node.* RPC 协议)      │  │  │
│  └─────────────────┘    │  └────────────────────────┘  │  │
│                          │  ┌────────────────────────┐  │  │
│                          │  │  Config Store          │  │  │
│                          │  │  (tauri-plugin-store)  │  │  │
│                          │  └────────────────────────┘  │  │
│                          │  ┌────────────────────────┐  │  │
│                          │  │  Health Checker        │  │  │
│                          │  │  (定期探测 Gateway)     │  │  │
│                          │  └────────────────────────┘  │  │
│                          │  ┌────────────────────────┐  │  │
│                          │  │  Exec Host             │  │  │
│                          │  │  (system.run/which)    │  │  │
│                          │  └────────────────────────┘  │  │
│                          │  ┌────────────────────────┐  │  │
│                          │  │  System Tray           │  │  │
│                          │  └────────────────────────┘  │  │
│                          └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
              WebSocket (port 18789)
              SSH Tunnel / Direct WS
                          │
┌─────────────────────────────────┐
│  OpenClaw Gateway (remote/local) │
│  ws://127.0.0.1:18789           │
└─────────────────────────────────┘
```

---

## 技术选型

| 层 | 技术 | 理由 |
|----|------|------|
| 应用框架 | Tauri v2 | 轻量原生，内置托盘/通知/WebView |
| 前端 | React 19 + TypeScript | 已初始化，生态成熟 |
| 构建工具 | Vite | 已初始化 |
| 状态管理 | **Zustand** | 轻量、与 Tauri 事件配合好 |
| UI 风格 | **Discord / Telegram Desktop 风格** | 侧边栏 + 简洁面板，深色为主 |
| SSH 隧道 | Rust `std::process::Command` | 跨平台管理 `ssh` 子进程，无额外依赖 |
| WS 客户端 | Rust `tokio-tungstenite` | 异步稳定，支持 TLS |
| 配置存储 | `tauri-plugin-store` | JSON 持久化，自动保存 |
| 系统通知 | `tauri-plugin-notification` | 原生通知，支持声音 |
| 自动启动 | `tauri-plugin-autostart` | 开机自启 |

---

## 目录结构规划

```
claw-leaves/
├── docs/
│   ├── architecture.md        # 本文件
│   └── roadmap.md             # 里程碑计划
├── src/                       # React 前端
│   ├── components/
│   │   ├── StatusCard.tsx     # Gateway / Node 状态卡
│   │   ├── TunnelConfig.tsx   # SSH 隧道配置表单
│   │   ├── ExecApprovals.tsx  # Exec 允许列表管理
│   │   └── NotificationLog.tsx
│   ├── views/
│   │   ├── Dashboard.tsx
│   │   └── Settings.tsx
│   ├── store/                 # Zustand stores
│   └── hooks/                 # Tauri 事件 hooks
└── src-tauri/
    └── src/
        ├── main.rs
        ├── tray.rs            # 系统托盘
        ├── tunnel.rs          # SSH 隧道生命周期
        ├── node_client.rs     # WS Node RPC 客户端
        ├── health.rs          # Gateway 健康检查
        ├── config.rs          # 配置读写
        └── exec_host.rs       # system.run 执行宿主
```

---

## 已确认决策

| 决策 | 结论 |
|------|------|
| 连接优先级 | **SSH 隧道模式优先**，Local 模式为次 |
| Exec 宿主 | ✅ 启用，未来扩展 UI 自动化 |
| 状态管理 | **Zustand** |
| UI 风格 | **Discord / Telegram Desktop 风格** |
