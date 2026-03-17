(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const O={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},C={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(O)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},T={name:"console.select_environment",description:"Switch the active PingOne environment by name. The name must match one of the environments returned after login.",inputSchema:{type:"object",properties:{name:{type:"string",description:"The exact name of the PingOne environment to switch to."}},required:["name"],additionalProperties:!1},annotations:{readOnlyHint:!1}},F=[C,T],I={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function y(){return new Date().toLocaleTimeString()}function g(e,t){return{ok:!0,message:e,data:t}}function B(e){return e===C.name?C:e===T.name?T:Object.values(I).flat().find(n=>n.name===e)||null}class z{constructor({getPage:t,setPage:n,getState:s,setState:r,onRegisteredSetChange:o,getEnvironments:i,setEnvironment:l}){this.getPage=t,this.setPage=n,this.getState=s,this.setState=r,this.onRegisteredSetChange=o,this.getEnvironments=i,this.setEnvironment=l,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const t=this.getPage(),n=I[t]||[];return[...F,...n]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(t){return async(n={},s)=>this.executeTool(t,n)}toWebMCPTool(t){return{name:t.name,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations,execute:this.createExecutor(t.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const t=this.getDesiredTemplates(),n=new Set(t.map(s=>s.name));for(const s of this.registeredTools)if(!n.has(s)){try{this.modelContext.unregisterTool(s)}catch{}this.registeredTools.delete(s)}for(const s of t){if(this.registeredTools.has(s.name))continue;const r=this.toWebMCPTool(s);try{this.modelContext.registerTool(r),this.registeredTools.add(s.name)}catch{try{this.modelContext.unregisterTool(s.name),this.modelContext.registerTool(r),this.registeredTools.add(s.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(t,n={}){if(t===C.name){if(!Object.prototype.hasOwnProperty.call(O,n.page))throw new Error(`Unknown page: ${n.page}`);return this.setPage(n.page),this.syncToolsForCurrentPage(),g("Navigation complete",{page:n.page,at:y()})}if(t===T.name){const i=this.getEnvironments?this.getEnvironments():[],l=i.find(c=>c.name.toLowerCase()===String(n.name||"").toLowerCase());if(!l){const c=i.map(u=>u.name).join(", ");throw new Error(`No environment named "${n.name}". Available: ${c||"none loaded"}`)}return this.setEnvironment(l.id),g("Environment switched",{id:l.id,name:l.name,at:y()})}const s=this.getPage();if(!(I[s]||[]).map(i=>i.name).includes(t))throw new Error(`Tool '${t}' is unavailable on page '${s}'.`);const o=this.getState();switch(t){case"user.create":{const i=`u-${Date.now().toString(36).slice(-5)}`;return o.users.push({id:i,name:n.name,role:n.role,status:"active"}),this.setState(o),g("User created",{id:i,...n,at:y()})}case"user.suspend":{const i=o.users.find(l=>l.id===n.userId);if(!i)throw new Error(`User '${n.userId}' not found.`);return i.status="suspended",i.suspensionReason=n.reason,this.setState(o),g("User suspended",{userId:n.userId,reason:n.reason,at:y()})}case"user.reset_mfa":return g("MFA reset issued",{userId:n.userId,at:y()});case"app.deploy":return o.deployments.unshift({appName:n.appName,version:n.version,targetEnv:n.targetEnv,status:"deployed",at:y()}),this.setState(o),g("Deployment completed",n);case"app.rollback":return o.deployments.unshift({appName:n.appName,version:"previous-stable",targetEnv:n.targetEnv,status:"rolled back",at:y()}),this.setState(o),g("Rollback completed",n);case"app.toggle_feature_flag":return o.flags[`${n.appName}:${n.flagName}`]=n.enabled,this.setState(o),g("Feature flag updated",n);case"env.maintenance_mode":return o.environments[n.environment].maintenance=n.enabled,this.setState(o),g("Maintenance mode changed",n);case"env.rotate_secrets":return o.environments[n.environment].lastSecretRotation=y(),this.setState(o),g("Secrets rotated",n);case"env.scale_cluster":return o.environments[n.environment].nodes=Number(n.nodeCount),this.setState(o),g("Cluster scaled",n);default:throw new Error(`Tool '${t}' not implemented.`)}}async invokeToolForDemo(t,n={}){const s=B(t);if(!s)throw new Error(`Unknown tool '${t}'.`);return this.toWebMCPTool(s).execute(n,{requestUserInteraction:async o=>o()})}}function x(e){return O[e]||"Unknown"}const H=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],_="https://api.pingone.com/v1";async function W(e){const t=await fetch(`${_}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const s=await t.text();throw new Error(`GET /environments failed (${t.status}): ${s}`)}return(await t.json())._embedded?.environments??[]}async function G(e,t){const n=await fetch(`${_}/environments/${t}/users`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const r=await n.text();throw new Error(`GET /users failed (${n.status}): ${r}`)}return(await n.json())._embedded?.users??[]}async function J(e,t){const n=await fetch(`${_}/environments/${t}/applications`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const r=await n.text();throw new Error(`GET /applications failed (${n.status}): ${r}`)}return(await n.json())._embedded?.applications??[]}const U="p1.oidc.config",k="p1.oidc.session",N="p1.oidc.tx";function M(e){let t="";for(let n=0;n<e.length;n+=1)t+=String.fromCharCode(e[n]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function L(e=48){const t=new Uint8Array(e);return crypto.getRandomValues(t),M(t)}async function K(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return new Uint8Array(n)}function D(e,t){const n=localStorage.getItem(e);if(!n)return t;try{return JSON.parse(n)}catch{return t}}function R(e,t){localStorage.setItem(e,JSON.stringify(t))}function Y(){const e=sessionStorage.getItem(N);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function V(e){sessionStorage.setItem(N,JSON.stringify(e))}function P(){sessionStorage.removeItem(N)}function $(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function j(e){return`https://auth.pingone.com/${e}/as/authorize`}function X(e){return`https://auth.pingone.com/${e}/as/token`}function Q(e){return`https://auth.pingone.com/${e}/as/userinfo`}function Z(){return D(U,{envId:"",clientId:"",scope:"openid profile email"})}function q(e){R(U,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim(),scope:String(e.scope||"openid profile email").trim()})}function ee(){return D(k,null)}function te(){localStorage.removeItem(k)}async function ne({envId:e,clientId:t,scope:n,redirectUri:s}){const r=String(e||"").trim(),o=String(t||"").trim(),i=String(n||"openid profile email").trim(),l=String(s||"").trim();if(!r||!o||!l)throw new Error("EnvID, ClientID, and redirect URI are required.");const c=L(24),u=L(64),f=await K(u),b=M(f);V({envId:r,clientId:o,scope:i,redirectUri:l,state:c,codeVerifier:u,createdAt:Date.now()});const d=new URL(j(r));return d.searchParams.set("response_type","code"),d.searchParams.set("client_id",o),d.searchParams.set("redirect_uri",l),d.searchParams.set("scope",i),d.searchParams.set("state",c),d.searchParams.set("code_challenge",b),d.searchParams.set("code_challenge_method","S256"),d.toString()}async function ae(){const e=new URL(window.location.href),t=e.searchParams.get("error"),n=e.searchParams.get("error_description")||"",s=e.searchParams.get("code"),r=e.searchParams.get("state");if(!t&&!s)return{handled:!1};if(t)return $(),P(),{handled:!0,error:`${t}${n?`: ${n}`:""}`};const o=Y();if(!o)return $(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(o.state!==r)return $(),P(),{handled:!0,error:"OIDC state mismatch. Start login again."};const i=new URLSearchParams;i.set("grant_type","authorization_code"),i.set("client_id",o.clientId),i.set("code",String(s)),i.set("redirect_uri",o.redirectUri),i.set("code_verifier",o.codeVerifier);const l=await fetch(X(o.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:i.toString()});if(!l.ok){const b=await l.text();return $(),P(),{handled:!0,error:`Token exchange failed (${l.status}): ${b}`}}const c=await l.json(),u=Number(c.expires_in||0),f={envId:o.envId,clientId:o.clientId,scope:o.scope,tokenType:c.token_type||"Bearer",accessToken:c.access_token||"",idToken:c.id_token||"",refreshToken:c.refresh_token||"",expiresAt:u>0?Date.now()+u*1e3:null};return R(k,f),q({envId:o.envId,clientId:o.clientId,scope:o.scope}),$(),P(),{handled:!0,session:f}}async function oe(e){const t=await fetch(Q(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!t.ok){const n=await t.text();throw new Error(`UserInfo failed (${t.status}): ${n}`)}return t.json()}const a={activePage:"console",auth:{config:Z(),session:ee(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:null,envsLoading:!1,envsError:"",users:null,applications:null,dataLoading:!1},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},h=document.querySelector("#app"),w=new z({getPage:()=>a.activePage,setPage:e=>{a.activePage=e,p()},getState:()=>structuredClone(a.data),setState:e=>{a.data=e,p()},onRegisteredSetChange:e=>{a.webmcp.registeredTools=e,p()},getEnvironments:()=>a.p1.environments,setEnvironment:e=>{a.p1.selectedEnvId=e,a.p1.users=null,a.p1.applications=null,p(),A()}});a.webmcp.supported=w.initialize().supported;w.syncToolsForCurrentPage();function m(e){a.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),a.data.activity=a.data.activity.slice(0,12)}function se(){const{config:e,pendingCallback:t,status:n}=a.auth,s=window.location.origin+window.location.pathname;return`
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
          <p class="auth-endpoint">Authorize endpoint: ${e.envId?j(e.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `}function re(){const{session:e,status:t}=a.auth;return e?`
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in to ${e.envId.slice(0,8)}... (${e.scope})</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary" data-fetch-userinfo="true">UserInfo</button>
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${t||""}</p>
    </div>
  `:""}function ie(e){if(e==="console")return`
      <section class="panel">
        <h2>Console Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${a.p1.users===null?a.p1.dataLoading?"…":"—":a.p1.users.length}</p>
          </article>
          <article>
            <h3>Applications</h3>
            <p>${a.p1.applications===null?a.p1.dataLoading?"…":"—":a.p1.applications.length}</p>
          </article>
        </div>
      </section>
    `;if(e==="userManagement"){const{users:t,dataLoading:n}=a.p1;let s;return n?s='<p class="data-loading">Loading users…</p>':t?t.length===0?s='<p class="data-empty">No users found in this environment.</p>':s=`
        <div class="table-like">
          <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
          ${t.map(r=>`
            <div class="row users-row">
              <span>${r.username??"—"}</span>
              <span>${[r.name?.given,r.name?.family].filter(Boolean).join(" ")||"—"}</span>
              <span>${r.email??"—"}</span>
              <span>${r.enabled?"Yes":"No"}</span>
              <span>${r.createdAt?new Date(r.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:s='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Users <span class="count-badge">${t?t.length:""}</span></h2>
        ${s}
      </section>
    `}if(e==="applicationManagement"){const{applications:t,dataLoading:n}=a.p1;let s;return n?s='<p class="data-loading">Loading applications…</p>':t?t.length===0?s='<p class="data-empty">No applications found in this environment.</p>':s=`
        <div class="table-like">
          <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
          ${t.map(r=>`
            <div class="row apps-row">
              <span>${r.name??"—"}</span>
              <span>${r.type??"—"}</span>
              <span>${r.protocol??"—"}</span>
              <span>${r.enabled?"Yes":"No"}</span>
              <span>${r.createdAt?new Date(r.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:s='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Applications <span class="count-badge">${t?t.length:""}</span></h2>
        ${s}
      </section>
    `}return`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(a.data.environments).map(([t,n])=>`<div class="row"><span>${t}</span><span>${n.nodes}</span><span>${String(n.maintenance)}</span><span>${n.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function le(e,t){return Array.isArray(t.enum)?`
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
  `}function ce(e,t){return e.type==="boolean"?t==="true":e.type==="number"?Number(t):t}function de(){const e=w.listCurrentTools(),t={"console.open_page":"Open Admin Page","console.select_environment":"Select Environment","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return e.map(n=>{const s=n.inputSchema?.properties||{},r=Object.entries(s);return`
        <article class="tool-card">
          <header>
            <h3>${t[n.name]||n.name}</h3>
            <code>${n.name}</code>
          </header>
          <p>${n.description}</p>
          <form data-tool-name="${n.name}">
            ${r.map(([o,i])=>le(o,i)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function pe(){h.querySelectorAll("[data-nav-page]").forEach(i=>{i.addEventListener("click",()=>{a.activePage=i.dataset.navPage,w.syncToolsForCurrentPage(),p()})});const t=h.querySelector("[data-env-picker]");t&&t.addEventListener("change",()=>{a.p1.selectedEnvId=t.value,a.p1.users=null,a.p1.applications=null,p(),A()});const n=h.querySelector("form[data-auth-form]");n&&n.addEventListener("submit",async i=>{i.preventDefault();const l=new FormData(n),c=String(l.get("envId")||"").trim(),u=String(l.get("clientId")||"").trim(),f=String(l.get("scope")||"openid profile email").trim(),b=String(l.get("redirectUri")||"").trim();a.auth.config={envId:c,clientId:u,scope:f},q(a.auth.config);try{const d=await ne({envId:c,clientId:u,scope:f,redirectUri:b});a.auth.status="Redirecting to PingOne authorize endpoint...",p(),window.location.assign(d)}catch(d){const E=d instanceof Error?d.message:"Unknown OIDC error";a.auth.status=`Login setup failed: ${E}`,m({tool:"auth.login",result:a.auth.status}),p()}});const s=h.querySelector("[data-signout]");s&&s.addEventListener("click",()=>{te(),a.auth.session=null,a.auth.status="Signed out.",m({tool:"auth.signout",result:"Session cleared from browser storage."}),p()});const r=h.querySelector("[data-fetch-userinfo]");r&&r.addEventListener("click",async()=>{if(a.auth.session){try{const i=await oe(a.auth.session),l=JSON.stringify(i,null,2);a.auth.status="UserInfo call succeeded.";const c=h.querySelector("#tool-output");c.textContent=l,m({tool:"pingone.userinfo",result:l})}catch(i){const l=i instanceof Error?i.message:"Unknown error";a.auth.status=`UserInfo failed: ${l}`,m({tool:"pingone.userinfo",result:a.auth.status})}p()}}),h.querySelectorAll("form[data-tool-name]").forEach(i=>{i.addEventListener("submit",async l=>{l.preventDefault();const c=i.dataset.toolName,u=w.listCurrentTools().find(v=>v.name===c);if(!u)return;const f=u.inputSchema?.properties||{},b=new FormData(i),d={};Object.entries(f).forEach(([v,S])=>{d[v]=ce(S,String(b.get(v)??""))});const E=h.querySelector("#tool-output");try{const v=await w.invokeToolForDemo(c,d),S=JSON.stringify(v,null,2);m({tool:c,result:S}),E.textContent=S}catch(v){const S=v instanceof Error?v.message:"Unknown error";E.textContent=`Error: ${S}`,m({tool:c,result:`Error: ${S}`})}p()})})}function ue(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function me(){const{environments:e,selectedEnvId:t,envsLoading:n,envsError:s}=a.p1,r=e.find(o=>o.id===t);return`
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${n?'<span class="env-loading">Loading environments&hellip;</span>':s?`<span class="env-error">${s}</span>`:`<select id="env-picker" data-env-picker="true">
              ${e.length===0?'<option value="">No environments found</option>':e.map(o=>`<option value="${o.id}" ${o.id===t?"selected":""}>${o.name} (${o.type})</option>`).join("")}
             </select>
             ${r?ue(r.type):""}`}
      </div>
    </div>
  `}function ge(){return a.webmcp.supported?`WebMCP active: ${a.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function he(){return`
    ${me()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${H.map(e=>`
              <section class="nav-group ${e.id===a.activePage?"active":""}">
                <button data-nav-page="${e.id}">${e.title}</button>
                <ul>
                  ${e.options.map(t=>`<li>${t}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${re()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${x(a.activePage)}</h2>
          </div>
          <div class="status-pill">${ge()}</div>
        </header>

        ${ie(a.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${x(a.activePage)}.</p>
          <p class="registered-list">${a.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${de()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${a.data.activity.map(e=>`<li><strong>${e.tool}</strong><span>${e.at}</span><p>${e.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `}function p(){!!a.auth.session?h.innerHTML=he():h.innerHTML=se(),pe()}async function fe(){a.auth.pendingCallback=!0,p();try{const e=await ae();e.handled&&e.error&&(a.auth.status=e.error,m({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(a.auth.session=e.session,a.auth.status="Login successful. Tokens stored in localStorage.",m({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const t=e instanceof Error?e.message:"Unknown callback error";a.auth.status=`Callback handling failed: ${t}`,m({tool:"auth.callback",result:a.auth.status})}a.auth.pendingCallback=!1,a.auth.session&&await ve(),p()}async function ve(){if(a.auth.session){a.p1.envsLoading=!0,a.p1.envsError="",p();try{const e=await W(a.auth.session.accessToken);a.p1.environments=e,e.length>0&&!a.p1.selectedEnvId&&(a.p1.selectedEnvId=e[0].id),m({tool:"pingone.environments",result:`Loaded ${e.length} environment(s).`})}catch(e){const t=e instanceof Error?e.message:"Unknown error";a.p1.envsError=t,m({tool:"pingone.environments",result:`Error: ${t}`})}a.p1.envsLoading=!1,a.p1.selectedEnvId&&await A()}}async function A(){const{session:e}=a.auth,t=a.p1.selectedEnvId;if(!e||!t)return;a.p1.dataLoading=!0,p();const[n,s]=await Promise.allSettled([G(e.accessToken,t),J(e.accessToken,t)]);n.status==="fulfilled"?a.p1.users=n.value:m({tool:"pingone.users",result:`Error: ${n.reason?.message}`}),s.status==="fulfilled"?a.p1.applications=s.value:m({tool:"pingone.applications",result:`Error: ${s.reason?.message}`}),a.p1.dataLoading=!1,p()}fe();
