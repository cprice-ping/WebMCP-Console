(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function n(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(a){if(a.ep)return;a.ep=!0;const r=n(a);fetch(a.href,r)}})();const W={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},L={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(W)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},M={name:"console.select_environment",description:"Switch the active PingOne environment by name. The name must match one of the environments returned after login.",inputSchema:{type:"object",properties:{name:{type:"string",description:"The exact name of the PingOne environment to switch to."}},required:["name"],additionalProperties:!1},annotations:{readOnlyHint:!1}},te=[L,M],q={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.create_oidc_web_app_with_scopes",description:"Create an OIDC Web App and assign resource scopes in one workflow. If scopes are omitted, the tool can request them via elicitation.",inputSchema:{type:"object",properties:{appName:{type:"string"},redirectUri:{type:"string"},postLogoutRedirectUri:{type:"string"},scopesCsv:{type:"string",description:"Comma-separated scope names, for example: openid,profile,email"},resourceId:{type:"string"},tokenEndpointAuthMethod:{type:"string",enum:["NONE","CLIENT_SECRET_BASIC","CLIENT_SECRET_POST"]}},required:["appName","redirectUri"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function C(){return new Date().toLocaleTimeString()}function E(e,t){return{ok:!0,message:e,data:t}}function ne(e){return e===L.name?L:e===M.name?M:Object.values(q).flat().find(n=>n.name===e)||null}class oe{constructor({getPage:t,setPage:n,getState:o,setState:a,onRegisteredSetChange:r,getEnvironments:s,setEnvironment:p,createOidcWebAppWithScopes:i}){this.getPage=t,this.setPage=n,this.getState=o,this.setState=a,this.onRegisteredSetChange=r,this.getEnvironments=s,this.setEnvironment=p,this.createOidcWebAppWithScopes=i,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const t=this.getPage(),n=q[t]||[];return[...te,...n]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(t){return async(n={},o)=>this.executeTool(t,n,o)}toWebMCPTool(t){return{name:t.name,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations,execute:this.createExecutor(t.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const t=this.getDesiredTemplates(),n=new Set(t.map(o=>o.name));for(const o of this.registeredTools)if(!n.has(o)){try{this.modelContext.unregisterTool(o)}catch{}this.registeredTools.delete(o)}for(const o of t){if(this.registeredTools.has(o.name))continue;const a=this.toWebMCPTool(o);try{this.modelContext.registerTool(a),this.registeredTools.add(o.name)}catch{try{this.modelContext.unregisterTool(o.name),this.modelContext.registerTool(a),this.registeredTools.add(o.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(t,n={},o=null){if(t===L.name){if(!Object.prototype.hasOwnProperty.call(W,n.page))throw new Error(`Unknown page: ${n.page}`);return this.setPage(n.page),this.syncToolsForCurrentPage(),E("Navigation complete",{page:n.page,at:C()})}if(t===M.name){const p=this.getEnvironments?this.getEnvironments():[],i=String(n.name||"").toLowerCase().trim(),f=p.find(c=>c.name.toLowerCase()===i)||p.find(c=>c.name.toLowerCase().startsWith(i))||p.find(c=>c.name.toLowerCase().includes(i));if(!f){const c=p.map(v=>v.name).join(", ");return{ok:!1,message:`No environment matching "${n.name}".`,available:c||"No environments loaded yet."}}return this.setEnvironment(f.id),E("Environment switched",{id:f.id,name:f.name,at:C()})}const a=this.getPage();if(!(q[a]||[]).map(p=>p.name).includes(t))throw new Error(`Tool '${t}' is unavailable on page '${a}'.`);const s=this.getState();switch(t){case"app.create_oidc_web_app_with_scopes":{if(typeof this.createOidcWebAppWithScopes!="function")throw new Error("OIDC app workflow is not configured in this console.");return this.createOidcWebAppWithScopes(n,o)}case"user.create":{const p=`u-${Date.now().toString(36).slice(-5)}`;return s.users.push({id:p,name:n.name,role:n.role,status:"active"}),this.setState(s),E("User created",{id:p,...n,at:C()})}case"user.suspend":{const p=s.users.find(i=>i.id===n.userId);if(!p)throw new Error(`User '${n.userId}' not found.`);return p.status="suspended",p.suspensionReason=n.reason,this.setState(s),E("User suspended",{userId:n.userId,reason:n.reason,at:C()})}case"user.reset_mfa":return E("MFA reset issued",{userId:n.userId,at:C()});case"app.deploy":return s.deployments.unshift({appName:n.appName,version:n.version,targetEnv:n.targetEnv,status:"deployed",at:C()}),this.setState(s),E("Deployment completed",n);case"app.rollback":return s.deployments.unshift({appName:n.appName,version:"previous-stable",targetEnv:n.targetEnv,status:"rolled back",at:C()}),this.setState(s),E("Rollback completed",n);case"app.toggle_feature_flag":return s.flags[`${n.appName}:${n.flagName}`]=n.enabled,this.setState(s),E("Feature flag updated",n);case"env.maintenance_mode":return s.environments[n.environment].maintenance=n.enabled,this.setState(s),E("Maintenance mode changed",n);case"env.rotate_secrets":return s.environments[n.environment].lastSecretRotation=C(),this.setState(s),E("Secrets rotated",n);case"env.scale_cluster":return s.environments[n.environment].nodes=Number(n.nodeCount),this.setState(s),E("Cluster scaled",n);default:throw new Error(`Tool '${t}' not implemented.`)}}async invokeToolForDemo(t,n={}){const o=ne(t);if(!o)throw new Error(`Unknown tool '${t}'.`);return this.toWebMCPTool(o).execute(n,{requestUserInteraction:async r=>r()})}}function ae(e){return W[e]||"Unknown"}const se=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],P="https://api.pingone.com/v1";async function re(e){const t=await fetch(`${P}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const o=await t.text();throw new Error(`GET /environments failed (${t.status}): ${o}`)}return(await t.json())._embedded?.environments??[]}async function ie(e,t){const n=await fetch(`${P}/environments/${t}/users`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const a=await n.text();throw new Error(`GET /users failed (${n.status}): ${a}`)}return(await n.json())._embedded?.users??[]}async function ce(e,t){const n=await fetch(`${P}/environments/${t}/applications`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const a=await n.text();throw new Error(`GET /applications failed (${n.status}): ${a}`)}return(await n.json())._embedded?.applications??[]}async function le(e,t,n){const o=await fetch(`${P}/environments/${t}/users/${n}`,{headers:{authorization:`Bearer ${e}`}});if(!o.ok){const a=await o.text();throw new Error(`GET /users/${n} failed (${o.status}): ${a}`)}return o.json()}async function pe(e,t,{expandScopes:n=!1}={}){const o=new URL(`${P}/environments/${t}/resources`);n&&o.searchParams.set("expand","scopes");const a=await fetch(o.toString(),{headers:{authorization:`Bearer ${e}`}});if(!a.ok){const s=await a.text();throw new Error(`GET /resources failed (${a.status}): ${s}`)}return(await a.json())._embedded?.resources??[]}async function de(e,t,n){const o=await fetch(`${P}/environments/${t}/resources/${n}/scopes`,{headers:{authorization:`Bearer ${e}`}});if(!o.ok){const r=await o.text();throw new Error(`GET /resources/${n}/scopes failed (${o.status}): ${r}`)}return(await o.json())._embedded?.scopes??[]}async function ue(e,t,n){const o=await fetch(`${P}/environments/${t}/applications`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(n)});if(!o.ok){const a=await o.text();throw new Error(`POST /applications failed (${o.status}): ${a}`)}return o.json()}async function me(e,t,n,o,a){const r={resource:{id:o},scopes:a.map(p=>({id:p}))},s=await fetch(`${P}/environments/${t}/applications/${n}/grants`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(r)});if(!s.ok){const p=await s.text();throw new Error(`POST /applications/${n}/grants failed (${s.status}): ${p}`)}return s.json()}const K="p1.oidc.config",R="p1.oidc.session",z="p1.oidc.tx";function Y(e){let t="";for(let n=0;n<e.length;n+=1)t+=String.fromCharCode(e[n]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function G(e=48){const t=new Uint8Array(e);return crypto.getRandomValues(t),Y(t)}async function fe(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return new Uint8Array(n)}function X(e,t){const n=localStorage.getItem(e);if(!n)return t;try{return JSON.parse(n)}catch{return t}}function F(e,t){localStorage.setItem(e,JSON.stringify(t))}function he(){const e=sessionStorage.getItem(z);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function ge(e){sessionStorage.setItem(z,JSON.stringify(e))}function x(){sessionStorage.removeItem(z)}function N(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function Q(e){return`https://auth.pingone.com/${e}/as/authorize`}function ve(e){return`https://auth.pingone.com/${e}/as/token`}function ye(e){return`https://auth.pingone.com/${e}/as/userinfo`}function be(){return X(K,{envId:"",clientId:""})}function Z(e){F(K,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim()})}function we(){return X(R,null)}function J(e){F(R,e)}function Se(){localStorage.removeItem(R)}async function $e({envId:e,clientId:t,scope:n,redirectUri:o}){const a=String(e||"").trim(),r=String(t||"").trim(),s=String(n||"openid profile email").trim(),p=String(o||"").trim();if(!a||!r||!p)throw new Error("EnvID, ClientID, and redirect URI are required.");const i=G(24),f=G(64),c=await fe(f),v=Y(c);ge({envId:a,clientId:r,scope:s,redirectUri:p,state:i,codeVerifier:f,createdAt:Date.now()});const b=new URL(Q(a));return b.searchParams.set("response_type","code"),b.searchParams.set("client_id",r),b.searchParams.set("redirect_uri",p),b.searchParams.set("scope",s),b.searchParams.set("state",i),b.searchParams.set("code_challenge",v),b.searchParams.set("code_challenge_method","S256"),b.toString()}async function Ee(){const e=new URL(window.location.href),t=e.searchParams.get("error"),n=e.searchParams.get("error_description")||"",o=e.searchParams.get("code"),a=e.searchParams.get("state");if(!t&&!o)return{handled:!1};if(t)return N(),x(),{handled:!0,error:`${t}${n?`: ${n}`:""}`};const r=he();if(!r)return N(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(r.state!==a)return N(),x(),{handled:!0,error:"OIDC state mismatch. Start login again."};const s=new URLSearchParams;s.set("grant_type","authorization_code"),s.set("client_id",r.clientId),s.set("code",String(o)),s.set("redirect_uri",r.redirectUri),s.set("code_verifier",r.codeVerifier);const p=await fetch(ve(r.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:s.toString()});if(!p.ok){const v=await p.text();return N(),x(),{handled:!0,error:`Token exchange failed (${p.status}): ${v}`}}const i=await p.json(),f=Number(i.expires_in||0),c={envId:r.envId,clientId:r.clientId,scope:r.scope,tokenType:i.token_type||"Bearer",accessToken:i.access_token||"",idToken:i.id_token||"",refreshToken:i.refresh_token||"",expiresAt:f>0?Date.now()+f*1e3:null};return F(R,c),Z({envId:r.envId,clientId:r.clientId,scope:r.scope}),N(),x(),{handled:!0,session:c}}async function Ie(e){const t=await fetch(ye(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!t.ok){const n=await t.text();throw new Error(`UserInfo failed (${t.status}): ${n}`)}return t.json()}function Te(e){const t=e.replace(/-/g,"+").replace(/_/g,"/"),n=t.padEnd(Math.ceil(t.length/4)*4,"=");return atob(n)}function B(e){if(!e||typeof e!="string")return null;const t=e.split(".");if(t.length<2)return null;try{const n=Te(t[1]);return JSON.parse(n)}catch{return null}}function Ce(e){if(!e)return"";const n=e.userInfo?.preferred_username||e.userInfo?.username||e.userInfo?.name||[e.userInfo?.given_name,e.userInfo?.family_name].filter(Boolean).join(" ")||e.userInfo?.email;if(n)return String(n);const o=B(e.idToken),a=o?.preferred_username||o?.username||o?.name||[o?.given_name,o?.family_name].filter(Boolean).join(" ")||o?.email;return a?String(a):""}function _e(e){if(!e)return"";if(e.userInfo?.sub)return String(e.userInfo.sub);const t=B(e.idToken);if(t?.sub)return String(t.sub);const n=B(e.accessToken);return n?.sub?String(n.sub):""}function ee(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function k(e){return String(e||"").trim().toLowerCase()}async function Pe(e){if(!e||typeof e.requestUserInteraction!="function")return[];const t=await e.requestUserInteraction(async()=>window.prompt("Enter scopes (comma separated)","openid,profile,email")||"");return ee(t)}function Oe({state:e,render:t,addActivity:n,saveLastEnvId:o}){async function a(){const{session:i}=e.auth,f=e.p1.selectedEnvId;if(!i||!f)return;e.p1.dataLoading=!0,t();const[c,v]=await Promise.allSettled([ie(i.accessToken,f),ce(i.accessToken,f)]);c.status==="fulfilled"?e.p1.users=c.value:n({tool:"pingone.users",result:`Error: ${c.reason?.message}`}),v.status==="fulfilled"?e.p1.applications=v.value:n({tool:"pingone.applications",result:`Error: ${v.reason?.message}`}),e.p1.dataLoading=!1,t()}async function r(){if(e.auth.session){e.p1.envsLoading=!0,e.p1.envsError="",t();try{const i=await re(e.auth.session.accessToken);e.p1.environments=i,i.some(c=>c.id===e.p1.selectedEnvId)||(e.p1.selectedEnvId=i.length>0?i[0].id:null),e.p1.selectedEnvId&&o(e.p1.selectedEnvId),n({tool:"pingone.environments",result:`Loaded ${i.length} environment(s).`})}catch(i){const f=i instanceof Error?i.message:"Unknown error";e.p1.envsError=f,n({tool:"pingone.environments",result:`Error: ${f}`})}e.p1.envsLoading=!1,e.p1.selectedEnvId&&await a()}}async function s(){if(!e.auth.session||e.auth.session.userInfo)return;const i=_e(e.auth.session),f=e.auth.session.envId;if(i&&f)try{const c=await le(e.auth.session.accessToken,f,i);e.auth.session.userInfo={sub:c.id,preferred_username:c.username||c.email||"",username:c.username||"",name:[c.name?.given,c.name?.family].filter(Boolean).join(" ")||"",given_name:c.name?.given||"",family_name:c.name?.family||"",email:c.email||""},J(e.auth.session),t();return}catch{}try{const c=await Ie(e.auth.session);e.auth.session.userInfo=c,J(e.auth.session),t()}catch{}}async function p(i,f){const c=e.auth.session;if(!c?.accessToken)return{ok:!1,message:"No access token available. Please sign in again."};const v=e.p1.selectedEnvId;if(!v)return{ok:!1,message:"No active environment selected."};let b=ee(i.scopesCsv);if(b.length===0&&(b=await Pe(f)),b.length===0)return{ok:!1,message:"Scope list is required to configure application grants."};const l=await pe(c.accessToken,v,{expandScopes:!0});if(l.length===0)return{ok:!1,message:"No resources found in selected environment."};let d=null;i.resourceId&&(d=l.find(y=>y.id===i.resourceId)||null),d||(d=l.find(y=>k(y.name)==="openid")||l.find(y=>k(y.type).includes("openid"))||l[0]);const u=Array.isArray(d?._embedded?.scopes)?d._embedded.scopes:await de(c.accessToken,v,d.id),h=[],m=[];for(const y of b){const O=k(y),$=u.find(S=>k(S.name)===O)||u.find(S=>k(S.name).startsWith(O))||u.find(S=>k(S.name).includes(O));$?h.push($):m.push(y)}if(h.length===0)return{ok:!1,message:"None of the requested scopes were found for the selected resource.",missingScopes:m,availableScopes:u.map(y=>y.name)};const w={enabled:!0,name:String(i.appName||"").trim(),type:"WEB_APP",protocol:"OPENID_CONNECT",grantTypes:["AUTHORIZATION_CODE"],responseTypes:["CODE"],redirectUris:[String(i.redirectUri||"").trim()],postLogoutRedirectUris:[String(i.postLogoutRedirectUri||i.redirectUri||"").trim()],tokenEndpointAuthMethod:i.tokenEndpointAuthMethod||"CLIENT_SECRET_BASIC"},I=await ue(c.accessToken,v,w),T=await me(c.accessToken,v,I.id,d.id,h.map(y=>y.id));return await a(),n({tool:"app.create_oidc_web_app_with_scopes",result:`Created ${I.name} with scopes: ${h.map(y=>y.name).join(", ")}`}),{ok:!0,message:"OIDC web app created and scopes granted.",data:{appId:I.id,appName:I.name,environmentId:v,resourceId:d.id,grantId:T.id,appliedScopes:h.map(y=>({id:y.id,name:y.name})),missingScopes:m}}}return{loadEnvData:a,loadEnvironments:r,hydrateUserIdentity:s,runCreateOidcWebAppWithScopes:p}}function ke(e,t){return e.type==="boolean"?t==="true":e.type==="number"?Number(t):t}function Ne({app:e,state:t,registry:n,render:o,workflows:a,saveLastEnvId:r,saveOidcConfig:s,buildAuthorizationUrl:p,clearOidcSession:i,addActivity:f}){e.querySelectorAll("[data-nav-page]").forEach(u=>{u.addEventListener("click",()=>{t.activePage=u.dataset.navPage,n.syncToolsForCurrentPage(),o()})});const v=e.querySelector("[data-env-picker]");v&&v.addEventListener("change",()=>{t.p1.selectedEnvId=v.value,r(t.p1.selectedEnvId),t.p1.users=null,t.p1.applications=null,o(),a.loadEnvData()});const b=e.querySelector("form[data-auth-form]");b&&b.addEventListener("submit",async u=>{u.preventDefault();const h=new FormData(b),m=String(h.get("envId")||"").trim(),w=String(h.get("clientId")||"").trim(),I=String(h.get("redirectUri")||"").trim();t.auth.config={envId:m,clientId:w},s(t.auth.config);try{const T=await p({envId:m,clientId:w,redirectUri:I});t.auth.status="Redirecting to PingOne authorize endpoint...",o(),window.location.assign(T)}catch(T){const y=T instanceof Error?T.message:"Unknown OIDC error";t.auth.status=`Login setup failed: ${y}`,f({tool:"auth.login",result:t.auth.status}),o()}});const l=e.querySelector("[data-signout]");l&&l.addEventListener("click",()=>{i(),t.auth.session=null,t.auth.status="Signed out.",f({tool:"auth.signout",result:"Session cleared from browser storage."}),o()}),e.querySelectorAll("form[data-tool-name]").forEach(u=>{u.addEventListener("submit",async h=>{h.preventDefault();const m=u.dataset.toolName,w=n.listCurrentTools().find($=>$.name===m);if(!w)return;const I=w.inputSchema?.properties||{},T=new FormData(u),y={};Object.entries(I).forEach(([$,S])=>{y[$]=ke(S,String(T.get($)??""))});const O=e.querySelector("#tool-output");try{const $=await n.invokeToolForDemo(m,y),S=JSON.stringify($,null,2);f({tool:m,result:S}),O.textContent=S}catch($){const S=$ instanceof Error?$.message:"Unknown error";O.textContent=`Error: ${S}`,f({tool:m,result:`Error: ${S}`})}o()})})}function Ae(e,t){return Array.isArray(t.enum)?`
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
  `}function Ue(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function xe({state:e,registry:t,navItems:n,pageLabel:o,getPreferredUsername:a,getAuthzEndpoint:r}){function s(){const{config:l,pendingCallback:d,status:u}=e.auth,h=window.location.origin+window.location.pathname;return`
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
                <input name="envId" value="${l.envId}" placeholder="2087f9ab-c416-45c4-92f1-22bbc894407c" required />
              </label>
              <label>
                OIDC ClientID
                <input name="clientId" value="${l.clientId}" placeholder="9691a97b-0a88-49d5-b566-44ca4750b244" required />
              </label>
              <label>
                Redirect URI
                <input name="redirectUri" value="${h}" readonly />
              </label>
              <button type="submit" class="login-button">${d?"Completing login...":"Login with PingOne"}</button>
            </form>
            <p class="auth-status">${u||""}</p>
            <p class="auth-endpoint">Authorize endpoint: ${l.envId?r(l.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
          </section>
        </div>
      </div>
    `}function p(){const{session:l,status:d}=e.auth;return l?`
      <div class="auth-header-bar">
        <div class="auth-badge">Signed in as ${a(l)||l.userInfo?.email||"Unknown user"}</div>
        <div class="auth-header-actions">
          <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
        </div>
        <p class="auth-header-status">${d||""}</p>
      </div>
    `:""}function i(l){if(l==="console")return`
        <section class="panel">
          <h2>Environment Overview</h2>
          <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
          <div class="stats-grid">
            <article>
              <h3>Users</h3>
              <p>${e.p1.users===null?e.p1.dataLoading?"…":"—":e.p1.users.length}</p>
            </article>
            <article>
              <h3>Applications</h3>
              <p>${e.p1.applications===null?e.p1.dataLoading?"…":"—":e.p1.applications.length}</p>
            </article>
          </div>
        </section>
      `;if(l==="userManagement"){const{users:d,dataLoading:u}=e.p1;let h;return u?h='<p class="data-loading">Loading users…</p>':d?d.length===0?h='<p class="data-empty">No users found in this environment.</p>':h=`
          <div class="table-like">
            <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
            ${d.map(m=>`
              <div class="row users-row">
                <span>${m.username??"—"}</span>
                <span>${[m.name?.given,m.name?.family].filter(Boolean).join(" ")||"—"}</span>
                <span>${m.email??"—"}</span>
                <span>${m.enabled?"Yes":"No"}</span>
                <span>${m.createdAt?new Date(m.createdAt).toLocaleDateString():"—"}</span>
              </div>`).join("")}
          </div>`:h='<p class="data-empty">No environment selected.</p>',`
        <section class="panel">
          <h2>Users <span class="count-badge">${d?d.length:""}</span></h2>
          ${h}
        </section>
      `}if(l==="applicationManagement"){const{applications:d,dataLoading:u}=e.p1;let h;return u?h='<p class="data-loading">Loading applications…</p>':d?d.length===0?h='<p class="data-empty">No applications found in this environment.</p>':h=`
          <div class="table-like">
            <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
            ${d.map(m=>`
              <div class="row apps-row">
                <span>${m.name??"—"}</span>
                <span>${m.type??"—"}</span>
                <span>${m.protocol??"—"}</span>
                <span>${m.enabled?"Yes":"No"}</span>
                <span>${m.createdAt?new Date(m.createdAt).toLocaleDateString():"—"}</span>
              </div>`).join("")}
          </div>`:h='<p class="data-empty">No environment selected.</p>',`
        <section class="panel">
          <h2>Applications <span class="count-badge">${d?d.length:""}</span></h2>
          ${h}
        </section>
      `}return`
      <section class="panel">
        <h2>Environment Matrix</h2>
        <div class="table-like">
          <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
          ${Object.entries(e.data.environments).map(([d,u])=>`<div class="row"><span>${d}</span><span>${u.nodes}</span><span>${String(u.maintenance)}</span><span>${u.lastSecretRotation}</span></div>`).join("")}
        </div>
      </section>
    `}function f(){const l=t.listCurrentTools(),d={"console.open_page":"Open Admin Page","console.select_environment":"Select Environment","app.create_oidc_web_app_with_scopes":"Create OIDC Web App (with Scopes)","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return l.map(u=>{const h=u.inputSchema?.properties||{},m=Object.entries(h);return`
          <article class="tool-card">
            <header>
              <h3>${d[u.name]||u.name}</h3>
              <code>${u.name}</code>
            </header>
            <p>${u.description}</p>
            <form data-tool-name="${u.name}">
              ${m.map(([w,I])=>Ae(w,I)).join("")}
              <button type="submit">Run Tool</button>
            </form>
          </article>
        `}).join("")}function c(){const{environments:l,selectedEnvId:d,envsLoading:u,envsError:h}=e.p1,m=l.find(w=>w.id===d);return`
      <div class="top-nav-bar">
        <div class="top-nav-brand">PingOne Admin Console</div>
        <div class="top-nav-env">
          <label for="env-picker">Environment</label>
          ${u?'<span class="env-loading">Loading environments&hellip;</span>':h?`<span class="env-error">${h}</span>`:`<select id="env-picker" data-env-picker="true">
                ${l.length===0?'<option value="">No environments found</option>':l.map(w=>`<option value="${w.id}" ${w.id===d?"selected":""}>${w.name} (${w.type})</option>`).join("")}
               </select>
               ${m?Ue(m.type):""}`}
        </div>
      </div>
    `}function v(){return e.webmcp.supported?`WebMCP active: ${e.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function b(){return`
      ${c()}
      <div class="console-shell">
        <aside class="left-nav">
          <h1>Admin Console</h1>
          <p class="subtitle">WebMCP Demo</p>
          <nav>
            ${n.map(l=>`
                <section class="nav-group ${l.id===e.activePage?"active":""}">
                  <button data-nav-page="${l.id}">${l.title}</button>
                  <ul>
                    ${l.options.map(d=>`<li>${d}</li>`).join("")}
                  </ul>
                </section>
              `).join("")}
          </nav>
        </aside>

        <main class="main-view">
          ${p()}

          <header class="main-header">
            <div>
              <p class="eyebrow">Current Page</p>
              <h2>${o(e.activePage)}</h2>
            </div>
            <div class="status-pill">${v()}</div>
          </header>

          ${i(e.activePage)}

          <section class="panel output-panel">
            <h2>Tool Output</h2>
            <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
          </section>
        </main>

        <aside class="tools-pane">
          <header>
            <h2>WebMCP Tools</h2>
            <p>Registered with navigator.modelContext for ${o(e.activePage)}.</p>
            <p class="registered-list">${e.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
          </header>
          <div class="tool-list">
            ${f()}
          </div>
          <section class="activity-log">
            <h3>Recent Activity</h3>
            <ul>
              ${e.data.activity.map(l=>`<li><strong>${l.tool}</strong><span>${l.at}</span><p>${l.result}</p></li>`).join("")}
            </ul>
          </section>
        </aside>
      </div>
    `}return{loginPageMarkup:s,renderConsoleShell:b}}const g={activePage:"console",auth:{config:be(),session:we(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:localStorage.getItem("p1.lastEnvId")||null,envsLoading:!1,envsError:"",users:null,applications:null,dataLoading:!1},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},j=document.querySelector("#app");function H(e){e&&localStorage.setItem("p1.lastEnvId",e)}function A(e){g.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),g.data.activity=g.data.activity.slice(0,12)}const U=Oe({state:g,render:_,addActivity:A,saveLastEnvId:H}),D=new oe({getPage:()=>g.activePage,setPage:e=>{g.activePage=e,_()},getState:()=>structuredClone(g.data),setState:e=>{g.data=e,_()},onRegisteredSetChange:e=>{g.webmcp.registeredTools=e,_()},getEnvironments:()=>g.p1.environments,setEnvironment:e=>{g.p1.selectedEnvId=e,H(e),g.p1.users=null,g.p1.applications=null,_(),U.loadEnvData()},createOidcWebAppWithScopes:U.runCreateOidcWebAppWithScopes}),V=xe({state:g,registry:D,navItems:se,pageLabel:ae,getPreferredUsername:Ce,getAuthzEndpoint:Q});g.webmcp.supported=D.initialize().supported;D.syncToolsForCurrentPage();function _(){!!g.auth.session?j.innerHTML=V.renderConsoleShell():j.innerHTML=V.loginPageMarkup(),Ne({app:j,state:g,registry:D,render:_,workflows:U,saveLastEnvId:H,saveOidcConfig:Z,buildAuthorizationUrl:$e,clearOidcSession:Se,addActivity:A})}async function Le(){g.auth.pendingCallback=!0,_();try{const e=await Ee();e.handled&&e.error&&(g.auth.status=e.error,A({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(g.auth.session=e.session,g.auth.status="Login successful. Tokens stored in localStorage.",A({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const t=e instanceof Error?e.message:"Unknown callback error";g.auth.status=`Callback handling failed: ${t}`,A({tool:"auth.callback",result:g.auth.status})}g.auth.pendingCallback=!1,await U.hydrateUserIdentity(),g.auth.session&&await U.loadEnvironments(),_()}Le();
