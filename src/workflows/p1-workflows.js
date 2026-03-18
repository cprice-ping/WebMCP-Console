import {
  createApplicationGrant,
  createOidcWebApp,
  readAllApplications,
  readAllEnvironments,
  readAllResources,
  readAllUsers,
  readResourceScopes,
  readUserById
} from "../pingone-api.js";
import { fetchUserInfo, getSubjectClaim, saveOidcSession } from "../pingone-oidc.js";

function parseScopesCsv(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

async function promptForScopes(client) {
  if (!client || typeof client.requestUserInteraction !== "function") {
    return [];
  }

  const response = await client.requestUserInteraction(async () => {
    const answer = window.prompt("Enter scopes (comma separated)", "openid,profile,email");
    return answer || "";
  });
  return parseScopesCsv(response);
}

export function createP1Workflows({ state, render, addActivity, saveLastEnvId }) {
  async function loadEnvData() {
    const { session } = state.auth;
    const envId = state.p1.selectedEnvId;
    if (!session || !envId) {
      return;
    }

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

      const currentSelectionStillValid = envs.some((e) => e.id === state.p1.selectedEnvId);
      if (!currentSelectionStillValid) {
        state.p1.selectedEnvId = envs.length > 0 ? envs[0].id : null;
      }
      if (state.p1.selectedEnvId) {
        saveLastEnvId(state.p1.selectedEnvId);
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

  async function hydrateUserIdentity() {
    if (!state.auth.session) {
      return;
    }

    if (state.auth.session.userInfo) {
      return;
    }

    const subject = getSubjectClaim(state.auth.session);
    const envId = state.auth.session.envId;

    if (subject && envId) {
      try {
        const user = await readUserById(state.auth.session.accessToken, envId, subject);
        state.auth.session.userInfo = {
          sub: user.id,
          preferred_username: user.username || user.email || "",
          username: user.username || "",
          name: [user.name?.given, user.name?.family].filter(Boolean).join(" ") || "",
          given_name: user.name?.given || "",
          family_name: user.name?.family || "",
          email: user.email || ""
        };
        saveOidcSession(state.auth.session);
        render();
        return;
      } catch (_error) {
        // Continue to fallback strategy.
      }
    }

    try {
      const userInfo = await fetchUserInfo(state.auth.session);
      state.auth.session.userInfo = userInfo;
      saveOidcSession(state.auth.session);
      render();
    } catch (_error) {
      // Non-fatal: keep the app usable even if userinfo is unavailable.
    }
  }

  async function runCreateOidcWebAppWithScopes(args, client) {
    const session = state.auth.session;
    if (!session?.accessToken) {
      return { ok: false, message: "No access token available. Please sign in again." };
    }

    const envId = state.p1.selectedEnvId;
    if (!envId) {
      return { ok: false, message: "No active environment selected." };
    }

    let requestedScopes = parseScopesCsv(args.scopesCsv);
    if (requestedScopes.length === 0) {
      requestedScopes = await promptForScopes(client);
    }
    if (requestedScopes.length === 0) {
      return { ok: false, message: "Scope list is required to configure application grants." };
    }

    const resourceList = await readAllResources(session.accessToken, envId, { expandScopes: true });
    if (resourceList.length === 0) {
      return { ok: false, message: "No resources found in selected environment." };
    }

    let resource = null;
    if (args.resourceId) {
      resource = resourceList.find((r) => r.id === args.resourceId) || null;
    }
    if (!resource) {
      resource =
        resourceList.find((r) => normalizeName(r.name) === "openid") ||
        resourceList.find((r) => normalizeName(r.type).includes("openid")) ||
        resourceList[0];
    }

    const scopes = Array.isArray(resource?._embedded?.scopes)
      ? resource._embedded.scopes
      : await readResourceScopes(session.accessToken, envId, resource.id);

    const resolvedScopeObjects = [];
    const missingScopes = [];
    for (const requested of requestedScopes) {
      const needle = normalizeName(requested);
      const scope =
        scopes.find((s) => normalizeName(s.name) === needle) ||
        scopes.find((s) => normalizeName(s.name).startsWith(needle)) ||
        scopes.find((s) => normalizeName(s.name).includes(needle));
      if (scope) {
        resolvedScopeObjects.push(scope);
      } else {
        missingScopes.push(requested);
      }
    }

    if (resolvedScopeObjects.length === 0) {
      return {
        ok: false,
        message: "None of the requested scopes were found for the selected resource.",
        missingScopes,
        availableScopes: scopes.map((s) => s.name)
      };
    }

    const payload = {
      enabled: true,
      name: String(args.appName || "").trim(),
      type: "WEB_APP",
      protocol: "OPENID_CONNECT",
      grantTypes: ["AUTHORIZATION_CODE"],
      responseTypes: ["CODE"],
      redirectUris: [String(args.redirectUri || "").trim()],
      postLogoutRedirectUris: [String(args.postLogoutRedirectUri || args.redirectUri || "").trim()],
      tokenEndpointAuthMethod: args.tokenEndpointAuthMethod || "CLIENT_SECRET_BASIC"
    };

    const createdApp = await createOidcWebApp(session.accessToken, envId, payload);
    const grant = await createApplicationGrant(
      session.accessToken,
      envId,
      createdApp.id,
      resource.id,
      resolvedScopeObjects.map((s) => s.id)
    );

    await loadEnvData();
    addActivity({
      tool: "app.create_oidc_web_app_with_scopes",
      result: `Created ${createdApp.name} with scopes: ${resolvedScopeObjects.map((s) => s.name).join(", ")}`
    });

    return {
      ok: true,
      message: "OIDC web app created and scopes granted.",
      data: {
        appId: createdApp.id,
        appName: createdApp.name,
        environmentId: envId,
        resourceId: resource.id,
        grantId: grant.id,
        appliedScopes: resolvedScopeObjects.map((s) => ({ id: s.id, name: s.name })),
        missingScopes
      }
    };
  }

  return {
    loadEnvData,
    loadEnvironments,
    hydrateUserIdentity,
    runCreateOidcWebAppWithScopes
  };
}
