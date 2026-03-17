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

## PingOne OIDC Login (new)

The app now includes a browser-side OIDC Authorization Code + PKCE login flow.

When you click **Login with PingOne**, it builds the authorize URL using:

- EnvID: `https://auth.pingone.com/<envId>/as/authorize`
- ClientID: your OIDC SPA application client ID
- Redirect URI: current page URL (for example `https://cprice-ping.github.io/WebMCP-Console/`)

### PingOne app configuration checklist

1. Create or use an OIDC application configured as a public SPA client.
2. Enable Authorization Code with PKCE.
3. Add the redirect URI for your deployed page exactly:
	`https://cprice-ping.github.io/WebMCP-Console/`
4. Ensure requested scopes are allowed for the client.

After callback, the app exchanges the code at `https://auth.pingone.com/<envId>/as/token` and stores token data in localStorage.
