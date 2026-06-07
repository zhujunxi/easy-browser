# AGENTS.md

**重要：不要执行构建操作（npm run dev / npm run build），只做代码编辑和 lint 检查。**

## Build & Dev

```bash
npm run dev      # Watch-mode build (NODE_ENV not set → dev build with sourcemaps)
npm run build    # Production build + zip (NODE_ENV=production)
npm run lint     # ESLint (src/manifest.js and dist/ are ignored)
npm run lint:fix # ESLint auto-fix
npm run format   # Prettier on src/**/*.{js,jsx,json,css,md}
```

The build is a custom Vite pipeline (`build.mjs`), **not** `vite build`. It runs two Vite builds:
1. **otherBuildConfig**: sidepanel, options, background, content styles → `dist/src/...`
2. **contentBuildConfig**: content script (`src/content/index.js`) → IIFE format (needs to run in page context, not as a module)

The custom `vite-plugin-extension` generates `dist/manifest.json` from `src/manifest.js`, resolving hashed content CSS filenames.

## Architecture

This is a **Chrome Extension (Manifest V3)** with these entrypoints:

| Entry | Source | Output |
|-------|--------|--------|
| Side Panel (main UI) | `src/sidepanel/sidepanel.jsx` | React app with chat |
| Options page | `src/options/options.jsx` | LLM key + model config |
| Background SW | `src/background/index.js` | Service worker, module type |
| Content script | `src/content/index.js` | Injected into all pages, IIFE |
| Popup | `src/popup/popup.jsx` | Minimal popup page |

## Core Loop

`ChatOrchestrator` (`src/services/chat/orchestrator.js:14`) drives the agent:
1. User input → `ContextManager.addMessage()`
2. `toolRegistry.inferCategories(input)` selects relevant tool categories
3. LLM stream via `LlmService` with tool definitions
4. Tool calls executed via `ToolExecutor` (with timeout + retry)
5. Results go back into `ContextManager` (truncated to max tokens)
6. Loop repeats up to `MAX_TOOL_ROUNDS`

## Key Modules

- **`src/services/llm/index.js`** — LLM API client (OpenAI-compatible). Supports `openai`, `qwen`, `deepseek`. Each model's key/host/model stored in `chrome.storage`.
- **`src/services/chat/context-manager.js`** — Token estimation (CJK-aware), tool result truncation (3000 token max), context summarization at 75% threshold of 64000 max tokens.
- **`src/services/chat/system-prompt.js`** — Dynamically injects date, tabs, screen size, and OS into base system prompt.
- **`src/tools/registry.js`** — `ToolRegistry` class: register/get/forCategories/inferCategories. Supports category filtering.
- **`src/tools/executor.js`** — Executes tools with 30s timeout, 1 retry on network/timeout errors, exponential backoff.
- **`src/sidepanel/stores/ChatStore.jsx`** — React Context + `useReducer` for chat state (messages, tool calls, streaming content).

## 15 Tools

Registered in `src/tools/index.js` under 4 categories:
- **navigation**: `createTab`, `getCurrentTab`, `getAllTabs`, `closeTabs`, `reloadTab`, `updateTab`
- **page_query**: `getScreenStructure`, `getScreenContent`, `getScreenShot`
- **page_interaction**: `scrollScreen`, `clickElement`, `typeText`, `hoverElement`
- **utility**: `wait`, `userConfirm`

Each tool follows `{ call: Function, tool: Object }` pattern (OpenAI function calling format).

## Config & Storage

`ConfigManager` (`src/services/storage.js`) wraps `chrome.storage` with defaults:
- Model: `openai` (default), `qwen`, `deepseek` — each with key/host/model
- Theme: `system`/`light`/`dark`
- Language: `system`/`English`/`中文-简体`

## Path Aliases (Vite, usable in src/)

```
@ → src/
@components → src/components/
@assets → src/assets/
@services → src/services/
@hooks → src/hooks/
@tools → src/tools/
@i18n → src/i18n/
@styles → src/styles/
@sidepanel → src/sidepanel/
```

## Code Conventions

- **No semicolons**, single quotes, trailing commas (always), jsxSingleQuote, printWidth 100 (Prettier enforced)
- ESLint: `no-unused-vars` error (uppercase vars ignored), `prettier/prettier` error, react-hooks rules enforced
- Global `chrome` API is `readonly` (declared in eslint globals)
- `__TEST_MODE__` global set to `true` in dev builds (`build.mjs:49`)
- SCSS variables/mixins must be explicitly `@use`'d per file (Vite scss config leaves this to the user)
- `src/manifest.js` is excluded from linting (uses import attributes for package.json)

## CI

`.github/workflows/release.yml` — triggers on `v*` tags, builds with Node 18, creates GitHub release with `easy-browser.zip`.

## Gotchas

- Content script is built as **IIFE** separately — if you add imports to it, they must work in a non-module context.
- The custom Vite plugin rewrites content script CSS paths in manifest.json by scanning `dist/assets/css/` for hashed filenames.
- `build.mjs` cleans `dist/` before each build.
- `LlmService.abortFetch()` uses `AbortController` — after abort it creates a fresh controller.
- i18n module at `src/i18n/index.js` — supports en/zh, detect based on `navigator.language` or stored config.
- No test runner is configured. There's a `src/test/index.jsx` that renders in sidepanel when `__TEST_MODE__` is truthy.
