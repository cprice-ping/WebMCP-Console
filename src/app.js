import { NAV_ITEMS, WebMCPToolRegistry, pageLabel } from "./webmcp-runtime.js";

const state = {
  activePage: "console",
  webmcp: {
    supported: false,
    registeredTools: []
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
  }
});

state.webmcp.supported = registry.initialize().supported;
registry.syncToolsForCurrentPage();

function addActivity(entry) {
  state.data.activity.unshift({ ...entry, at: new Date().toLocaleTimeString() });
  state.data.activity = state.data.activity.slice(0, 12);
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
            <p>${state.data.users.length}</p>
          </article>
          <article>
            <h3>Deployments</h3>
            <p>${state.data.deployments.length}</p>
          </article>
          <article>
            <h3>Environments</h3>
            <p>${Object.keys(state.data.environments).length}</p>
          </article>
        </div>
      </section>
    `;
  }

  if (pageId === "userManagement") {
    return `
      <section class="panel">
        <h2>User Directory</h2>
        <div class="table-like">
          <div class="row head"><span>ID</span><span>Name</span><span>Role</span><span>Status</span></div>
          ${state.data.users
            .map(
              (u) => `<div class="row"><span>${u.id}</span><span>${u.name}</span><span>${u.role}</span><span>${u.status}</span></div>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  if (pageId === "applicationManagement") {
    return `
      <section class="panel">
        <h2>Deployment Timeline</h2>
        <div class="table-like">
          <div class="row head"><span>App</span><span>Version</span><span>Target</span><span>Status</span><span>Time</span></div>
          ${state.data.deployments
            .slice(0, 8)
            .map(
              (d) => `<div class="row"><span>${d.appName}</span><span>${d.version}</span><span>${d.targetEnv}</span><span>${d.status}</span><span>${d.at}</span></div>`
            )
            .join("")}
        </div>
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

function webmcpStatusMarkup() {
  if (!state.webmcp.supported) {
    return "WebMCP unavailable in this browser context";
  }
  return `WebMCP active: ${state.webmcp.registeredTools.length} tools registered`;
}

function render() {
  app.innerHTML = `
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

  attachEvents();
}

render();
