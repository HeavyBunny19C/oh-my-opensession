<p align="center">
  <img src="./docs/preview-dashboard.png" alt="oh-my-opensession" width="720" />
</p>

<h1 align="center">OpenSession</h1>

<p align="center">
  <strong>The Developer's AI Chronicle — binding your scattered conversation diaries into one volume</strong>
</p>

<p align="center">
  <a href="./README.en.md">English</a> · <a href="./README.md">中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22.5.0-brightgreen?style=flat-square&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-blue?style=flat-square" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/license-MIT-purple?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/v1.0.0-orange?style=flat-square" alt="Version" />
</p>

<p align="center">
  <em>Developers keep journals too — ours just happen to be AI conversations.</em><br/>
  <em>The problem? Your journal is scattered across four different drawers.</em>
</p>

---

## 🤔 What Is This?

We might be the first generation of programmers who **talk to AI more than to our coworkers**.

Think about it — every day you pour your most complex architecture decisions, your trickiest debugging logic, your most inspired design instincts into conversations with AI. These conversations are more honest than any code comment you've ever written (let's be real, you'd never put "I can't understand my own code from three days ago" in a comment), more informative than any standup, and closer to your actual work than any weekly report.

**Your AI conversation history is the most authentic developer journal of this era.**

Except this journal is scattered across four different notebooks — OpenCode's SQLite database, Claude Code's JSONL files, Codex's JSON, Gemini's temp directory. Four formats, four corners, much like that "read later" bookmark folder you'll never actually organize.

**OpenSession does one simple thing: gathers those four scattered diaries and binds them into one volume.**

Search, browse, star, export, stats — dark mode, terminal aesthetic, zero dependencies. It'll even tell you exactly how many tokens you've burned (you might want to sit down before looking at that number 💸).

---

## 🤖 Supported AI Tools

| Tool | Status | Capabilities |
|:---|:---:|:---|
| **OpenCode** | ✅ Full | Browse, search, star, rename, delete, export |
| **Claude Code** | ✅ Read | Browse, search, export |
| **Codex CLI** | 🔜 Ready | Adapter built, auto-detected when installed |
| **Gemini CLI** | 🔜 Ready | Adapter built, auto-detected when installed |

> Auto-detection: OpenSession scans default data directories on startup. Detected tools appear in the top bar; undetected ones are grayed out.

---

## 🚀 Quick Start

```bash
npx opensession
```

> 💡 Open `http://localhost:3456` and start exploring your AI coding sessions!

### Global Install

```bash
npm install -g opensession
opensession --open  # auto-opens browser
```

### From Source

```bash
git clone https://github.com/HeavyBunny19C/OpenSession.git
cd oh-my-opensession
npm start
```

---

## 📦 Install / Upgrade / Uninstall

```bash
# Install
npm install -g opensession

# Upgrade to latest
npm update -g opensession

# Uninstall
npm uninstall -g opensession
```

> Backward compatible: the `oh-my-opensession` command still works after upgrade.

---

## ✨ Features

| | Feature | Description |
|:---:|:---|:---|
| 🤖 | **Multi-provider** | One UI for OpenCode, Claude Code, Codex CLI, Gemini CLI |
| 🌙 | **Dark mode** | Auto-follows system, easy on the eyes |
| 🖥️ | **Terminal aesthetic** | Code block cards + grid background |
| 🔍 | **Search & filter** | By keyword, time range, across all providers |
| ⭐ | **Star & rename** | Mark important sessions (OpenCode) |
| 📤 | **Export** | JSON / Markdown / Plain text |
| 🗑️ | **Soft delete** | Recoverable trash bin (OpenCode) |
| 📊 | **Token stats** | Daily token usage charts |
| 🌐 | **i18n** | English & Chinese |
| 🚀 | **Zero dependencies** | Pure Node.js, no npm install needed |

---

## ⚙️ CLI Options

```
Option                  Description                     Default
--port <port>           Server port                     3456
--opencode-db <path>    OpenCode database path          auto-detect
--claude-dir <path>     Claude Code projects dir        auto-detect
--codex-dir <path>      Codex CLI sessions dir          auto-detect
--gemini-dir <path>     Gemini CLI sessions dir         auto-detect
--lang <en|zh>          UI language                     auto-detect
--open                  Auto-open browser               false
--reindex               Force rebuild session index     false
-h, --help              Show help                       —
```

## 🔧 Environment Variables

| Variable | Description |
|:---|:---|
| `PORT` | Server port (`--port` takes priority) |
| `SESSION_VIEWER_DB_PATH` | OpenCode DB path (`--opencode-db` takes priority) |
| `OPENSESSION_META_PATH` | Metadata DB path |

---

## 🏗️ Architecture

```
opensession
├── bin/cli.mjs              # Entry point
├── src/
│   ├── server.mjs           # HTTP server, /:provider routing
│   ├── providers/
│   │   ├── interface.mjs    # ProviderAdapter interface (JSDoc)
│   │   ├── index.mjs        # Provider registry
│   │   ├── opencode/        # OpenCode adapter (SQLite)
│   │   ├── claude-code/     # Claude Code adapter (JSONL)
│   │   ├── codex/           # Codex CLI adapter (JSONL)
│   │   └── gemini/          # Gemini CLI adapter (JSON)
│   ├── index-db.mjs         # Cross-provider session index
│   ├── meta.mjs             # User metadata (star, rename, delete)
│   ├── views/               # Server-rendered HTML templates
│   ├── static/              # CSS + client JS
│   └── locales/             # i18n (en, zh)
└── docs/
    └── CONTRIBUTING-PROVIDER.md  # How to add a new provider
```

---

## 🔌 Add Your Own Provider

See [CONTRIBUTING-PROVIDER.md](./docs/CONTRIBUTING-PROVIDER.md) for a step-by-step guide.

---

<details>
<summary>🤖 <strong>AI Agent Context</strong> (click to expand)</summary>

```
PROJECT: OpenSession v1.0.0
PURPOSE: Multi-provider AI session viewer (web UI)
STACK: Node.js ≥22.5.0, zero dependencies, ESM, SQLite (node:sqlite)
PROVIDERS: OpenCode (read-write), Claude Code (read-only), Codex CLI (read-only), Gemini CLI (read-only)

ARCHITECTURE:
  src/providers/interface.mjs — ProviderAdapter interface
  src/providers/*/adapter.mjs — Per-provider implementation
  src/index-db.mjs — Cross-provider session index (SQLite)
  src/meta.mjs — User metadata: star, rename, soft-delete (SQLite)
  src/server.mjs — HTTP routing with /:provider prefix

KEY FACTS:
  - Read-only: Never modifies AI tool databases
  - Meta storage: ~/.config/oh-my-opensession/meta.db
  - Zero install: Clone and run, no npm install needed
  - ESM only: "type": "module", entry is bin/cli.mjs
  - No build step: Pure JavaScript, no bundler
```

</details>

---

## 🗺️ Roadmap

> v1.0 ships with multi-provider architecture. Below are planned but not yet implemented features. PRs and Issues welcome!

**🔀 Cross-Platform Session Migration & Context Injection**
- [ ] Cross-provider session export / import (OpenCode ↔ Claude Code ↔ Codex ↔ Gemini)
- [ ] Auto-inject context into target tool when opening a session (one-click to continue a conversation in another AI tool)
- [ ] `adapter.exportSession()` interface pre-seeded — returns normalized messages + raw data in dual format

**🧠 Session Knowledge Graph**
- [ ] Parent-child session hierarchy visualization (main task → subtask → sub-subtask)
- [ ] Session relation graph: derivation, branching, merging between sessions
- [ ] Project-level aggregation: auto-group related sessions by working directory
- [ ] `RawSession.parentId` pre-seeded — OpenCode's `parent_id` and Claude Code's `parentSessionId` already collected in v1

**🔮 Agent / Skill / MCP / Tool / LSP Visualization**
- [ ] In-session node graph: full thinking chain of Agent calls, Skill triggers, MCP Server interactions, Tool executions, LSP operations
- [ ] Per-node timing analysis: execution time and token cost for each tool call / agent delegation
- [ ] Thinking chain replay: reconstruct AI decision process on a timeline (thinking → tool → result → next step)
- [ ] `Message.metadata` pre-seeded — agent name / skill name / MCP server / delegation chain raw data preserved per provider in v1

**🔌 Cross-Provider Enhancements**
- [ ] Unified search across all providers (currently per-tab only)
- [ ] Aggregated stats dashboard across providers
- [ ] Star / rename / delete for non-OpenCode providers (currently OpenCode only for write ops)

**⚡ Data & Real-time**
- [ ] Real-time file watching (currently reindex on launch + manual refresh)
- [ ] Incremental indexing (scan only new/changed session files)

**🧩 Plugins & Extensibility**
- [ ] Runtime dynamic provider plugin loading (currently compile-time registered)
- [ ] In-UI provider settings panel (currently CLI flags / env vars only)
- [ ] More providers: Cursor / Windsurf / Aider

**Architecture Pre-seeded in v1.0**
- ✅ `RawSession.parentId` — knowledge graph parent-child linking field
- ✅ `Message.metadata` — Agent/Skill/MCP/Tool/LSP raw data preserved
- ✅ `adapter.exportSession()` — cross-platform migration export interface stub
- ✅ `session_index` composite PK `(provider, session_id)` — cross-provider data isolation

---

## 💖 Donate

If this project made you smile, consider buying me a Mixue ice cream 🍦

<p align="center">
  <img src="./docs/wechat-pay.jpeg" alt="WeChat Pay" width="250" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./docs/alipay.jpeg" alt="Alipay" width="250" />
</p>
<p align="center">
  <sub>WeChat Pay &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Alipay</sub>
</p>

---

## 📄 License

MIT — use it, have fun 🎉
