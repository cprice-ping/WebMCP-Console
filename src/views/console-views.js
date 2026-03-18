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

function envTypeBadge(type) {
  const colours = { PRODUCTION: "#d44540", SANDBOX: "#0a7a78" };
  const colour = colours[type] || "#5a646b";
  return `<span class="env-badge" style="background:${colour}">${type || "UNKNOWN"}</span>`;
}

export function createViews({ state, registry, navItems, pageLabel, getPreferredUsername, getAuthzEndpoint }) {
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

    const preferredUsername = getPreferredUsername(session) || session.userInfo?.email || "Unknown user";

    return `
      <div class="auth-header-bar">
        <div class="auth-badge">Signed in as ${preferredUsername}</div>
        <div class="auth-header-actions">
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
          <h2>Environment Overview</h2>
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
            ${users
              .map(
                (u) => `
              <div class="row users-row">
                <span>${u.username ?? "—"}</span>
                <span>${[u.name?.given, u.name?.family].filter(Boolean).join(" ") || "—"}</span>
                <span>${u.email ?? "—"}</span>
                <span>${u.enabled ? "Yes" : "No"}</span>
                <span>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</span>
              </div>`
              )
              .join("")}
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
            ${applications
              .map(
                (a) => `
              <div class="row apps-row">
                <span>${a.name ?? "—"}</span>
                <span>${a.type ?? "—"}</span>
                <span>${a.protocol ?? "—"}</span>
                <span>${a.enabled ? "Yes" : "No"}</span>
                <span>${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</span>
              </div>`
              )
              .join("")}
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

  function renderToolsMarkup() {
    const tools = registry.listCurrentTools();
    const titleByName = {
      "console.open_page": "Open Admin Page",
      "console.select_environment": "Select Environment",
      "app.create_oidc_web_app_with_scopes": "Create OIDC Web App (with Scopes)",
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
                  : environments
                      .map(
                        (e) =>
                          `<option value="${e.id}" ${e.id === selectedEnvId ? "selected" : ""}>${e.name} (${e.type})</option>`
                      )
                      .join("")}
               </select>
               ${selected ? envTypeBadge(selected.type) : ""}`}
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
            ${navItems
              .map(
                (item) => `
                <section class="nav-group ${item.id === state.activePage ? "active" : ""}">
                  <button data-nav-page="${item.id}">${item.title}</button>
                  <ul>
                    ${item.options.map((option) => `<li>${option}</li>`).join("")}
                  </ul>
                </section>
              `
              )
              .join("")}
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

  return {
    loginPageMarkup,
    renderConsoleShell
  };
}
