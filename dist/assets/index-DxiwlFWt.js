(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();const y={console:"Console",userManagement:"User Management",applicationManagement:"Application Management",environmentManagement:"Environment Management"},v={name:"console.open_page",description:"Navigate to an Admin Console page from the left navigation.",inputSchema:{type:"object",properties:{page:{type:"string",enum:Object.keys(y)}},required:["page"],additionalProperties:!1},annotations:{readOnlyHint:!1}},f={userManagement:[{name:"user.create",description:"Create a new user with a role.",inputSchema:{type:"object",properties:{name:{type:"string"},role:{type:"string",enum:["viewer","operator","admin"]}},required:["name","role"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.suspend",description:"Suspend an existing user account.",inputSchema:{type:"object",properties:{userId:{type:"string"},reason:{type:"string"}},required:["userId","reason"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"user.reset_mfa",description:"Reset multi-factor authentication for a user.",inputSchema:{type:"object",properties:{userId:{type:"string"}},required:["userId"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],applicationManagement:[{name:"app.deploy",description:"Deploy a specific application version to an environment.",inputSchema:{type:"object",properties:{appName:{type:"string"},version:{type:"string"},targetEnv:{type:"string",enum:["dev","staging","prod"]}},required:["appName","version","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.rollback",description:"Rollback an application to the previous stable release.",inputSchema:{type:"object",properties:{appName:{type:"string"},targetEnv:{type:"string",enum:["staging","prod"]}},required:["appName","targetEnv"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"app.toggle_feature_flag",description:"Enable or disable an application feature flag.",inputSchema:{type:"object",properties:{appName:{type:"string"},flagName:{type:"string"},enabled:{type:"boolean"}},required:["appName","flagName","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}}],environmentManagement:[{name:"env.maintenance_mode",description:"Enable or disable maintenance mode in an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},enabled:{type:"boolean"}},required:["environment","enabled"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.rotate_secrets",description:"Rotate secrets for a target environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},scope:{type:"string",enum:["database","api","all"]}},required:["environment","scope"],additionalProperties:!1},annotations:{readOnlyHint:!1}},{name:"env.scale_cluster",description:"Adjust cluster node count for an environment.",inputSchema:{type:"object",properties:{environment:{type:"string",enum:["dev","staging","prod"]},nodeCount:{type:"number",minimum:1,maximum:50}},required:["environment","nodeCount"],additionalProperties:!1},annotations:{readOnlyHint:!1}}]};function d(){return new Date().toLocaleTimeString()}function l(n,t){return{ok:!0,message:n,data:t}}function C(n){return n===v.name?v:Object.values(f).flat().find(e=>e.name===n)||null}class P{constructor({getPage:t,setPage:e,getState:s,setState:o,onRegisteredSetChange:a}){this.getPage=t,this.setPage=e,this.getState=s,this.setState=o,this.onRegisteredSetChange=a,this.registeredTools=new Set,this.modelContext=null}initialize(){return this.modelContext=navigator.modelContext||null,{supported:!!this.modelContext,transport:"navigator.modelContext"}}getDesiredTemplates(){const t=this.getPage(),e=f[t]||[];return[v,...e]}listCurrentTools(){return this.getDesiredTemplates()}createExecutor(t){return async(e={},s)=>this.executeTool(t,e)}toWebMCPTool(t){return{name:t.name,description:t.description,inputSchema:t.inputSchema,annotations:t.annotations,execute:this.createExecutor(t.name)}}notifyRegisteredSetChange(){typeof this.onRegisteredSetChange=="function"&&this.onRegisteredSetChange(Array.from(this.registeredTools.values()).sort())}syncToolsForCurrentPage(){if(!this.modelContext)return;const t=this.getDesiredTemplates(),e=new Set(t.map(s=>s.name));for(const s of this.registeredTools)if(!e.has(s)){try{this.modelContext.unregisterTool(s)}catch{}this.registeredTools.delete(s)}for(const s of t){if(this.registeredTools.has(s.name))continue;const o=this.toWebMCPTool(s);try{this.modelContext.registerTool(o),this.registeredTools.add(s.name)}catch{try{this.modelContext.unregisterTool(s.name),this.modelContext.registerTool(o),this.registeredTools.add(s.name)}catch{}}}this.notifyRegisteredSetChange()}async executeTool(t,e={}){if(t===v.name){if(!Object.prototype.hasOwnProperty.call(y,e.page))throw new Error(`Unknown page: ${e.page}`);return this.setPage(e.page),this.syncToolsForCurrentPage(),l("Navigation complete",{page:e.page,at:d()})}const s=this.getPage();if(!(f[s]||[]).map(i=>i.name).includes(t))throw new Error(`Tool '${t}' is unavailable on page '${s}'.`);const a=this.getState();switch(t){case"user.create":{const i=`u-${Date.now().toString(36).slice(-5)}`;return a.users.push({id:i,name:e.name,role:e.role,status:"active"}),this.setState(a),l("User created",{id:i,...e,at:d()})}case"user.suspend":{const i=a.users.find(h=>h.id===e.userId);if(!i)throw new Error(`User '${e.userId}' not found.`);return i.status="suspended",i.suspensionReason=e.reason,this.setState(a),l("User suspended",{userId:e.userId,reason:e.reason,at:d()})}case"user.reset_mfa":return l("MFA reset issued",{userId:e.userId,at:d()});case"app.deploy":return a.deployments.unshift({appName:e.appName,version:e.version,targetEnv:e.targetEnv,status:"deployed",at:d()}),this.setState(a),l("Deployment completed",e);case"app.rollback":return a.deployments.unshift({appName:e.appName,version:"previous-stable",targetEnv:e.targetEnv,status:"rolled back",at:d()}),this.setState(a),l("Rollback completed",e);case"app.toggle_feature_flag":return a.flags[`${e.appName}:${e.flagName}`]=e.enabled,this.setState(a),l("Feature flag updated",e);case"env.maintenance_mode":return a.environments[e.environment].maintenance=e.enabled,this.setState(a),l("Maintenance mode changed",e);case"env.rotate_secrets":return a.environments[e.environment].lastSecretRotation=d(),this.setState(a),l("Secrets rotated",e);case"env.scale_cluster":return a.environments[e.environment].nodes=Number(e.nodeCount),this.setState(a),l("Cluster scaled",e);default:throw new Error(`Tool '${t}' not implemented.`)}}async invokeToolForDemo(t,e={}){const s=C(t);if(!s)throw new Error(`Unknown tool '${t}'.`);return this.toWebMCPTool(s).execute(e,{requestUserInteraction:async a=>a()})}}function T(n){return y[n]||"Unknown"}const w=[{id:"console",title:"Console",options:["Overview","Activity"]},{id:"userManagement",title:"User Management",options:["Users","Roles","Sessions"]},{id:"applicationManagement",title:"Application Management",options:["Deployments","Feature Flags","Pipelines"]},{id:"environmentManagement",title:"Environment Management",options:["Clusters","Secrets","Maintenance"]}],r={activePage:"console",webmcp:{supported:!1,registeredTools:[]},data:{users:[{id:"u-1001",name:"Alice",role:"admin",status:"active"},{id:"u-1002",name:"Ben",role:"operator",status:"active"}],deployments:[{appName:"Portal",version:"v2.4.0",targetEnv:"prod",status:"deployed",at:"09:05:12"}],flags:{"Portal:betaDashboard":!0},environments:{dev:{maintenance:!1,nodes:2,lastSecretRotation:"08:17:22"},staging:{maintenance:!1,nodes:4,lastSecretRotation:"08:45:09"},prod:{maintenance:!1,nodes:8,lastSecretRotation:"07:53:14"}},activity:[]}},g=document.querySelector("#app"),u=new P({getPage:()=>r.activePage,setPage:n=>{r.activePage=n,m()},getState:()=>structuredClone(r.data),setState:n=>{r.data=n,m()},onRegisteredSetChange:n=>{r.webmcp.registeredTools=n,m()}});r.webmcp.supported=u.initialize().supported;u.syncToolsForCurrentPage();function $(n){r.data.activity.unshift({...n,at:new Date().toLocaleTimeString()}),r.data.activity=r.data.activity.slice(0,12)}function E(n){return n==="console"?`
      <section class="panel">
        <h2>Console Overview</h2>
        <p>Use the left navigation or run the common tool <strong>console.open_page</strong> to switch pages.</p>
        <div class="stats-grid">
          <article>
            <h3>Users</h3>
            <p>${r.data.users.length}</p>
          </article>
          <article>
            <h3>Deployments</h3>
            <p>${r.data.deployments.length}</p>
          </article>
          <article>
            <h3>Environments</h3>
            <p>${Object.keys(r.data.environments).length}</p>
          </article>
        </div>
      </section>
    `:n==="userManagement"?`
      <section class="panel">
        <h2>User Directory</h2>
        <div class="table-like">
          <div class="row head"><span>ID</span><span>Name</span><span>Role</span><span>Status</span></div>
          ${r.data.users.map(t=>`<div class="row"><span>${t.id}</span><span>${t.name}</span><span>${t.role}</span><span>${t.status}</span></div>`).join("")}
        </div>
      </section>
    `:n==="applicationManagement"?`
      <section class="panel">
        <h2>Deployment Timeline</h2>
        <div class="table-like">
          <div class="row head"><span>App</span><span>Version</span><span>Target</span><span>Status</span><span>Time</span></div>
          ${r.data.deployments.slice(0,8).map(t=>`<div class="row"><span>${t.appName}</span><span>${t.version}</span><span>${t.targetEnv}</span><span>${t.status}</span><span>${t.at}</span></div>`).join("")}
        </div>
      </section>
    `:`
    <section class="panel">
      <h2>Environment Matrix</h2>
      <div class="table-like">
        <div class="row head"><span>Environment</span><span>Nodes</span><span>Maintenance</span><span>Secret Rotation</span></div>
        ${Object.entries(r.data.environments).map(([t,e])=>`<div class="row"><span>${t}</span><span>${e.nodes}</span><span>${String(e.maintenance)}</span><span>${e.lastSecretRotation}</span></div>`).join("")}
      </div>
    </section>
  `}function M(n,t){return Array.isArray(t.enum)?`
      <label>
        ${n}
        <select name="${n}">
          ${t.enum.map(e=>`<option value="${e}">${e}</option>`).join("")}
        </select>
      </label>
    `:t.type==="boolean"?`
      <label>
        ${n}
        <select name="${n}">
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
    `:`
    <label>
      ${n}
      <input name="${n}" type="text" ${t.type==="number"?'inputmode="numeric"':""} />
    </label>
  `}function O(n,t){return n.type==="boolean"?t==="true":n.type==="number"?Number(t):t}function N(){const n=u.listCurrentTools(),t={"console.open_page":"Open Admin Page","user.create":"Create User","user.suspend":"Suspend User","user.reset_mfa":"Reset MFA","app.deploy":"Deploy Release","app.rollback":"Rollback Release","app.toggle_feature_flag":"Toggle Feature Flag","env.maintenance_mode":"Set Maintenance Mode","env.rotate_secrets":"Rotate Secrets","env.scale_cluster":"Scale Cluster"};return n.map(e=>{const s=e.inputSchema?.properties||{},o=Object.entries(s);return`
        <article class="tool-card">
          <header>
            <h3>${t[e.name]||e.name}</h3>
            <code>${e.name}</code>
          </header>
          <p>${e.description}</p>
          <form data-tool-name="${e.name}">
            ${o.map(([a,i])=>M(a,i)).join("")}
            <button type="submit">Run Tool</button>
          </form>
        </article>
      `}).join("")}function x(){g.querySelectorAll("[data-nav-page]").forEach(e=>{e.addEventListener("click",()=>{r.activePage=e.dataset.navPage,u.syncToolsForCurrentPage(),m()})}),g.querySelectorAll("form[data-tool-name]").forEach(e=>{e.addEventListener("submit",async s=>{s.preventDefault();const o=e.dataset.toolName,a=u.listCurrentTools().find(p=>p.name===o);if(!a)return;const i=a.inputSchema?.properties||{},h=new FormData(e),b={};Object.entries(i).forEach(([p,c])=>{b[p]=O(c,String(h.get(p)??""))});const S=g.querySelector("#tool-output");try{const p=await u.invokeToolForDemo(o,b),c=JSON.stringify(p,null,2);$({tool:o,result:c}),S.textContent=c}catch(p){const c=p instanceof Error?p.message:"Unknown error";S.textContent=`Error: ${c}`,$({tool:o,result:`Error: ${c}`})}m()})})}function R(){return r.webmcp.supported?`WebMCP active: ${r.webmcp.registeredTools.length} tools registered`:"WebMCP unavailable in this browser context"}function m(){g.innerHTML=`
    <div class="console-shell">
      <aside class="left-nav">
        <h1>Admin Console</h1>
        <p class="subtitle">WebMCP Demo</p>
        <nav>
          ${w.map(n=>`
              <section class="nav-group ${n.id===r.activePage?"active":""}">
                <button data-nav-page="${n.id}">${n.title}</button>
                <ul>
                  ${n.options.map(t=>`<li>${t}</li>`).join("")}
                </ul>
              </section>
            `).join("")}
        </nav>
      </aside>

      <main class="main-view">
        <header class="main-header">
          <div>
            <p class="eyebrow">Current Page</p>
            <h2>${T(r.activePage)}</h2>
          </div>
          <div class="status-pill">${R()}</div>
        </header>

        ${E(r.activePage)}

        <section class="panel output-panel">
          <h2>Tool Output</h2>
          <pre id="tool-output">Run a tool to see JSON-like text output.</pre>
        </section>
      </main>

      <aside class="tools-pane">
        <header>
          <h2>WebMCP Tools</h2>
          <p>Registered with navigator.modelContext for ${T(r.activePage)}.</p>
          <p class="registered-list">${r.webmcp.registeredTools.join(" | ")||"No registered tools yet"}</p>
        </header>
        <div class="tool-list">
          ${N()}
        </div>
        <section class="activity-log">
          <h3>Recent Activity</h3>
          <ul>
            ${r.data.activity.map(n=>`<li><strong>${n.tool}</strong><span>${n.at}</span><p>${n.result}</p></li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  `,x()}m();
