import { NAV_ITEMS, WebMCPToolRegistry, pageLabel } from "./webmcp-runtime.js";
import { readAllEnvironments, readAllUsers, readAllApplications } from "./pingone-api.js";
import {
  buildAuthorizationUrl,
  clearOidcSession,
  completeLoginFromCurrentUrl,
  fetchUserInfo,
  getAuthzEndpoint,
  loadOidcConfig,
  loadOidcSession,
  saveOidcConfig
} from "./pingone-oidc.js";

const state = {
  activePage: "console",
  auth: {
    config: loadOidcConfig(),
    session: loadOidcSession(),
    pendingCallback: false,
    status: ""
  },
  webmcp: {
    supported: false,
    registeredTools: []
  },
  p1: {
    environments: [],
    selectedEnvId: null,
    envsLoading: false,
    envsError: "",
    users: null,
    applications: null,
    dataLoading: false
  },
  data: {
    users: [
      { id: "u-1001", name: "Alice", role: "admin", status: "active" },
      { id: "u-1002", name: "Ben", role: "operator", status: "active" }
    ],
    deployments: [
      { appName: "Portal", version: "v2.4.0", targetEnv: "prod", status: "deployed", at: "09:05:12" }
    ],
    flags: {
      "Portal:betaDashboard": true
    },
    environments: {
      dev: { maintenance: false, nodes: 2, lastSecretRotation: "08:17:22" },
      staging: { maintenance: false, nodes: 4, lastSecretRotation: "08:45:09" },
      prod: { maintenance: false, nodes: 8, lastSecretRotation: "07:53:14" }
    },
    activity: []
  }
};

const app = document.querySelector("#app");

const registry = new WebMCPToolRegistry({
  getPage: () => state.activePage,
  setPage: (page) => {
    state.activePage = page;
    render();
  },
  getState: () => structuredClone(state.data),
  setState: (next) => {
    state.data = next;
    render();
  },
  onRegisteredSetChange: (names) => {
    state.webmcp.registeredTools = names;
    render();
  },
  getEnvironments: () => state.p1.environments,
  setEnvironment: (envId) => {
    state.p1.selectedEnvId = envId;
    state.p1.users = null;
    state.p1.applications = null;
    render();
    loadEnvData();
  }
});

state.webmcp.supported = registry.initialize().supported;
registry.syncToolsForCurrentPage();

function addActivity(entry) {
  state.data.activity.unshift({ ...entry, at: new Date().toLocaleTimeString() });
  state.data.activity = state.data.activity.slice(0, 12);
}

function tokenPreview(token) {
  if (!token) {
    return "n/a";
  }
  return `${token.slice(0, 18)}...${token.slice(-12)}`;
}

function loginPageMarkup() {
  const { config, pendingCallback, status } = state.auth;
  const redirectUri = window.location.origin + window.location.pathname;

  return `
    <div class="login-shell">
      <div class="login-box">
        <header class="login-header">
          <h1>PingOne Admin Console</h1>
          <p>Sign in with your PingOne credentials</p>
        </header>
        <section class="login-form-panel">
          <h2>OIDC Configuration</h2>
          <p class="auth-note">Enter your PingOne Admin Environment ID and OIDC SPA Client ID to begin login.</p>
          <form data-auth-form="true" class="auth-form">
            <label>
              PingOne EnvID
              <input name="envId" value="${config.envId}" placeholder="2087f9ab-c416-45c4-92f1-22bbc894407c" required />
            </label>
            <label>
              OIDC ClientID
              <input name="clientId" value="${config.clientId}" placeholder="9691a97b-0a88-49d5-b566-44ca4750b244" required />
            </label>
            <label>
              Scope
              <input name="scope" value="${config.scope}" placeholder="openid profile email" required />
            </label>
            <label>
              Redirect URI
              <input name="redirectUri" value="${redirectUri}" readonly />
            </label>
            <button type="submit" class="login-button">${pendingCallback ? "Completing login..." : "Login with PingOne"}</button>
          </form>
          <p class="auth-status">${status || ""}</p>
          <p class="auth-endpoint">Authorize endpoint: ${config.envId ? getAuthzEndpoint(config.envId) : "https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `;
}

function authHeaderMarkup() {
  const { session, status } = state.auth;

  if (!session) {
    return "";
  }

  return `
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in to ${session.envId.slice(0, 8)}... (${session.scope})</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary" data-fetch-userinfo="true">UserInfo</button>
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${status || ""}</p>
    </div>
  `;
}

function pageContentMarkup(pageId) {
  if (pageId === "console") {
    return `
      <section class="panel">
        <h2>Console Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${state.p1.users === null ? (state.p1.dataLoading ? "…" : "—") : state.p1.users.length}</p>
          </article>
          <article>
            <h3>Applications</h3>
            <p>${state.p1.applications === null ? (state.p1.dataLoading ? "…" : "—") : state.p1.applications.length}</p>
          </article>
        </div>
      </section>
    `;
  }

  if (pageId === "userManagement") {
    const { users, dataLoading } = state.p1;
    let body;
    if (dataLoading) {
      body = `<p class="data-loading">Loading users…</p>`;
    } else if (!users) {
      body = `<p class="data-empty">No environment selected.</p>`;
    } else if (users.length === 0) {
      body = `<p class="data-empty">No users found in this environment.</p>`;
    } else {
      body = `
        <div class="table-like">
          <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
          ${users.map((u) => `
            <div class="row users-row">
              <span>${u.username ?? "—"}</span>
              <span>${[u.name?.given, u.name?.family].filter(Boolean).join(" ") || "—"}</span>
              <span>${u.email ?? "—"}</span>
              <span>${u.enabled ? "Yes" : "No"}</span>
              <span>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</span>
            </div>`).join("")}
        </div>`;
    }
    return `
      <section class="panel">
        <h2>Users <span class="count-badge">${users ? users.length : ""}</span></h2>
        ${body}
      </section>
    `;
  }

  if (pageId === "applicationManagement") {
    const { applications, dataLoading } = state.p1;
    let body;
    if (dataLoading) {
      body = `<p class="data-loading">Loading applications…</p>`;
    } else if (!applications) {
      body = `<p class="data-empty">No environment selected.</p>`;
    } else if (applications.length === 0) {
      body = `<p class="data-empty">No applications found in this environment.</p>`;
    } else {
      body = `
        <div class="table-like">
          <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
          ${applications.map((a) => `
            <div class="row apps-row">
              <span>${a.name ?? "—"}</span>
              <span>${a.type ?? "—"}</span>
              <span>${a.protocol ?? "—"}</span>
              <span>${a.enabled ? "Yes" : "No"}</span>
              <span>${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</span>
            </div>`).join("")}
        </div>`;
    }
    return `
      <section class="panel">
        <h2>Applications <span class="count-badge">${applications ? applications.length : ""}</span></h2>
        ${body}
      </section>
    `;
  }

  return `
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(state.data.environments)
          .map(
            ([name, details]) =>
              `<div class="row"><span>${name}</span><span>${details.nodes}</span><span>${String(details.maintenance)}</span><span>${details.lastSecretRotation}</span></div>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderToolInputField(propName, schema) {
  if (Array.isArray(schema.enum)) {
    return `
      <label>
        ${propName}
        <select name="${propName}">
          ${schema.enum.map((v) => `<option value="${v}">${v}</option>`).join("")}
        </select>
      </label>
    `;
  }

  if (schema.type === "boolean") {
    return `
      <label>
        ${propName}
        <select name="${propName}">
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
    `;
  }

  return `
    <label>
      ${propName}
      <input name="${propName}" type="text" ${schema.type === "number" ? 'inputmode="numeric"' : ""} />
    </label>
  `;
}

function parseField(schema, value) {
  if (schema.type === "boolean") {
    return value === "true";
  }
  if (schema.type === "number") {
    return Number(value);
  }
  return value;
}

function renderToolsMarkup() {
  const tools = registry.listCurrentTools();
  const titleByName = {
    "console.open_page": "Open Admin Page",
    "console.select_environment": "Select Environment",
    "user.create": "Create User",
    "user.suspend": "Suspend User",
    "user.reset_mfa": "Reset MFA",
    "app.deploy": "Deploy Release",
    "app.rollback": "Rollback Release",
    "app.toggle_feature_flag": "Toggle Feature Flag",
    "env.maintenance_mode": "Set Maintenance Mode",
    "env.rotate_secrets": "Rotate Secrets",
    "env.scale_cluster": "Scale Cluster"
  };

  return tools
    .map((tool) => {
      const properties = tool.inputSchema?.properties || {};
      const propEntries = Object.entries(properties);

      return `
        <article class="tool-card">
          <header>
            <h3>${titleByName[tool.name] || tool.name}</h3>
            <code>${tool.name}</code>
          </header>
          <p>${tool.description}</p>
          <form data-tool-name="${tool.name}">
            ${propEntries.map(([name, schema]) => renderToolInputField(name, schema)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `;
    })
    .join("");
}

function attachEvents() {
  const navButtons = app.querySelectorAll("[data-nav-page]");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.navPage;
      registry.syncToolsForCurrentPage();
      render();
    });
  });

  const envPicker = app.querySelector("[data-env-picker]");
  if (envPicker) {
    envPicker.addEventListener("change", () => {
      state.p1.selectedEnvId = envPicker.value;
      state.p1.users = null;
      state.p1.applications = null;
      render();
      loadEnvData();
    });
  }

  const authForm = app.querySelector("form[data-auth-form]");
  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(authForm);
      const envId = String(formData.get("envId") || "").trim();
      const clientId = String(formData.get("clientId") || "").trim();
      const scope = String(formData.get("scope") || "openid profile email").trim();
      const redirectUri = String(formData.get("redirectUri") || "").trim();

      state.auth.config = { envId, clientId, scope };
      saveOidcConfig(state.auth.config);

      try {
        const authUrl = await buildAuthorizationUrl({ envId, clientId, scope, redirectUri });
        state.auth.status = "Redirecting to PingOne authorize endpoint...";
        render();
        window.location.assign(authUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown OIDC error";
        state.auth.status = `Login setup failed: ${message}`;
        addActivity({ tool: "auth.login", result: state.auth.status });
        render();
      }
    });
  }

  const signOutButton = app.querySelector("[data-signout]");
  if (signOutButton) {
    signOutButton.addEventListener("click", () => {
      clearOidcSession();
      state.auth.session = null;
      state.auth.status = "Signed out.";
      addActivity({ tool: "auth.signout", result: "Session cleared from browser storage." });
      render();
    });
  }

  const userInfoButton = app.querySelector("[data-fetch-userinfo]");
  if (userInfoButton) {
    userInfoButton.addEventListener("click", async () => {
      if (!state.auth.session) {
        return;
      }
      try {
        const userInfo = await fetchUserInfo(state.auth.session);
        const text = JSON.stringify(userInfo, null, 2);
        state.auth.status = "UserInfo call succeeded.";
        const outputElement = app.querySelector("#tool-output");
        outputElement.textContent = text;
        addActivity({ tool: "pingone.userinfo", result: text });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        state.auth.status = `UserInfo failed: ${message}`;
        addActivity({ tool: "pingone.userinfo", result: state.auth.status });
      }
      render();
    });
  }

  const forms = app.querySelectorAll("form[data-tool-name]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const toolName = form.dataset.toolName;
      const tool = registry.listCurrentTools().find((t) => t.name === toolName);
      if (!tool) {
        return;
      }

      const schemaProps = tool.inputSchema?.properties || {};
      const formData = new FormData(form);
      const args = {};
      Object.entries(schemaProps).forEach(([key, schema]) => {
        args[key] = parseField(schema, String(formData.get(key) ?? ""));
      });

      const outputElement = app.querySelector("#tool-output");
      try {
        const result = await registry.invokeToolForDemo(toolName, args);
        const text = JSON.stringify(result, null, 2);
        addActivity({ tool: toolName, result: text });
        outputElement.textContent = text;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        outputElement.textContent = `Error: ${message}`;
        addActivity({ tool: toolName, result: `Error: ${message}` });
      }

      render();
    });
  });
}

function envTypeBadge(type) {
  const colours = { PRODUCTION: "#d44540", SANDBOX: "#0a7a78" };
  const colour = colours[type] || "#5a646b";
  return `<span class="env-badge" style="background:${colour}">${type || "UNKNOWN"}</span>`;
}

function topNavMarkup() {
  const { environments, selectedEnvId, envsLoading, envsError } = state.p1;
  const selected = environments.find((e) => e.id === selectedEnvId);

  return `
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${envsLoading
          ? `<span class="env-loading">Loading environments&hellip;</span>`
          : envsError
          ? `<span class="env-error">${envsError}</span>`
          : `<select id="env-picker" data-env-picker="true">
              ${environments.length === 0
                ? `<option value="">No environments found</option>`
                : environments.map(
                    (e) => `<option value="${e.id}" ${e.id === selectedEnvId ? "selected" : ""}>${e.name} (${e.type})</option>`
                  ).join("")
              }
             </select>
             ${selected ? envTypeBadge(selected.type) : ""}`
        }
      </div>
    </div>
  `;
}

function webmcpStatusMarkup() {
  if (!state.webmcp.supported) {
    return "WebMCP unavailable in this browser context";
  }
  return `WebMCP active: ${state.webmcp.registeredTools.length} tools registered`;
}

function renderConsoleShell() {
  return `
    ${topNavMarkup()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${NAV_ITEMS.map(
            (item) => `
              <section class="nav-group ${item.id === state.activePage ? "active" : ""}">
                <button data-nav-page="${item.id}">${item.title}</button>
                <ul>
                  ${item.options.map((option) => `<li>${option}</li>`).join("")}
                </ul>
              </section>
            `
          ).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${authHeaderMarkup()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${pageLabel(state.activePage)}</h2>
          </div>
          <div class="status-pill">${webmcpStatusMarkup()}</div>
        </header>

        ${pageContentMarkup(state.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${pageLabel(state.activePage)}.</p>
          <p class="registered-list">${state.webmcp.registeredTools.join(" | ") || "No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${renderToolsMarkup()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${state.data.activity
              .map((entry) => `<li><strong>${entry.tool}</strong><span>${entry.at}</span><p>${entry.result}</p></li>`)
              .join("")}
          </ul>
        </section>
      </aside>
    </div>
  `;
}

function render() {
  const isAuthenticated = Boolean(state.auth.session);

  if (!isAuthenticated) {
    app.innerHTML = loginPageMarkup();
  } else {
    app.innerHTML = renderConsoleShell();
  }

  attachEvents();
}

async function bootstrap() {
  state.auth.pendingCallback = true;
  render();

  try {
    const callback = await completeLoginFromCurrentUrl();
    if (callback.handled && callback.error) {
      state.auth.status = callback.error;
      addActivity({ tool: "auth.callback", result: callback.error });
    }
    if (callback.handled && callback.session) {
      state.auth.session = callback.session;
      state.auth.status = "Login successful. Tokens stored in localStorage.";
      addActivity({ tool: "auth.callback", result: "OIDC login completed and token received." });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown callback error";
    state.auth.status = `Callback handling failed: ${message}`;
    addActivity({ tool: "auth.callback", result: state.auth.status });
  }

  state.auth.pendingCallback = false;

  // Fetch environments now if we have a session (either from callback or existing localStorage token)
  if (state.auth.session) {
    await loadEnvironments();
  }

  render();
}

async function loadEnvironments() {
  if (!state.auth.session) {
    return;
  }
  state.p1.envsLoading = true;
  state.p1.envsError = "";
  render();
  try {
    const envs = await readAllEnvironments(state.auth.session.accessToken);
    state.p1.environments = envs;
    // Default-select the first environment
    if (envs.length > 0 && !state.p1.selectedEnvId) {
      state.p1.selectedEnvId = envs[0].id;
    }
    addActivity({ tool: "pingone.environments", result: `Loaded ${envs.length} environment(s).` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    state.p1.envsError = message;
    addActivity({ tool: "pingone.environments", result: `Error: ${message}` });
  }
  state.p1.envsLoading = false;
  if (state.p1.selectedEnvId) {
    await loadEnvData();
  }
}

async function loadEnvData() {
  const { session, } = state.auth;
  const envId = state.p1.selectedEnvId;
  if (!session || !envId) return;

  state.p1.dataLoading = true;
  render();

  const [usersResult, appsResult] = await Promise.allSettled([
    readAllUsers(session.accessToken, envId),
    readAllApplications(session.accessToken, envId)
  ]);

  if (usersResult.status === "fulfilled") {
    state.p1.users = usersResult.value;
  } else {
    addActivity({ tool: "pingone.users", result: `Error: ${usersResult.reason?.message}` });
  }
  if (appsResult.status === "fulfilled") {
    state.p1.applications = appsResult.value;
  } else {
    addActivity({ tool: "pingone.applications", result: `Error: ${appsResult.reason?.message}` });
  }

  state.p1.dataLoading = false;
  render();
}

bootstrap();
