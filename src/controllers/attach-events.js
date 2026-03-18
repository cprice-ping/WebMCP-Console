function parseField(schema, value) {
  if (schema.type === "boolean") {
    return value === "true";
  }
  if (schema.type === "number") {
    return Number(value);
  }
  return value;
}

export function attachEvents({
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
}) {
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
      saveLastEnvId(state.p1.selectedEnvId);
      state.p1.users = null;
      state.p1.applications = null;
      render();
      workflows.loadEnvData();
    });
  }

  const authForm = app.querySelector("form[data-auth-form]");
  if (authForm) {
    authForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(authForm);
      const envId = String(formData.get("envId") || "").trim();
      const clientId = String(formData.get("clientId") || "").trim();
      const redirectUri = String(formData.get("redirectUri") || "").trim();

      state.auth.config = { envId, clientId };
      saveOidcConfig(state.auth.config);

      try {
        const authUrl = await buildAuthorizationUrl({ envId, clientId, redirectUri });
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
