# WebMCP Admin Console Demo

A browser demo that simulates an Admin Console with:

- A left-hand navigation with Console, User Management, Application Management, and Environment Management pages
- A common WebMCP tool that opens pages: `console.open_page`
- Context-relevant tools that appear dynamically based on the active page
- Runtime registration through the WebMCP API: `navigator.modelContext.registerTool()` and `unregisterTool()`

## GitHub Pages Deployment

Yes, this Console UI can be hosted on GitHub Pages.

1. Push this repo to GitHub with default branch `main`.
2. In GitHub, go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` and the workflow in `.github/workflows/deploy-pages.yml` will build and deploy `dist/`.

The Vite base path is configured in `vite.config.js` to use the repository name automatically on CI.

For local builds that target root (`/`) instead of a repo subpath, run:

```bash
VITE_BASE_PATH=/ npm run build
```

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Build

```bash
npm run build
```

## Notes on WebMCP behavior

- If `navigator.modelContext` is available (secure + compliant browser), tools are registered using the spec API.
- The common tool (`console.open_page`) is always registered.
- Contextual tools are registered/unregistered when active page changes.
- Each tool is defined using the `ModelContextTool` shape (name, description, inputSchema, execute, annotations).

## About a future server

- This current Console is static and can run from Pages.
- If you later add backend-only tools or data APIs, host that server separately and call it from the UI.
