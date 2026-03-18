import { NAV_ITEMS, WebMCPToolRegistry, pageLabel } from "./webmcp-runtime.js";
import { createP1Workflows } from "./workflows/p1-workflows.js";
import { attachEvents } from "./controllers/attach-events.js";
import { createViews } from "./views/console-views.js";
import {
  buildAuthorizationUrl,
  clearOidcSession,
  completeLoginFromCurrentUrl,
  getPreferredUsername,
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
    selectedEnvId: localStorage.getItem("p1.lastEnvId") || null,
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

function saveLastEnvId(envId) {
  if (!envId) {
    return;
  }
  localStorage.setItem("p1.lastEnvId", envId);
}

function addActivity(entry) {
  state.data.activity.unshift({ ...entry, at: new Date().toLocaleTimeString() });
  state.data.activity = state.data.activity.slice(0, 12);
}

const workflows = createP1Workflows({
  state,
  render,
  addActivity,
  saveLastEnvId
});

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
    saveLastEnvId(envId);
    state.p1.users = null;
    state.p1.applications = null;
    render();
    workflows.loadEnvData();
  },
  createOidcWebAppWithScopes: workflows.runCreateOidcWebAppWithScopes
});

const views = createViews({
  state,
  registry,
  navItems: NAV_ITEMS,
  pageLabel,
  getPreferredUsername,
  getAuthzEndpoint
});

state.webmcp.supported = registry.initialize().supported;
registry.syncToolsForCurrentPage();

function render() {
  const isAuthenticated = Boolean(state.auth.session);

  if (!isAuthenticated) {
    app.innerHTML = views.loginPageMarkup();
  } else {
    app.innerHTML = views.renderConsoleShell();
  }

  attachEvents({
    app,
    state,
    registry,
    render,
    workflows,
    saveLastEnvId,
    saveOidcConfig,
    buildAuthorizationUrl,
    clearOidcSession,
    addActivity
  });
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

  await workflows.hydrateUserIdentity();

  if (state.auth.session) {
    await workflows.loadEnvironments();
  }

  render();
}

bootstrap();
