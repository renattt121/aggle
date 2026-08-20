"use strict";(()=>{var b={theme:{mode:"dark",accentHue:18,accentSaturation:100,blurIntensity:24,grainOpacity:15,backgroundPreset:"ember"},sidebar:{providerId:"ollama",model:"llama3.1",apiKeyGroq:"",apiKeyOpenai:"",apiKeyXai:"",ollamaUrl:"http://localhost:11434",includePageContext:!0},blocker:{enabled:!0,lists:[{id:"aggle-builtin",name:"Aggle Base List",url:"bundled:base",enabled:!0,bundled:!0,ruleCount:0,lastUpdated:0}],whitelist:[],stats:{totalBlocked:0,blockedToday:0,lastResetDate:"",perSite:{}}},performance:{profile:"balanced",processCount:8,diskCacheMb:512,hwVideoDecode:!0,webRender:!0},general:{customNewTab:!0,commandPaletteEnabled:!0,searchEngine:"duckduckgo"}};var d="aggle-settings";function f(t,e){if(e==null)return t;if(typeof t!="object"||Array.isArray(t)||typeof e!="object"||Array.isArray(e))return e;let r={...t};for(let[n,o]of Object.entries(e))r[n]=n in t?f(t[n],o):o;return r}async function a(){let t=await browser.storage.local.get(d);return f(b,t[d])}var x=0;function $(t,e){let r=t.replace(/\$[a-zA-Z][a-zA-Z0-9_-]*(?:=[^$]*)?/g,"").trim();if(r.startsWith("||")){let o=r.slice(2).replace(/[*^?]/g,"");o=o.replace(/\/$/,"");let s=new RegExp(`(?:^https?://(?:.*\\.)?${o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`);return e?null:s}if(r.startsWith("|")){let o=r.slice(1).replace(/[*^?]/g,"");return e?null:new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i")}if(r.includes("*")){let o=r.replace(/[*]/g,"\0").replace(/[.+?^${}()|[\]\\]/g,"\\$&").replace(/\x00/g,".*"),s=new RegExp("^"+o+"$","i");return e?null:s}let n=r.replace(/[^a-zA-Z0-9._-]/g,"\\$&");return e?null:new RegExp("(?:^|[^a-zA-Z0-9._-])"+n+"(?:$|[^a-zA-Z0-9._-])","i")}function S(t){let e=t.trim();if(!e||e.startsWith("!")||e.startsWith("["))return null;let r=e.startsWith("@@"),n=r?e.slice(2).trim():e,o=$(n,!1),s,m=/^\\|\\|([^/^*]+)\^?\$/.exec(e);return m&&(s=m[1]),{id:`f-${++x}`,type:"network",pattern:n,regex:o,domain:s,isException:r}}function w(t){return t.split(`
`).map(S).filter(Boolean)}var y=`
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
`;var g=[],h=[],u=!0,c=0,i=0,l="";function F(){return new Date().toISOString().slice(0,10)}async function R(){let t=await a();u=t.blocker.enabled,h=t.blocker.whitelist,c=t.blocker.stats.totalBlocked,i=t.blocker.stats.blockedToday,l=t.blocker.stats.lastResetDate,g=[]}function T(){let t=F();l!==t&&(i=0,l=t)}async function E(){let t=await a(),e=[];for(let r of w(y))r.regex&&e.push(r.regex);for(let r of t.blocker.lists){if(!r.enabled)continue;let n=r.rules;for(let o of n)o.regex&&e.push(o.regex)}g=e}function B(t){for(let e of g)if(e.test(t))return!0;return!1}browser.webRequest.onBeforeRequest.addListener(t=>{if(!u)return;T();let e=t.url,r=(new URL(e).hostname??"").replace(/^www\./,"");if(!h.includes(r)&&B(e)){c++,i++;let n={totalBlocked:c,blockedToday:i,lastResetDate:l,perSite:{}};return browser.storage.local.set({"aggle-blocker-stats":n}),{cancel:!0}}},{urls:["<all_urls>"]},["blocking"]);var p={loadState:R,rebuildRules:E,getStats:()=>({enabled:u,totalBlocked:c,blockedToday:i})};var k={off:"#52525B",on:"#FF5A1F"};async function v(){if(!(await a()).blocker.enabled){browser.browserAction.setBadgeText({text:"OFF"}),browser.browserAction.setBadgeBackgroundColor({color:k.off});return}let e=p.getStats();if(e.blockedToday>0){let r=e.blockedToday>9999?"9k+":String(e.blockedToday);browser.browserAction.setBadgeText({text:r})}else browser.browserAction.setBadgeText({text:""});browser.browserAction.setBadgeBackgroundColor({color:k.on})}async function A(t){let e=await a();await browser.storage.local.set({"aggle-settings":{...e,blocker:{...e.blocker,enabled:t}}}),t&&await p.rebuildRules(),v()}browser.commands.onCommand.addListener(async t=>{if(t==="toggle-blocker-site"){let r=(await browser.tabs.query({active:!0,currentWindow:!0}))[0];if(!r?.url)return;let n=new URL(r.url).hostname.replace(/^www\./,""),s=(await a()).blocker.whitelist.includes(n);await A(!s)}});})();
