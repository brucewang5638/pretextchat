# PretextChat

[中文说明](README.zh-CN.md)

PretextChat is an AI-only multi-instance desktop client for heavy AI users.

Instead of treating ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Kimi, and other AI products like random browser tabs, PretextChat turns them into task-oriented workspaces you can reopen, rename, and switch between quickly.

## Why PretextChat

Heavy AI users do not use AI like normal web browsing.

They:

- keep multiple AI products open at the same time
- keep multiple task contexts open inside the same AI product
- switch between long conversations constantly
- compare answers across tools
- lose state when browser tabs become chaotic

PretextChat is built for that workflow.

Core product thesis:

- AI-only, not a general browser
- multi-instance by default, not single-tab by default
- task-oriented, not site-oriented
- optimized for high-frequency text interaction

## Why Pretext

This project is powered by [Pretext](https://github.com/chenglou/pretext), a text measurement and layout library designed for fast multiline text sizing and layout without expensive DOM reflow.

In PretextChat, Pretext is not decorative branding. It is part of the product direction.

It enables the product to grow toward:

- more stable prompt input sizing
- more predictable long-text layout
- less layout shift in chat-heavy workflows
- better tab, card, and split-pane text behavior
- future virtualized chat and workbench layouts

The first real integration is already in place for application card copy layout, and the longer-term roadmap pushes Pretext deeper into the workbench experience.

## Current Status

PretextChat is in active early-stage development.

What exists today:

- preloaded AI application directory
- one-click AI launch into a dedicated instance
- multiple instances per AI app
- tab-based instance switching
- instance rename / close flows
- recent task reopen
- session restore
- login-state persistence through Electron partitions
- first renderer-side Pretext integration for stable text layout

What is intentionally not done yet:

- unified prompt bar
- split-screen workbench
- one-to-many prompt sending
- multi-instance comparison view
- cloud sync
- plugin / agent platform

See [PRD](docs/prd.md), [Roadmap](docs/roadmap.md), [Positioning](docs/positioning.md), [Go-To-Market Plan](docs/go-to-market.md), and [Release Checklist](docs/release-checklist.md).

## Supported AI Apps

The current app directory includes major global and Chinese AI products such as:

- ChatGPT
- Claude
- Gemini
- Perplexity
- DeepSeek
- Kimi
- 豆包
- 通义千问
- 智谱清言
- 腾讯元宝
- 秘塔 AI 搜索

These are configured through [data/ai-apps.json](data/ai-apps.json).

## Product Positioning

One-line positioning:

> PretextChat is a desktop work client for people who use multiple AI tools and multiple AI tasks every day.

What it is:

- an AI work launcher
- a multi-instance AI client
- a task-oriented desktop shell for AI websites

What it is not:

- a general-purpose browser
- an LLM API platform
- an all-in-one agent marketplace

## Tech Stack

- Electron
- React 19
- TypeScript
- Zustand
- Electron Forge
- Vite
- Pretext

## Local Development

### Requirements

- Node.js 22
- npm

### Install

```bash
npm ci
```

### Start the app

```bash
npm run start
```

### Typecheck

```bash
npm run lint
```

### Build distributables

```bash
# macOS / Linux
npm run make

# Windows NSIS / portable
npm run dist:win
```

## Release Flow

This repo ships desktop binaries through GitHub Releases.

Current release workflow:

1. update the product and docs
2. run local verification
3. push a version tag like `v0.1.0-beta.1` or `v0.1.0`
4. GitHub Actions builds platform artifacts
5. the workflow publishes a GitHub Release with attached binaries

The workflow file lives at [.github/workflows/release.yml](.github/workflows/release.yml).

Use [docs/release-checklist.md](docs/release-checklist.md) before every public release.

Windows distribution now follows a traditional installer strategy:

- primary installer: `NSIS`
- optional advanced-user build: `portable`
- installer and app icon: branded `icon.ico`

Current packaging split:

- local development: Electron Forge + Vite
- macOS / Linux packaging: Electron Forge makers
- Windows packaging: `electron-builder` via `npm run dist:win`

This better matches normal Windows user expectations around guided installation and install-path selection.

## Documentation Map

- [docs/prd.md](docs/prd.md): product requirements and scope
- [docs/roadmap.md](docs/roadmap.md): phased product plan
- [docs/positioning.md](docs/positioning.md): external messaging and narrative
- [docs/go-to-market.md](docs/go-to-market.md): launch and growth strategy
- [docs/release-checklist.md](docs/release-checklist.md): operational release checklist
- [docs/launch-copy.md](docs/launch-copy.md): ready-to-use launch copy templates
- [README.zh-CN.md](README.zh-CN.md): Chinese README

## Who This Is For

PretextChat is a strong fit for:

- developers comparing coding assistants
- PMs and researchers comparing answers across tools
- writers and translators running multiple tone or language workflows
- heavy AI users who treat AI as a daily work surface

It is not optimized for:

- light users who only open one AI tab occasionally
- users who want arbitrary web browsing
- teams primarily seeking model APIs rather than UI workflow

## Distribution Strategy

This product should not be launched as “yet another AI app.”

It should be launched as:

- a better workflow for people already paying for and using multiple AI products
- a desktop shell that turns chaotic AI tabs into organized task slots
- a product where speed means less switching friction, less context loss, and less layout instability

The detailed launch plan is documented in [docs/go-to-market.md](docs/go-to-market.md).

## Contributing

This project is still in an early product-shaping phase, so the most useful contributions are:

- workflow feedback from heavy AI users
- bug reports around login, navigation, or tab management
- release validation on different operating systems
- UX feedback on workbench flows
- future Pretext-driven layout improvements

If you want to contribute code, start by reading the current docs and opening an issue or discussion with:

- the workflow you are trying to improve
- the user problem you observed
- the expected before/after behavior

## Contact & Feedback

If you are testing PretextChat before public beta, the most valuable feedback is:

- which AI tools you use in parallel
- how many tasks you keep open at once
- where browser tabs currently break down for you
- whether session restore and recent task reopen are enough to change your default workflow

## Vision

Phase 1 proves that users want an AI-only multi-instance client.

Phase 2 proves they want to work inside it for long stretches.

Phase 3 turns it into an AI work operating system with one-to-many prompting, comparison views, and multi-workspace structure.
