(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const k={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},I={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(k)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},T={name:"console.select_environment",description:"Switch the active PingOne environment by name. The name must match one of the environments returned after login.",inputSchema:{type:"object",properties:{name:{type:"string",description:"The exact name of the PingOne environment to switch to."}},required:["name"],additionalProperties:!1},annotations:{readOnlyHint:!1}},z=[I,T],_={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function y(){return new Date().toLocaleTimeString()}function g(e,n){return{ok:!0,message:e,data:n}}function H(e){return e===I.name?I:e===T.name?T:Object.values(_).flat().find(t=>t.name===e)||null}class W{constructor({getPage:n,setPage:t,getState:o,setState:r,onRegisteredSetChange:s,getEnvironments:i,setEnvironment:l}){this.getPage=n,this.setPage=t,this.getState=o,this.setState=r,this.onRegisteredSetChange=s,this.getEnvironments=i,this.setEnvironment=l,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const n=this.getPage(),t=_[n]||[];return[...z,...t]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(n){return async(t={},o)=>this.executeTool(n,t)}toWebMCPTool(n){return{name:n.name,description:n.description,inputSchema:n.inputSchema,annotations:n.annotations,execute:this.createExecutor(n.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const n=this.getDesiredTemplates(),t=new Set(n.map(o=>o.name));for(const o of this.registeredTools)if(!t.has(o)){try{this.modelContext.unregisterTool(o)}catch{}this.registeredTools.delete(o)}for(const o of n){if(this.registeredTools.has(o.name))continue;const r=this.toWebMCPTool(o);try{this.modelContext.registerTool(r),this.registeredTools.add(o.name)}catch{try{this.modelContext.unregisterTool(o.name),this.modelContext.registerTool(r),this.registeredTools.add(o.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(n,t={}){if(n===I.name){if(!Object.prototype.hasOwnProperty.call(k,t.page))throw new Error(`Unknown page: ${t.page}`);return this.setPage(t.page),this.syncToolsForCurrentPage(),g("Navigation complete",{page:t.page,at:y()})}if(n===T.name){const i=this.getEnvironments?this.getEnvironments():[],l=String(t.name||"").toLowerCase().trim(),c=i.find(d=>d.name.toLowerCase()===l)||i.find(d=>d.name.toLowerCase().startsWith(l))||i.find(d=>d.name.toLowerCase().includes(l));if(!c){const d=i.map(p=>p.name).join(", ");return{ok:!1,message:`No environment matching "${t.name}".`,available:d||"No environments loaded yet."}}return this.setEnvironment(c.id),g("Environment switched",{id:c.id,name:c.name,at:y()})}const o=this.getPage();if(!(_[o]||[]).map(i=>i.name).includes(n))throw new Error(`Tool '${n}' is unavailable on page '${o}'.`);const s=this.getState();switch(n){case"user.create":{const i=`u-${Date.now().toString(36).slice(-5)}`;return s.users.push({id:i,name:t.name,role:t.role,status:"active"}),this.setState(s),g("User created",{id:i,...t,at:y()})}case"user.suspend":{const i=s.users.find(l=>l.id===t.userId);if(!i)throw new Error(`User '${t.userId}' not found.`);return i.status="suspended",i.suspensionReason=t.reason,this.setState(s),g("User suspended",{userId:t.userId,reason:t.reason,at:y()})}case"user.reset_mfa":return g("MFA reset issued",{userId:t.userId,at:y()});case"app.deploy":return s.deployments.unshift({appName:t.appName,version:t.version,targetEnv:t.targetEnv,status:"deployed",at:y()}),this.setState(s),g("Deployment completed",t);case"app.rollback":return s.deployments.unshift({appName:t.appName,version:"previous-stable",targetEnv:t.targetEnv,status:"rolled back",at:y()}),this.setState(s),g("Rollback completed",t);case"app.toggle_feature_flag":return s.flags[`${t.appName}:${t.flagName}`]=t.enabled,this.setState(s),g("Feature flag updated",t);case"env.maintenance_mode":return s.environments[t.environment].maintenance=t.enabled,this.setState(s),g("Maintenance mode changed",t);case"env.rotate_secrets":return s.environments[t.environment].lastSecretRotation=y(),this.setState(s),g("Secrets rotated",t);case"env.scale_cluster":return s.environments[t.environment].nodes=Number(t.nodeCount),this.setState(s),g("Cluster scaled",t);default:throw new Error(`Tool '${n}' not implemented.`)}}async invokeToolForDemo(n,t={}){const o=H(n);if(!o)throw new Error(`Unknown tool '${n}'.`);return this.toWebMCPTool(o).execute(t,{requestUserInteraction:async s=>s()})}}function A(e){return k[e]||"Unknown"}const G=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],C="https://api.pingone.com/v1";async function J(e){const n=await fetch(`${C}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const o=await n.text();throw new Error(`GET /environments failed (${n.status}): ${o}`)}return(await n.json())._embedded?.environments??[]}async function V(e,n){const t=await fetch(`${C}/environments/${n}/users`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const r=await t.text();throw new Error(`GET /users failed (${t.status}): ${r}`)}return(await t.json())._embedded?.users??[]}async function K(e,n){const t=await fetch(`${C}/environments/${n}/applications`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const r=await t.text();throw new Error(`GET /applications failed (${t.status}): ${r}`)}return(await t.json())._embedded?.applications??[]}async function Y(e,n,t){const o=await fetch(`${C}/environments/${n}/users/${t}`,{headers:{authorization:`Bearer ${e}`}});if(!o.ok){const r=await o.text();throw new Error(`GET /users/${t} failed (${o.status}): ${r}`)}return o.json()}const R="p1.oidc.config",P="p1.oidc.session",N="p1.oidc.tx";function j(e){let n="";for(let t=0;t<e.length;t+=1)n+=String.fromCharCode(e[t]);return btoa(n).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function M(e=48){const n=new Uint8Array(e);return crypto.getRandomValues(n),j(n)}async function X(e){const n=new TextEncoder().encode(e),t=await crypto.subtle.digest("SHA-256",n);return new Uint8Array(t)}function q(e,n){const t=localStorage.getItem(e);if(!t)return n;try{return JSON.parse(t)}catch{return n}}function L(e,n){localStorage.setItem(e,JSON.stringify(n))}function Q(){const e=sessionStorage.getItem(N);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function Z(e){sessionStorage.setItem(N,JSON.stringify(e))}function E(){sessionStorage.removeItem(N)}function $(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function B(e){return`https://auth.pingone.com/${e}/as/authorize`}function ee(e){return`https://auth.pingone.com/${e}/as/token`}function te(e){return`https://auth.pingone.com/${e}/as/userinfo`}function ne(){return q(R,{envId:"",clientId:""})}function F(e){L(R,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim()})}function ae(){return q(P,null)}function D(e){L(P,e)}function oe(){localStorage.removeItem(P)}async function se({envId:e,clientId:n,scope:t,redirectUri:o}){const r=String(e||"").trim(),s=String(n||"").trim(),i=String(t||"openid profile email").trim(),l=String(o||"").trim();if(!r||!s||!l)throw new Error("EnvID, ClientID, and redirect URI are required.");const c=M(24),d=M(64),p=await X(d),v=j(p);Z({envId:r,clientId:s,scope:i,redirectUri:l,state:c,codeVerifier:d,createdAt:Date.now()});const m=new URL(B(r));return m.searchParams.set("response_type","code"),m.searchParams.set("client_id",s),m.searchParams.set("redirect_uri",l),m.searchParams.set("scope",i),m.searchParams.set("state",c),m.searchParams.set("code_challenge",v),m.searchParams.set("code_challenge_method","S256"),m.toString()}async function re(){const e=new URL(window.location.href),n=e.searchParams.get("error"),t=e.searchParams.get("error_description")||"",o=e.searchParams.get("code"),r=e.searchParams.get("state");if(!n&&!o)return{handled:!1};if(n)return $(),E(),{handled:!0,error:`${n}${t?`: ${t}`:""}`};const s=Q();if(!s)return $(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(s.state!==r)return $(),E(),{handled:!0,error:"OIDC state mismatch. Start login again."};const i=new URLSearchParams;i.set("grant_type","authorization_code"),i.set("client_id",s.clientId),i.set("code",String(o)),i.set("redirect_uri",s.redirectUri),i.set("code_verifier",s.codeVerifier);const l=await fetch(ee(s.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:i.toString()});if(!l.ok){const v=await l.text();return $(),E(),{handled:!0,error:`Token exchange failed (${l.status}): ${v}`}}const c=await l.json(),d=Number(c.expires_in||0),p={envId:s.envId,clientId:s.clientId,scope:s.scope,tokenType:c.token_type||"Bearer",accessToken:c.access_token||"",idToken:c.id_token||"",refreshToken:c.refresh_token||"",expiresAt:d>0?Date.now()+d*1e3:null};return L(P,p),F({envId:s.envId,clientId:s.clientId,scope:s.scope}),$(),E(),{handled:!0,session:p}}async function ie(e){const n=await fetch(te(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!n.ok){const t=await n.text();throw new Error(`UserInfo failed (${n.status}): ${t}`)}return n.json()}function le(e){const n=e.replace(/-/g,"+").replace(/_/g,"/"),t=n.padEnd(Math.ceil(n.length/4)*4,"=");return atob(t)}function O(e){if(!e||typeof e!="string")return null;const n=e.split(".");if(n.length<2)return null;try{const t=le(n[1]);return JSON.parse(t)}catch{return null}}function ce(e){if(!e)return"";const t=e.userInfo?.preferred_username||e.userInfo?.username||e.userInfo?.name||[e.userInfo?.given_name,e.userInfo?.family_name].filter(Boolean).join(" ")||e.userInfo?.email;if(t)return String(t);const o=O(e.idToken),r=o?.preferred_username||o?.username||o?.name||[o?.given_name,o?.family_name].filter(Boolean).join(" ")||o?.email;return r?String(r):""}function de(e){if(!e)return"";if(e.userInfo?.sub)return String(e.userInfo.sub);const n=O(e.idToken);if(n?.sub)return String(n.sub);const t=O(e.accessToken);return t?.sub?String(t.sub):""}const a={activePage:"console",auth:{config:ne(),session:ae(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:localStorage.getItem("p1.lastEnvId")||null,envsLoading:!1,envsError:"",users:null,applications:null,dataLoading:!1},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},b=document.querySelector("#app");function U(e){e&&localStorage.setItem("p1.lastEnvId",e)}const w=new W({getPage:()=>a.activePage,setPage:e=>{a.activePage=e,u()},getState:()=>structuredClone(a.data),setState:e=>{a.data=e,u()},onRegisteredSetChange:e=>{a.webmcp.registeredTools=e,u()},getEnvironments:()=>a.p1.environments,setEnvironment:e=>{a.p1.selectedEnvId=e,U(e),a.p1.users=null,a.p1.applications=null,u(),x()}});a.webmcp.supported=w.initialize().supported;w.syncToolsForCurrentPage();function f(e){a.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),a.data.activity=a.data.activity.slice(0,12)}function ue(){const{config:e,pendingCallback:n,status:t}=a.auth,o=window.location.origin+window.location.pathname;return`
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
              <input name="redirectUri" value="${o}" readonly />
            </label>
            <button type="submit" class="login-button">${n?"Completing login...":"Login with PingOne"}</button>
          </form>
          <p class="auth-status">${t||""}</p>
          <p class="auth-endpoint">Authorize endpoint: ${e.envId?B(e.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `}function pe(){const{session:e,status:n}=a.auth;return e?`
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in as ${ce(e)||e.userInfo?.email||"Unknown user"}</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${n||""}</p>
    </div>
  `:""}function me(e){if(e==="console")return`
      <section class="panel">
        <h2>Environment Overview</h2>
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
    `;if(e==="userManagement"){const{users:n,dataLoading:t}=a.p1;let o;return t?o='<p class="data-loading">Loading users…</p>':n?n.length===0?o='<p class="data-empty">No users found in this environment.</p>':o=`
        <div class="table-like">
          <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
          ${n.map(r=>`
            <div class="row users-row">
              <span>${r.username??"—"}</span>
              <span>${[r.name?.given,r.name?.family].filter(Boolean).join(" ")||"—"}</span>
              <span>${r.email??"—"}</span>
              <span>${r.enabled?"Yes":"No"}</span>
              <span>${r.createdAt?new Date(r.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:o='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Users <span class="count-badge">${n?n.length:""}</span></h2>
        ${o}
      </section>
    `}if(e==="applicationManagement"){const{applications:n,dataLoading:t}=a.p1;let o;return t?o='<p class="data-loading">Loading applications…</p>':n?n.length===0?o='<p class="data-empty">No applications found in this environment.</p>':o=`
        <div class="table-like">
          <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
          ${n.map(r=>`
            <div class="row apps-row">
              <span>${r.name??"—"}</span>
              <span>${r.type??"—"}</span>
              <span>${r.protocol??"—"}</span>
              <span>${r.enabled?"Yes":"No"}</span>
              <span>${r.createdAt?new Date(r.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:o='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Applications <span class="count-badge">${n?n.length:""}</span></h2>
        ${o}
      </section>
    `}return`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(a.data.environments).map(([n,t])=>`<div class="row"><span>${n}</span><span>${t.nodes}</span><span>${String(t.maintenance)}</span><span>${t.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function ge(e,n){return Array.isArray(n.enum)?`
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
  `}function fe(e,n){return e.type==="boolean"?n==="true":e.type==="number"?Number(n):n}function he(){const e=w.listCurrentTools(),n={"console.open_page":"Open Admin Page","console.select_environment":"Select Environment","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return e.map(t=>{const o=t.inputSchema?.properties||{},r=Object.entries(o);return`
        <article class="tool-card">
          <header>
            <h3>${n[t.name]||t.name}</h3>
            <code>${t.name}</code>
          </header>
          <p>${t.description}</p>
          <form data-tool-name="${t.name}">
            ${r.map(([s,i])=>ge(s,i)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function ve(){b.querySelectorAll("[data-nav-page]").forEach(s=>{s.addEventListener("click",()=>{a.activePage=s.dataset.navPage,w.syncToolsForCurrentPage(),u()})});const n=b.querySelector("[data-env-picker]");n&&n.addEventListener("change",()=>{a.p1.selectedEnvId=n.value,U(a.p1.selectedEnvId),a.p1.users=null,a.p1.applications=null,u(),x()});const t=b.querySelector("form[data-auth-form]");t&&t.addEventListener("submit",async s=>{s.preventDefault();const i=new FormData(t),l=String(i.get("envId")||"").trim(),c=String(i.get("clientId")||"").trim(),d=String(i.get("redirectUri")||"").trim();a.auth.config={envId:l,clientId:c},F(a.auth.config);try{const p=await se({envId:l,clientId:c,redirectUri:d});a.auth.status="Redirecting to PingOne authorize endpoint...",u(),window.location.assign(p)}catch(p){const v=p instanceof Error?p.message:"Unknown OIDC error";a.auth.status=`Login setup failed: ${v}`,f({tool:"auth.login",result:a.auth.status}),u()}});const o=b.querySelector("[data-signout]");o&&o.addEventListener("click",()=>{oe(),a.auth.session=null,a.auth.status="Signed out.",f({tool:"auth.signout",result:"Session cleared from browser storage."}),u()}),b.querySelectorAll("form[data-tool-name]").forEach(s=>{s.addEventListener("submit",async i=>{i.preventDefault();const l=s.dataset.toolName,c=w.listCurrentTools().find(h=>h.name===l);if(!c)return;const d=c.inputSchema?.properties||{},p=new FormData(s),v={};Object.entries(d).forEach(([h,S])=>{v[h]=fe(S,String(p.get(h)??""))});const m=b.querySelector("#tool-output");try{const h=await w.invokeToolForDemo(l,v),S=JSON.stringify(h,null,2);f({tool:l,result:S}),m.textContent=S}catch(h){const S=h instanceof Error?h.message:"Unknown error";m.textContent=`Error: ${S}`,f({tool:l,result:`Error: ${S}`})}u()})})}function ye(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function be(){const{environments:e,selectedEnvId:n,envsLoading:t,envsError:o}=a.p1,r=e.find(s=>s.id===n);return`
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${t?'<span class="env-loading">Loading environments&hellip;</span>':o?`<span class="env-error">${o}</span>`:`<select id="env-picker" data-env-picker="true">
              ${e.length===0?'<option value="">No environments found</option>':e.map(s=>`<option value="${s.id}" ${s.id===n?"selected":""}>${s.name} (${s.type})</option>`).join("")}
             </select>
             ${r?ye(r.type):""}`}
      </div>
    </div>
  `}function Se(){return a.webmcp.supported?`WebMCP active: ${a.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function we(){return`
    ${be()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${G.map(e=>`
              <section class="nav-group ${e.id===a.activePage?"active":""}">
                <button data-nav-page="${e.id}">${e.title}</button>
                <ul>
                  ${e.options.map(n=>`<li>${n}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${pe()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${A(a.activePage)}</h2>
          </div>
          <div class="status-pill">${Se()}</div>
        </header>

        ${me(a.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${A(a.activePage)}.</p>
          <p class="registered-list">${a.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${he()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${a.data.activity.map(e=>`<li><strong>${e.tool}</strong><span>${e.at}</span><p>${e.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `}function u(){!!a.auth.session?b.innerHTML=we():b.innerHTML=ue(),ve()}async function $e(){a.auth.pendingCallback=!0,u();try{const e=await re();e.handled&&e.error&&(a.auth.status=e.error,f({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(a.auth.session=e.session,a.auth.status="Login successful. Tokens stored in localStorage.",f({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const n=e instanceof Error?e.message:"Unknown callback error";a.auth.status=`Callback handling failed: ${n}`,f({tool:"auth.callback",result:a.auth.status})}a.auth.pendingCallback=!1,await Ie(),a.auth.session&&await Ee(),u()}async function Ee(){if(a.auth.session){a.p1.envsLoading=!0,a.p1.envsError="",u();try{const e=await J(a.auth.session.accessToken);a.p1.environments=e,e.some(t=>t.id===a.p1.selectedEnvId)||(a.p1.selectedEnvId=e.length>0?e[0].id:null),a.p1.selectedEnvId&&U(a.p1.selectedEnvId),f({tool:"pingone.environments",result:`Loaded ${e.length} environment(s).`})}catch(e){const n=e instanceof Error?e.message:"Unknown error";a.p1.envsError=n,f({tool:"pingone.environments",result:`Error: ${n}`})}a.p1.envsLoading=!1,a.p1.selectedEnvId&&await x()}}async function x(){const{session:e}=a.auth,n=a.p1.selectedEnvId;if(!e||!n)return;a.p1.dataLoading=!0,u();const[t,o]=await Promise.allSettled([V(e.accessToken,n),K(e.accessToken,n)]);t.status==="fulfilled"?a.p1.users=t.value:f({tool:"pingone.users",result:`Error: ${t.reason?.message}`}),o.status==="fulfilled"?a.p1.applications=o.value:f({tool:"pingone.applications",result:`Error: ${o.reason?.message}`}),a.p1.dataLoading=!1,u()}async function Ie(){if(!a.auth.session||a.auth.session.userInfo)return;const e=de(a.auth.session),n=a.auth.session.envId;if(e&&n)try{const t=await Y(a.auth.session.accessToken,n,e);a.auth.session.userInfo={sub:t.id,preferred_username:t.username||t.email||"",username:t.username||"",name:[t.name?.given,t.name?.family].filter(Boolean).join(" ")||"",given_name:t.name?.given||"",family_name:t.name?.family||"",email:t.email||""},D(a.auth.session),u();return}catch{}try{const t=await ie(a.auth.session);a.auth.session.userInfo=t,D(a.auth.session),u()}catch{}}$e();
