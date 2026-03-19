# oh-my-opensession

A web-based session viewer and manager for [OpenCode](https://opencode.ai) — browse, search, star, rename, delete, and export your AI coding sessions.

[中文文档](#中文文档)

## Features

- 📋 Browse and search all OpenCode sessions
- ⭐ Star/unstar sessions for quick access
- ✏️ Rename sessions with custom titles
- 🗑️ Soft delete with trash & restore
- 📤 Export sessions as Markdown or JSON
- 📊 Token usage statistics and charts
- 🌐 English & Chinese UI (`--lang en|zh`)
- 🔒 Read-only access to OpenCode DB — your data is safe
- 📦 Zero dependencies — just Node.js

## Quick Start

```bash
npx oh-my-opensession
```

Opens a web UI at `http://localhost:3456`.

## Installation

```bash
npm install -g oh-my-opensession
oh-my-opensession
```

## Requirements

- Node.js >= 22.5.0 (uses built-in `node:sqlite`)
- An existing [OpenCode](https://opencode.ai) installation with session data
- Supported platforms: macOS, Windows x64

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Server port | `3456` |
| `--db <path>` | Path to `opencode.db` | macOS: `~/.local/share/opencode/opencode.db`<br>Windows: `%LOCALAPPDATA%\opencode\opencode.db` |
| `--lang <en\|zh>` | UI language | Auto-detect from `LANG` |
| `--open` | Open browser on start | `false` |
| `-h, --help` | Show help | — |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (overridden by `--port`) |
| `SESSION_VIEWER_DB_PATH` | Path to `opencode.db` (overridden by `--db`) |
| `OH_MY_OPENSESSION_META_PATH` | Path to metadata DB |

## How It Works

oh-my-opensession reads your OpenCode SQLite database in **read-only mode** to display sessions. It never writes to your OpenCode data.

Management metadata (stars, renames, soft deletes) is stored in a separate `meta.db`:
- macOS: `~/.config/oh-my-opensession/meta.db`
- Windows: `%APPDATA%\oh-my-opensession\meta.db`

## License

MIT

---

# 中文文档

oh-my-opensession 是一个基于 Web 的 [OpenCode](https://opencode.ai) 会话浏览器与管理工具，让你轻松浏览、搜索、收藏、重命名、删除和导出 AI 编程会话。

## 功能特性

- 📋 浏览和搜索所有 OpenCode 会话
- ⭐ 收藏/取消收藏，快速定位重要会话
- ✏️ 自定义会话标题
- 🗑️ 软删除 + 回收站恢复
- 📤 导出为 Markdown 或 JSON
- 📊 Token 消耗统计与图表
- 🌐 中英双语界面（`--lang zh|en`）
- 🔒 只读访问 OpenCode 数据库，数据安全无忧
- 📦 零依赖，只需 Node.js

## 快速开始

```bash
npx oh-my-opensession
```

在 `http://localhost:3456` 打开 Web 界面。

## 安装

```bash
npm install -g oh-my-opensession
oh-my-opensession
```

## 环境要求

- Node.js >= 22.5.0（使用内置 `node:sqlite`）
- 已安装 [OpenCode](https://opencode.ai) 并有会话数据
- 支持平台：macOS、Windows x64

## 命令行选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--port <端口号>` | 服务端口 | `3456` |
| `--db <路径>` | opencode.db 路径 | macOS: `~/.local/share/opencode/opencode.db`<br>Windows: `%LOCALAPPDATA%\opencode\opencode.db` |
| `--lang <en\|zh>` | 界面语言 | 自动检测系统 `LANG` |
| `--open` | 启动后自动打开浏览器 | `false` |
| `-h, --help` | 显示帮助 | — |

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 服务端口（被 `--port` 覆盖） |
| `SESSION_VIEWER_DB_PATH` | opencode.db 路径（被 `--db` 覆盖） |
| `OH_MY_OPENSESSION_META_PATH` | 元数据库路径 |

## 工作原理

oh-my-opensession 以**只读模式**读取 OpenCode 的 SQLite 数据库来展示会话，绝不写入你的 OpenCode 数据。

管理元数据（收藏、重命名、软删除）存储在独立的 `meta.db` 中：
- macOS: `~/.config/oh-my-opensession/meta.db`
- Windows: `%APPDATA%\oh-my-opensession\meta.db`

## 许可证

MIT
