# Claw Leaves 🍃

A cross-platform OpenClaw Desktop companion app for Windows (and eventually Linux), inspired by the official macOS companion.

Built with **Tauri v2**, **React 19**, and **TypeScript**.

## Features

- 🔌 **SSH Tunnel Management** — Auto-establishes and reconnects `ssh -N -L` tunnels to a remote OpenClaw Gateway
- 🤝 **Node Mode** — Registers as a WebSocket node, responds to `node.*` RPC calls
- ⚡ **Exec Host** — Handles `system.run` / `system.which` tool calls locally, with an approval list GUI
- 🏥 **Gateway Health Check** — Periodic status polling with live display
- 🔔 **System Notifications** — Native OS notifications from Gateway pushes
- 🗂️ **Config Persistence** — SSH credentials, node token, and settings stored locally
- 🚀 **Auto-start** — Runs on system startup

## Tech Stack

| Layer | Technology |
|-------|------------|
| App framework | [Tauri v2](https://tauri.app/) |
| Frontend | [React 19](https://reactjs.org/) + TypeScript |
| Build tool | [Vite](https://vite.dev/) |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| SSH tunnel | Rust `std::process::Command` |
| WebSocket | Rust `tokio-tungstenite` |
| Config | `tauri-plugin-store` |

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md) for the full milestone plan.

| Milestone | Status |
|-----------|--------|
| M1 — Core skeleton (tray, UI, health check) | 🔲 Planned |
| M2 — SSH tunnel + Node + Exec host | 🔲 Planned |
| M3 — Notifications + auto-start + status broadcast | 🔲 Planned |
| M4 — Extensions (mDNS, Web Chat, channel monitoring) | 🔲 Planned |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full architecture design.

## Development

```bash
pnpm install
pnpm tauri dev
```

## License

MIT
