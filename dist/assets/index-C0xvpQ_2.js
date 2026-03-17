(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const T={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},C={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(T)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},I={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function S(){return new Date().toLocaleTimeString()}function g(e,t){return{ok:!0,message:e,data:t}}function L(e){return e===C.name?C:Object.values(I).flat().find(n=>n.name===e)||null}class j{constructor({getPage:t,setPage:n,getState:s,setState:i,onRegisteredSetChange:a}){this.getPage=t,this.setPage=n,this.getState=s,this.setState=i,this.onRegisteredSetChange=a,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const t=this.getPage(),n=I[t]||[];return[C,...n]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(t){return async(n={},s)=>this.executeTool(t,n)}toWebMCPTool(t){return{name:t.name,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations,execute:this.createExecutor(t.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const t=this.getDesiredTemplates(),n=new Set(t.map(s=>s.name));for(const s of this.registeredTools)if(!n.has(s)){try{this.modelContext.unregisterTool(s)}catch{}this.registeredTools.delete(s)}for(const s of t){if(this.registeredTools.has(s.name))continue;const i=this.toWebMCPTool(s);try{this.modelContext.registerTool(i),this.registeredTools.add(s.name)}catch{try{this.modelContext.unregisterTool(s.name),this.modelContext.registerTool(i),this.registeredTools.add(s.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(t,n={}){if(t===C.name){if(!Object.prototype.hasOwnProperty.call(T,n.page))throw new Error(`Unknown page: ${n.page}`);return this.setPage(n.page),this.syncToolsForCurrentPage(),g("Navigation complete",{page:n.page,at:S()})}const s=this.getPage();if(!(I[s]||[]).map(r=>r.name).includes(t))throw new Error(`Tool '${t}' is unavailable on page '${s}'.`);const a=this.getState();switch(t){case"user.create":{const r=`u-${Date.now().toString(36).slice(-5)}`;return a.users.push({id:r,name:n.name,role:n.role,status:"active"}),this.setState(a),g("User created",{id:r,...n,at:S()})}case"user.suspend":{const r=a.users.find(c=>c.id===n.userId);if(!r)throw new Error(`User '${n.userId}' not found.`);return r.status="suspended",r.suspensionReason=n.reason,this.setState(a),g("User suspended",{userId:n.userId,reason:n.reason,at:S()})}case"user.reset_mfa":return g("MFA reset issued",{userId:n.userId,at:S()});case"app.deploy":return a.deployments.unshift({appName:n.appName,version:n.version,targetEnv:n.targetEnv,status:"deployed",at:S()}),this.setState(a),g("Deployment completed",n);case"app.rollback":return a.deployments.unshift({appName:n.appName,version:"previous-stable",targetEnv:n.targetEnv,status:"rolled back",at:S()}),this.setState(a),g("Rollback completed",n);case"app.toggle_feature_flag":return a.flags[`${n.appName}:${n.flagName}`]=n.enabled,this.setState(a),g("Feature flag updated",n);case"env.maintenance_mode":return a.environments[n.environment].maintenance=n.enabled,this.setState(a),g("Maintenance mode changed",n);case"env.rotate_secrets":return a.environments[n.environment].lastSecretRotation=S(),this.setState(a),g("Secrets rotated",n);case"env.scale_cluster":return a.environments[n.environment].nodes=Number(n.nodeCount),this.setState(a),g("Cluster scaled",n);default:throw new Error(`Tool '${t}' not implemented.`)}}async invokeToolForDemo(t,n={}){const s=L(t);if(!s)throw new Error(`Unknown tool '${t}'.`);return this.toWebMCPTool(s).execute(n,{requestUserInteraction:async a=>a()})}}function _(e){return T[e]||"Unknown"}const q=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],F="https://api.pingone.com/v1";async function z(e){const t=await fetch(`${F}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const s=await t.text();throw new Error(`GET /environments failed (${t.status}): ${s}`)}return(await t.json())._embedded?.environments??[]}const M="p1.oidc.config",O="p1.oidc.session",k="p1.oidc.tx";function U(e){let t="";for(let n=0;n<e.length;n+=1)t+=String.fromCharCode(e[n]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function x(e=48){const t=new Uint8Array(e);return crypto.getRandomValues(t),U(t)}async function B(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return new Uint8Array(n)}function N(e,t){const n=localStorage.getItem(e);if(!n)return t;try{return JSON.parse(n)}catch{return t}}function A(e,t){localStorage.setItem(e,JSON.stringify(t))}function H(){const e=sessionStorage.getItem(k);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function W(e){sessionStorage.setItem(k,JSON.stringify(e))}function P(){sessionStorage.removeItem(k)}function w(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function D(e){return`https://auth.pingone.com/${e}/as/authorize`}function J(e){return`https://auth.pingone.com/${e}/as/token`}function K(e){return`https://auth.pingone.com/${e}/as/userinfo`}function G(){return N(M,{envId:"",clientId:"",scope:"openid profile email"})}function R(e){A(M,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim(),scope:String(e.scope||"openid profile email").trim()})}function V(){return N(O,null)}function X(){localStorage.removeItem(O)}async function Y({envId:e,clientId:t,scope:n,redirectUri:s}){const i=String(e||"").trim(),a=String(t||"").trim(),r=String(n||"openid profile email").trim(),c=String(s||"").trim();if(!i||!a||!c)throw new Error("EnvID, ClientID, and redirect URI are required.");const l=x(24),p=x(64),f=await B(p),y=U(f);W({envId:i,clientId:a,scope:r,redirectUri:c,state:l,codeVerifier:p,createdAt:Date.now()});const d=new URL(D(i));return d.searchParams.set("response_type","code"),d.searchParams.set("client_id",a),d.searchParams.set("redirect_uri",c),d.searchParams.set("scope",r),d.searchParams.set("state",l),d.searchParams.set("code_challenge",y),d.searchParams.set("code_challenge_method","S256"),d.toString()}async function Q(){const e=new URL(window.location.href),t=e.searchParams.get("error"),n=e.searchParams.get("error_description")||"",s=e.searchParams.get("code"),i=e.searchParams.get("state");if(!t&&!s)return{handled:!1};if(t)return w(),P(),{handled:!0,error:`${t}${n?`: ${n}`:""}`};const a=H();if(!a)return w(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(a.state!==i)return w(),P(),{handled:!0,error:"OIDC state mismatch. Start login again."};const r=new URLSearchParams;r.set("grant_type","authorization_code"),r.set("client_id",a.clientId),r.set("code",String(s)),r.set("redirect_uri",a.redirectUri),r.set("code_verifier",a.codeVerifier);const c=await fetch(J(a.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:r.toString()});if(!c.ok){const y=await c.text();return w(),P(),{handled:!0,error:`Token exchange failed (${c.status}): ${y}`}}const l=await c.json(),p=Number(l.expires_in||0),f={envId:a.envId,clientId:a.clientId,scope:a.scope,tokenType:l.token_type||"Bearer",accessToken:l.access_token||"",idToken:l.id_token||"",refreshToken:l.refresh_token||"",expiresAt:p>0?Date.now()+p*1e3:null};return A(O,f),R({envId:a.envId,clientId:a.clientId,scope:a.scope}),w(),P(),{handled:!0,session:f}}async function Z(e){const t=await fetch(K(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!t.ok){const n=await t.text();throw new Error(`UserInfo failed (${t.status}): ${n}`)}return t.json()}const o={activePage:"console",auth:{config:G(),session:V(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:null,envsLoading:!1,envsError:""},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},h=document.querySelector("#app"),$=new j({getPage:()=>o.activePage,setPage:e=>{o.activePage=e,u()},getState:()=>structuredClone(o.data),setState:e=>{o.data=e,u()},onRegisteredSetChange:e=>{o.webmcp.registeredTools=e,u()}});o.webmcp.supported=$.initialize().supported;$.syncToolsForCurrentPage();function m(e){o.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),o.data.activity=o.data.activity.slice(0,12)}function ee(){const{config:e,pendingCallback:t,status:n}=o.auth,s=window.location.origin+window.location.pathname;return`
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
              Scope
              <input name="scope" value="${e.scope}" placeholder="openid profile email" required />
            </label>
            <label>
              Redirect URI
              <input name="redirectUri" value="${s}" readonly />
            </label>
            <button type="submit" class="login-button">${t?"Completing login...":"Login with PingOne"}</button>
          </form>
          <p class="auth-status">${n||""}</p>
          <p class="auth-endpoint">Authorize endpoint: ${e.envId?D(e.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `}function te(){const{session:e,status:t}=o.auth;return e?`
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in to ${e.envId.slice(0,8)}... (${e.scope})</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary" data-fetch-userinfo="true">UserInfo</button>
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${t||""}</p>
    </div>
  `:""}function ne(e){return e==="console"?`
      <section class="panel">
        <h2>Console Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${o.data.users.length}</p>
          </article>
          <article>
            <h3>Deployments</h3>
            <p>${o.data.deployments.length}</p>
          </article>
          <article>
            <h3>Environments</h3>
            <p>${Object.keys(o.data.environments).length}</p>
          </article>
        </div>
      </section>
    `:e==="userManagement"?`
      <section class="panel">
        <h2>User Directory</h2>
        <div class="table-like">
          <div class="row head"><span>ID</span><span>Name</span><span>Role</span><span>Status</span></div>
          ${o.data.users.map(t=>`<div class="row"><span>${t.id}</span><span>${t.name}</span><span>${t.role}</span><span>${t.status}</span></div>`).join("")}
        </div>
      </section>
    `:e==="applicationManagement"?`
      <section class="panel">
        <h2>Deployment Timeline</h2>
        <div class="table-like">
          <div class="row head"><span>App</span><span>Version</span><span>Target</span><span>Status</span><span>Time</span></div>
          ${o.data.deployments.slice(0,8).map(t=>`<div class="row"><span>${t.appName}</span><span>${t.version}</span><span>${t.targetEnv}</span><span>${t.status}</span><span>${t.at}</span></div>`).join("")}
        </div>
      </section>
    `:`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(o.data.environments).map(([t,n])=>`<div class="row"><span>${t}</span><span>${n.nodes}</span><span>${String(n.maintenance)}</span><span>${n.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function ae(e,t){return Array.isArray(t.enum)?`
      <label>
        ${e}
        <select name="${e}">
          ${t.enum.map(n=>`<option value="${n}">${n}</option>`).join("")}
        </select>
      </label>
    `:t.type==="boolean"?`
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
      <input name="${e}" type="text" ${t.type==="number"?'inputmode="numeric"':""} />
    </label>
  `}function oe(e,t){return e.type==="boolean"?t==="true":e.type==="number"?Number(t):t}function se(){const e=$.listCurrentTools(),t={"console.open_page":"Open Admin Page","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return e.map(n=>{const s=n.inputSchema?.properties||{},i=Object.entries(s);return`
        <article class="tool-card">
          <header>
            <h3>${t[n.name]||n.name}</h3>
            <code>${n.name}</code>
          </header>
          <p>${n.description}</p>
          <form data-tool-name="${n.name}">
            ${i.map(([a,r])=>ae(a,r)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function re(){h.querySelectorAll("[data-nav-page]").forEach(r=>{r.addEventListener("click",()=>{o.activePage=r.dataset.navPage,$.syncToolsForCurrentPage(),u()})});const t=h.querySelector("[data-env-picker]");t&&t.addEventListener("change",()=>{o.p1.selectedEnvId=t.value,u()});const n=h.querySelector("form[data-auth-form]");n&&n.addEventListener("submit",async r=>{r.preventDefault();const c=new FormData(n),l=String(c.get("envId")||"").trim(),p=String(c.get("clientId")||"").trim(),f=String(c.get("scope")||"openid profile email").trim(),y=String(c.get("redirectUri")||"").trim();o.auth.config={envId:l,clientId:p,scope:f},R(o.auth.config);try{const d=await Y({envId:l,clientId:p,scope:f,redirectUri:y});o.auth.status="Redirecting to PingOne authorize endpoint...",u(),window.location.assign(d)}catch(d){const E=d instanceof Error?d.message:"Unknown OIDC error";o.auth.status=`Login setup failed: ${E}`,m({tool:"auth.login",result:o.auth.status}),u()}});const s=h.querySelector("[data-signout]");s&&s.addEventListener("click",()=>{X(),o.auth.session=null,o.auth.status="Signed out.",m({tool:"auth.signout",result:"Session cleared from browser storage."}),u()});const i=h.querySelector("[data-fetch-userinfo]");i&&i.addEventListener("click",async()=>{if(o.auth.session){try{const r=await Z(o.auth.session),c=JSON.stringify(r,null,2);o.auth.status="UserInfo call succeeded.";const l=h.querySelector("#tool-output");l.textContent=c,m({tool:"pingone.userinfo",result:c})}catch(r){const c=r instanceof Error?r.message:"Unknown error";o.auth.status=`UserInfo failed: ${c}`,m({tool:"pingone.userinfo",result:o.auth.status})}u()}}),h.querySelectorAll("form[data-tool-name]").forEach(r=>{r.addEventListener("submit",async c=>{c.preventDefault();const l=r.dataset.toolName,p=$.listCurrentTools().find(v=>v.name===l);if(!p)return;const f=p.inputSchema?.properties||{},y=new FormData(r),d={};Object.entries(f).forEach(([v,b])=>{d[v]=oe(b,String(y.get(v)??""))});const E=h.querySelector("#tool-output");try{const v=await $.invokeToolForDemo(l,d),b=JSON.stringify(v,null,2);m({tool:l,result:b}),E.textContent=b}catch(v){const b=v instanceof Error?v.message:"Unknown error";E.textContent=`Error: ${b}`,m({tool:l,result:`Error: ${b}`})}u()})})}function ie(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function ce(){const{environments:e,selectedEnvId:t,envsLoading:n,envsError:s}=o.p1,i=e.find(a=>a.id===t);return`
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${n?'<span class="env-loading">Loading environments&hellip;</span>':s?`<span class="env-error">${s}</span>`:`<select id="env-picker" data-env-picker="true">
              ${e.length===0?'<option value="">No environments found</option>':e.map(a=>`<option value="${a.id}" ${a.id===t?"selected":""}>${a.name} (${a.type})</option>`).join("")}
             </select>
             ${i?ie(i.type):""}`}
      </div>
    </div>
  `}function le(){return o.webmcp.supported?`WebMCP active: ${o.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function de(){return`
    ${ce()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${q.map(e=>`
              <section class="nav-group ${e.id===o.activePage?"active":""}">
                <button data-nav-page="${e.id}">${e.title}</button>
                <ul>
                  ${e.options.map(t=>`<li>${t}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${te()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${_(o.activePage)}</h2>
          </div>
          <div class="status-pill">${le()}</div>
        </header>

        ${ne(o.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${_(o.activePage)}.</p>
          <p class="registered-list">${o.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${se()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${o.data.activity.map(e=>`<li><strong>${e.tool}</strong><span>${e.at}</span><p>${e.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `}function u(){!!o.auth.session?h.innerHTML=de():h.innerHTML=ee(),re()}async function ue(){o.auth.pendingCallback=!0,u();try{const e=await Q();e.handled&&e.error&&(o.auth.status=e.error,m({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(o.auth.session=e.session,o.auth.status="Login successful. Tokens stored in localStorage.",m({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const t=e instanceof Error?e.message:"Unknown callback error";o.auth.status=`Callback handling failed: ${t}`,m({tool:"auth.callback",result:o.auth.status})}o.auth.pendingCallback=!1,o.auth.session&&await pe(),u()}async function pe(){if(o.auth.session){o.p1.envsLoading=!0,o.p1.envsError="",u();try{const e=await z(o.auth.session.accessToken);o.p1.environments=e,e.length>0&&!o.p1.selectedEnvId&&(o.p1.selectedEnvId=e[0].id),m({tool:"pingone.environments",result:`Loaded ${e.length} environment(s).`})}catch(e){const t=e instanceof Error?e.message:"Unknown error";o.p1.envsError=t,m({tool:"pingone.environments",result:`Error: ${t}`})}o.p1.envsLoading=!1}}ue();
