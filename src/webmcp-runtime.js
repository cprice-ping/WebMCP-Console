const PAGES = {
  console: "Console",
  userManagement: "User Management",
  applicationManagement: "Application Management",
  environmentManagement: "Environment Management"
};

const COMMON_TOOL_TEMPLATE = {
  name: "console.open_page",
  description: "Navigate to an Admin Console page from the left navigation.",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "string",
        enum: Object.keys(PAGES)
      }
    },
    required: ["page"],
    additionalProperties: false
  },
  annotations: {
    readOnlyHint: false
  }
};

const SELECT_ENV_TOOL_TEMPLATE = {
  name: "console.select_environment",
  description: "Switch the active PingOne environment by name. The name must match one of the environments returned after login.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The exact name of the PingOne environment to switch to."
      }
    },
    required: ["name"],
    additionalProperties: false
  },
  annotations: {
    readOnlyHint: false
  }
};

const ALWAYS_ON_TOOLS = [COMMON_TOOL_TEMPLATE, SELECT_ENV_TOOL_TEMPLATE];

const CONTEXT_TOOL_TEMPLATES = {
  userManagement: [
    {
      name: "user.create",
      description: "Create a new user with a role.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string", enum: ["viewer", "operator", "admin"] }
        },
        required: ["name", "role"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "user.suspend",
      description: "Suspend an existing user account.",
      inputSchema: {
        type: "object",
        properties: {
          userId: { type: "string" },
          reason: { type: "string" }
        },
        required: ["userId", "reason"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "user.reset_mfa",
      description: "Reset multi-factor authentication for a user.",
      inputSchema: {
        type: "object",
        properties: {
          userId: { type: "string" }
        },
        required: ["userId"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    }
  ],
  applicationManagement: [
    {
      name: "app.deploy",
      description: "Deploy a specific application version to an environment.",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string" },
          version: { type: "string" },
          targetEnv: { type: "string", enum: ["dev", "staging", "prod"] }
        },
        required: ["appName", "version", "targetEnv"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "app.rollback",
      description: "Rollback an application to the previous stable release.",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string" },
          targetEnv: { type: "string", enum: ["staging", "prod"] }
        },
        required: ["appName", "targetEnv"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "app.toggle_feature_flag",
      description: "Enable or disable an application feature flag.",
      inputSchema: {
        type: "object",
        properties: {
          appName: { type: "string" },
          flagName: { type: "string" },
          enabled: { type: "boolean" }
        },
        required: ["appName", "flagName", "enabled"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    }
  ],
  environmentManagement: [
    {
      name: "env.maintenance_mode",
      description: "Enable or disable maintenance mode in an environment.",
      inputSchema: {
        type: "object",
        properties: {
          environment: { type: "string", enum: ["dev", "staging", "prod"] },
          enabled: { type: "boolean" }
        },
        required: ["environment", "enabled"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "env.rotate_secrets",
      description: "Rotate secrets for a target environment.",
      inputSchema: {
        type: "object",
        properties: {
          environment: { type: "string", enum: ["dev", "staging", "prod"] },
          scope: { type: "string", enum: ["database", "api", "all"] }
        },
        required: ["environment", "scope"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    },
    {
      name: "env.scale_cluster",
      description: "Adjust cluster node count for an environment.",
      inputSchema: {
        type: "object",
        properties: {
          environment: { type: "string", enum: ["dev", "staging", "prod"] },
          nodeCount: { type: "number", minimum: 1, maximum: 50 }
        },
        required: ["environment", "nodeCount"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false
      }
    }
  ]
};

function nowStamp() {
  return new Date().toLocaleTimeString();
}

function textResult(message, data) {
  return {
    ok: true,
    message,
    data
  };
}

function findToolTemplate(name) {
  if (name === COMMON_TOOL_TEMPLATE.name) {
    return COMMON_TOOL_TEMPLATE;
  }
  if (name === SELECT_ENV_TOOL_TEMPLATE.name) {
    return SELECT_ENV_TOOL_TEMPLATE;
  }
  const allContextTools = Object.values(CONTEXT_TOOL_TEMPLATES).flat();
  return allContextTools.find((tool) => tool.name === name) || null;
}

export class WebMCPToolRegistry {
  constructor({ getPage, setPage, getState, setState, onRegisteredSetChange, getEnvironments, setEnvironment }) {
    this.getPage = getPage;
    this.setPage = setPage;
    this.getState = getState;
    this.setState = setState;
    this.onRegisteredSetChange = onRegisteredSetChange;
    this.getEnvironments = getEnvironments;
    this.setEnvironment = setEnvironment;
    this.registeredTools = new Set();
    this.modelContext = null;
  }

  initialize() {
    this.modelContext = navigator.modelContext || null;
    return {
      supported: Boolean(this.modelContext),
      transport: "navigator.modelContext"
    };
  }

  getDesiredTemplates() {
    const page = this.getPage();
    const contextual = CONTEXT_TOOL_TEMPLATES[page] || [];
    return [...ALWAYS_ON_TOOLS, ...contextual];
  }

  listCurrentTools() {
    return this.getDesiredTemplates();
  }

  createExecutor(toolName) {
    return async (input = {}, _client) => this.executeTool(toolName, input);
  }

  toWebMCPTool(template) {
    return {
      name: template.name,
      description: template.description,
      inputSchema: template.inputSchema,
      annotations: template.annotations,
      execute: this.createExecutor(template.name)
    };
  }

  notifyRegisteredSetChange() {
    if (typeof this.onRegisteredSetChange === "function") {
      this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort());
    }
  }

  syncToolsForCurrentPage() {
    if (!this.modelContext) {
      return;
    }

    const desired = this.getDesiredTemplates();
    const desiredNames = new Set(desired.map((tool) => tool.name));

    for (const existing of this.registeredTools) {
      if (desiredNames.has(existing)) {
        continue;
      }
      try {
        this.modelContext.unregisterTool(existing);
      } catch (_error) {
        // Ignore tool drift if browser-side state was changed externally.
      }
      this.registeredTools.delete(existing);
    }

    for (const template of desired) {
      if (this.registeredTools.has(template.name)) {
        continue;
      }

      const webTool = this.toWebMCPTool(template);
      try {
        this.modelContext.registerTool(webTool);
        this.registeredTools.add(template.name);
      } catch (_error) {
        // Recover from duplicate state by best-effort unregister/re-register.
        try {
          this.modelContext.unregisterTool(template.name);
          this.modelContext.registerTool(webTool);
          this.registeredTools.add(template.name);
        } catch (_secondError) {
          // Keep app running even if host browser rejects a registration.
        }
      }
    }

    this.notifyRegisteredSetChange();
  }

  async executeTool(name, args = {}) {
    if (name === COMMON_TOOL_TEMPLATE.name) {
      if (!Object.prototype.hasOwnProperty.call(PAGES, args.page)) {
        throw new Error(`Unknown page: ${args.page}`);
      }
      this.setPage(args.page);
      this.syncToolsForCurrentPage();
      return textResult("Navigation complete", { page: args.page, at: nowStamp() });
    }

    if (name === SELECT_ENV_TOOL_TEMPLATE.name) {
      const environments = this.getEnvironments ? this.getEnvironments() : [];
      const match = environments.find(
        (e) => e.name.toLowerCase() === String(args.name || "").toLowerCase()
      );
      if (!match) {
        const names = environments.map((e) => e.name).join(", ");
        throw new Error(`No environment named "${args.name}". Available: ${names || "none loaded"}`);
      }
      this.setEnvironment(match.id);
      return textResult("Environment switched", { id: match.id, name: match.name, at: nowStamp() });
    }

    const page = this.getPage();
    const currentPageToolNames = (CONTEXT_TOOL_TEMPLATES[page] || []).map((tool) => tool.name);
    if (!currentPageToolNames.includes(name)) {
      throw new Error(`Tool '${name}' is unavailable on page '${page}'.`);
    }

    const state = this.getState();
    switch (name) {
      case "user.create": {
        const id = `u-${Date.now().toString(36).slice(-5)}`;
        state.users.push({ id, name: args.name, role: args.role, status: "active" });
        this.setState(state);
        return textResult("User created", { id, ...args, at: nowStamp() });
      }
      case "user.suspend": {
        const user = state.users.find((u) => u.id === args.userId);
        if (!user) {
          throw new Error(`User '${args.userId}' not found.`);
        }
        user.status = "suspended";
        user.suspensionReason = args.reason;
        this.setState(state);
        return textResult("User suspended", { userId: args.userId, reason: args.reason, at: nowStamp() });
      }
      case "user.reset_mfa": {
        return textResult("MFA reset issued", { userId: args.userId, at: nowStamp() });
      }
      case "app.deploy": {
        state.deployments.unshift({
          appName: args.appName,
          version: args.version,
          targetEnv: args.targetEnv,
          status: "deployed",
          at: nowStamp()
        });
        this.setState(state);
        return textResult("Deployment completed", args);
      }
      case "app.rollback": {
        state.deployments.unshift({
          appName: args.appName,
          version: "previous-stable",
          targetEnv: args.targetEnv,
          status: "rolled back",
          at: nowStamp()
        });
        this.setState(state);
        return textResult("Rollback completed", args);
      }
      case "app.toggle_feature_flag": {
        state.flags[`${args.appName}:${args.flagName}`] = args.enabled;
        this.setState(state);
        return textResult("Feature flag updated", args);
      }
      case "env.maintenance_mode": {
        state.environments[args.environment].maintenance = args.enabled;
        this.setState(state);
        return textResult("Maintenance mode changed", args);
      }
      case "env.rotate_secrets": {
        state.environments[args.environment].lastSecretRotation = nowStamp();
        this.setState(state);
        return textResult("Secrets rotated", args);
      }
      case "env.scale_cluster": {
        state.environments[args.environment].nodes = Number(args.nodeCount);
        this.setState(state);
        return textResult("Cluster scaled", args);
      }
      default:
        throw new Error(`Tool '${name}' not implemented.`);
    }
  }

  async invokeToolForDemo(name, args = {}) {
    const template = findToolTemplate(name);
    if (!template) {
      throw new Error(`Unknown tool '${name}'.`);
    }

    const webTool = this.toWebMCPTool(template);
    return webTool.execute(args, {
      requestUserInteraction: async (callback) => callback()
    });
  }
}

export function pageLabel(pageId) {
  return PAGES[pageId] || "Unknown";
}

export const NAV_ITEMS = [
  {
    id: "console",
    title: "Console",
    options: ["Overview", "Activity"]
  },
  {
    id: "userManagement",
    title: "User Management",
    options: ["Users", "Roles", "Sessions"]
  },
  {
    id: "applicationManagement",
    title: "Application Management",
    options: ["Deployments", "Feature Flags", "Pipelines"]
  },
  {
    id: "environmentManagement",
    title: "Environment Management",
    options: ["Clusters", "Secrets", "Maintenance"]
  }
];
