(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const j={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},A={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(j)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},U={name:"console.select_environment",description:"Switch the active PingOne environment by name. The name must match one of the environments returned after login.",inputSchema:{type:"object",properties:{name:{type:"string",description:"The exact name of the PingOne environment to switch to."}},required:["name"],additionalProperties:!1},annotations:{readOnlyHint:!1}},te=[A,U],R={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.create_oidc_web_app_with_scopes",description:"Create an OIDC Web App and assign resource scopes in one workflow. If scopes are omitted, the tool can request them via elicitation.",inputSchema:{type:"object",properties:{appName:{type:"string"},redirectUri:{type:"string"},postLogoutRedirectUri:{type:"string"},scopesCsv:{type:"string",description:"Comma-separated scope names, for example: openid,profile,email"},resourceId:{type:"string"},tokenEndpointAuthMethod:{type:"string",enum:["NONE","CLIENT_SECRET_BASIC","CLIENT_SECRET_POST"]}},required:["appName","redirectUri"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function b(){return new Date().toLocaleTimeString()}function y(e,t){return{ok:!0,message:e,data:t}}function ne(e){return e===A.name?A:e===U.name?U:Object.values(R).flat().find(n=>n.name===e)||null}class ae{constructor({getPage:t,setPage:n,getState:a,setState:o,onRegisteredSetChange:s,getEnvironments:i,setEnvironment:p,createOidcWebAppWithScopes:c}){this.getPage=t,this.setPage=n,this.getState=a,this.setState=o,this.onRegisteredSetChange=s,this.getEnvironments=i,this.setEnvironment=p,this.createOidcWebAppWithScopes=c,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const t=this.getPage(),n=R[t]||[];return[...te,...n]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(t){return async(n={},a)=>this.executeTool(t,n,a)}toWebMCPTool(t){return{name:t.name,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations,execute:this.createExecutor(t.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const t=this.getDesiredTemplates(),n=new Set(t.map(a=>a.name));for(const a of this.registeredTools)if(!n.has(a)){try{this.modelContext.unregisterTool(a)}catch{}this.registeredTools.delete(a)}for(const a of t){if(this.registeredTools.has(a.name))continue;const o=this.toWebMCPTool(a);try{this.modelContext.registerTool(o),this.registeredTools.add(a.name)}catch{try{this.modelContext.unregisterTool(a.name),this.modelContext.registerTool(o),this.registeredTools.add(a.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(t,n={},a=null){if(t===A.name){if(!Object.prototype.hasOwnProperty.call(j,n.page))throw new Error(`Unknown page: ${n.page}`);return this.setPage(n.page),this.syncToolsForCurrentPage(),y("Navigation complete",{page:n.page,at:b()})}if(t===U.name){const p=this.getEnvironments?this.getEnvironments():[],c=String(n.name||"").toLowerCase().trim(),d=p.find(l=>l.name.toLowerCase()===c)||p.find(l=>l.name.toLowerCase().startsWith(c))||p.find(l=>l.name.toLowerCase().includes(c));if(!d){const l=p.map(u=>u.name).join(", ");return{ok:!1,message:`No environment matching "${n.name}".`,available:l||"No environments loaded yet."}}return this.setEnvironment(d.id),y("Environment switched",{id:d.id,name:d.name,at:b()})}const o=this.getPage();if(!(R[o]||[]).map(p=>p.name).includes(t))throw new Error(`Tool '${t}' is unavailable on page '${o}'.`);const i=this.getState();switch(t){case"app.create_oidc_web_app_with_scopes":{if(typeof this.createOidcWebAppWithScopes!="function")throw new Error("OIDC app workflow is not configured in this console.");return this.createOidcWebAppWithScopes(n,a)}case"user.create":{const p=`u-${Date.now().toString(36).slice(-5)}`;return i.users.push({id:p,name:n.name,role:n.role,status:"active"}),this.setState(i),y("User created",{id:p,...n,at:b()})}case"user.suspend":{const p=i.users.find(c=>c.id===n.userId);if(!p)throw new Error(`User '${n.userId}' not found.`);return p.status="suspended",p.suspensionReason=n.reason,this.setState(i),y("User suspended",{userId:n.userId,reason:n.reason,at:b()})}case"user.reset_mfa":return y("MFA reset issued",{userId:n.userId,at:b()});case"app.deploy":return i.deployments.unshift({appName:n.appName,version:n.version,targetEnv:n.targetEnv,status:"deployed",at:b()}),this.setState(i),y("Deployment completed",n);case"app.rollback":return i.deployments.unshift({appName:n.appName,version:"previous-stable",targetEnv:n.targetEnv,status:"rolled back",at:b()}),this.setState(i),y("Rollback completed",n);case"app.toggle_feature_flag":return i.flags[`${n.appName}:${n.flagName}`]=n.enabled,this.setState(i),y("Feature flag updated",n);case"env.maintenance_mode":return i.environments[n.environment].maintenance=n.enabled,this.setState(i),y("Maintenance mode changed",n);case"env.rotate_secrets":return i.environments[n.environment].lastSecretRotation=b(),this.setState(i),y("Secrets rotated",n);case"env.scale_cluster":return i.environments[n.environment].nodes=Number(n.nodeCount),this.setState(i),y("Cluster scaled",n);default:throw new Error(`Tool '${t}' not implemented.`)}}async invokeToolForDemo(t,n={}){const a=ne(t);if(!a)throw new Error(`Unknown tool '${t}'.`);return this.toWebMCPTool(a).execute(n,{requestUserInteraction:async s=>s()})}}function F(e){return j[e]||"Unknown"}const oe=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],$="https://api.pingone.com/v1";async function se(e){const t=await fetch(`${$}/environments`,{headers:{authorization:`Bearer ${e}`}});if(!t.ok){const a=await t.text();throw new Error(`GET /environments failed (${t.status}): ${a}`)}return(await t.json())._embedded?.environments??[]}async function re(e,t){const n=await fetch(`${$}/environments/${t}/users`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const o=await n.text();throw new Error(`GET /users failed (${n.status}): ${o}`)}return(await n.json())._embedded?.users??[]}async function ie(e,t){const n=await fetch(`${$}/environments/${t}/applications`,{headers:{authorization:`Bearer ${e}`}});if(!n.ok){const o=await n.text();throw new Error(`GET /applications failed (${n.status}): ${o}`)}return(await n.json())._embedded?.applications??[]}async function ce(e,t,n){const a=await fetch(`${$}/environments/${t}/users/${n}`,{headers:{authorization:`Bearer ${e}`}});if(!a.ok){const o=await a.text();throw new Error(`GET /users/${n} failed (${a.status}): ${o}`)}return a.json()}async function le(e,t,{expandScopes:n=!1}={}){const a=new URL(`${$}/environments/${t}/resources`);n&&a.searchParams.set("expand","scopes");const o=await fetch(a.toString(),{headers:{authorization:`Bearer ${e}`}});if(!o.ok){const i=await o.text();throw new Error(`GET /resources failed (${o.status}): ${i}`)}return(await o.json())._embedded?.resources??[]}async function pe(e,t,n){const a=await fetch(`${$}/environments/${t}/resources/${n}/scopes`,{headers:{authorization:`Bearer ${e}`}});if(!a.ok){const s=await a.text();throw new Error(`GET /resources/${n}/scopes failed (${a.status}): ${s}`)}return(await a.json())._embedded?.scopes??[]}async function de(e,t,n){const a=await fetch(`${$}/environments/${t}/applications`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(n)});if(!a.ok){const o=await a.text();throw new Error(`POST /applications failed (${a.status}): ${o}`)}return a.json()}async function ue(e,t,n,a,o){const s={resource:{id:a},scopes:o.map(p=>({id:p}))},i=await fetch(`${$}/environments/${t}/applications/${n}/grants`,{method:"POST",headers:{authorization:`Bearer ${e}`,"content-type":"application/json"},body:JSON.stringify(s)});if(!i.ok){const p=await i.text();throw new Error(`POST /applications/${n}/grants failed (${i.status}): ${p}`)}return i.json()}const J="p1.oidc.config",x="p1.oidc.session",q="p1.oidc.tx";function V(e){let t="";for(let n=0;n<e.length;n+=1)t+=String.fromCharCode(e[n]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}function H(e=48){const t=new Uint8Array(e);return crypto.getRandomValues(t),V(t)}async function me(e){const t=new TextEncoder().encode(e),n=await crypto.subtle.digest("SHA-256",t);return new Uint8Array(n)}function K(e,t){const n=localStorage.getItem(e);if(!n)return t;try{return JSON.parse(n)}catch{return t}}function B(e,t){localStorage.setItem(e,JSON.stringify(t))}function fe(){const e=sessionStorage.getItem(q);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function ge(e){sessionStorage.setItem(q,JSON.stringify(e))}function N(){sessionStorage.removeItem(q)}function _(){const e=new URL(window.location.href);e.searchParams.delete("code"),e.searchParams.delete("state"),e.searchParams.delete("error"),e.searchParams.delete("error_description"),history.replaceState({},document.title,e.toString())}function Y(e){return`https://auth.pingone.com/${e}/as/authorize`}function he(e){return`https://auth.pingone.com/${e}/as/token`}function ve(e){return`https://auth.pingone.com/${e}/as/userinfo`}function ye(){return K(J,{envId:"",clientId:""})}function X(e){B(J,{envId:String(e.envId||"").trim(),clientId:String(e.clientId||"").trim()})}function be(){return K(x,null)}function G(e){B(x,e)}function we(){localStorage.removeItem(x)}async function Se({envId:e,clientId:t,scope:n,redirectUri:a}){const o=String(e||"").trim(),s=String(t||"").trim(),i=String(n||"openid profile email").trim(),p=String(a||"").trim();if(!o||!s||!p)throw new Error("EnvID, ClientID, and redirect URI are required.");const c=H(24),d=H(64),l=await me(d),u=V(l);ge({envId:o,clientId:s,scope:i,redirectUri:p,state:c,codeVerifier:d,createdAt:Date.now()});const f=new URL(Y(o));return f.searchParams.set("response_type","code"),f.searchParams.set("client_id",s),f.searchParams.set("redirect_uri",p),f.searchParams.set("scope",i),f.searchParams.set("state",c),f.searchParams.set("code_challenge",u),f.searchParams.set("code_challenge_method","S256"),f.toString()}async function $e(){const e=new URL(window.location.href),t=e.searchParams.get("error"),n=e.searchParams.get("error_description")||"",a=e.searchParams.get("code"),o=e.searchParams.get("state");if(!t&&!a)return{handled:!1};if(t)return _(),N(),{handled:!0,error:`${t}${n?`: ${n}`:""}`};const s=fe();if(!s)return _(),{handled:!0,error:"Missing PKCE transaction. Start login again."};if(s.state!==o)return _(),N(),{handled:!0,error:"OIDC state mismatch. Start login again."};const i=new URLSearchParams;i.set("grant_type","authorization_code"),i.set("client_id",s.clientId),i.set("code",String(a)),i.set("redirect_uri",s.redirectUri),i.set("code_verifier",s.codeVerifier);const p=await fetch(he(s.envId),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:i.toString()});if(!p.ok){const u=await p.text();return _(),N(),{handled:!0,error:`Token exchange failed (${p.status}): ${u}`}}const c=await p.json(),d=Number(c.expires_in||0),l={envId:s.envId,clientId:s.clientId,scope:s.scope,tokenType:c.token_type||"Bearer",accessToken:c.access_token||"",idToken:c.id_token||"",refreshToken:c.refresh_token||"",expiresAt:d>0?Date.now()+d*1e3:null};return B(x,l),X({envId:s.envId,clientId:s.clientId,scope:s.scope}),_(),N(),{handled:!0,session:l}}async function Ee(e){const t=await fetch(ve(e.envId),{headers:{authorization:`Bearer ${e.accessToken}`}});if(!t.ok){const n=await t.text();throw new Error(`UserInfo failed (${t.status}): ${n}`)}return t.json()}function Ie(e){const t=e.replace(/-/g,"+").replace(/_/g,"/"),n=t.padEnd(Math.ceil(t.length/4)*4,"=");return atob(n)}function D(e){if(!e||typeof e!="string")return null;const t=e.split(".");if(t.length<2)return null;try{const n=Ie(t[1]);return JSON.parse(n)}catch{return null}}function Te(e){if(!e)return"";const n=e.userInfo?.preferred_username||e.userInfo?.username||e.userInfo?.name||[e.userInfo?.given_name,e.userInfo?.family_name].filter(Boolean).join(" ")||e.userInfo?.email;if(n)return String(n);const a=D(e.idToken),o=a?.preferred_username||a?.username||a?.name||[a?.given_name,a?.family_name].filter(Boolean).join(" ")||a?.email;return o?String(o):""}function Ce(e){if(!e)return"";if(e.userInfo?.sub)return String(e.userInfo.sub);const t=D(e.idToken);if(t?.sub)return String(t.sub);const n=D(e.accessToken);return n?.sub?String(n.sub):""}function Q(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function E(e){return String(e||"").trim().toLowerCase()}async function _e(e){if(!e||typeof e.requestUserInteraction!="function")return[];const t=await e.requestUserInteraction(async()=>window.prompt("Enter scopes (comma separated)","openid,profile,email")||"");return Q(t)}function Pe({state:e,render:t,addActivity:n,saveLastEnvId:a}){async function o(){const{session:c}=e.auth,d=e.p1.selectedEnvId;if(!c||!d)return;e.p1.dataLoading=!0,t();const[l,u]=await Promise.allSettled([re(c.accessToken,d),ie(c.accessToken,d)]);l.status==="fulfilled"?e.p1.users=l.value:n({tool:"pingone.users",result:`Error: ${l.reason?.message}`}),u.status==="fulfilled"?e.p1.applications=u.value:n({tool:"pingone.applications",result:`Error: ${u.reason?.message}`}),e.p1.dataLoading=!1,t()}async function s(){if(e.auth.session){e.p1.envsLoading=!0,e.p1.envsError="",t();try{const c=await se(e.auth.session.accessToken);e.p1.environments=c,c.some(l=>l.id===e.p1.selectedEnvId)||(e.p1.selectedEnvId=c.length>0?c[0].id:null),e.p1.selectedEnvId&&a(e.p1.selectedEnvId),n({tool:"pingone.environments",result:`Loaded ${c.length} environment(s).`})}catch(c){const d=c instanceof Error?c.message:"Unknown error";e.p1.envsError=d,n({tool:"pingone.environments",result:`Error: ${d}`})}e.p1.envsLoading=!1,e.p1.selectedEnvId&&await o()}}async function i(){if(!e.auth.session||e.auth.session.userInfo)return;const c=Ce(e.auth.session),d=e.auth.session.envId;if(c&&d)try{const l=await ce(e.auth.session.accessToken,d,c);e.auth.session.userInfo={sub:l.id,preferred_username:l.username||l.email||"",username:l.username||"",name:[l.name?.given,l.name?.family].filter(Boolean).join(" ")||"",given_name:l.name?.given||"",family_name:l.name?.family||"",email:l.email||""},G(e.auth.session),t();return}catch{}try{const l=await Ee(e.auth.session);e.auth.session.userInfo=l,G(e.auth.session),t()}catch{}}async function p(c,d){const l=e.auth.session;if(!l?.accessToken)return{ok:!1,message:"No access token available. Please sign in again."};const u=e.p1.selectedEnvId;if(!u)return{ok:!1,message:"No active environment selected."};let f=Q(c.scopesCsv);if(f.length===0&&(f=await _e(d)),f.length===0)return{ok:!1,message:"Scope list is required to configure application grants."};const h=await le(l.accessToken,u,{expandScopes:!0});if(h.length===0)return{ok:!1,message:"No resources found in selected environment."};let g=null;c.resourceId&&(g=h.find(m=>m.id===c.resourceId)||null),g||(g=h.find(m=>E(m.name)==="openid")||h.find(m=>E(m.type).includes("openid"))||h[0]);const O=Array.isArray(g?._embedded?.scopes)?g._embedded.scopes:await pe(l.accessToken,u,g.id),T=[],L=[];for(const m of f){const M=E(m),z=O.find(C=>E(C.name)===M)||O.find(C=>E(C.name).startsWith(M))||O.find(C=>E(C.name).includes(M));z?T.push(z):L.push(m)}if(T.length===0)return{ok:!1,message:"None of the requested scopes were found for the selected resource.",missingScopes:L,availableScopes:O.map(m=>m.name)};const Z={enabled:!0,name:String(c.appName||"").trim(),type:"WEB_APP",protocol:"OPENID_CONNECT",grantTypes:["AUTHORIZATION_CODE"],responseTypes:["CODE"],redirectUris:[String(c.redirectUri||"").trim()],postLogoutRedirectUris:[String(c.postLogoutRedirectUri||c.redirectUri||"").trim()],tokenEndpointAuthMethod:c.tokenEndpointAuthMethod||"CLIENT_SECRET_BASIC"},k=await de(l.accessToken,u,Z),ee=await ue(l.accessToken,u,k.id,g.id,T.map(m=>m.id));return await o(),n({tool:"app.create_oidc_web_app_with_scopes",result:`Created ${k.name} with scopes: ${T.map(m=>m.name).join(", ")}`}),{ok:!0,message:"OIDC web app created and scopes granted.",data:{appId:k.id,appName:k.name,environmentId:u,resourceId:g.id,grantId:ee.id,appliedScopes:T.map(m=>({id:m.id,name:m.name})),missingScopes:L}}}return{loadEnvData:o,loadEnvironments:s,hydrateUserIdentity:i,runCreateOidcWebAppWithScopes:p}}const r={activePage:"console",auth:{config:ye(),session:be(),pendingCallback:!1,status:""},webmcp:{supported:!1,registeredTools:[]},p1:{environments:[],selectedEnvId:localStorage.getItem("p1.lastEnvId")||null,envsLoading:!1,envsError:"",users:null,applications:null,dataLoading:!1},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},w=document.querySelector("#app");function W(e){e&&localStorage.setItem("p1.lastEnvId",e)}function S(e){r.data.activity.unshift({...e,at:new Date().toLocaleTimeString()}),r.data.activity=r.data.activity.slice(0,12)}const P=Pe({state:r,render:v,addActivity:S,saveLastEnvId:W}),I=new ae({getPage:()=>r.activePage,setPage:e=>{r.activePage=e,v()},getState:()=>structuredClone(r.data),setState:e=>{r.data=e,v()},onRegisteredSetChange:e=>{r.webmcp.registeredTools=e,v()},getEnvironments:()=>r.p1.environments,setEnvironment:e=>{r.p1.selectedEnvId=e,W(e),r.p1.users=null,r.p1.applications=null,v(),P.loadEnvData()},createOidcWebAppWithScopes:P.runCreateOidcWebAppWithScopes});r.webmcp.supported=I.initialize().supported;I.syncToolsForCurrentPage();function Oe(){const{config:e,pendingCallback:t,status:n}=r.auth,a=window.location.origin+window.location.pathname;return`
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
            <button type="submit" class="login-button">${t?"Completing login...":"Login with PingOne"}</button>
          </form>
          <p class="auth-status">${n||""}</p>
          <p class="auth-endpoint">Authorize endpoint: ${e.envId?Y(e.envId):"https://auth.pingone.com/<envId>/as/authorize"}</p>
        </section>
      </div>
    </div>
  `}function ke(){const{session:e,status:t}=r.auth;return e?`
    <div class="auth-header-bar">
      <div class="auth-badge">Signed in as ${Te(e)||e.userInfo?.email||"Unknown user"}</div>
      <div class="auth-header-actions">
        <button type="button" class="secondary danger" data-signout="true">Sign Out</button>
      </div>
      <p class="auth-header-status">${t||""}</p>
    </div>
  `:""}function Ne(e){if(e==="console")return`
      <section class="panel">
        <h2>Environment Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${r.p1.users===null?r.p1.dataLoading?"…":"—":r.p1.users.length}</p>
          </article>
          <article>
            <h3>Applications</h3>
            <p>${r.p1.applications===null?r.p1.dataLoading?"…":"—":r.p1.applications.length}</p>
          </article>
        </div>
      </section>
    `;if(e==="userManagement"){const{users:t,dataLoading:n}=r.p1;let a;return n?a='<p class="data-loading">Loading users…</p>':t?t.length===0?a='<p class="data-empty">No users found in this environment.</p>':a=`
        <div class="table-like">
          <div class="row users-row head"><span>Username</span><span>Name</span><span>Email</span><span>Enabled</span><span>Created</span></div>
          ${t.map(o=>`
            <div class="row users-row">
              <span>${o.username??"—"}</span>
              <span>${[o.name?.given,o.name?.family].filter(Boolean).join(" ")||"—"}</span>
              <span>${o.email??"—"}</span>
              <span>${o.enabled?"Yes":"No"}</span>
              <span>${o.createdAt?new Date(o.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:a='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Users <span class="count-badge">${t?t.length:""}</span></h2>
        ${a}
      </section>
    `}if(e==="applicationManagement"){const{applications:t,dataLoading:n}=r.p1;let a;return n?a='<p class="data-loading">Loading applications…</p>':t?t.length===0?a='<p class="data-empty">No applications found in this environment.</p>':a=`
        <div class="table-like">
          <div class="row apps-row head"><span>Name</span><span>Type</span><span>Protocol</span><span>Enabled</span><span>Created</span></div>
          ${t.map(o=>`
            <div class="row apps-row">
              <span>${o.name??"—"}</span>
              <span>${o.type??"—"}</span>
              <span>${o.protocol??"—"}</span>
              <span>${o.enabled?"Yes":"No"}</span>
              <span>${o.createdAt?new Date(o.createdAt).toLocaleDateString():"—"}</span>
            </div>`).join("")}
        </div>`:a='<p class="data-empty">No environment selected.</p>',`
      <section class="panel">
        <h2>Applications <span class="count-badge">${t?t.length:""}</span></h2>
        ${a}
      </section>
    `}return`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(r.data.environments).map(([t,n])=>`<div class="row"><span>${t}</span><span>${n.nodes}</span><span>${String(n.maintenance)}</span><span>${n.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function Ae(e,t){return Array.isArray(t.enum)?`
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
  `}function Ue(e,t){return e.type==="boolean"?t==="true":e.type==="number"?Number(t):t}function xe(){const e=I.listCurrentTools(),t={"console.open_page":"Open Admin Page","console.select_environment":"Select Environment","app.create_oidc_web_app_with_scopes":"Create OIDC Web App (with Scopes)","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return e.map(n=>{const a=n.inputSchema?.properties||{},o=Object.entries(a);return`
        <article class="tool-card">
          <header>
            <h3>${t[n.name]||n.name}</h3>
            <code>${n.name}</code>
          </header>
          <p>${n.description}</p>
          <form data-tool-name="${n.name}">
            ${o.map(([s,i])=>Ae(s,i)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function Le(){w.querySelectorAll("[data-nav-page]").forEach(s=>{s.addEventListener("click",()=>{r.activePage=s.dataset.navPage,I.syncToolsForCurrentPage(),v()})});const t=w.querySelector("[data-env-picker]");t&&t.addEventListener("change",()=>{r.p1.selectedEnvId=t.value,W(r.p1.selectedEnvId),r.p1.users=null,r.p1.applications=null,v(),P.loadEnvData()});const n=w.querySelector("form[data-auth-form]");n&&n.addEventListener("submit",async s=>{s.preventDefault();const i=new FormData(n),p=String(i.get("envId")||"").trim(),c=String(i.get("clientId")||"").trim(),d=String(i.get("redirectUri")||"").trim();r.auth.config={envId:p,clientId:c},X(r.auth.config);try{const l=await Se({envId:p,clientId:c,redirectUri:d});r.auth.status="Redirecting to PingOne authorize endpoint...",v(),window.location.assign(l)}catch(l){const u=l instanceof Error?l.message:"Unknown OIDC error";r.auth.status=`Login setup failed: ${u}`,S({tool:"auth.login",result:r.auth.status}),v()}});const a=w.querySelector("[data-signout]");a&&a.addEventListener("click",()=>{we(),r.auth.session=null,r.auth.status="Signed out.",S({tool:"auth.signout",result:"Session cleared from browser storage."}),v()}),w.querySelectorAll("form[data-tool-name]").forEach(s=>{s.addEventListener("submit",async i=>{i.preventDefault();const p=s.dataset.toolName,c=I.listCurrentTools().find(h=>h.name===p);if(!c)return;const d=c.inputSchema?.properties||{},l=new FormData(s),u={};Object.entries(d).forEach(([h,g])=>{u[h]=Ue(g,String(l.get(h)??""))});const f=w.querySelector("#tool-output");try{const h=await I.invokeToolForDemo(p,u),g=JSON.stringify(h,null,2);S({tool:p,result:g}),f.textContent=g}catch(h){const g=h instanceof Error?h.message:"Unknown error";f.textContent=`Error: ${g}`,S({tool:p,result:`Error: ${g}`})}v()})})}function Me(e){return`<span class="env-badge" style="background:${{PRODUCTION:"#d44540",SANDBOX:"#0a7a78"}[e]||"#5a646b"}">${e||"UNKNOWN"}</span>`}function Re(){const{environments:e,selectedEnvId:t,envsLoading:n,envsError:a}=r.p1,o=e.find(s=>s.id===t);return`
    <div class="top-nav-bar">
      <div class="top-nav-brand">PingOne Admin Console</div>
      <div class="top-nav-env">
        <label for="env-picker">Environment</label>
        ${n?'<span class="env-loading">Loading environments&hellip;</span>':a?`<span class="env-error">${a}</span>`:`<select id="env-picker" data-env-picker="true">
              ${e.length===0?'<option value="">No environments found</option>':e.map(s=>`<option value="${s.id}" ${s.id===t?"selected":""}>${s.name} (${s.type})</option>`).join("")}
             </select>
             ${o?Me(o.type):""}`}
      </div>
    </div>
  `}function De(){return r.webmcp.supported?`WebMCP active: ${r.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function je(){return`
    ${Re()}
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${oe.map(e=>`
              <section class="nav-group ${e.id===r.activePage?"active":""}">
                <button data-nav-page="${e.id}">${e.title}</button>
                <ul>
                  ${e.options.map(t=>`<li>${t}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        ${ke()}

        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${F(r.activePage)}</h2>
          </div>
          <div class="status-pill">${De()}</div>
        </header>

        ${Ne(r.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${F(r.activePage)}.</p>
          <p class="registered-list">${r.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${xe()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${r.data.activity.map(e=>`<li><strong>${e.tool}</strong><span>${e.at}</span><p>${e.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `}function v(){!!r.auth.session?w.innerHTML=je():w.innerHTML=Oe(),Le()}async function qe(){r.auth.pendingCallback=!0,v();try{const e=await $e();e.handled&&e.error&&(r.auth.status=e.error,S({tool:"auth.callback",result:e.error})),e.handled&&e.session&&(r.auth.session=e.session,r.auth.status="Login successful. Tokens stored in localStorage.",S({tool:"auth.callback",result:"OIDC login completed and token received."}))}catch(e){const t=e instanceof Error?e.message:"Unknown callback error";r.auth.status=`Callback handling failed: ${t}`,S({tool:"auth.callback",result:r.auth.status})}r.auth.pendingCallback=!1,await P.hydrateUserIdentity(),r.auth.session&&await P.loadEnvironments(),v()}qe();
