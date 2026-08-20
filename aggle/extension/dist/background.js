"use strict";(()=>{var f={theme:{mode:"dark",accentHue:18,accentSaturation:100,blurIntensity:24,grainOpacity:15,backgroundPreset:"ember"},sidebar:{providerId:"ollama",model:"llama3.1",apiKeyGroq:"",apiKeyOpenai:"",apiKeyXai:"",ollamaUrl:"http://localhost:11434",includePageContext:!0},blocker:{enabled:!0,lists:[{id:"aggle-builtin",name:"Aggle Base List",url:"bundled:base",enabled:!0,bundled:!0,ruleCount:0,lastUpdated:0}],whitelist:[],stats:{totalBlocked:0,blockedToday:0,lastResetDate:"",perSite:{}}},performance:{profile:"balanced",processCount:8,diskCacheMb:512,hwVideoDecode:!0,webRender:!0},general:{customNewTab:!0,commandPaletteEnabled:!0,searchEngine:"duckduckgo"}};var u="aggle-settings";function y(e,t){if(t==null)return e;if(typeof e!="object"||Array.isArray(e)||typeof t!="object"||Array.isArray(t))return t;let r={...e};for(let[s,o]of Object.entries(t))r[s]=s in e?y(e[s],o):o;return r}async function i(){let e=await browser.storage.local.get(u);return y(f,e[u])}var x=0;function S(e,t){let r=e.replace(/\$[a-zA-Z][a-zA-Z0-9_-]*(?:=[^$]*)?/g,"").trim();if(r.startsWith("||")){let o=r.slice(2).replace(/[*^?]/g,"");o=o.replace(/\/$/,"");let a=new RegExp(`(?:^https?://(?:.*\\.)?${o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`);return t?null:a}if(r.startsWith("|")){let o=r.slice(1).replace(/[*^?]/g,"");return t?null:new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i")}if(r.includes("*")){let o=r.replace(/[*]/g,"\0").replace(/[.+?^${}()|[\]\\]/g,"\\$&").replace(/\x00/g,".*"),a=new RegExp("^"+o+"$","i");return t?null:a}let s=r.replace(/[^a-zA-Z0-9._-]/g,"\\$&");return t?null:new RegExp("(?:^|[^a-zA-Z0-9._-])"+s+"(?:$|[^a-zA-Z0-9._-])","i")}function $(e){let t=e.trim();if(!t||t.startsWith("!")||t.startsWith("["))return null;let r=t.startsWith("@@"),s=r?t.slice(2).trim():t,o=S(s,!1),a,b=/^\\|\\|([^/^*]+)\^?\$/.exec(t);return b&&(a=b[1]),{id:`f-${++x}`,type:"network",pattern:s,regex:o,domain:a,isException:r}}function w(e){return e.split(`
`).map($).filter(Boolean)}var h=`
! Aggle bundled base list \u2014 v0.1.0
! Covers the most common ad and tracker domains.
! Full EasyList-compatible lists can be added from Settings.
!
! Ads / tracking
||doubleclick.net^$third-party
||googlesyndication.com^$third-party
||googletagmanager.com^$third-party
||google-analytics.com^$third-party
||facebook.net^$third-party
||facebook.com^$third-party
||fbcdn.net^$third-party
||analytics.yahoo.com^$third-party
||scorecardresearch.com^$third-party
||mixpanel.com^$third-party
||intercom.io^$third-party
||criteo.com^$third-party
||adnxs.com^$third-party
||pubmatic.com^$third-party
||openx.net^$third-party
||amazon-adsystem.com^$third-party
||clickbank.net^$third-party
||cj.com^$third-party
||impact.com^$third-party
||shareasale.com^$third-party
||tradedoubler.com^$third-party
||quantserve.com^$third-party
||hotjar.com^$third-party
||segment.com^$third-party
||klarna.com^$third-party
||tiktok.com^$third-party
||snapchat.com^$third-party
!
! Analytics
||mixpanel.com^$third-party
||fullstory.com^$third-party
||hotjar.com^$third-party
||matomo.org^$third-party
||piwik.org^$third-party
!
! Crypto miners (coinhive etc.)
||coinhive.com^
||minero.pw^
||nohash.life^
|https://coinhive.com/
|https://minero.pw/
`;var p=[],k=[],m=!0,d=0,c=0,g="";function R(){return new Date().toISOString().slice(0,10)}async function F(){let e=await i();m=e.blocker.enabled,k=e.blocker.whitelist,d=e.blocker.stats.totalBlocked,c=e.blocker.stats.blockedToday,g=e.blocker.stats.lastResetDate,p=[]}function T(){let e=R();g!==e&&(c=0,g=e)}async function E(){let e=await i(),t=[];for(let r of w(h))r.regex&&t.push(r.regex);for(let r of e.blocker.lists){if(!r.enabled)continue;let s=r.rules;for(let o of s)o.regex&&t.push(o.regex)}p=t}function v(e){for(let t of p)if(t.test(e))return!0;return!1}browser.webRequest.onBeforeRequest.addListener(e=>{if(!m)return;T();let t=e.url,r=(new URL(t).hostname??"").replace(/^www\./,"");if(!k.includes(r)&&v(t)){d++,c++;let s={totalBlocked:d,blockedToday:c,lastResetDate:g,perSite:{}};return browser.storage.local.set({"aggle-blocker-stats":s}),{cancel:!0}}},{urls:["<all_urls>"]},["blocking"]);var n={loadState:F,rebuildRules:E,getStats:()=>({enabled:m,totalBlocked:d,blockedToday:c})};var A={off:"#52525B",on:"#FF5A1F"};async function l(){if(!(await i()).blocker.enabled){browser.browserAction.setBadgeText({text:"OFF"}),browser.browserAction.setBadgeBackgroundColor({color:A.off});return}let t=n.getStats();if(t.blockedToday>0){let r=t.blockedToday>9999?"9k+":String(t.blockedToday);browser.browserAction.setBadgeText({text:r})}else browser.browserAction.setBadgeText({text:""});browser.browserAction.setBadgeBackgroundColor({color:A.on})}browser.commands.onCommand.addListener(async e=>{e==="open-stats"&&await browser.tabs.create({url:"src/stats/dashboard.html",active:!0})});(async()=>(await n.loadState(),await n.rebuildRules(),l()))();browser.runtime.onMessage.addListener((e,t)=>{switch(e.action){case"blocker:getState":{let r=n.getStats();return Promise.resolve({...r,totalBlocked:r.totalBlocked})}case"blocker:toggle":return n.rebuildRules(),l(),Promise.resolve({ok:!0});case"blocker:getStats":return Promise.resolve(n.getStats());case"stats:getTabInfo":return browser.tabs.query({}).then(r=>{let s=r.map(o=>({id:o.id,title:o.title??"",url:o.url??"",hostname:(()=>{try{return new URL(o.url??"").hostname}catch{return""}})(),discarded:o.discarded??!1,blockedCount:0}));return Promise.resolve({tabCount:s.length,tabs:s})});case"stats:unloadTab":return browser.tabs.reload(e.tabId,{bypassCache:!0});case"sidebar:opened":return Promise.resolve({ok:!0})}});browser.tabs.onUpdated.addListener(()=>{l()});browser.tabs.onActivated.addListener(()=>{l()});})();
