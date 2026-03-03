# Inboxt Browser Extension

Save articles and content directly to your Inboxt instance with a single click. Built with [WXT](https://wxt.dev/) and [React](https://react.dev/).

## Features

- **One-Click Save:** Instantly save the current page to your Inboxt library.
- **Smart Extraction:** Extracts page content and metadata to be processed by Inboxt's backend.
- **Multi-Browser:** Supports Firefox and Chrome (Manifest V3).

The extension is built with **WXT** (Web Extension Toolbox), providing a modern developer experience with React and Mantine. It shares core types and validation schemas with the monorepo via `@inboxt/common`.

### Auto-Imports

WXT automatically imports common APIs and your project's components, hooks, and utils. You don't need to manually `import` them:
- **WXT APIs:** `browser`, `onMessage`, `defineConfig`, etc.
- **Project Files:** Everything in `src/components/*`, `src/hooks/*`, and `src/utils/*`.
- Run `npx wxt prepare` to update the helper types in `.wxt/types/imports.d.ts`.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/)
- **Inboxt Instance:** You must have a running Inboxt instance (API and Database) to use the extension. For local development, it's recommended to run the full app from the root first.

### Development Server

```bash
cd apps/web-extension

# Start Firefox development environment (with HMR)
npm run dev

# Target Chrome
npm run dev:chrome
```

WXT will **automatically launch a browser instance** with the extension pre-loaded. Hot Module Replacement (HMR) is supported for UI components.

### Manual Loading

If you need to manually load the extension:
1. Run `npm run build` or `npm run build:chrome` inside `apps/web-extension`.
2. **Chrome:** Go to `chrome://extensions`, enable Developer Mode, and "Load unpacked" from `.output/chrome-mv3`.
3. **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in `.output/firefox-mv3`.

## Permissions & Security

The extension requires the following permissions to function:

| Permission | Reason |
| --- | --- |
| `tabs` | Needed to retrieve the current URL and title for saving. |
| `storage` | Stores your API URL and Auth Token locally. |
| `<all_urls>` | Required to perform content extraction across different domains. |

## Configuration

During development, configure the extension via its **Options** page to set your API URL and Auth Token.
