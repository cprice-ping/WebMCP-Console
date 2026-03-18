(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(o){if(o.ep)return;o.ep=!0;const r=t(o);fetch(o.href,r)}})();const U={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},_={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(U)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},P={name:"console.select_environment",description:"Switch the active PingOne environment by name. The name must match one of the environments returned after login.",inputSchema:{type:"object",properties:{name:{type:"string",description:"The exact name of the PingOne environment to switch to."}},required:["name"],additionalProperties:!1},annotations:{readOnlyHint:!1}},J=[_,P],N={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.create_oidc_web_app_with_scopes",description:"Create an OIDC Web App and assign resource scopes in one workflow. If scopes are omitted, the tool can request them via elicitation.",inputSchema:{type:"object",properties:{appName:{type:"string"},redirectUri:{type:"string"},postLogoutRedirectUri:{type:"string"},scopesCsv:{type:"string",description:"Comma-separated scope names, for example: openid,profile,email"},resourceId:{type:"string"},tokenEndpointAuthMethod:{type:"string",enum:["NONE","CLIENT_SECRET_BASIC","CLIENT_SECRET_POST"]}},required:["appName","redirectUri"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function b(){return new Date().toLocaleTimeString()}function y(e,n){return{ok:!0,message:e,data:n}}function V(e){return e===_.name?_:e===P.name?P:Object.values(N).flat().find(t=>t.name===e)||null}class K{constructor({getPage:n,setPage:t,getState:a,setState:o,onRegisteredSetChange:r,getEnvironments:i,setEnvironment:c,createOidcWebAppWithScopes:l}){this.getPage=n,this.setPage=t,this.getState=a,this.setState=o,this.onRegisteredSetChange=r,this.getEnvironments=i,this.setEnvironment=c,this.createOidcWebAppWithScopes=l,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const n=this.getPage(),t=N[n]||[];return[...J,...t]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(n){return async(t={},a)=>this.executeTool(n,t,a)}toWebMCPTool(n){return{name:n.name,description:n.description,inputSchema:n.inputSchema,annotations:n.annotations,execute:this.createExecutor(n.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const n=this.getDesiredTemplates(),t=new Set(n.map(a=>a.name));for(const a of this.registeredTools)if(!t.has(a)){try{this.modelContext.unregisterTool(a)}catch{}this.registeredTools.delete(a)}for(const a of n){if(this.registeredTools.has(a.name))continue;const o=this.toWebMCPTool(a);try{this.modelContext.registerTool(o),this.registeredTools.add(a.name)}catch{try{this.modelContext.unregisterTool(a.name),this.modelContext.registerTool(o),this.registeredTools.add(a.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(n,t={},a=null){if(n===_.name){if(!Object.prototype.hasOwnProperty.call(U,t.page))throw new Error(`Unknown page: ${t.page}`);return this.setPage(t.page),this.syncToolsForCurrentPage(),y("Navigation complete",{page:t.page,at:b()})}if(n===P.name){const c=this.getEnvironments?this.getEnvironments():[],l=String(t.name||"").toLowerCase().trim(),u=c.find(p=>p.name.toLowerCase()===l)||c.find(p=>p.name.toLowerCase().startsWith(l))||c.find(p=>p.name.toLowerCase().includes(l));if(!u){const p=c.map(f=>f.name).join(", ");return{ok:!1,message:`No environment matching "${t.name}".`,available:p||"No environments loaded yet."}}return this.setEnvironment(u.id),y("Environment switched",{id:u.id,name:u.name,at:b()})}const o=this.getPage();if(!(N[o]||[]).map(c=>c.name).includes(n))throw new Error(`Tool '${n}' is unavailable on page '${o}'.`);const i=this.getState();switch(n){case"app.create_oidc_web_app_with_scopes":{if(typeof this.createOidcWebAppWithScopes!="function")throw new Error("OIDC app workflow is not configured in this console.");return this.createOidcWebAppWithScopes(t,a)}case"user.create":{const c=`u-${Date.now().toString(36).slice(-5)}`;return i.users.push({id:c,name:t.name,role:t.role,status:"active"}),this.setState(i),y("User created",{id:c,...t,at:b()})}case"user.suspend":{const c=i.users.find(l=>l.id===t.userId);if(!c)throw new Error(`User '${t.userId}' not found.`);return c.status="suspended",c.suspensionReason=t.reason,this.setState(i),y("User suspended",{userId:t.userId,reason:t.reason,at:b()})}case"user.reset_mfa":return y("MFA reset issued",{userId:t.userId,at:b()});case"app.deploy":return i.deployments.unshift({appName:t.appName,version:t.version,targetEnv:t.targetEnv,status:"deployed",at:b()}),this.setState(i),y("Deployment completed",t);case"app.rollback":return i.deployments.unshift({appName:t.appName,version:"previous-stable",targetEnv:t.targetEnv,status:"rolled back",at:b()}),this.setState(i),y("Rollback completed",t);case"app.toggle_feature_flag":return i.flags[`${t.appName}:${t.flagName}`]=t.enabled,this.setState(i),y("Feature flag updated",t);case"env.maintenance_mode":return i.environments[t.environment].maintenance=t.enabled,this.setState(i),y("Maintenance mode changed",t);case"env.rotate_secrets":return i.environments[t.environment].lastSecretRotation=b(),this.setState(i),y("Secrets rotated",t);case"env.scale_cluster":return i.environments[t.environment].nodes=Number(t.nodeCount),this.setState(i),y("Cluster scaled",t);default:throw new Error(`Tool '${n}' not implemented.`)}}async invokeToolForDemo(n,t={}){const a=V(n);if(!a)throw new Error(`Unknown tool '${n}'.`);return this.toWebMCPTool(a).execute(t,{requestUserInteraction:async r=>r()})}}function j(e){return U[e]||"Unknown"}const Y=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],S="https://api.pingone.com/v1";async function X(e){const n=await fetch(`${S}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const a=await n.text();throw new Error(`GET /environments failed (${n.status}): ${a}`)}return(await n.json())._embedded?.environments??[]}async function Q(e,n){const t=await fetch(`${S}/environments/${n}/users`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const o=await t.text();throw new Error(`GET /users failed (${t.status}): ${o}`)}return(await t.json())._embedded?.users??[]}async function Z(e,n){const t=await fetch(`${S}/environments/${n}/applications`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const o=await t.text();throw new Error(`GET /applications failed (${t.status}): ${o}`)}return(await t.json())._embedded?.applications??[]}async function ee(e,n,t){const a=await fetch(`${S}/environments/${n}/users/${t}`,{headers:{authorization:`Bearer ${e}`}});if(!a.ok){const o=await a.text();throw new Error(`GET /users/${t} failed (${a.status}): ${o}`)}return a.json()}async function te(e,n,{expandScopes:t=!1}={}){const a=new URL(`${S}/environments/${n}/resources`);t&&a.searchParams.set("expand","scopes");const o=await fetch(a.toString(),{headers:{authorization:`Bearer ${e}`}});if(!o.ok){const i=await o.text();throw new Error(`GET /resources failed (${o.status}): ${i}`)}return(await o.json())._embedded?.resources??[]}async function ne(e,n,t){const a=await fetch(`${S}/environments/${n}/resources/${t}/scopes`,{headers:{authorization:`Bearer ${e}`}});if(!a.ok){const r=await a.text();throw new Error(`GET /resources/${t}/scopes failed (${a.status}): ${r}`)}return(await a.json())._embedded?.scopes??[]}async function ae(e,n,t){const a=await fetch(`${S}/environments/${n}/applications`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(t)});if(!a.ok){const o=await a.text();throw new Error(`POST /applications failed (${a.status}): ${o}`)}return a.json()}async function se(e,n,t,a,o){const r={resource:{id:a},scopes:o.map(c=>({id:c}))},i=await fetch(`${S}/environments/${n}/applications/${t}/grants`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(r)});if(!i.ok){const c=await i.text();throw new Error(`POST /applications/${t}/grants failed (${i.status}): ${c}`)}return i.json()}const B="p1.oidc.config",O="p1.oidc.session",x="p1.oidc.tx";function W(e){let n="";for(let t=0;t<e.length;t+=1)n+=String.fromCharCode(e[t]);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function D(e=48){const n=new Uint8Array(e);return crypto.getRandomValues(n),W(n)}async function oe(e){const n=new TextEncoder().encode(e),t=await crypto.subtle.digest("SHA-256",n);return new Uint8Array(t)}function z(e,n){const t=localStorage.getItem(e);if(!t)return n;try{return JSON.parse(t)}catch{return n}}function L(e,n){localStorage.setItem(e,JSON.stringify(n))}function re(){const e=sessionStorage.getItem(x);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function ie(e){sessionStorage.setItem(x,JSON.stringify(e))}function C(){sessionStorage.removeItem(x)}function T(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function F(e){return`https://auth.pingone.com/${e}/as/authorize`}function ce(e){return`https://auth.pingone.com/${e}/as/token`}function le(e){return`https://auth.pingone.com/${e}/as/userinfo`}function de(){return z(B,{envId:"",clientId:""})}function H(e){L(B,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim()})}function pe(){return z(O,null)}function q(e){L(O,e)}function ue(){localStorage.removeItem(O)}async function me({envId:e,clientId:n,scope:t,redirectUri:a}){const o=String(e||"").trim(),r=String(n||"").trim(),i=String(t||"openid profile email").trim(),c=String(a||"").trim();if(!o||!r||!c)throw new Error("EnvID, ClientID, and redirect URI are required.");const l=D(24),u=D(64),p=await oe(u),f=W(p);ie({envId:o,clientId:r,scope:i,redirectUri:c,state:l,codeVerifier:u,createdAt:Date.now()});const g=new URL(F(o));return g.searchParams.set("response_type","code"),g.searchParams.set("client_id",r),g.searchParams.set("redirect_uri",c),g.searchParams.set("scope",i),g.searchParams.set("state",l),g.searchParams.set("code_challenge",f),g.searchParams.set("code_challenge_method","S256"),g.toString()}async function fe(){const e=new URL(window.location.href),n=e.searchParams.get("error"),t=e.searchParams.get("error_description")||"",a=e.searchParams.get("code"),o=e.searchParams.get("state");if(!n&&!a)return{handled:!1};if(n)return T(),C(),{handled:!0,error:`${n}${t?`: ${t}`:""}`};const r=re();if(!r)return T(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(r.state!==o)return T(),C(),{handled:!0,error:"OIDC state mismatch. Start login again."};const i=new URLSearchParams;i.set("grant_type","authorization_code"),i.set("client_id",r.clientId),i.set("code",String(a)),i.set("redirect_uri",r.redirectUri),i.set("code_verifier",r.codeVerifier);const c=await fetch(ce(r.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:i.toString()});if(!c.ok){const f=await c.text();return T(),C(),{handled:!0,error:`Token exchange failed (${c.status}): ${f}`}}const l=await c.json(),u=Number(l.expires_in||0),p={envId:r.envId,clientId:r.clientId,scope:r.scope,tokenType:l.token_type||"Bearer",accessToken:l.access_token||"",idToken:l.id_token||"",refreshToken:l.refresh_token||"",expiresAt:u>0?Date.now()+u*1e3:null};return L(O,p),H({envId:r.envId,clientId:r.clientId,scope:r.scope}),T(),C(),{handled:!0,session:p}}async function ge(e){const n=await fetch(le(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!n.ok){const t=await n.text();throw new Error(`UserInfo failed (${n.status}): ${t}`)}return n.json()}function he(e){const n=e.replace(/-/g,"+").replace(/_/g,"/"),t=n.padEnd(Math.ceil(n.length/4)*4,"=");return atob(t)}function A(e){if(!e||typeof e!="string")return null;const n=e.split(".");if(n.length<2)return null;try{const t=he(n[1]);return JSON.parse(t)}catch{return null}}function ve(e){if(!e)return"";const t=e.userInfo?.preferred_username||e.userInfo?.username||e.userInfo?.name||[e.userInfo?.given_name,e.userInfo?.family_name].filter(Boolean).join(" ")||e.userInfo?.email;if(t)return String(t);const a=A(e.idToken),o=a?.preferred_username||a?.username||a?.name||[a?.given_name,a?.family_name].filter(Boolean).join(" ")||a?.email;return o?String(o):""}function ye(e){if(!e)return"";if(e.userInfo?.sub)return String(e.userInfo.sub);const n=A(e.idToken);if(n?.sub)return String(n.sub);const t=A(e.accessToken);return t?.sub?String(t.sub):""}const s={activePage:"console",auth:{config:de(),session:pe(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:localStorage.getItem("p1.lastEnvId")||null,envsLoading:!1,envsError:"",users:null,applications:null,dataLoading:!1},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},w=document.querySelector("#app");function M(e){e&&localStorage.setItem("p1.lastEnvId",e)}function G(e){return String(e||"").split(",").map(n=>n.trim()).filter(Boolean)}async function be(e){if(!e||typeof e.requestUserInteraction!="function")return[];const n=await e.requestUserInteraction(async()=>window.prompt("Enter scopes (comma separated)","openid,profile,email")||"");return G(n)}function $(e){return String(e||"").trim().toLowerCase()}async function we(e,n){const t=s.auth.session;if(!t?.accessToken)return{ok:!1,message:"No access token available. Please sign in again."};const a=s.p1.selectedEnvId;if(!a)return{ok:!1,message:"No active environment selected."};let o=G(e.scopesCsv);if(o.length===0&&(o=await be(n)),o.length===0)return{ok:!1,message:"Scope list is required to configure application grants."};const r=await te(t.accessToken,a,{expandScopes:!0});if(r.length===0)return{ok:!1,message:"No resources found in selected environment."};let i=null;e.resourceId&&(i=r.find(d=>d.id===e.resourceId)||null),i||(i=r.find(d=>$(d.name)==="openid")||r.find(d=>$(d.type).includes("openid"))||r[0]);const c=Array.isArray(i?._embedded?.scopes)?i._embedded.scopes:await ne(t.accessToken,a,i.id),l=[],u=[];for(const d of o){const v=$(d),R=c.find(I=>$(I.name)===v)||c.find(I=>$(I.name).startsWith(v))||c.find(I=>$(I.name).includes(v));R?l.push(R):u.push(d)}if(l.length===0)return{ok:!1,message:"None of the requested scopes were found for the selected resource.",missingScopes:u,availableScopes:c.map(d=>d.name)};const p={enabled:!0,name:String(e.appName||"").trim(),type:"WEB_APP",protocol:"OPENID_CONNECT",grantTypes:["AUTHORIZATION_CODE"],responseTypes:["CODE"],redirectUris:[String(e.redirectUri||"").trim()],postLogoutRedirectUris:[String(e.postLogoutRedirectUri||e.redirectUri||"").trim()],tokenEndpointAuthMethod:e.tokenEndpointAuthMethod||"CLIENT_SECRET_BASIC"},f=await ae(t.accessToken,a,p),g=await se(t.accessToken,a,f.id,i.id,l.map(d=>d.id));return await k(),h({tool:"app.create_oidc_web_app_with_scopes",result:`Created ${f.name} with scopes: ${l.map(d=>d.name).join(", ")}`}),{ok:!0,message:"OIDC web app created and scopes granted.",data:{appId:f.id,appName:f.name,environmentId:a,resourceId:i.id,grantId:g.id,appliedScopes:l.map(d=>({id:d.id,name:d.name})),missingScopes:u}}}const E=new K({getPage:()=>s.activePage,setPage:e=>{s.activePage=e,m()},getState:()=>structuredClone(s.data),setState:e=>{s.data=e,m()},onRegisteredSetChange:e=>{s.webmcp.registeredTools=e,m()},getEnvironments:()=>s.p1.environments,setEnvironment:e=>{s.p1.selectedEnvId=e,M(e),s.p1.users=null,s.p1.applications=null,m(),k()},createOidcWebAppWithScopes:we});s.webmcp.supported=E.initialize().supported;E.syncToolsForCurrentPage();function h(e){s.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),s.data.activity=s.data.activity.slice(0,12)}function Se(){const{config:e,pendingCallback:n,status:t}=s.auth,a=window.location.origin+window.location.pathname;return`
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
              <input name="envId" value="${e.envId}" placeholder="2087f9ab-c416-45c4-92f1-22bbc894407c" required />
            </label>
            <label>
              OIDC ClientID
              <input name="clientId" value="${e.clientId}" placeholder="9691a97b-0a88-49d5-b566-44ca4750b244" required />
            </label>
            <label>
              Redirect URI
              <input name="redirectUri" value="${a}" readonly />
            </label>
            <button type="submit" class="login-button">${n?"Completing login...":"Login with PingOne"}</button>
          </form>
          <p class="auth-status">${t||""}</p>
          <p class="auth-endpoint">Authorize endpoint: ${e.envId?F(e.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `}function $e(){const{session:e,status:n}=s.auth;return e?`
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in as ${ve(e)||e.userInfo?.email||"Unknown user"}</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${n||""}</p>
    </div>
  `:""}function Ee(e){if(e==="console")return`
      <section class="panel">
        <h2>Environment Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${s.p1.users===null?s.p1.dataLoading?"…":"—":s.p1.users.length}</p>
          </article>
          <article>
            <h3>Applications</h3>
            <p>${s.p1.applications===null?s.p1.dataLoading?"…":"—":s.p1.applications.length}</p>
          </article>
        </div>
      </section>
    `;if(e==="userManagement"){const{users:n,dataLoading:t}=s.p1;let a;return t?a='<p class="data-loading">Loading users…</p>':n?n.length===0?a='<p class="data-empty">No users found in this environment.</p>':a=`
        <div class="table-like">
          <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
          ${n.map(o=>`
            <div class="row users-row">
              <span>${o.username??"—"}</span>
              <span>${[o.name?.given,o.name?.family].filter(Boolean).join(" ")||"—"}</span>
              <span>${o.email??"—"}</span>
              <span>${o.enabled?"Yes":"No"}</span>
              <span>${o.createdAt?new Date(o.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:a='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Users <span class="count-badge">${n?n.length:""}</span></h2>
        ${a}
      </section>
    `}if(e==="applicationManagement"){const{applications:n,dataLoading:t}=s.p1;let a;return t?a='<p class="data-loading">Loading applications…</p>':n?n.length===0?a='<p class="data-empty">No applications found in this environment.</p>':a=`
        <div class="table-like">
          <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
          ${n.map(o=>`
            <div class="row apps-row">
              <span>${o.name??"—"}</span>
              <span>${o.type??"—"}</span>
              <span>${o.protocol??"—"}</span>
              <span>${o.enabled?"Yes":"No"}</span>
              <span>${o.createdAt?new Date(o.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:a='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Applications <span class="count-badge">${n?n.length:""}</span></h2>
        ${a}
      </section>
    `}return`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(s.data.environments).map(([n,t])=>`<div class="row"><span>${n}</span><span>${t.nodes}</span><span>${String(t.maintenance)}</span><span>${t.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function Ie(e,n){return Array.isArray(n.enum)?`
      <label>
        ${e}
        <select name="${e}">
          ${n.enum.map(t=>`<option value="${t}">${t}</option>`).join("")}
        </select>
      </label>
    `:n.type==="boolean"?`
      <label>
        ${e}
        <select name="${e}">
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
    `:`
    <label>
      ${e}
      <input name="${e}" type="text" ${n.type==="number"?'inputmode="numeric"':""} />
    </label>
  `}function Te(e,n){return e.type==="boolean"?n==="true":e.type==="number"?Number(n):n}function Ce(){const e=E.listCurrentTools(),n={"console.open_page":"Open Admin Page","console.select_environment":"Select Environment","app.create_oidc_web_app_with_scopes":"Create OIDC Web App (with Scopes)","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return e.map(t=>{const a=t.inputSchema?.properties||{},o=Object.entries(a);return`
        <article class="tool-card">
          <header>
            <h3>${n[t.name]||t.name}</h3>
            <code>${t.name}</code>
          </header>
          <p>${t.description}</p>
          <form data-tool-name="${t.name}">
            ${o.map(([r,i])=>Ie(r,i)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function _e(){w.querySelectorAll("[data-nav-page]").forEach(r=>{r.addEventListener("click",()=>{s.activePage=r.dataset.navPage,E.syncToolsForCurrentPage(),m()})});const n=w.querySelector("[data-env-picker]");n&&n.addEventListener("change",()=>{s.p1.selectedEnvId=n.value,M(s.p1.selectedEnvId),s.p1.users=null,s.p1.applications=null,m(),k()});const t=w.querySelector("form[data-auth-form]");t&&t.addEventListener("submit",async r=>{r.preventDefault();const i=new FormData(t),c=String(i.get("envId")||"").trim(),l=String(i.get("clientId")||"").trim(),u=String(i.get("redirectUri")||"").trim();s.auth.config={envId:c,clientId:l},H(s.auth.config);try{const p=await me({envId:c,clientId:l,redirectUri:u});s.auth.status="Redirecting to PingOne authorize endpoint...",m(),window.location.assign(p)}catch(p){const f=p instanceof Error?p.message:"Unknown OIDC error";s.auth.status=`Login setup failed: ${f}`,h({tool:"auth.login",result:s.auth.status}),m()}});const a=w.querySelector("[data-signout]");a&&a.addEventListener("click",()=>{ue(),s.auth.session=null,s.auth.status="Signed out.",h({tool:"auth.signout",result:"Session cleared from browser storage."}),m()}),w.querySelectorAll("form[data-tool-name]").forEach(r=>{r.addEventListener("submit",async i=>{i.preventDefault();const c=r.dataset.toolName,l=E.listCurrentTools().find(d=>d.name===c);if(!l)return;const u=l.inputSchema?.properties||{},p=new FormData(r),f={};Object.entries(u).forEach(([d,v])=>{f[d]=Te(v,String(p.get(d)??""))});const g=w.querySelector("#tool-output");try{const d=await E.invokeToolForDemo(c,f),v=JSON.stringify(d,null,2);h({tool:c,result:v}),g.textContent=v}catch(d){const v=d instanceof Error?d.message:"Unknown error";g.textContent=`Error: ${v}`,h({tool:c,result:`Error: ${v}`})}m()})})}function Pe(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function Oe(){const{environments:e,selectedEnvId:n,envsLoading:t,envsError:a}=s.p1,o=e.find(r=>r.id===n);return`
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${t?'<span class="env-loading">Loading environments&hellip;</span>':a?`<span class="env-error">${a}</span>`:`<select id="env-picker" data-env-picker="true">
              ${e.length===0?'<option value="">No environments found</option>':e.map(r=>`<option value="${r.id}" ${r.id===n?"selected":""}>${r.name} (${r.type})</option>`).join("")}
             </select>
             ${o?Pe(o.type):""}`}
      </div>
    </div>
  `}function ke(){return s.webmcp.supported?`WebMCP active: ${s.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function Ne(){return`
    ${Oe()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${Y.map(e=>`
              <section class="nav-group ${e.id===s.activePage?"active":""}">
                <button data-nav-page="${e.id}">${e.title}</button>
                <ul>
                  ${e.options.map(n=>`<li>${n}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${$e()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${j(s.activePage)}</h2>
          </div>
          <div class="status-pill">${ke()}</div>
        </header>

        ${Ee(s.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${j(s.activePage)}.</p>
          <p class="registered-list">${s.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${Ce()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${s.data.activity.map(e=>`<li><strong>${e.tool}</strong><span>${e.at}</span><p>${e.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `}function m(){!!s.auth.session?w.innerHTML=Ne():w.innerHTML=Se(),_e()}async function Ae(){s.auth.pendingCallback=!0,m();try{const e=await fe();e.handled&&e.error&&(s.auth.status=e.error,h({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(s.auth.session=e.session,s.auth.status="Login successful. Tokens stored in localStorage.",h({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const n=e instanceof Error?e.message:"Unknown callback error";s.auth.status=`Callback handling failed: ${n}`,h({tool:"auth.callback",result:s.auth.status})}s.auth.pendingCallback=!1,await xe(),s.auth.session&&await Ue(),m()}async function Ue(){if(s.auth.session){s.p1.envsLoading=!0,s.p1.envsError="",m();try{const e=await X(s.auth.session.accessToken);s.p1.environments=e,e.some(t=>t.id===s.p1.selectedEnvId)||(s.p1.selectedEnvId=e.length>0?e[0].id:null),s.p1.selectedEnvId&&M(s.p1.selectedEnvId),h({tool:"pingone.environments",result:`Loaded ${e.length} environment(s).`})}catch(e){const n=e instanceof Error?e.message:"Unknown error";s.p1.envsError=n,h({tool:"pingone.environments",result:`Error: ${n}`})}s.p1.envsLoading=!1,s.p1.selectedEnvId&&await k()}}async function k(){const{session:e}=s.auth,n=s.p1.selectedEnvId;if(!e||!n)return;s.p1.dataLoading=!0,m();const[t,a]=await Promise.allSettled([Q(e.accessToken,n),Z(e.accessToken,n)]);t.status==="fulfilled"?s.p1.users=t.value:h({tool:"pingone.users",result:`Error: ${t.reason?.message}`}),a.status==="fulfilled"?s.p1.applications=a.value:h({tool:"pingone.applications",result:`Error: ${a.reason?.message}`}),s.p1.dataLoading=!1,m()}async function xe(){if(!s.auth.session||s.auth.session.userInfo)return;const e=ye(s.auth.session),n=s.auth.session.envId;if(e&&n)try{const t=await ee(s.auth.session.accessToken,n,e);s.auth.session.userInfo={sub:t.id,preferred_username:t.username||t.email||"",username:t.username||"",name:[t.name?.given,t.name?.family].filter(Boolean).join(" ")||"",given_name:t.name?.given||"",family_name:t.name?.family||"",email:t.email||""},q(s.auth.session),m();return}catch{}try{const t=await ge(s.auth.session);s.auth.session.userInfo=t,q(s.auth.session),m()}catch{}}Ae();
