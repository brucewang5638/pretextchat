# PretextChat Architecture

## 1. Tooling Split

PretextChat adopts a split tooling model on purpose:

- local development: `Electron Forge` + `@electron-forge/plugin-vite`
- macOS / Linux packaging: Electron Forge makers
- Windows packaging: `electron-builder`

This is not a “mixed chain by accident”.
It is an explicit division of responsibility:

- Forge owns developer ergonomics and Vite integration
- Builder owns Windows installer output, especially `NSIS` and `portable`

Windows packaging should not reintroduce Forge-specific installer makers.

## 2. Web Content Hosting

PretextChat supports two ways to host AI websites:

- default: `WebContentsView`
- exception-only: renderer `<webview>`

The rule is:

- all normal AI websites should use `WebContentsView`
- `<webview>` is allowed only when a site has proven login or compatibility issues
- every `<webview>` exception should document why it exists in app config

Current known exception:

- Google login flow

## 3. Preference Model

Startup preference uses a single source of truth:

- `startupMode: 'home' | 'restoreLastSession'`

Do not reintroduce parallel booleans such as `restoreOnStartup`.

## 4. Maintenance Guardrails

Before adding a dependency or a second implementation path, ask:

1. Does an existing dependency already solve this?
2. Is this new path temporary or permanent?
3. If temporary, where is the removal condition documented?
4. Will this create a second source of truth?

If the answer increases packaging duplication, runtime branching, or state duplication, prefer simplifying first.
