const Kh=()=>{};var Sa={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jc={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qh=function(n,e){if(!n)throw Xh(e)},Xh=function(n){return new Error("Firebase Database ("+Jc.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yc=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Jh=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=n[t++];e[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=n[t++],a=n[t++],u=n[t++],h=((s&7)<<18|(o&63)<<12|(a&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(h>>10)),e[r++]=String.fromCharCode(56320+(h&1023))}else{const o=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Zc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const o=n[s],a=s+1<n.length,u=a?n[s+1]:0,h=s+2<n.length,d=h?n[s+2]:0,p=o>>2,y=(o&3)<<4|u>>4;let I=(u&15)<<2|d>>6,P=d&63;h||(P=64,a||(I=64)),r.push(t[p],t[y],t[I],t[P])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Yc(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Jh(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const o=t[n.charAt(s++)],u=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const y=s<n.length?t[n.charAt(s)]:64;if(++s,o==null||u==null||d==null||y==null)throw new Yh;const I=o<<2|u>>4;if(r.push(I),d!==64){const P=u<<4&240|d>>2;if(r.push(P),y!==64){const k=d<<6&192|y;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Yh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Zh=function(n){const e=Yc(n);return Zc.encodeByteArray(e,!0)},$r=function(n){return Zh(n).replace(/\./g,"")},zr=function(n){try{return Zc.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rE(n){return eu(void 0,n)}function eu(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!ed(t)||(n[t]=eu(n[t],e[t]));return n}function ed(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function td(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nd=()=>td().__FIREBASE_DEFAULTS__,rd=()=>{if(typeof process>"u"||typeof Sa>"u")return;const n=Sa.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},sd=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&zr(n[1]);return e&&JSON.parse(e)},us=()=>{try{return Kh()||nd()||rd()||sd()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},tu=n=>us()?.emulatorHosts?.[n],id=n=>{const e=tu(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},nu=()=>us()?.config,ru=n=>us()?.[`_${n}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class od{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function an(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function su(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ad(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}},...n};return[$r(JSON.stringify(t)),$r(JSON.stringify(a)),""].join(".")}const Mn={};function cd(){const n={prod:[],emulator:[]};for(const e of Object.keys(Mn))Mn[e]?n.emulator.push(e):n.prod.push(e);return n}function ud(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Pa=!1;function iu(n,e){if(typeof window>"u"||typeof document>"u"||!an(window.location.host)||Mn[n]===e||Mn[n]||Pa)return;Mn[n]=e;function t(I){return`__firebase__banner__${I}`}const r="__firebase__banner",o=cd().prod.length>0;function a(){const I=document.getElementById(r);I&&I.remove()}function u(I){I.style.display="flex",I.style.background="#7faaf0",I.style.position="fixed",I.style.bottom="5px",I.style.left="5px",I.style.padding=".5em",I.style.borderRadius="5px",I.style.alignItems="center"}function h(I,P){I.setAttribute("width","24"),I.setAttribute("id",P),I.setAttribute("height","24"),I.setAttribute("viewBox","0 0 24 24"),I.setAttribute("fill","none"),I.style.marginLeft="-6px"}function d(){const I=document.createElement("span");return I.style.cursor="pointer",I.style.marginLeft="16px",I.style.fontSize="24px",I.innerHTML=" &times;",I.onclick=()=>{Pa=!0,a()},I}function p(I,P){I.setAttribute("id",P),I.innerText="Learn more",I.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",I.setAttribute("target","__blank"),I.style.paddingLeft="5px",I.style.textDecoration="underline"}function y(){const I=ud(r),P=t("text"),k=document.getElementById(P)||document.createElement("span"),N=t("learnmore"),V=document.getElementById(N)||document.createElement("a"),z=t("preprendIcon"),B=document.getElementById(z)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(I.created){const H=I.element;u(H),p(V,N);const ce=d();h(B,z),H.append(B,k,V,ce),document.body.appendChild(H)}o?(k.innerText="Preview backend disconnected.",B.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(B.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,k.innerText="Preview backend running in this workspace."),k.setAttribute("id",P)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",y):y()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ie(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function ld(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ie())}function hd(){const n=us()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function dd(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function fd(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function pd(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function md(){const n=Ie();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function sE(){return Jc.NODE_ADMIN===!0}function gd(){return!hd()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function _d(){try{return typeof indexedDB=="object"}catch{return!1}}function yd(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(t){e(t)}})}function iE(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ed="FirebaseError";class et extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Ed,Object.setPrototypeOf(this,et.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Zn.prototype.create)}}class Zn{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,o=this.errors[e],a=o?Td(o,r):"Error",u=`${this.serviceName}: ${a} (${s}).`;return new et(s,u,r)}}function Td(n,e){return n.replace(Id,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Id=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ca(n){return JSON.parse(n)}function oE(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ou=function(n){let e={},t={},r={},s="";try{const o=n.split(".");e=Ca(zr(o[0])||""),t=Ca(zr(o[1])||""),s=o[2],r=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:r,signature:s}},aE=function(n){const e=ou(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},cE=function(n){const e=ou(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uE(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function lE(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function vd(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function hE(n,e,t){const r={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(r[s]=e.call(t,n[s],s,n));return r}function Vt(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const o=n[s],a=e[s];if(ba(o)&&ba(a)){if(!Vt(o,a))return!1}else if(o!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function ba(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function er(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dE{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const r=this.W_;if(typeof e=="string")for(let y=0;y<16;y++)r[y]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let y=0;y<16;y++)r[y]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let y=16;y<80;y++){const I=r[y-3]^r[y-8]^r[y-14]^r[y-16];r[y]=(I<<1|I>>>31)&4294967295}let s=this.chain_[0],o=this.chain_[1],a=this.chain_[2],u=this.chain_[3],h=this.chain_[4],d,p;for(let y=0;y<80;y++){y<40?y<20?(d=u^o&(a^u),p=1518500249):(d=o^a^u,p=1859775393):y<60?(d=o&a|u&(o|a),p=2400959708):(d=o^a^u,p=3395469782);const I=(s<<5|s>>>27)+d+h+p+r[y]&4294967295;h=u,u=a,a=(o<<30|o>>>2)&4294967295,o=s,s=I}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+a&4294967295,this.chain_[3]=this.chain_[3]+u&4294967295,this.chain_[4]=this.chain_[4]+h&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const r=t-this.blockSize;let s=0;const o=this.buf_;let a=this.inbuf_;for(;s<t;){if(a===0)for(;s<=r;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(o[a]=e.charCodeAt(s),++a,++s,a===this.blockSize){this.compress_(o),a=0;break}}else for(;s<t;)if(o[a]=e[s],++a,++s,a===this.blockSize){this.compress_(o),a=0;break}}this.inbuf_=a,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let r=0;for(let s=0;s<5;s++)for(let o=24;o>=0;o-=8)e[r]=this.chain_[s]>>o&255,++r;return e}}function wd(n,e){const t=new Ad(n,e);return t.subscribe.bind(t)}class Ad{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Rd(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Zs),s.error===void 0&&(s.error=Zs),s.complete===void 0&&(s.complete=Zs);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Rd(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Zs(){}function fE(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pE=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);if(s>=55296&&s<=56319){const o=s-55296;r++,Qh(r<n.length,"Surrogate pair missing trail surrogate.");const a=n.charCodeAt(r)-56320;s=65536+(o<<10)+a}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},mE=function(n){let e=0;for(let t=0;t<n.length;t++){const r=n.charCodeAt(t);r<128?e++:r<2048?e+=2:r>=55296&&r<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sd=1e3,Pd=2,Cd=14400*1e3,bd=.5;function gE(n,e=Sd,t=Pd){const r=e*Math.pow(t,n),s=Math.round(bd*r*(Math.random()-.5)*2);return Math.min(Cd,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ae(n){return n&&n._delegate?n._delegate:n}class Dt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kd{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new od;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),r=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Dd(e))try{this.getOrInitializeService({instanceIdentifier:Pt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch{}}}}clearInstance(e=Pt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Pt){return this.instances.has(e)}getOptions(e=Pt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[o,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(o);r===u&&a.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const o=this.instances.get(r);return o&&e(o,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Vd(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Pt){return this.component?this.component.multipleInstances?e:Pt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Vd(n){return n===Pt?void 0:n}function Dd(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nd{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new kd(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var j;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(j||(j={}));const Od={debug:j.DEBUG,verbose:j.VERBOSE,info:j.INFO,warn:j.WARN,error:j.ERROR,silent:j.SILENT},Md=j.INFO,Ld={[j.DEBUG]:"log",[j.VERBOSE]:"log",[j.INFO]:"info",[j.WARN]:"warn",[j.ERROR]:"error"},xd=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Ld[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Mi{constructor(e){this.name=e,this._logLevel=Md,this._logHandler=xd,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in j))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Od[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,j.DEBUG,...e),this._logHandler(this,j.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,j.VERBOSE,...e),this._logHandler(this,j.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,j.INFO,...e),this._logHandler(this,j.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,j.WARN,...e),this._logHandler(this,j.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,j.ERROR,...e),this._logHandler(this,j.ERROR,...e)}}const Ud=(n,e)=>e.some(t=>n instanceof t);let ka,Va;function Fd(){return ka||(ka=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Bd(){return Va||(Va=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const au=new WeakMap,hi=new WeakMap,cu=new WeakMap,ei=new WeakMap,Li=new WeakMap;function jd(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{t(ht(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",o),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&au.set(t,n)}).catch(()=>{}),Li.set(e,n),e}function qd(n){if(hi.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});hi.set(n,e)}let di={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return hi.get(n);if(e==="objectStoreNames")return n.objectStoreNames||cu.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return ht(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function $d(n){di=n(di)}function zd(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ti(this),e,...t);return cu.set(r,e.sort?e.sort():[e]),ht(r)}:Bd().includes(n)?function(...e){return n.apply(ti(this),e),ht(au.get(this))}:function(...e){return ht(n.apply(ti(this),e))}}function Hd(n){return typeof n=="function"?zd(n):(n instanceof IDBTransaction&&qd(n),Ud(n,Fd())?new Proxy(n,di):n)}function ht(n){if(n instanceof IDBRequest)return jd(n);if(ei.has(n))return ei.get(n);const e=Hd(n);return e!==n&&(ei.set(n,e),Li.set(e,n)),e}const ti=n=>Li.get(n);function Wd(n,e,{blocked:t,upgrade:r,blocking:s,terminated:o}={}){const a=indexedDB.open(n,e),u=ht(a);return r&&a.addEventListener("upgradeneeded",h=>{r(ht(a.result),h.oldVersion,h.newVersion,ht(a.transaction),h)}),t&&a.addEventListener("blocked",h=>t(h.oldVersion,h.newVersion,h)),u.then(h=>{o&&h.addEventListener("close",()=>o()),s&&h.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}const Gd=["get","getKey","getAll","getAllKeys","count"],Kd=["put","add","delete","clear"],ni=new Map;function Da(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(ni.get(e))return ni.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=Kd.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Gd.includes(t)))return;const o=async function(a,...u){const h=this.transaction(a,s?"readwrite":"readonly");let d=h.store;return r&&(d=d.index(u.shift())),(await Promise.all([d[t](...u),s&&h.done]))[0]};return ni.set(e,o),o}$d(n=>({...n,get:(e,t,r)=>Da(e,t)||n.get(e,t,r),has:(e,t)=>!!Da(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qd{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Xd(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Xd(n){return n.getComponent()?.type==="VERSION"}const fi="@firebase/app",Na="0.14.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qe=new Mi("@firebase/app"),Jd="@firebase/app-compat",Yd="@firebase/analytics-compat",Zd="@firebase/analytics",ef="@firebase/app-check-compat",tf="@firebase/app-check",nf="@firebase/auth",rf="@firebase/auth-compat",sf="@firebase/database",of="@firebase/data-connect",af="@firebase/database-compat",cf="@firebase/functions",uf="@firebase/functions-compat",lf="@firebase/installations",hf="@firebase/installations-compat",df="@firebase/messaging",ff="@firebase/messaging-compat",pf="@firebase/performance",mf="@firebase/performance-compat",gf="@firebase/remote-config",_f="@firebase/remote-config-compat",yf="@firebase/storage",Ef="@firebase/storage-compat",Tf="@firebase/firestore",If="@firebase/ai",vf="@firebase/firestore-compat",wf="firebase",Af="12.2.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pi="[DEFAULT]",Rf={[fi]:"fire-core",[Jd]:"fire-core-compat",[Zd]:"fire-analytics",[Yd]:"fire-analytics-compat",[tf]:"fire-app-check",[ef]:"fire-app-check-compat",[nf]:"fire-auth",[rf]:"fire-auth-compat",[sf]:"fire-rtdb",[of]:"fire-data-connect",[af]:"fire-rtdb-compat",[cf]:"fire-fn",[uf]:"fire-fn-compat",[lf]:"fire-iid",[hf]:"fire-iid-compat",[df]:"fire-fcm",[ff]:"fire-fcm-compat",[pf]:"fire-perf",[mf]:"fire-perf-compat",[gf]:"fire-rc",[_f]:"fire-rc-compat",[yf]:"fire-gcs",[Ef]:"fire-gcs-compat",[Tf]:"fire-fst",[vf]:"fire-fst-compat",[If]:"fire-vertex","fire-js":"fire-js",[wf]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hr=new Map,Sf=new Map,mi=new Map;function Oa(n,e){try{n.container.addComponent(e)}catch(t){Qe.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Yt(n){const e=n.name;if(mi.has(e))return Qe.debug(`There were multiple attempts to register component ${e}.`),!1;mi.set(e,n);for(const t of Hr.values())Oa(t,n);for(const t of Sf.values())Oa(t,n);return!0}function xi(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Oe(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pf={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},dt=new Zn("app","Firebase",Pf);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cf{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Dt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw dt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cn=Af;function bf(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:pi,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw dt.create("bad-app-name",{appName:String(s)});if(t||(t=nu()),!t)throw dt.create("no-options");const o=Hr.get(s);if(o){if(Vt(t,o.options)&&Vt(r,o.config))return o;throw dt.create("duplicate-app",{appName:s})}const a=new Nd(s);for(const h of mi.values())a.addComponent(h);const u=new Cf(t,r,a);return Hr.set(s,u),u}function uu(n=pi){const e=Hr.get(n);if(!e&&n===pi&&nu())return bf();if(!e)throw dt.create("no-app",{appName:n});return e}function ft(n,e,t){let r=Rf[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const a=[`Unable to register library "${r}" with version "${e}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Qe.warn(a.join(" "));return}Yt(new Dt(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kf="firebase-heartbeat-database",Vf=1,qn="firebase-heartbeat-store";let ri=null;function lu(){return ri||(ri=Wd(kf,Vf,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(qn)}catch(t){console.warn(t)}}}}).catch(n=>{throw dt.create("idb-open",{originalErrorMessage:n.message})})),ri}async function Df(n){try{const t=(await lu()).transaction(qn),r=await t.objectStore(qn).get(hu(n));return await t.done,r}catch(e){if(e instanceof et)Qe.warn(e.message);else{const t=dt.create("idb-get",{originalErrorMessage:e?.message});Qe.warn(t.message)}}}async function Ma(n,e){try{const r=(await lu()).transaction(qn,"readwrite");await r.objectStore(qn).put(e,hu(n)),await r.done}catch(t){if(t instanceof et)Qe.warn(t.message);else{const r=dt.create("idb-set",{originalErrorMessage:t?.message});Qe.warn(r.message)}}}function hu(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nf=1024,Of=30;class Mf{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new xf(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=La();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:t}),this._heartbeatsCache.heartbeats.length>Of){const s=Uf(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Qe.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=La(),{heartbeatsToSend:t,unsentEntries:r}=Lf(this._heartbeatsCache.heartbeats),s=$r(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return Qe.warn(e),""}}}function La(){return new Date().toISOString().substring(0,10)}function Lf(n,e=Nf){const t=[];let r=n.slice();for(const s of n){const o=t.find(a=>a.agent===s.agent);if(o){if(o.dates.push(s.date),xa(t)>e){o.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),xa(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class xf{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return _d()?yd().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Df(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Ma(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Ma(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function xa(n){return $r(JSON.stringify({version:2,heartbeats:n})).length}function Uf(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ff(n){Yt(new Dt("platform-logger",e=>new Qd(e),"PRIVATE")),Yt(new Dt("heartbeat",e=>new Mf(e),"PRIVATE")),ft(fi,Na,n),ft(fi,Na,"esm2020"),ft("fire-js","")}Ff("");function du(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Bf=du,fu=new Zn("auth","Firebase",du());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wr=new Mi("@firebase/auth");function jf(n,...e){Wr.logLevel<=j.WARN&&Wr.warn(`Auth (${cn}): ${n}`,...e)}function Nr(n,...e){Wr.logLevel<=j.ERROR&&Wr.error(`Auth (${cn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xe(n,...e){throw Ui(n,...e)}function Me(n,...e){return Ui(n,...e)}function pu(n,e,t){const r={...Bf(),[e]:t};return new Zn("auth","Firebase",r).create(e,{appName:n.name})}function bt(n){return pu(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ui(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return fu.create(n,...e)}function x(n,e,...t){if(!n)throw Ui(e,...t)}function We(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Nr(e),new Error(e)}function Je(n,e){n||We(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gi(){return typeof self<"u"&&self.location?.href||""}function qf(){return Ua()==="http:"||Ua()==="https:"}function Ua(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $f(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(qf()||fd()||"connection"in navigator)?navigator.onLine:!0}function zf(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tr{constructor(e,t){this.shortDelay=e,this.longDelay=t,Je(t>e,"Short delay should be less than long delay!"),this.isMobile=ld()||pd()}get(){return $f()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fi(n,e){Je(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mu{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;We("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;We("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;We("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hf={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wf=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Gf=new tr(3e4,6e4);function Bi(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function un(n,e,t,r,s={}){return gu(n,s,async()=>{let o={},a={};r&&(e==="GET"?a=r:o={body:JSON.stringify(r)});const u=er({key:n.config.apiKey,...a}).slice(1),h=await n._getAdditionalHeaders();h["Content-Type"]="application/json",n.languageCode&&(h["X-Firebase-Locale"]=n.languageCode);const d={method:e,headers:h,...o};return dd()||(d.referrerPolicy="no-referrer"),n.emulatorConfig&&an(n.emulatorConfig.host)&&(d.credentials="include"),mu.fetch()(await _u(n,n.config.apiHost,t,u),d)})}async function gu(n,e,t){n._canInitEmulator=!1;const r={...Hf,...e};try{const s=new Qf(n),o=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await o.json();if("needConfirmation"in a)throw Pr(n,"account-exists-with-different-credential",a);if(o.ok&&!("errorMessage"in a))return a;{const u=o.ok?a.errorMessage:a.error.message,[h,d]=u.split(" : ");if(h==="FEDERATED_USER_ID_ALREADY_LINKED")throw Pr(n,"credential-already-in-use",a);if(h==="EMAIL_EXISTS")throw Pr(n,"email-already-in-use",a);if(h==="USER_DISABLED")throw Pr(n,"user-disabled",a);const p=r[h]||h.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw pu(n,p,d);Xe(n,p)}}catch(s){if(s instanceof et)throw s;Xe(n,"network-request-failed",{message:String(s)})}}async function Kf(n,e,t,r,s={}){const o=await un(n,e,t,r,s);return"mfaPendingCredential"in o&&Xe(n,"multi-factor-auth-required",{_serverResponse:o}),o}async function _u(n,e,t,r){const s=`${e}${t}?${r}`,o=n,a=o.config.emulator?Fi(n.config,s):`${n.config.apiScheme}://${s}`;return Wf.includes(t)&&(await o._persistenceManagerAvailable,o._getPersistenceType()==="COOKIE")?o._getPersistence()._getFinalTarget(a).toString():a}class Qf{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Me(this.auth,"network-request-failed")),Gf.get())})}}function Pr(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Me(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xf(n,e){return un(n,"POST","/v1/accounts:delete",e)}async function Gr(n,e){return un(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ln(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Jf(n,e=!1){const t=Ae(n),r=await t.getIdToken(e),s=ji(r);x(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const o=typeof s.firebase=="object"?s.firebase:void 0,a=o?.sign_in_provider;return{claims:s,token:r,authTime:Ln(si(s.auth_time)),issuedAtTime:Ln(si(s.iat)),expirationTime:Ln(si(s.exp)),signInProvider:a||null,signInSecondFactor:o?.sign_in_second_factor||null}}function si(n){return Number(n)*1e3}function ji(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Nr("JWT malformed, contained fewer than 3 sections"),null;try{const s=zr(t);return s?JSON.parse(s):(Nr("Failed to decode base64 JWT payload"),null)}catch(s){return Nr("Caught error parsing JWT payload as JSON",s?.toString()),null}}function Fa(n){const e=ji(n);return x(e,"internal-error"),x(typeof e.exp<"u","internal-error"),x(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $n(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof et&&Yf(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Yf({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zf{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _i{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ln(this.lastLoginAt),this.creationTime=Ln(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kr(n){const e=n.auth,t=await n.getIdToken(),r=await $n(n,Gr(e,{idToken:t}));x(r?.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const o=s.providerUserInfo?.length?yu(s.providerUserInfo):[],a=tp(n.providerData,o),u=n.isAnonymous,h=!(n.email&&s.passwordHash)&&!a?.length,d=u?h:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new _i(s.createdAt,s.lastLoginAt),isAnonymous:d};Object.assign(n,p)}async function ep(n){const e=Ae(n);await Kr(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function tp(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function yu(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function np(n,e){const t=await gu(n,{},async()=>{const r=er({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:o}=n.config,a=await _u(n,s,"/v1/token",`key=${o}`),u=await n._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const h={method:"POST",headers:u,body:r};return n.emulatorConfig&&an(n.emulatorConfig.host)&&(h.credentials="include"),mu.fetch()(a,h)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function rp(n,e){return un(n,"POST","/v2/accounts:revokeToken",Bi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){x(e.idToken,"internal-error"),x(typeof e.idToken<"u","internal-error"),x(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Fa(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){x(e.length!==0,"internal-error");const t=Fa(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(x(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:o}=await np(e,t);this.updateTokensAndExpiration(r,s,Number(o))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:o}=t,a=new Kt;return r&&(x(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(x(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),o&&(x(typeof o=="number","internal-error",{appName:e}),a.expirationTime=o),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Kt,this.toJSON())}_performRefresh(){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function it(n,e){x(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class ke{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new Zf(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new _i(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await $n(this,this.stsTokenManager.getToken(this.auth,e));return x(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Jf(this,e)}reload(){return ep(this)}_assign(e){this!==e&&(x(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new ke({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){x(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Kr(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Oe(this.auth.app))return Promise.reject(bt(this.auth));const e=await this.getIdToken();return await $n(this,Xf(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,o=t.phoneNumber??void 0,a=t.photoURL??void 0,u=t.tenantId??void 0,h=t._redirectEventId??void 0,d=t.createdAt??void 0,p=t.lastLoginAt??void 0,{uid:y,emailVerified:I,isAnonymous:P,providerData:k,stsTokenManager:N}=t;x(y&&N,e,"internal-error");const V=Kt.fromJSON(this.name,N);x(typeof y=="string",e,"internal-error"),it(r,e.name),it(s,e.name),x(typeof I=="boolean",e,"internal-error"),x(typeof P=="boolean",e,"internal-error"),it(o,e.name),it(a,e.name),it(u,e.name),it(h,e.name),it(d,e.name),it(p,e.name);const z=new ke({uid:y,auth:e,email:s,emailVerified:I,displayName:r,isAnonymous:P,photoURL:a,phoneNumber:o,tenantId:u,stsTokenManager:V,createdAt:d,lastLoginAt:p});return k&&Array.isArray(k)&&(z.providerData=k.map(B=>({...B}))),h&&(z._redirectEventId=h),z}static async _fromIdTokenResponse(e,t,r=!1){const s=new Kt;s.updateFromServerResponse(t);const o=new ke({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Kr(o),o}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];x(s.localId!==void 0,"internal-error");const o=s.providerUserInfo!==void 0?yu(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!o?.length,u=new Kt;u.updateFromIdToken(r);const h=new ke({uid:s.localId,auth:e,stsTokenManager:u,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new _i(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!o?.length};return Object.assign(h,d),h}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ba=new Map;function Ge(n){Je(n instanceof Function,"Expected a class definition");let e=Ba.get(n);return e?(Je(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Ba.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eu{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Eu.type="NONE";const ja=Eu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Or(n,e,t){return`firebase:${n}:${e}:${t}`}class Qt{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:o}=this.auth;this.fullUserKey=Or(this.userKey,s.apiKey,o),this.fullPersistenceKey=Or("persistence",s.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Gr(this.auth,{idToken:e}).catch(()=>{});return t?ke._fromGetAccountInfoResponse(this.auth,t,e):null}return ke._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Qt(Ge(ja),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let o=s[0]||Ge(ja);const a=Or(r,e.config.apiKey,e.name);let u=null;for(const d of t)try{const p=await d._get(a);if(p){let y;if(typeof p=="string"){const I=await Gr(e,{idToken:p}).catch(()=>{});if(!I)break;y=await ke._fromGetAccountInfoResponse(e,I,p)}else y=ke._fromJSON(e,p);d!==o&&(u=y),o=d;break}}catch{}const h=s.filter(d=>d._shouldAllowMigration);return!o._shouldAllowMigration||!h.length?new Qt(o,e,r):(o=h[0],u&&await o._set(a,u.toJSON()),await Promise.all(t.map(async d=>{if(d!==o)try{await d._remove(a)}catch{}})),new Qt(o,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(wu(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Tu(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Ru(e))return"Blackberry";if(Su(e))return"Webos";if(Iu(e))return"Safari";if((e.includes("chrome/")||vu(e))&&!e.includes("edge/"))return"Chrome";if(Au(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if(r?.length===2)return r[1]}return"Other"}function Tu(n=Ie()){return/firefox\//i.test(n)}function Iu(n=Ie()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function vu(n=Ie()){return/crios\//i.test(n)}function wu(n=Ie()){return/iemobile/i.test(n)}function Au(n=Ie()){return/android/i.test(n)}function Ru(n=Ie()){return/blackberry/i.test(n)}function Su(n=Ie()){return/webos/i.test(n)}function qi(n=Ie()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function sp(n=Ie()){return qi(n)&&!!window.navigator?.standalone}function ip(){return md()&&document.documentMode===10}function Pu(n=Ie()){return qi(n)||Au(n)||Su(n)||Ru(n)||/windows phone/i.test(n)||wu(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cu(n,e=[]){let t;switch(n){case"Browser":t=qa(Ie());break;case"Worker":t=`${qa(Ie())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${cn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class op{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=o=>new Promise((a,u)=>{try{const h=e(o);a(h)}catch(h){u(h)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ap(n,e={}){return un(n,"GET","/v2/passwordPolicy",Bi(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cp=6;class up{constructor(e){const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??cp,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lp{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new $a(this),this.idTokenSubscription=new $a(this),this.beforeStateQueue=new op(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=fu,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(o=>this._resolvePersistenceManagerAvailable=o)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ge(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Qt.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Gr(this,{idToken:e}),r=await ke._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Oe(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=this.redirectUser?._redirectEventId,a=r?._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===a)&&u?.user&&(r=u.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return x(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Kr(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=zf()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Oe(this.app))return Promise.reject(bt(this));const t=e?Ae(e):null;return t&&x(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&x(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Oe(this.app)?Promise.reject(bt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Oe(this.app)?Promise.reject(bt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ge(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await ap(this),t=new up(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Zn("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await rp(this,r)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ge(e)||this._popupRedirectResolver;x(t,this,"argument-error"),this.redirectPersistenceManager=await Qt.create(this,[Ge(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const o=typeof t=="function"?t:t.next.bind(t);let a=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(x(u,this,"internal-error"),u.then(()=>{a||o(this.currentUser)}),typeof t=="function"){const h=e.addObserver(t,r,s);return()=>{a=!0,h()}}else{const h=e.addObserver(t);return()=>{a=!0,h()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return x(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Cu(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){if(Oe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&jf(`Error while retrieving App Check token: ${e.error}`),e?.token}}function $i(n){return Ae(n)}class $a{constructor(e){this.auth=e,this.observer=null,this.addObserver=wd(t=>this.observer=t)}get next(){return x(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function hp(n){zi=n}function dp(n){return zi.loadJS(n)}function fp(){return zi.gapiScript}function pp(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mp(n,e){const t=xi(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),o=t.getOptions();if(Vt(o,e??{}))return s;Xe(s,"already-initialized")}return t.initialize({options:e})}function gp(n,e){const t=e?.persistence||[],r=(Array.isArray(t)?t:[t]).map(Ge);e?.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e?.popupRedirectResolver)}function _p(n,e,t){const r=$i(n);x(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,o=bu(e),{host:a,port:u}=yp(e),h=u===null?"":`:${u}`,d={url:`${o}//${a}${h}/`},p=Object.freeze({host:a,port:u,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){x(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),x(Vt(d,r.config.emulator)&&Vt(p,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=d,r.emulatorConfig=p,r.settings.appVerificationDisabledForTesting=!0,an(a)?(su(`${o}//${a}${h}`),iu("Auth",!0)):Ep()}function bu(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function yp(n){const e=bu(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const o=s[1];return{host:o,port:za(r.substr(o.length+1))}}else{const[o,a]=r.split(":");return{host:o,port:za(a)}}}function za(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Ep(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return We("not implemented")}_getIdTokenResponse(e){return We("not implemented")}_linkToIdToken(e,t){return We("not implemented")}_getReauthenticationResolver(e){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xt(n,e){return Kf(n,"POST","/v1/accounts:signInWithIdp",Bi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tp="http://localhost";class Nt extends ku{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Nt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Xe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...o}=t;if(!r||!s)return null;const a=new Nt(r,s);return a.idToken=o.idToken||void 0,a.accessToken=o.accessToken||void 0,a.secret=o.secret,a.nonce=o.nonce,a.pendingToken=o.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Xt(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Xt(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Xt(e,t)}buildRequest(){const e={requestUri:Tp,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=er(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vu{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr extends Vu{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot extends nr{constructor(){super("facebook.com")}static credential(e){return Nt._fromParams({providerId:ot.PROVIDER_ID,signInMethod:ot.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ot.credentialFromTaggedObject(e)}static credentialFromError(e){return ot.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ot.credential(e.oauthAccessToken)}catch{return null}}}ot.FACEBOOK_SIGN_IN_METHOD="facebook.com";ot.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at extends nr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Nt._fromParams({providerId:at.PROVIDER_ID,signInMethod:at.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return at.credentialFromTaggedObject(e)}static credentialFromError(e){return at.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return at.credential(t,r)}catch{return null}}}at.GOOGLE_SIGN_IN_METHOD="google.com";at.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct extends nr{constructor(){super("github.com")}static credential(e){return Nt._fromParams({providerId:ct.PROVIDER_ID,signInMethod:ct.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ct.credentialFromTaggedObject(e)}static credentialFromError(e){return ct.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ct.credential(e.oauthAccessToken)}catch{return null}}}ct.GITHUB_SIGN_IN_METHOD="github.com";ct.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut extends nr{constructor(){super("twitter.com")}static credential(e,t){return Nt._fromParams({providerId:ut.PROVIDER_ID,signInMethod:ut.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ut.credentialFromTaggedObject(e)}static credentialFromError(e){return ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ut.credential(t,r)}catch{return null}}}ut.TWITTER_SIGN_IN_METHOD="twitter.com";ut.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const o=await ke._fromIdTokenResponse(e,r,s),a=Ha(r);return new Zt({user:o,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Ha(r);return new Zt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Ha(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr extends et{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Qr.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Qr(e,t,r,s)}}function Du(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(o=>{throw o.code==="auth/multi-factor-auth-required"?Qr._fromErrorAndOperation(n,o,e,r):o})}async function Ip(n,e,t=!1){const r=await $n(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Zt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vp(n,e,t=!1){const{auth:r}=n;if(Oe(r.app))return Promise.reject(bt(r));const s="reauthenticate";try{const o=await $n(n,Du(r,s,e,n),t);x(o.idToken,r,"internal-error");const a=ji(o.idToken);x(a,r,"internal-error");const{sub:u}=a;return x(n.uid===u,r,"user-mismatch"),Zt._forOperation(n,s,o)}catch(o){throw o?.code==="auth/user-not-found"&&Xe(r,"user-mismatch"),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wp(n,e,t=!1){if(Oe(n.app))return Promise.reject(bt(n));const r="signIn",s=await Du(n,r,e),o=await Zt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(o.user),o}function Ap(n,e,t,r){return Ae(n).onIdTokenChanged(e,t,r)}function Rp(n,e,t){return Ae(n).beforeAuthStateChanged(e,t)}function _E(n,e,t,r){return Ae(n).onAuthStateChanged(e,t,r)}function yE(n){return Ae(n).signOut()}const Xr="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Xr,"1"),this.storage.removeItem(Xr),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sp=1e3,Pp=10;class Ou extends Nu{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Pu(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,u,h)=>{this.notifyListeners(a,h)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},o=this.storage.getItem(r);ip()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Pp):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Sp)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Ou.type="LOCAL";const Cp=Ou;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mu extends Nu{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Mu.type="SESSION";const Lu=Mu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bp(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new ls(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:o}=t.data,a=this.handlersMap[s];if(!a?.size)return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const u=Array.from(a).map(async d=>d(t.origin,o)),h=await bp(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:h})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ls.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hi(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let o,a;return new Promise((u,h)=>{const d=Hi("",20);s.port1.start();const p=setTimeout(()=>{h(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(y){const I=y;if(I.data.eventId===d)switch(I.data.status){case"ack":clearTimeout(p),o=setTimeout(()=>{h(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),u(I.data.response);break;default:clearTimeout(p),clearTimeout(o),h(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Le(){return window}function Vp(n){Le().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xu(){return typeof Le().WorkerGlobalScope<"u"&&typeof Le().importScripts=="function"}async function Dp(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Np(){return navigator?.serviceWorker?.controller||null}function Op(){return xu()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uu="firebaseLocalStorageDb",Mp=1,Jr="firebaseLocalStorage",Fu="fbase_key";class rr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function hs(n,e){return n.transaction([Jr],e?"readwrite":"readonly").objectStore(Jr)}function Lp(){const n=indexedDB.deleteDatabase(Uu);return new rr(n).toPromise()}function yi(){const n=indexedDB.open(Uu,Mp);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Jr,{keyPath:Fu})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Jr)?e(r):(r.close(),await Lp(),e(await yi()))})})}async function Wa(n,e,t){const r=hs(n,!0).put({[Fu]:e,value:t});return new rr(r).toPromise()}async function xp(n,e){const t=hs(n,!1).get(e),r=await new rr(t).toPromise();return r===void 0?null:r.value}function Ga(n,e){const t=hs(n,!0).delete(e);return new rr(t).toPromise()}const Up=800,Fp=3;class Bu{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await yi(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Fp)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return xu()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ls._getInstance(Op()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await Dp(),!this.activeServiceWorker)return;this.sender=new kp(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Np()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await yi();return await Wa(e,Xr,"1"),await Ga(e,Xr),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Wa(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>xp(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ga(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const o=hs(s,!1).getAll();return new rr(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:o}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(o)&&(this.notifyListeners(s,o),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Up)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Bu.type="LOCAL";const Bp=Bu;new tr(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jp(n,e){return e?Ge(e):(x(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi extends ku{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Xt(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Xt(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Xt(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function qp(n){return wp(n.auth,new Wi(n),n.bypassAuthState)}function $p(n){const{auth:e,user:t}=n;return x(t,e,"internal-error"),vp(t,new Wi(n),n.bypassAuthState)}async function zp(n){const{auth:e,user:t}=n;return x(t,e,"internal-error"),Ip(t,new Wi(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ju{constructor(e,t,r,s,o=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=o,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:o,error:a,type:u}=e;if(a){this.reject(a);return}const h={auth:this.auth,requestUri:t,sessionId:r,tenantId:o||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(h))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return qp;case"linkViaPopup":case"linkViaRedirect":return zp;case"reauthViaPopup":case"reauthViaRedirect":return $p;default:Xe(this.auth,"internal-error")}}resolve(e){Je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Je(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hp=new tr(2e3,1e4);class Gt extends ju{constructor(e,t,r,s,o){super(e,t,s,o),this.provider=r,this.authWindow=null,this.pollId=null,Gt.currentPopupAction&&Gt.currentPopupAction.cancel(),Gt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return x(e,this.auth,"internal-error"),e}async onExecution(){Je(this.filter.length===1,"Popup operations only handle one event");const e=Hi();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Me(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(Me(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Gt.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Me(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Hp.get())};e()}}Gt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wp="pendingRedirect",Mr=new Map;class Gp extends ju{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Mr.get(this.auth._key());if(!e){try{const r=await Kp(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Mr.set(this.auth._key(),e)}return this.bypassAuthState||Mr.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Kp(n,e){const t=Jp(e),r=Xp(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function Qp(n,e){Mr.set(n._key(),e)}function Xp(n){return Ge(n._redirectPersistence)}function Jp(n){return Or(Wp,n.config.apiKey,n.name)}async function Yp(n,e,t=!1){if(Oe(n.app))return Promise.reject(bt(n));const r=$i(n),s=jp(r,e),a=await new Gp(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zp=600*1e3;class em{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!tm(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!qu(e)){const r=e.error.code?.split("auth/")[1]||"internal-error";t.onError(Me(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Zp&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ka(e))}saveEventToCache(e){this.cachedEventUids.add(Ka(e)),this.lastProcessedEventTime=Date.now()}}function Ka(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function qu({type:n,error:e}){return n==="unknown"&&e?.code==="auth/no-auth-event"}function tm(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return qu(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nm(n,e={}){return un(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rm=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,sm=/^https?/;async function im(n){if(n.config.emulator)return;const{authorizedDomains:e}=await nm(n);for(const t of e)try{if(om(t))return}catch{}Xe(n,"unauthorized-domain")}function om(n){const e=gi(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!sm.test(t))return!1;if(rm.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const am=new tr(3e4,6e4);function Qa(){const n=Le().___jsl;if(n?.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function cm(n){return new Promise((e,t)=>{function r(){Qa(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Qa(),t(Me(n,"network-request-failed"))},timeout:am.get()})}if(Le().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Le().gapi?.load)r();else{const s=pp("iframefcb");return Le()[s]=()=>{gapi.load?r():t(Me(n,"network-request-failed"))},dp(`${fp()}?onload=${s}`).catch(o=>t(o))}}).catch(e=>{throw Lr=null,e})}let Lr=null;function um(n){return Lr=Lr||cm(n),Lr}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lm=new tr(5e3,15e3),hm="__/auth/iframe",dm="emulator/auth/iframe",fm={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},pm=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function mm(n){const e=n.config;x(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Fi(e,dm):`https://${n.config.authDomain}/${hm}`,r={apiKey:e.apiKey,appName:n.name,v:cn},s=pm.get(n.config.apiHost);s&&(r.eid=s);const o=n._getFrameworks();return o.length&&(r.fw=o.join(",")),`${t}?${er(r).slice(1)}`}async function gm(n){const e=await um(n),t=Le().gapi;return x(t,n,"internal-error"),e.open({where:document.body,url:mm(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:fm,dontclear:!0},r=>new Promise(async(s,o)=>{await r.restyle({setHideOnLeave:!1});const a=Me(n,"network-request-failed"),u=Le().setTimeout(()=>{o(a)},lm.get());function h(){Le().clearTimeout(u),s(r)}r.ping(h).then(h,()=>{o(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _m={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ym=500,Em=600,Tm="_blank",Im="http://localhost";class Xa{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function vm(n,e,t,r=ym,s=Em){const o=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let u="";const h={..._m,width:r.toString(),height:s.toString(),top:o,left:a},d=Ie().toLowerCase();t&&(u=vu(d)?Tm:t),Tu(d)&&(e=e||Im,h.scrollbars="yes");const p=Object.entries(h).reduce((I,[P,k])=>`${I}${P}=${k},`,"");if(sp(d)&&u!=="_self")return wm(e||"",u),new Xa(null);const y=window.open(e||"",u,p);x(y,n,"popup-blocked");try{y.focus()}catch{}return new Xa(y)}function wm(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Am="__/auth/handler",Rm="emulator/auth/handler",Sm=encodeURIComponent("fac");async function Ja(n,e,t,r,s,o){x(n.config.authDomain,n,"auth-domain-config-required"),x(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:cn,eventId:s};if(e instanceof Vu){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",vd(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,y]of Object.entries({}))a[p]=y}if(e instanceof nr){const p=e.getScopes().filter(y=>y!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);const u=a;for(const p of Object.keys(u))u[p]===void 0&&delete u[p];const h=await n._getAppCheckToken(),d=h?`#${Sm}=${encodeURIComponent(h)}`:"";return`${Pm(n)}?${er(u).slice(1)}${d}`}function Pm({config:n}){return n.emulator?Fi(n,Rm):`https://${n.authDomain}/${Am}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ii="webStorageSupport";class Cm{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Lu,this._completeRedirectFn=Yp,this._overrideRedirectResult=Qp}async _openPopup(e,t,r,s){Je(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const o=await Ja(e,t,r,gi(),s);return vm(e,o,Hi())}async _openRedirect(e,t,r,s){await this._originValidation(e);const o=await Ja(e,t,r,gi(),s);return Vp(o),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:o}=this.eventManagers[t];return s?Promise.resolve(s):(Je(o,"If manager is not set, promise should be"),o)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await gm(e),r=new em(e);return t.register("authEvent",s=>(x(s?.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(ii,{type:ii},s=>{const o=s?.[0]?.[ii];o!==void 0&&t(!!o),Xe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=im(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Pu()||Iu()||qi()}}const bm=Cm;var Ya="@firebase/auth",Za="1.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class km{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e(r?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){x(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vm(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Dm(n){Yt(new Dt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:a,authDomain:u}=r.options;x(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const h={apiKey:a,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Cu(n)},d=new lp(r,s,o,h);return gp(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Yt(new Dt("auth-internal",e=>{const t=$i(e.getProvider("auth").getImmediate());return(r=>new km(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ft(Ya,Za,Vm(n)),ft(Ya,Za,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nm=300,Om=ru("authIdTokenMaxAge")||Nm;let ec=null;const Mm=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>Om)return;const s=t?.token;ec!==s&&(ec=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function EE(n=uu()){const e=xi(n,"auth");if(e.isInitialized())return e.getImmediate();const t=mp(n,{popupRedirectResolver:bm,persistence:[Bp,Cp,Lu]}),r=ru("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const o=new URL(r,location.origin);if(location.origin===o.origin){const a=Mm(o.toString());Rp(t,a,()=>a(t.currentUser)),Ap(t,u=>a(u))}}const s=tu("auth");return s&&_p(t,`http://${s}`),t}function Lm(){return document.getElementsByTagName("head")?.[0]??document}hp({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const o=Me("internal-error");o.customData=s,t(o)},r.type="text/javascript",r.charset="UTF-8",Lm().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Dm("Browser");var tc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pt,$u;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,m){function _(){}_.prototype=m.prototype,v.D=m.prototype,v.prototype=new _,v.prototype.constructor=v,v.C=function(E,T,A){for(var g=Array(arguments.length-2),$e=2;$e<arguments.length;$e++)g[$e-2]=arguments[$e];return m.prototype[T].apply(E,g)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,m,_){_||(_=0);var E=Array(16);if(typeof m=="string")for(var T=0;16>T;++T)E[T]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(T=0;16>T;++T)E[T]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=v.g[0],_=v.g[1],T=v.g[2];var A=v.g[3],g=m+(A^_&(T^A))+E[0]+3614090360&4294967295;m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[1]+3905402710&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[2]+606105819&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[3]+3250441966&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[4]+4118548399&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[5]+1200080426&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[6]+2821735955&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[7]+4249261313&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[8]+1770035416&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[9]+2336552879&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[10]+4294925233&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[11]+2304563134&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[12]+1804603682&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[13]+4254626195&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[14]+2792965006&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[15]+1236535329&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(T^A&(_^T))+E[1]+4129170786&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[6]+3225465664&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[11]+643717713&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[0]+3921069994&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[5]+3593408605&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[10]+38016083&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[15]+3634488961&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[4]+3889429448&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[9]+568446438&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[14]+3275163606&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[3]+4107603335&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[8]+1163531501&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[13]+2850285829&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[2]+4243563512&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[7]+1735328473&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[12]+2368359562&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(_^T^A)+E[5]+4294588738&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[8]+2272392833&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[11]+1839030562&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[14]+4259657740&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[1]+2763975236&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[4]+1272893353&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[7]+4139469664&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[10]+3200236656&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[13]+681279174&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[0]+3936430074&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[3]+3572445317&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[6]+76029189&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[9]+3654602809&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[12]+3873151461&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[15]+530742520&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[2]+3299628645&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(T^(_|~A))+E[0]+4096336452&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[7]+1126891415&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[14]+2878612391&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[5]+4237533241&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[12]+1700485571&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[3]+2399980690&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[10]+4293915773&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[1]+2240044497&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[8]+1873313359&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[15]+4264355552&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[6]+2734768916&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[13]+1309151649&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[4]+4149444226&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[11]+3174756917&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[2]+718787259&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[9]+3951481745&4294967295,v.g[0]=v.g[0]+m&4294967295,v.g[1]=v.g[1]+(T+(g<<21&4294967295|g>>>11))&4294967295,v.g[2]=v.g[2]+T&4294967295,v.g[3]=v.g[3]+A&4294967295}r.prototype.u=function(v,m){m===void 0&&(m=v.length);for(var _=m-this.blockSize,E=this.B,T=this.h,A=0;A<m;){if(T==0)for(;A<=_;)s(this,v,A),A+=this.blockSize;if(typeof v=="string"){for(;A<m;)if(E[T++]=v.charCodeAt(A++),T==this.blockSize){s(this,E),T=0;break}}else for(;A<m;)if(E[T++]=v[A++],T==this.blockSize){s(this,E),T=0;break}}this.h=T,this.o+=m},r.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var m=1;m<v.length-8;++m)v[m]=0;var _=8*this.o;for(m=v.length-8;m<v.length;++m)v[m]=_&255,_/=256;for(this.u(v),v=Array(16),m=_=0;4>m;++m)for(var E=0;32>E;E+=8)v[_++]=this.g[m]>>>E&255;return v};function o(v,m){var _=u;return Object.prototype.hasOwnProperty.call(_,v)?_[v]:_[v]=m(v)}function a(v,m){this.h=m;for(var _=[],E=!0,T=v.length-1;0<=T;T--){var A=v[T]|0;E&&A==m||(_[T]=A,E=!1)}this.g=_}var u={};function h(v){return-128<=v&&128>v?o(v,function(m){return new a([m|0],0>m?-1:0)}):new a([v|0],0>v?-1:0)}function d(v){if(isNaN(v)||!isFinite(v))return y;if(0>v)return V(d(-v));for(var m=[],_=1,E=0;v>=_;E++)m[E]=v/_|0,_*=4294967296;return new a(m,0)}function p(v,m){if(v.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(v.charAt(0)=="-")return V(p(v.substring(1),m));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),E=y,T=0;T<v.length;T+=8){var A=Math.min(8,v.length-T),g=parseInt(v.substring(T,T+A),m);8>A?(A=d(Math.pow(m,A)),E=E.j(A).add(d(g))):(E=E.j(_),E=E.add(d(g)))}return E}var y=h(0),I=h(1),P=h(16777216);n=a.prototype,n.m=function(){if(N(this))return-V(this).m();for(var v=0,m=1,_=0;_<this.g.length;_++){var E=this.i(_);v+=(0<=E?E:4294967296+E)*m,m*=4294967296}return v},n.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(k(this))return"0";if(N(this))return"-"+V(this).toString(v);for(var m=d(Math.pow(v,6)),_=this,E="";;){var T=ce(_,m).g;_=z(_,T.j(m));var A=((0<_.g.length?_.g[0]:_.h)>>>0).toString(v);if(_=T,k(_))return A+E;for(;6>A.length;)A="0"+A;E=A+E}},n.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function k(v){if(v.h!=0)return!1;for(var m=0;m<v.g.length;m++)if(v.g[m]!=0)return!1;return!0}function N(v){return v.h==-1}n.l=function(v){return v=z(this,v),N(v)?-1:k(v)?0:1};function V(v){for(var m=v.g.length,_=[],E=0;E<m;E++)_[E]=~v.g[E];return new a(_,~v.h).add(I)}n.abs=function(){return N(this)?V(this):this},n.add=function(v){for(var m=Math.max(this.g.length,v.g.length),_=[],E=0,T=0;T<=m;T++){var A=E+(this.i(T)&65535)+(v.i(T)&65535),g=(A>>>16)+(this.i(T)>>>16)+(v.i(T)>>>16);E=g>>>16,A&=65535,g&=65535,_[T]=g<<16|A}return new a(_,_[_.length-1]&-2147483648?-1:0)};function z(v,m){return v.add(V(m))}n.j=function(v){if(k(this)||k(v))return y;if(N(this))return N(v)?V(this).j(V(v)):V(V(this).j(v));if(N(v))return V(this.j(V(v)));if(0>this.l(P)&&0>v.l(P))return d(this.m()*v.m());for(var m=this.g.length+v.g.length,_=[],E=0;E<2*m;E++)_[E]=0;for(E=0;E<this.g.length;E++)for(var T=0;T<v.g.length;T++){var A=this.i(E)>>>16,g=this.i(E)&65535,$e=v.i(T)>>>16,pn=v.i(T)&65535;_[2*E+2*T]+=g*pn,B(_,2*E+2*T),_[2*E+2*T+1]+=A*pn,B(_,2*E+2*T+1),_[2*E+2*T+1]+=g*$e,B(_,2*E+2*T+1),_[2*E+2*T+2]+=A*$e,B(_,2*E+2*T+2)}for(E=0;E<m;E++)_[E]=_[2*E+1]<<16|_[2*E];for(E=m;E<2*m;E++)_[E]=0;return new a(_,0)};function B(v,m){for(;(v[m]&65535)!=v[m];)v[m+1]+=v[m]>>>16,v[m]&=65535,m++}function H(v,m){this.g=v,this.h=m}function ce(v,m){if(k(m))throw Error("division by zero");if(k(v))return new H(y,y);if(N(v))return m=ce(V(v),m),new H(V(m.g),V(m.h));if(N(m))return m=ce(v,V(m)),new H(V(m.g),m.h);if(30<v.g.length){if(N(v)||N(m))throw Error("slowDivide_ only works with positive integers.");for(var _=I,E=m;0>=E.l(v);)_=De(_),E=De(E);var T=fe(_,1),A=fe(E,1);for(E=fe(E,2),_=fe(_,2);!k(E);){var g=A.add(E);0>=g.l(v)&&(T=T.add(_),A=g),E=fe(E,1),_=fe(_,1)}return m=z(v,T.j(m)),new H(T,m)}for(T=y;0<=v.l(m);){for(_=Math.max(1,Math.floor(v.m()/m.m())),E=Math.ceil(Math.log(_)/Math.LN2),E=48>=E?1:Math.pow(2,E-48),A=d(_),g=A.j(m);N(g)||0<g.l(v);)_-=E,A=d(_),g=A.j(m);k(A)&&(A=I),T=T.add(A),v=z(v,g)}return new H(T,v)}n.A=function(v){return ce(this,v).h},n.and=function(v){for(var m=Math.max(this.g.length,v.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)&v.i(E);return new a(_,this.h&v.h)},n.or=function(v){for(var m=Math.max(this.g.length,v.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)|v.i(E);return new a(_,this.h|v.h)},n.xor=function(v){for(var m=Math.max(this.g.length,v.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)^v.i(E);return new a(_,this.h^v.h)};function De(v){for(var m=v.g.length+1,_=[],E=0;E<m;E++)_[E]=v.i(E)<<1|v.i(E-1)>>>31;return new a(_,v.h)}function fe(v,m){var _=m>>5;m%=32;for(var E=v.g.length-_,T=[],A=0;A<E;A++)T[A]=0<m?v.i(A+_)>>>m|v.i(A+_+1)<<32-m:v.i(A+_);return new a(T,v.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,$u=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,pt=a}).apply(typeof tc<"u"?tc:typeof self<"u"?self:typeof window<"u"?window:{});var Cr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var zu,Vn,Hu,xr,Ei,Wu,Gu,Ku;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,c,l){return i==Array.prototype||i==Object.prototype||(i[c]=l.value),i};function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof Cr=="object"&&Cr];for(var c=0;c<i.length;++c){var l=i[c];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=t(this);function s(i,c){if(c)e:{var l=r;i=i.split(".");for(var f=0;f<i.length-1;f++){var w=i[f];if(!(w in l))break e;l=l[w]}i=i[i.length-1],f=l[i],c=c(f),c!=f&&c!=null&&e(l,i,{configurable:!0,writable:!0,value:c})}}function o(i,c){i instanceof String&&(i+="");var l=0,f=!1,w={next:function(){if(!f&&l<i.length){var R=l++;return{value:c(R,i[R]),done:!1}}return f=!0,{done:!0,value:void 0}}};return w[Symbol.iterator]=function(){return w},w}s("Array.prototype.values",function(i){return i||function(){return o(this,function(c,l){return l})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function h(i){var c=typeof i;return c=c!="object"?c:i?Array.isArray(i)?"array":c:"null",c=="array"||c=="object"&&typeof i.length=="number"}function d(i){var c=typeof i;return c=="object"&&i!=null||c=="function"}function p(i,c,l){return i.call.apply(i.bind,arguments)}function y(i,c,l){if(!i)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var w=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(w,f),i.apply(c,w)}}return function(){return i.apply(c,arguments)}}function I(i,c,l){return I=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:y,I.apply(null,arguments)}function P(i,c){var l=Array.prototype.slice.call(arguments,1);return function(){var f=l.slice();return f.push.apply(f,arguments),i.apply(this,f)}}function k(i,c){function l(){}l.prototype=c.prototype,i.aa=c.prototype,i.prototype=new l,i.prototype.constructor=i,i.Qb=function(f,w,R){for(var b=Array(arguments.length-2),Q=2;Q<arguments.length;Q++)b[Q-2]=arguments[Q];return c.prototype[w].apply(f,b)}}function N(i){const c=i.length;if(0<c){const l=Array(c);for(let f=0;f<c;f++)l[f]=i[f];return l}return[]}function V(i,c){for(let l=1;l<arguments.length;l++){const f=arguments[l];if(h(f)){const w=i.length||0,R=f.length||0;i.length=w+R;for(let b=0;b<R;b++)i[w+b]=f[b]}else i.push(f)}}class z{constructor(c,l){this.i=c,this.j=l,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function B(i){return/^[\s\xa0]*$/.test(i)}function H(){var i=u.navigator;return i&&(i=i.userAgent)?i:""}function ce(i){return ce[" "](i),i}ce[" "]=function(){};var De=H().indexOf("Gecko")!=-1&&!(H().toLowerCase().indexOf("webkit")!=-1&&H().indexOf("Edge")==-1)&&!(H().indexOf("Trident")!=-1||H().indexOf("MSIE")!=-1)&&H().indexOf("Edge")==-1;function fe(i,c,l){for(const f in i)c.call(l,i[f],f,i)}function v(i,c){for(const l in i)c.call(void 0,i[l],l,i)}function m(i){const c={};for(const l in i)c[l]=i[l];return c}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(i,c){let l,f;for(let w=1;w<arguments.length;w++){f=arguments[w];for(l in f)i[l]=f[l];for(let R=0;R<_.length;R++)l=_[R],Object.prototype.hasOwnProperty.call(f,l)&&(i[l]=f[l])}}function T(i){var c=1;i=i.split(":");const l=[];for(;0<c&&i.length;)l.push(i.shift()),c--;return i.length&&l.push(i.join(":")),l}function A(i){u.setTimeout(()=>{throw i},0)}function g(){var i=bs;let c=null;return i.g&&(c=i.g,i.g=i.g.next,i.g||(i.h=null),c.next=null),c}class $e{constructor(){this.h=this.g=null}add(c,l){const f=pn.get();f.set(c,l),this.h?this.h.next=f:this.g=f,this.h=f}}var pn=new z(()=>new fh,i=>i.reset());class fh{constructor(){this.next=this.g=this.h=null}set(c,l){this.h=c,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let mn,gn=!1,bs=new $e,So=()=>{const i=u.Promise.resolve(void 0);mn=()=>{i.then(ph)}};var ph=()=>{for(var i;i=g();){try{i.h.call(i.g)}catch(l){A(l)}var c=pn;c.j(i),100>c.h&&(c.h++,i.next=c.g,c.g=i)}gn=!1};function tt(){this.s=this.s,this.C=this.C}tt.prototype.s=!1,tt.prototype.ma=function(){this.s||(this.s=!0,this.N())},tt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function pe(i,c){this.type=i,this.g=this.target=c,this.defaultPrevented=!1}pe.prototype.h=function(){this.defaultPrevented=!0};var mh=(function(){if(!u.addEventListener||!Object.defineProperty)return!1;var i=!1,c=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const l=()=>{};u.addEventListener("test",l,c),u.removeEventListener("test",l,c)}catch{}return i})();function _n(i,c){if(pe.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var l=this.type=i.type,f=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=c,c=i.relatedTarget){if(De){e:{try{ce(c.nodeName);var w=!0;break e}catch{}w=!1}w||(c=null)}}else l=="mouseover"?c=i.fromElement:l=="mouseout"&&(c=i.toElement);this.relatedTarget=c,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:gh[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&_n.aa.h.call(this)}}k(_n,pe);var gh={2:"touch",3:"pen",4:"mouse"};_n.prototype.h=function(){_n.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var cr="closure_listenable_"+(1e6*Math.random()|0),_h=0;function yh(i,c,l,f,w){this.listener=i,this.proxy=null,this.src=c,this.type=l,this.capture=!!f,this.ha=w,this.key=++_h,this.da=this.fa=!1}function ur(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function lr(i){this.src=i,this.g={},this.h=0}lr.prototype.add=function(i,c,l,f,w){var R=i.toString();i=this.g[R],i||(i=this.g[R]=[],this.h++);var b=Vs(i,c,f,w);return-1<b?(c=i[b],l||(c.fa=!1)):(c=new yh(c,this.src,R,!!f,w),c.fa=l,i.push(c)),c};function ks(i,c){var l=c.type;if(l in i.g){var f=i.g[l],w=Array.prototype.indexOf.call(f,c,void 0),R;(R=0<=w)&&Array.prototype.splice.call(f,w,1),R&&(ur(c),i.g[l].length==0&&(delete i.g[l],i.h--))}}function Vs(i,c,l,f){for(var w=0;w<i.length;++w){var R=i[w];if(!R.da&&R.listener==c&&R.capture==!!l&&R.ha==f)return w}return-1}var Ds="closure_lm_"+(1e6*Math.random()|0),Ns={};function Po(i,c,l,f,w){if(Array.isArray(c)){for(var R=0;R<c.length;R++)Po(i,c[R],l,f,w);return null}return l=ko(l),i&&i[cr]?i.K(c,l,d(f)?!!f.capture:!1,w):Eh(i,c,l,!1,f,w)}function Eh(i,c,l,f,w,R){if(!c)throw Error("Invalid event type");var b=d(w)?!!w.capture:!!w,Q=Ms(i);if(Q||(i[Ds]=Q=new lr(i)),l=Q.add(c,l,f,b,R),l.proxy)return l;if(f=Th(),l.proxy=f,f.src=i,f.listener=l,i.addEventListener)mh||(w=b),w===void 0&&(w=!1),i.addEventListener(c.toString(),f,w);else if(i.attachEvent)i.attachEvent(bo(c.toString()),f);else if(i.addListener&&i.removeListener)i.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return l}function Th(){function i(l){return c.call(i.src,i.listener,l)}const c=Ih;return i}function Co(i,c,l,f,w){if(Array.isArray(c))for(var R=0;R<c.length;R++)Co(i,c[R],l,f,w);else f=d(f)?!!f.capture:!!f,l=ko(l),i&&i[cr]?(i=i.i,c=String(c).toString(),c in i.g&&(R=i.g[c],l=Vs(R,l,f,w),-1<l&&(ur(R[l]),Array.prototype.splice.call(R,l,1),R.length==0&&(delete i.g[c],i.h--)))):i&&(i=Ms(i))&&(c=i.g[c.toString()],i=-1,c&&(i=Vs(c,l,f,w)),(l=-1<i?c[i]:null)&&Os(l))}function Os(i){if(typeof i!="number"&&i&&!i.da){var c=i.src;if(c&&c[cr])ks(c.i,i);else{var l=i.type,f=i.proxy;c.removeEventListener?c.removeEventListener(l,f,i.capture):c.detachEvent?c.detachEvent(bo(l),f):c.addListener&&c.removeListener&&c.removeListener(f),(l=Ms(c))?(ks(l,i),l.h==0&&(l.src=null,c[Ds]=null)):ur(i)}}}function bo(i){return i in Ns?Ns[i]:Ns[i]="on"+i}function Ih(i,c){if(i.da)i=!0;else{c=new _n(c,this);var l=i.listener,f=i.ha||i.src;i.fa&&Os(i),i=l.call(f,c)}return i}function Ms(i){return i=i[Ds],i instanceof lr?i:null}var Ls="__closure_events_fn_"+(1e9*Math.random()>>>0);function ko(i){return typeof i=="function"?i:(i[Ls]||(i[Ls]=function(c){return i.handleEvent(c)}),i[Ls])}function me(){tt.call(this),this.i=new lr(this),this.M=this,this.F=null}k(me,tt),me.prototype[cr]=!0,me.prototype.removeEventListener=function(i,c,l,f){Co(this,i,c,l,f)};function ve(i,c){var l,f=i.F;if(f)for(l=[];f;f=f.F)l.push(f);if(i=i.M,f=c.type||c,typeof c=="string")c=new pe(c,i);else if(c instanceof pe)c.target=c.target||i;else{var w=c;c=new pe(f,i),E(c,w)}if(w=!0,l)for(var R=l.length-1;0<=R;R--){var b=c.g=l[R];w=hr(b,f,!0,c)&&w}if(b=c.g=i,w=hr(b,f,!0,c)&&w,w=hr(b,f,!1,c)&&w,l)for(R=0;R<l.length;R++)b=c.g=l[R],w=hr(b,f,!1,c)&&w}me.prototype.N=function(){if(me.aa.N.call(this),this.i){var i=this.i,c;for(c in i.g){for(var l=i.g[c],f=0;f<l.length;f++)ur(l[f]);delete i.g[c],i.h--}}this.F=null},me.prototype.K=function(i,c,l,f){return this.i.add(String(i),c,!1,l,f)},me.prototype.L=function(i,c,l,f){return this.i.add(String(i),c,!0,l,f)};function hr(i,c,l,f){if(c=i.i.g[String(c)],!c)return!0;c=c.concat();for(var w=!0,R=0;R<c.length;++R){var b=c[R];if(b&&!b.da&&b.capture==l){var Q=b.listener,ue=b.ha||b.src;b.fa&&ks(i.i,b),w=Q.call(ue,f)!==!1&&w}}return w&&!f.defaultPrevented}function Vo(i,c,l){if(typeof i=="function")l&&(i=I(i,l));else if(i&&typeof i.handleEvent=="function")i=I(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(i,c||0)}function Do(i){i.g=Vo(()=>{i.g=null,i.i&&(i.i=!1,Do(i))},i.l);const c=i.h;i.h=null,i.m.apply(null,c)}class vh extends tt{constructor(c,l){super(),this.m=c,this.l=l,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Do(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function yn(i){tt.call(this),this.h=i,this.g={}}k(yn,tt);var No=[];function Oo(i){fe(i.g,function(c,l){this.g.hasOwnProperty(l)&&Os(c)},i),i.g={}}yn.prototype.N=function(){yn.aa.N.call(this),Oo(this)},yn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var xs=u.JSON.stringify,wh=u.JSON.parse,Ah=class{stringify(i){return u.JSON.stringify(i,void 0)}parse(i){return u.JSON.parse(i,void 0)}};function Us(){}Us.prototype.h=null;function Mo(i){return i.h||(i.h=i.i())}function Lo(){}var En={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Fs(){pe.call(this,"d")}k(Fs,pe);function Bs(){pe.call(this,"c")}k(Bs,pe);var wt={},xo=null;function dr(){return xo=xo||new me}wt.La="serverreachability";function Uo(i){pe.call(this,wt.La,i)}k(Uo,pe);function Tn(i){const c=dr();ve(c,new Uo(c))}wt.STAT_EVENT="statevent";function Fo(i,c){pe.call(this,wt.STAT_EVENT,i),this.stat=c}k(Fo,pe);function we(i){const c=dr();ve(c,new Fo(c,i))}wt.Ma="timingevent";function Bo(i,c){pe.call(this,wt.Ma,i),this.size=c}k(Bo,pe);function In(i,c){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){i()},c)}function vn(){this.g=!0}vn.prototype.xa=function(){this.g=!1};function Rh(i,c,l,f,w,R){i.info(function(){if(i.g)if(R)for(var b="",Q=R.split("&"),ue=0;ue<Q.length;ue++){var G=Q[ue].split("=");if(1<G.length){var ge=G[0];G=G[1];var _e=ge.split("_");b=2<=_e.length&&_e[1]=="type"?b+(ge+"="+G+"&"):b+(ge+"=redacted&")}}else b=null;else b=R;return"XMLHTTP REQ ("+f+") [attempt "+w+"]: "+c+`
`+l+`
`+b})}function Sh(i,c,l,f,w,R,b){i.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+w+"]: "+c+`
`+l+`
`+R+" "+b})}function Ft(i,c,l,f){i.info(function(){return"XMLHTTP TEXT ("+c+"): "+Ch(i,l)+(f?" "+f:"")})}function Ph(i,c){i.info(function(){return"TIMEOUT: "+c})}vn.prototype.info=function(){};function Ch(i,c){if(!i.g)return c;if(!c)return null;try{var l=JSON.parse(c);if(l){for(i=0;i<l.length;i++)if(Array.isArray(l[i])){var f=l[i];if(!(2>f.length)){var w=f[1];if(Array.isArray(w)&&!(1>w.length)){var R=w[0];if(R!="noop"&&R!="stop"&&R!="close")for(var b=1;b<w.length;b++)w[b]=""}}}}return xs(l)}catch{return c}}var fr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},jo={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},js;function pr(){}k(pr,Us),pr.prototype.g=function(){return new XMLHttpRequest},pr.prototype.i=function(){return{}},js=new pr;function nt(i,c,l,f){this.j=i,this.i=c,this.l=l,this.R=f||1,this.U=new yn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new qo}function qo(){this.i=null,this.g="",this.h=!1}var $o={},qs={};function $s(i,c,l){i.L=1,i.v=yr(ze(c)),i.m=l,i.P=!0,zo(i,null)}function zo(i,c){i.F=Date.now(),mr(i),i.A=ze(i.v);var l=i.A,f=i.R;Array.isArray(f)||(f=[String(f)]),sa(l.i,"t",f),i.C=0,l=i.j.J,i.h=new qo,i.g=va(i.j,l?c:null,!i.m),0<i.O&&(i.M=new vh(I(i.Y,i,i.g),i.O)),c=i.U,l=i.g,f=i.ca;var w="readystatechange";Array.isArray(w)||(w&&(No[0]=w.toString()),w=No);for(var R=0;R<w.length;R++){var b=Po(l,w[R],f||c.handleEvent,!1,c.h||c);if(!b)break;c.g[b.key]=b}c=i.H?m(i.H):{},i.m?(i.u||(i.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,c)):(i.u="GET",i.g.ea(i.A,i.u,null,c)),Tn(),Rh(i.i,i.u,i.A,i.l,i.R,i.m)}nt.prototype.ca=function(i){i=i.target;const c=this.M;c&&He(i)==3?c.j():this.Y(i)},nt.prototype.Y=function(i){try{if(i==this.g)e:{const _e=He(this.g);var c=this.g.Ba();const qt=this.g.Z();if(!(3>_e)&&(_e!=3||this.g&&(this.h.h||this.g.oa()||ha(this.g)))){this.J||_e!=4||c==7||(c==8||0>=qt?Tn(3):Tn(2)),zs(this);var l=this.g.Z();this.X=l;t:if(Ho(this)){var f=ha(this.g);i="";var w=f.length,R=He(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){At(this),wn(this);var b="";break t}this.h.i=new u.TextDecoder}for(c=0;c<w;c++)this.h.h=!0,i+=this.h.i.decode(f[c],{stream:!(R&&c==w-1)});f.length=0,this.h.g+=i,this.C=0,b=this.h.g}else b=this.g.oa();if(this.o=l==200,Sh(this.i,this.u,this.A,this.l,this.R,_e,l),this.o){if(this.T&&!this.K){t:{if(this.g){var Q,ue=this.g;if((Q=ue.g?ue.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(Q)){var G=Q;break t}}G=null}if(l=G)Ft(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Hs(this,l);else{this.o=!1,this.s=3,we(12),At(this),wn(this);break e}}if(this.P){l=!0;let be;for(;!this.J&&this.C<b.length;)if(be=bh(this,b),be==qs){_e==4&&(this.s=4,we(14),l=!1),Ft(this.i,this.l,null,"[Incomplete Response]");break}else if(be==$o){this.s=4,we(15),Ft(this.i,this.l,b,"[Invalid Chunk]"),l=!1;break}else Ft(this.i,this.l,be,null),Hs(this,be);if(Ho(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),_e!=4||b.length!=0||this.h.h||(this.s=1,we(16),l=!1),this.o=this.o&&l,!l)Ft(this.i,this.l,b,"[Invalid Chunked Response]"),At(this),wn(this);else if(0<b.length&&!this.W){this.W=!0;var ge=this.j;ge.g==this&&ge.ba&&!ge.M&&(ge.j.info("Great, no buffering proxy detected. Bytes received: "+b.length),Js(ge),ge.M=!0,we(11))}}else Ft(this.i,this.l,b,null),Hs(this,b);_e==4&&At(this),this.o&&!this.J&&(_e==4?ya(this.j,this):(this.o=!1,mr(this)))}else Wh(this.g),l==400&&0<b.indexOf("Unknown SID")?(this.s=3,we(12)):(this.s=0,we(13)),At(this),wn(this)}}}catch{}finally{}};function Ho(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function bh(i,c){var l=i.C,f=c.indexOf(`
`,l);return f==-1?qs:(l=Number(c.substring(l,f)),isNaN(l)?$o:(f+=1,f+l>c.length?qs:(c=c.slice(f,f+l),i.C=f+l,c)))}nt.prototype.cancel=function(){this.J=!0,At(this)};function mr(i){i.S=Date.now()+i.I,Wo(i,i.I)}function Wo(i,c){if(i.B!=null)throw Error("WatchDog timer not null");i.B=In(I(i.ba,i),c)}function zs(i){i.B&&(u.clearTimeout(i.B),i.B=null)}nt.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(Ph(this.i,this.A),this.L!=2&&(Tn(),we(17)),At(this),this.s=2,wn(this)):Wo(this,this.S-i)};function wn(i){i.j.G==0||i.J||ya(i.j,i)}function At(i){zs(i);var c=i.M;c&&typeof c.ma=="function"&&c.ma(),i.M=null,Oo(i.U),i.g&&(c=i.g,i.g=null,c.abort(),c.ma())}function Hs(i,c){try{var l=i.j;if(l.G!=0&&(l.g==i||Ws(l.h,i))){if(!i.K&&Ws(l.h,i)&&l.G==3){try{var f=l.Da.g.parse(c)}catch{f=null}if(Array.isArray(f)&&f.length==3){var w=f;if(w[0]==0){e:if(!l.u){if(l.g)if(l.g.F+3e3<i.F)Ar(l),vr(l);else break e;Xs(l),we(18)}}else l.za=w[1],0<l.za-l.T&&37500>w[2]&&l.F&&l.v==0&&!l.C&&(l.C=In(I(l.Za,l),6e3));if(1>=Qo(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else St(l,11)}else if((i.K||l.g==i)&&Ar(l),!B(c))for(w=l.Da.g.parse(c),c=0;c<w.length;c++){let G=w[c];if(l.T=G[0],G=G[1],l.G==2)if(G[0]=="c"){l.K=G[1],l.ia=G[2];const ge=G[3];ge!=null&&(l.la=ge,l.j.info("VER="+l.la));const _e=G[4];_e!=null&&(l.Aa=_e,l.j.info("SVER="+l.Aa));const qt=G[5];qt!=null&&typeof qt=="number"&&0<qt&&(f=1.5*qt,l.L=f,l.j.info("backChannelRequestTimeoutMs_="+f)),f=l;const be=i.g;if(be){const Sr=be.g?be.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Sr){var R=f.h;R.g||Sr.indexOf("spdy")==-1&&Sr.indexOf("quic")==-1&&Sr.indexOf("h2")==-1||(R.j=R.l,R.g=new Set,R.h&&(Gs(R,R.h),R.h=null))}if(f.D){const Ys=be.g?be.g.getResponseHeader("X-HTTP-Session-Id"):null;Ys&&(f.ya=Ys,X(f.I,f.D,Ys))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-i.F,l.j.info("Handshake RTT: "+l.R+"ms")),f=l;var b=i;if(f.qa=Ia(f,f.J?f.ia:null,f.W),b.K){Xo(f.h,b);var Q=b,ue=f.L;ue&&(Q.I=ue),Q.B&&(zs(Q),mr(Q)),f.g=b}else ga(f);0<l.i.length&&wr(l)}else G[0]!="stop"&&G[0]!="close"||St(l,7);else l.G==3&&(G[0]=="stop"||G[0]=="close"?G[0]=="stop"?St(l,7):Qs(l):G[0]!="noop"&&l.l&&l.l.ta(G),l.v=0)}}Tn(4)}catch{}}var kh=class{constructor(i,c){this.g=i,this.map=c}};function Go(i){this.l=i||10,u.PerformanceNavigationTiming?(i=u.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Ko(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function Qo(i){return i.h?1:i.g?i.g.size:0}function Ws(i,c){return i.h?i.h==c:i.g?i.g.has(c):!1}function Gs(i,c){i.g?i.g.add(c):i.h=c}function Xo(i,c){i.h&&i.h==c?i.h=null:i.g&&i.g.has(c)&&i.g.delete(c)}Go.prototype.cancel=function(){if(this.i=Jo(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function Jo(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let c=i.i;for(const l of i.g.values())c=c.concat(l.D);return c}return N(i.i)}function Vh(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(h(i)){for(var c=[],l=i.length,f=0;f<l;f++)c.push(i[f]);return c}c=[],l=0;for(f in i)c[l++]=i[f];return c}function Dh(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(h(i)||typeof i=="string"){var c=[];i=i.length;for(var l=0;l<i;l++)c.push(l);return c}c=[],l=0;for(const f in i)c[l++]=f;return c}}}function Yo(i,c){if(i.forEach&&typeof i.forEach=="function")i.forEach(c,void 0);else if(h(i)||typeof i=="string")Array.prototype.forEach.call(i,c,void 0);else for(var l=Dh(i),f=Vh(i),w=f.length,R=0;R<w;R++)c.call(void 0,f[R],l&&l[R],i)}var Zo=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Nh(i,c){if(i){i=i.split("&");for(var l=0;l<i.length;l++){var f=i[l].indexOf("="),w=null;if(0<=f){var R=i[l].substring(0,f);w=i[l].substring(f+1)}else R=i[l];c(R,w?decodeURIComponent(w.replace(/\+/g," ")):"")}}}function Rt(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof Rt){this.h=i.h,gr(this,i.j),this.o=i.o,this.g=i.g,_r(this,i.s),this.l=i.l;var c=i.i,l=new Sn;l.i=c.i,c.g&&(l.g=new Map(c.g),l.h=c.h),ea(this,l),this.m=i.m}else i&&(c=String(i).match(Zo))?(this.h=!1,gr(this,c[1]||"",!0),this.o=An(c[2]||""),this.g=An(c[3]||"",!0),_r(this,c[4]),this.l=An(c[5]||"",!0),ea(this,c[6]||"",!0),this.m=An(c[7]||"")):(this.h=!1,this.i=new Sn(null,this.h))}Rt.prototype.toString=function(){var i=[],c=this.j;c&&i.push(Rn(c,ta,!0),":");var l=this.g;return(l||c=="file")&&(i.push("//"),(c=this.o)&&i.push(Rn(c,ta,!0),"@"),i.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&i.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&i.push("/"),i.push(Rn(l,l.charAt(0)=="/"?Lh:Mh,!0))),(l=this.i.toString())&&i.push("?",l),(l=this.m)&&i.push("#",Rn(l,Uh)),i.join("")};function ze(i){return new Rt(i)}function gr(i,c,l){i.j=l?An(c,!0):c,i.j&&(i.j=i.j.replace(/:$/,""))}function _r(i,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);i.s=c}else i.s=null}function ea(i,c,l){c instanceof Sn?(i.i=c,Fh(i.i,i.h)):(l||(c=Rn(c,xh)),i.i=new Sn(c,i.h))}function X(i,c,l){i.i.set(c,l)}function yr(i){return X(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function An(i,c){return i?c?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Rn(i,c,l){return typeof i=="string"?(i=encodeURI(i).replace(c,Oh),l&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function Oh(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var ta=/[#\/\?@]/g,Mh=/[#\?:]/g,Lh=/[#\?]/g,xh=/[#\?@]/g,Uh=/#/g;function Sn(i,c){this.h=this.g=null,this.i=i||null,this.j=!!c}function rt(i){i.g||(i.g=new Map,i.h=0,i.i&&Nh(i.i,function(c,l){i.add(decodeURIComponent(c.replace(/\+/g," ")),l)}))}n=Sn.prototype,n.add=function(i,c){rt(this),this.i=null,i=Bt(this,i);var l=this.g.get(i);return l||this.g.set(i,l=[]),l.push(c),this.h+=1,this};function na(i,c){rt(i),c=Bt(i,c),i.g.has(c)&&(i.i=null,i.h-=i.g.get(c).length,i.g.delete(c))}function ra(i,c){return rt(i),c=Bt(i,c),i.g.has(c)}n.forEach=function(i,c){rt(this),this.g.forEach(function(l,f){l.forEach(function(w){i.call(c,w,f,this)},this)},this)},n.na=function(){rt(this);const i=Array.from(this.g.values()),c=Array.from(this.g.keys()),l=[];for(let f=0;f<c.length;f++){const w=i[f];for(let R=0;R<w.length;R++)l.push(c[f])}return l},n.V=function(i){rt(this);let c=[];if(typeof i=="string")ra(this,i)&&(c=c.concat(this.g.get(Bt(this,i))));else{i=Array.from(this.g.values());for(let l=0;l<i.length;l++)c=c.concat(i[l])}return c},n.set=function(i,c){return rt(this),this.i=null,i=Bt(this,i),ra(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[c]),this.h+=1,this},n.get=function(i,c){return i?(i=this.V(i),0<i.length?String(i[0]):c):c};function sa(i,c,l){na(i,c),0<l.length&&(i.i=null,i.g.set(Bt(i,c),N(l)),i.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],c=Array.from(this.g.keys());for(var l=0;l<c.length;l++){var f=c[l];const R=encodeURIComponent(String(f)),b=this.V(f);for(f=0;f<b.length;f++){var w=R;b[f]!==""&&(w+="="+encodeURIComponent(String(b[f]))),i.push(w)}}return this.i=i.join("&")};function Bt(i,c){return c=String(c),i.j&&(c=c.toLowerCase()),c}function Fh(i,c){c&&!i.j&&(rt(i),i.i=null,i.g.forEach(function(l,f){var w=f.toLowerCase();f!=w&&(na(this,f),sa(this,w,l))},i)),i.j=c}function Bh(i,c){const l=new vn;if(u.Image){const f=new Image;f.onload=P(st,l,"TestLoadImage: loaded",!0,c,f),f.onerror=P(st,l,"TestLoadImage: error",!1,c,f),f.onabort=P(st,l,"TestLoadImage: abort",!1,c,f),f.ontimeout=P(st,l,"TestLoadImage: timeout",!1,c,f),u.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=i}else c(!1)}function jh(i,c){const l=new vn,f=new AbortController,w=setTimeout(()=>{f.abort(),st(l,"TestPingServer: timeout",!1,c)},1e4);fetch(i,{signal:f.signal}).then(R=>{clearTimeout(w),R.ok?st(l,"TestPingServer: ok",!0,c):st(l,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(w),st(l,"TestPingServer: error",!1,c)})}function st(i,c,l,f,w){try{w&&(w.onload=null,w.onerror=null,w.onabort=null,w.ontimeout=null),f(l)}catch{}}function qh(){this.g=new Ah}function $h(i,c,l){const f=l||"";try{Yo(i,function(w,R){let b=w;d(w)&&(b=xs(w)),c.push(f+R+"="+encodeURIComponent(b))})}catch(w){throw c.push(f+"type="+encodeURIComponent("_badmap")),w}}function Er(i){this.l=i.Ub||null,this.j=i.eb||!1}k(Er,Us),Er.prototype.g=function(){return new Tr(this.l,this.j)},Er.prototype.i=(function(i){return function(){return i}})({});function Tr(i,c){me.call(this),this.D=i,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(Tr,me),n=Tr.prototype,n.open=function(i,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=c,this.readyState=1,Cn(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(c.body=i),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Pn(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Cn(this)),this.g&&(this.readyState=3,Cn(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;ia(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function ia(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var c=i.value?i.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!i.done}))&&(this.response=this.responseText+=c)}i.done?Pn(this):Cn(this),this.readyState==3&&ia(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,Pn(this))},n.Qa=function(i){this.g&&(this.response=i,Pn(this))},n.ga=function(){this.g&&Pn(this)};function Pn(i){i.readyState=4,i.l=null,i.j=null,i.v=null,Cn(i)}n.setRequestHeader=function(i,c){this.u.append(i,c)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],c=this.h.entries();for(var l=c.next();!l.done;)l=l.value,i.push(l[0]+": "+l[1]),l=c.next();return i.join(`\r
`)};function Cn(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(Tr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function oa(i){let c="";return fe(i,function(l,f){c+=f,c+=":",c+=l,c+=`\r
`}),c}function Ks(i,c,l){e:{for(f in l){var f=!1;break e}f=!0}f||(l=oa(l),typeof i=="string"?l!=null&&encodeURIComponent(String(l)):X(i,c,l))}function ee(i){me.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(ee,me);var zh=/^https?$/i,Hh=["POST","PUT"];n=ee.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,c,l,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);c=c?c.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():js.g(),this.v=this.o?Mo(this.o):Mo(js),this.g.onreadystatechange=I(this.Ea,this);try{this.B=!0,this.g.open(c,String(i),!0),this.B=!1}catch(R){aa(this,R);return}if(i=l||"",l=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var w in f)l.set(w,f[w]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const R of f.keys())l.set(R,f.get(R));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(l.keys()).find(R=>R.toLowerCase()=="content-type"),w=u.FormData&&i instanceof u.FormData,!(0<=Array.prototype.indexOf.call(Hh,c,void 0))||f||w||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[R,b]of l)this.g.setRequestHeader(R,b);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{la(this),this.u=!0,this.g.send(i),this.u=!1}catch(R){aa(this,R)}};function aa(i,c){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=c,i.m=5,ca(i),Ir(i)}function ca(i){i.A||(i.A=!0,ve(i,"complete"),ve(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,ve(this,"complete"),ve(this,"abort"),Ir(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ir(this,!0)),ee.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?ua(this):this.bb())},n.bb=function(){ua(this)};function ua(i){if(i.h&&typeof a<"u"&&(!i.v[1]||He(i)!=4||i.Z()!=2)){if(i.u&&He(i)==4)Vo(i.Ea,0,i);else if(ve(i,"readystatechange"),He(i)==4){i.h=!1;try{const b=i.Z();e:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var l;if(!(l=c)){var f;if(f=b===0){var w=String(i.D).match(Zo)[1]||null;!w&&u.self&&u.self.location&&(w=u.self.location.protocol.slice(0,-1)),f=!zh.test(w?w.toLowerCase():"")}l=f}if(l)ve(i,"complete"),ve(i,"success");else{i.m=6;try{var R=2<He(i)?i.g.statusText:""}catch{R=""}i.l=R+" ["+i.Z()+"]",ca(i)}}finally{Ir(i)}}}}function Ir(i,c){if(i.g){la(i);const l=i.g,f=i.v[0]?()=>{}:null;i.g=null,i.v=null,c||ve(i,"ready");try{l.onreadystatechange=f}catch{}}}function la(i){i.I&&(u.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function He(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<He(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var c=this.g.responseText;return i&&c.indexOf(i)==0&&(c=c.substring(i.length)),wh(c)}};function ha(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Wh(i){const c={};i=(i.g&&2<=He(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<i.length;f++){if(B(i[f]))continue;var l=T(i[f]);const w=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const R=c[w]||[];c[w]=R,R.push(l)}v(c,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function bn(i,c,l){return l&&l.internalChannelParams&&l.internalChannelParams[i]||c}function da(i){this.Aa=0,this.i=[],this.j=new vn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=bn("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=bn("baseRetryDelayMs",5e3,i),this.cb=bn("retryDelaySeedMs",1e4,i),this.Wa=bn("forwardChannelMaxRetries",2,i),this.wa=bn("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new Go(i&&i.concurrentRequestLimit),this.Da=new qh,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=da.prototype,n.la=8,n.G=1,n.connect=function(i,c,l,f){we(0),this.W=i,this.H=c||{},l&&f!==void 0&&(this.H.OSID=l,this.H.OAID=f),this.F=this.X,this.I=Ia(this,null,this.W),wr(this)};function Qs(i){if(fa(i),i.G==3){var c=i.U++,l=ze(i.I);if(X(l,"SID",i.K),X(l,"RID",c),X(l,"TYPE","terminate"),kn(i,l),c=new nt(i,i.j,c),c.L=2,c.v=yr(ze(l)),l=!1,u.navigator&&u.navigator.sendBeacon)try{l=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!l&&u.Image&&(new Image().src=c.v,l=!0),l||(c.g=va(c.j,null),c.g.ea(c.v)),c.F=Date.now(),mr(c)}Ta(i)}function vr(i){i.g&&(Js(i),i.g.cancel(),i.g=null)}function fa(i){vr(i),i.u&&(u.clearTimeout(i.u),i.u=null),Ar(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&u.clearTimeout(i.s),i.s=null)}function wr(i){if(!Ko(i.h)&&!i.s){i.s=!0;var c=i.Ga;mn||So(),gn||(mn(),gn=!0),bs.add(c,i),i.B=0}}function Gh(i,c){return Qo(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=c.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=In(I(i.Ga,i,c),Ea(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const w=new nt(this,this.j,i);let R=this.o;if(this.S&&(R?(R=m(R),E(R,this.S)):R=this.S),this.m!==null||this.O||(w.H=R,R=null),this.P)e:{for(var c=0,l=0;l<this.i.length;l++){t:{var f=this.i[l];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(c+=f,4096<c){c=l;break e}if(c===4096||l===this.i.length-1){c=l+1;break e}}c=1e3}else c=1e3;c=ma(this,w,c),l=ze(this.I),X(l,"RID",i),X(l,"CVER",22),this.D&&X(l,"X-HTTP-Session-Id",this.D),kn(this,l),R&&(this.O?c="headers="+encodeURIComponent(String(oa(R)))+"&"+c:this.m&&Ks(l,this.m,R)),Gs(this.h,w),this.Ua&&X(l,"TYPE","init"),this.P?(X(l,"$req",c),X(l,"SID","null"),w.T=!0,$s(w,l,null)):$s(w,l,c),this.G=2}}else this.G==3&&(i?pa(this,i):this.i.length==0||Ko(this.h)||pa(this))};function pa(i,c){var l;c?l=c.l:l=i.U++;const f=ze(i.I);X(f,"SID",i.K),X(f,"RID",l),X(f,"AID",i.T),kn(i,f),i.m&&i.o&&Ks(f,i.m,i.o),l=new nt(i,i.j,l,i.B+1),i.m===null&&(l.H=i.o),c&&(i.i=c.D.concat(i.i)),c=ma(i,l,1e3),l.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),Gs(i.h,l),$s(l,f,c)}function kn(i,c){i.H&&fe(i.H,function(l,f){X(c,f,l)}),i.l&&Yo({},function(l,f){X(c,f,l)})}function ma(i,c,l){l=Math.min(i.i.length,l);var f=i.l?I(i.l.Na,i.l,i):null;e:{var w=i.i;let R=-1;for(;;){const b=["count="+l];R==-1?0<l?(R=w[0].g,b.push("ofs="+R)):R=0:b.push("ofs="+R);let Q=!0;for(let ue=0;ue<l;ue++){let G=w[ue].g;const ge=w[ue].map;if(G-=R,0>G)R=Math.max(0,w[ue].g-100),Q=!1;else try{$h(ge,b,"req"+G+"_")}catch{f&&f(ge)}}if(Q){f=b.join("&");break e}}}return i=i.i.splice(0,l),c.D=i,f}function ga(i){if(!i.g&&!i.u){i.Y=1;var c=i.Fa;mn||So(),gn||(mn(),gn=!0),bs.add(c,i),i.v=0}}function Xs(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=In(I(i.Fa,i),Ea(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,_a(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=In(I(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,we(10),vr(this),_a(this))};function Js(i){i.A!=null&&(u.clearTimeout(i.A),i.A=null)}function _a(i){i.g=new nt(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var c=ze(i.qa);X(c,"RID","rpc"),X(c,"SID",i.K),X(c,"AID",i.T),X(c,"CI",i.F?"0":"1"),!i.F&&i.ja&&X(c,"TO",i.ja),X(c,"TYPE","xmlhttp"),kn(i,c),i.m&&i.o&&Ks(c,i.m,i.o),i.L&&(i.g.I=i.L);var l=i.g;i=i.ia,l.L=1,l.v=yr(ze(c)),l.m=null,l.P=!0,zo(l,i)}n.Za=function(){this.C!=null&&(this.C=null,vr(this),Xs(this),we(19))};function Ar(i){i.C!=null&&(u.clearTimeout(i.C),i.C=null)}function ya(i,c){var l=null;if(i.g==c){Ar(i),Js(i),i.g=null;var f=2}else if(Ws(i.h,c))l=c.D,Xo(i.h,c),f=1;else return;if(i.G!=0){if(c.o)if(f==1){l=c.m?c.m.length:0,c=Date.now()-c.F;var w=i.B;f=dr(),ve(f,new Bo(f,l)),wr(i)}else ga(i);else if(w=c.s,w==3||w==0&&0<c.X||!(f==1&&Gh(i,c)||f==2&&Xs(i)))switch(l&&0<l.length&&(c=i.h,c.i=c.i.concat(l)),w){case 1:St(i,5);break;case 4:St(i,10);break;case 3:St(i,6);break;default:St(i,2)}}}function Ea(i,c){let l=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(l*=2),l*c}function St(i,c){if(i.j.info("Error code "+c),c==2){var l=I(i.fb,i),f=i.Xa;const w=!f;f=new Rt(f||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||gr(f,"https"),yr(f),w?Bh(f.toString(),l):jh(f.toString(),l)}else we(2);i.G=0,i.l&&i.l.sa(c),Ta(i),fa(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),we(2)):(this.j.info("Failed to ping google.com"),we(1))};function Ta(i){if(i.G=0,i.ka=[],i.l){const c=Jo(i.h);(c.length!=0||i.i.length!=0)&&(V(i.ka,c),V(i.ka,i.i),i.h.i.length=0,N(i.i),i.i.length=0),i.l.ra()}}function Ia(i,c,l){var f=l instanceof Rt?ze(l):new Rt(l);if(f.g!="")c&&(f.g=c+"."+f.g),_r(f,f.s);else{var w=u.location;f=w.protocol,c=c?c+"."+w.hostname:w.hostname,w=+w.port;var R=new Rt(null);f&&gr(R,f),c&&(R.g=c),w&&_r(R,w),l&&(R.l=l),f=R}return l=i.D,c=i.ya,l&&c&&X(f,l,c),X(f,"VER",i.la),kn(i,f),f}function va(i,c,l){if(c&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=i.Ca&&!i.pa?new ee(new Er({eb:l})):new ee(i.pa),c.Ha(i.J),c}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function wa(){}n=wa.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Rr(){}Rr.prototype.g=function(i,c){return new Se(i,c)};function Se(i,c){me.call(this),this.g=new da(c),this.l=i,this.h=c&&c.messageUrlParams||null,i=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(i?i["X-WebChannel-Content-Type"]=c.messageContentType:i={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(i?i["X-WebChannel-Client-Profile"]=c.va:i={"X-WebChannel-Client-Profile":c.va}),this.g.S=i,(i=c&&c.Sb)&&!B(i)&&(this.g.m=i),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!B(c)&&(this.g.D=c,i=this.h,i!==null&&c in i&&(i=this.h,c in i&&delete i[c])),this.j=new jt(this)}k(Se,me),Se.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Se.prototype.close=function(){Qs(this.g)},Se.prototype.o=function(i){var c=this.g;if(typeof i=="string"){var l={};l.__data__=i,i=l}else this.u&&(l={},l.__data__=xs(i),i=l);c.i.push(new kh(c.Ya++,i)),c.G==3&&wr(c)},Se.prototype.N=function(){this.g.l=null,delete this.j,Qs(this.g),delete this.g,Se.aa.N.call(this)};function Aa(i){Fs.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var c=i.__sm__;if(c){e:{for(const l in c){i=l;break e}i=void 0}(this.i=i)&&(i=this.i,c=c!==null&&i in c?c[i]:void 0),this.data=c}else this.data=i}k(Aa,Fs);function Ra(){Bs.call(this),this.status=1}k(Ra,Bs);function jt(i){this.g=i}k(jt,wa),jt.prototype.ua=function(){ve(this.g,"a")},jt.prototype.ta=function(i){ve(this.g,new Aa(i))},jt.prototype.sa=function(i){ve(this.g,new Ra)},jt.prototype.ra=function(){ve(this.g,"b")},Rr.prototype.createWebChannel=Rr.prototype.g,Se.prototype.send=Se.prototype.o,Se.prototype.open=Se.prototype.m,Se.prototype.close=Se.prototype.close,Ku=function(){return new Rr},Gu=function(){return dr()},Wu=wt,Ei={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},fr.NO_ERROR=0,fr.TIMEOUT=8,fr.HTTP_ERROR=6,xr=fr,jo.COMPLETE="complete",Hu=jo,Lo.EventType=En,En.OPEN="a",En.CLOSE="b",En.ERROR="c",En.MESSAGE="d",me.prototype.listen=me.prototype.K,Vn=Lo,ee.prototype.listenOnce=ee.prototype.L,ee.prototype.getLastError=ee.prototype.Ka,ee.prototype.getLastErrorCode=ee.prototype.Ba,ee.prototype.getStatus=ee.prototype.Z,ee.prototype.getResponseJson=ee.prototype.Oa,ee.prototype.getResponseText=ee.prototype.oa,ee.prototype.send=ee.prototype.ea,ee.prototype.setWithCredentials=ee.prototype.Ha,zu=ee}).apply(typeof Cr<"u"?Cr:typeof self<"u"?self:typeof window<"u"?window:{});const nc="@firebase/firestore",rc="4.9.1";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ee.UNAUTHENTICATED=new Ee(null),Ee.GOOGLE_CREDENTIALS=new Ee("google-credentials-uid"),Ee.FIRST_PARTY=new Ee("first-party-uid"),Ee.MOCK_USER=new Ee("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ln="12.2.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ot=new Mi("@firebase/firestore");function $t(){return Ot.logLevel}function D(n,...e){if(Ot.logLevel<=j.DEBUG){const t=e.map(Gi);Ot.debug(`Firestore (${ln}): ${n}`,...t)}}function Ye(n,...e){if(Ot.logLevel<=j.ERROR){const t=e.map(Gi);Ot.error(`Firestore (${ln}): ${n}`,...t)}}function en(n,...e){if(Ot.logLevel<=j.WARN){const t=e.map(Gi);Ot.warn(`Firestore (${ln}): ${n}`,...t)}}function Gi(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Qu(n,r,t)}function Qu(n,e,t){let r=`FIRESTORE (${ln}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ye(r),new Error(r)}function K(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Qu(e,s,r)}function F(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends et{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class xm{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ee.UNAUTHENTICATED)))}shutdown(){}}class Um{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Fm{constructor(e){this.t=e,this.currentUser=Ee.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){K(this.o===void 0,42304);let r=this.i;const s=h=>this.i!==r?(r=this.i,t(h)):Promise.resolve();let o=new mt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new mt,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const h=o;e.enqueueRetryable((async()=>{await h.promise,await s(this.currentUser)}))},u=h=>{D("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((h=>u(h))),setTimeout((()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?u(h):(D("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new mt)}}),0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(D("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(K(typeof r.accessToken=="string",31837,{l:r}),new Xu(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return K(e===null||typeof e=="string",2055,{h:e}),new Ee(e)}}class Bm{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=Ee.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class jm{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Bm(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(Ee.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class sc{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class qm{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Oe(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){K(this.o===void 0,3512);const r=o=>{o.error!=null&&D("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.m;return this.m=o.token,D("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable((()=>r(o)))};const s=o=>{D("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((o=>s(o))),setTimeout((()=>{if(!this.appCheck){const o=this.V.getImmediate({optional:!0});o?s(o):D("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new sc(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(K(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new sc(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $m(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ki{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=$m(40);for(let o=0;o<s.length;++o)r.length<20&&s[o]<t&&(r+=e.charAt(s[o]%62))}return r}}function q(n,e){return n<e?-1:n>e?1:0}function Ti(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),o=e.charAt(r);if(s!==o)return oi(s)===oi(o)?q(s,o):oi(s)?1:-1}return q(n.length,e.length)}const zm=55296,Hm=57343;function oi(n){const e=n.charCodeAt(0);return e>=zm&&e<=Hm}function tn(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ic="__name__";class Ne{constructor(e,t,r){t===void 0?t=0:t>e.length&&L(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&L(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Ne.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Ne?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const o=Ne.compareSegments(e.get(s),t.get(s));if(o!==0)return o}return q(e.length,t.length)}static compareSegments(e,t){const r=Ne.isNumericId(e),s=Ne.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Ne.extractNumericId(e).compare(Ne.extractNumericId(t)):Ti(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return pt.fromString(e.substring(4,e.length-2))}}class Y extends Ne{construct(e,t,r){return new Y(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new O(C.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new Y(t)}static emptyPath(){return new Y([])}}const Wm=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class he extends Ne{construct(e,t,r){return new he(e,t,r)}static isValidIdentifier(e){return Wm.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),he.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===ic}static keyField(){return new he([ic])}static fromServerFormat(e){const t=[];let r="",s=0;const o=()=>{if(r.length===0)throw new O(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const u=e[s];if(u==="\\"){if(s+1===e.length)throw new O(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const h=e[s+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new O(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=h,s+=2}else u==="`"?(a=!a,s++):u!=="."||a?(r+=u,s++):(o(),s++)}if(o(),a)throw new O(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new he(t)}static emptyPath(){return new he([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(e){this.path=e}static fromPath(e){return new M(Y.fromString(e))}static fromName(e){return new M(Y.fromString(e).popFirst(5))}static empty(){return new M(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Y.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new M(new Y(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gm(n,e,t){if(!t)throw new O(C.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Km(n,e,t,r){if(e===!0&&r===!0)throw new O(C.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function oc(n){if(!M.isDocumentKey(n))throw new O(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Ju(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Qi(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":L(12329,{type:typeof n})}function zn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Qi(n);throw new O(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function re(n,e){const t={typeString:n};return e&&(t.value=e),t}function sr(n,e){if(!Ju(n))throw new O(C.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,o="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(o!==void 0&&a!==o.value){t=`Expected '${r}' field to equal '${o.value}'`;break}}if(t)throw new O(C.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ac=-62135596800,cc=1e6;class J{static now(){return J.fromMillis(Date.now())}static fromDate(e){return J.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*cc);return new J(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<ac)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/cc}_compareTo(e){return this.seconds===e.seconds?q(this.nanoseconds,e.nanoseconds):q(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:J._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(sr(e,J._jsonSchema))return new J(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-ac;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}J._jsonSchemaVersion="firestore/timestamp/1.0",J._jsonSchema={type:re("string",J._jsonSchemaVersion),seconds:re("number"),nanoseconds:re("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{static fromTimestamp(e){return new U(e)}static min(){return new U(new J(0,0))}static max(){return new U(new J(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hn=-1;function Qm(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=U.fromTimestamp(r===1e9?new J(t+1,0):new J(t,r));return new gt(s,M.empty(),e)}function Xm(n){return new gt(n.readTime,n.key,Hn)}class gt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new gt(U.min(),M.empty(),Hn)}static max(){return new gt(U.max(),M.empty(),Hn)}}function Jm(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=M.comparator(n.documentKey,e.documentKey),t!==0?t:q(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ym="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Zm{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hn(n){if(n.code!==C.FAILED_PRECONDITION||n.message!==Ym)throw n;D("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&L(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new S(((r,s)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(r,s)},this.catchCallback=o=>{this.wrapFailure(t,o).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof S?t:S.resolve(t)}catch(t){return S.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):S.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):S.reject(t)}static resolve(e){return new S(((t,r)=>{t(e)}))}static reject(e){return new S(((t,r)=>{r(e)}))}static waitFor(e){return new S(((t,r)=>{let s=0,o=0,a=!1;e.forEach((u=>{++s,u.next((()=>{++o,a&&o===s&&t()}),(h=>r(h)))})),a=!0,o===s&&t()}))}static or(e){let t=S.resolve(!1);for(const r of e)t=t.next((s=>s?S.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,o)=>{r.push(t.call(this,s,o))})),this.waitFor(r)}static mapArray(e,t){return new S(((r,s)=>{const o=e.length,a=new Array(o);let u=0;for(let h=0;h<o;h++){const d=h;t(e[d]).next((p=>{a[d]=p,++u,u===o&&r(a)}),(p=>s(p)))}}))}static doWhile(e,t){return new S(((r,s)=>{const o=()=>{e()===!0?t().next((()=>{o()}),s):r()};o()}))}}function eg(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function dn(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}ds.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xi=-1;function fs(n){return n==null}function Yr(n){return n===0&&1/n==-1/0}function tg(n){return typeof n=="number"&&Number.isInteger(n)&&!Yr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yu="";function ng(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=uc(e)),e=rg(n.get(t),e);return uc(e)}function rg(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const o=n.charAt(s);switch(o){case"\0":t+="";break;case Yu:t+="";break;default:t+=o}}return t}function uc(n){return n+Yu+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lc(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function vt(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Zu(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z{constructor(e,t){this.comparator=e,this.root=t||le.EMPTY}insert(e,t){return new Z(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,le.BLACK,null,null))}remove(e){return new Z(this.comparator,this.root.remove(e,this.comparator).copy(null,null,le.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new br(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new br(this.root,e,this.comparator,!1)}getReverseIterator(){return new br(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new br(this.root,e,this.comparator,!0)}}class br{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?r(e.key,t):1,t&&s&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class le{constructor(e,t,r,s,o){this.key=e,this.value=t,this.color=r??le.RED,this.left=s??le.EMPTY,this.right=o??le.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,o){return new le(e??this.key,t??this.value,r??this.color,s??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const o=r(e,s.key);return s=o<0?s.copy(null,null,null,s.left.insert(e,t,r),null):o===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return le.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return le.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,le.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,le.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw L(43730,{key:this.key,value:this.value});if(this.right.isRed())throw L(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw L(27949);return e+(this.isRed()?0:1)}}le.EMPTY=null,le.RED=!0,le.BLACK=!1;le.EMPTY=new class{constructor(){this.size=0}get key(){throw L(57766)}get value(){throw L(16141)}get color(){throw L(16727)}get left(){throw L(29726)}get right(){throw L(36894)}copy(e,t,r,s,o){return this}insert(e,t,r){return new le(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e){this.comparator=e,this.data=new Z(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new hc(this.data.getIterator())}getIteratorFrom(e){return new hc(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,o=r.getNext().key;if(this.comparator(s,o)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new ie(this.comparator);return t.data=e,t}}class hc{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e){this.fields=e,e.sort(he.comparator)}static empty(){return new Ve([])}unionWith(e){let t=new ie(he.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ve(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return tn(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class el extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new el("Invalid base64 string: "+o):o}})(e);return new de(t)}static fromUint8Array(e){const t=(function(s){let o="";for(let a=0;a<s.length;++a)o+=String.fromCharCode(s[a]);return o})(e);return new de(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return q(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}de.EMPTY_BYTE_STRING=new de("");const sg=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function _t(n){if(K(!!n,39018),typeof n=="string"){let e=0;const t=sg.exec(n);if(K(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:te(n.seconds),nanos:te(n.nanos)}}function te(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function yt(n){return typeof n=="string"?de.fromBase64String(n):de.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tl="server_timestamp",nl="__type__",rl="__previous_value__",sl="__local_write_time__";function Ji(n){return(n?.mapValue?.fields||{})[nl]?.stringValue===tl}function ps(n){const e=n.mapValue.fields[rl];return Ji(e)?ps(e):e}function Wn(n){const e=_t(n.mapValue.fields[sl].timestampValue);return new J(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e,t,r,s,o,a,u,h,d,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=h,this.useFetchStreams=d,this.isUsingEmulator=p}}const Zr="(default)";class Gn{constructor(e,t){this.projectId=e,this.database=t||Zr}static empty(){return new Gn("","")}get isDefaultDatabase(){return this.database===Zr}isEqual(e){return e instanceof Gn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const il="__type__",og="__max__",kr={mapValue:{}},ol="__vector__",es="value";function Et(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ji(n)?4:cg(n)?9007199254740991:ag(n)?10:11:L(28295,{value:n})}function je(n,e){if(n===e)return!0;const t=Et(n);if(t!==Et(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Wn(n).isEqual(Wn(e));case 3:return(function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=_t(s.timestampValue),u=_t(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(s,o){return yt(s.bytesValue).isEqual(yt(o.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(s,o){return te(s.geoPointValue.latitude)===te(o.geoPointValue.latitude)&&te(s.geoPointValue.longitude)===te(o.geoPointValue.longitude)})(n,e);case 2:return(function(s,o){if("integerValue"in s&&"integerValue"in o)return te(s.integerValue)===te(o.integerValue);if("doubleValue"in s&&"doubleValue"in o){const a=te(s.doubleValue),u=te(o.doubleValue);return a===u?Yr(a)===Yr(u):isNaN(a)&&isNaN(u)}return!1})(n,e);case 9:return tn(n.arrayValue.values||[],e.arrayValue.values||[],je);case 10:case 11:return(function(s,o){const a=s.mapValue.fields||{},u=o.mapValue.fields||{};if(lc(a)!==lc(u))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(u[h]===void 0||!je(a[h],u[h])))return!1;return!0})(n,e);default:return L(52216,{left:n})}}function Kn(n,e){return(n.values||[]).find((t=>je(t,e)))!==void 0}function nn(n,e){if(n===e)return 0;const t=Et(n),r=Et(e);if(t!==r)return q(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return q(n.booleanValue,e.booleanValue);case 2:return(function(o,a){const u=te(o.integerValue||o.doubleValue),h=te(a.integerValue||a.doubleValue);return u<h?-1:u>h?1:u===h?0:isNaN(u)?isNaN(h)?0:-1:1})(n,e);case 3:return dc(n.timestampValue,e.timestampValue);case 4:return dc(Wn(n),Wn(e));case 5:return Ti(n.stringValue,e.stringValue);case 6:return(function(o,a){const u=yt(o),h=yt(a);return u.compareTo(h)})(n.bytesValue,e.bytesValue);case 7:return(function(o,a){const u=o.split("/"),h=a.split("/");for(let d=0;d<u.length&&d<h.length;d++){const p=q(u[d],h[d]);if(p!==0)return p}return q(u.length,h.length)})(n.referenceValue,e.referenceValue);case 8:return(function(o,a){const u=q(te(o.latitude),te(a.latitude));return u!==0?u:q(te(o.longitude),te(a.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return fc(n.arrayValue,e.arrayValue);case 10:return(function(o,a){const u=o.fields||{},h=a.fields||{},d=u[es]?.arrayValue,p=h[es]?.arrayValue,y=q(d?.values?.length||0,p?.values?.length||0);return y!==0?y:fc(d,p)})(n.mapValue,e.mapValue);case 11:return(function(o,a){if(o===kr.mapValue&&a===kr.mapValue)return 0;if(o===kr.mapValue)return 1;if(a===kr.mapValue)return-1;const u=o.fields||{},h=Object.keys(u),d=a.fields||{},p=Object.keys(d);h.sort(),p.sort();for(let y=0;y<h.length&&y<p.length;++y){const I=Ti(h[y],p[y]);if(I!==0)return I;const P=nn(u[h[y]],d[p[y]]);if(P!==0)return P}return q(h.length,p.length)})(n.mapValue,e.mapValue);default:throw L(23264,{he:t})}}function dc(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return q(n,e);const t=_t(n),r=_t(e),s=q(t.seconds,r.seconds);return s!==0?s:q(t.nanos,r.nanos)}function fc(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const o=nn(t[s],r[s]);if(o)return o}return q(t.length,r.length)}function rn(n){return Ii(n)}function Ii(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=_t(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return yt(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return M.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const o of t.values||[])s?s=!1:r+=",",r+=Ii(o);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",o=!0;for(const a of r)o?o=!1:s+=",",s+=`${a}:${Ii(t.fields[a])}`;return s+"}"})(n.mapValue):L(61005,{value:n})}function Ur(n){switch(Et(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ps(n);return e?16+Ur(e):16;case 5:return 2*n.stringValue.length;case 6:return yt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,o)=>s+Ur(o)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return vt(r.fields,((o,a)=>{s+=o.length+Ur(a)})),s})(n.mapValue);default:throw L(13486,{value:n})}}function vi(n){return!!n&&"integerValue"in n}function Yi(n){return!!n&&"arrayValue"in n}function pc(n){return!!n&&"nullValue"in n}function mc(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Fr(n){return!!n&&"mapValue"in n}function ag(n){return(n?.mapValue?.fields||{})[il]?.stringValue===ol}function xn(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return vt(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=xn(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=xn(n.arrayValue.values[t]);return e}return{...n}}function cg(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===og}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe{constructor(e){this.value=e}static empty(){return new Pe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Fr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=xn(t)}setAll(e){let t=he.emptyPath(),r={},s=[];e.forEach(((a,u)=>{if(!t.isImmediateParentOf(u)){const h=this.getFieldsMap(t);this.applyChanges(h,r,s),r={},s=[],t=u.popLast()}a?r[u.lastSegment()]=xn(a):s.push(u.lastSegment())}));const o=this.getFieldsMap(t);this.applyChanges(o,r,s)}delete(e){const t=this.field(e.popLast());Fr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return je(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Fr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){vt(t,((s,o)=>e[s]=o));for(const s of r)delete e[s]}clone(){return new Pe(xn(this.value))}}function al(n){const e=[];return vt(n.fields,((t,r)=>{const s=new he([t]);if(Fr(r)){const o=al(r.mapValue).fields;if(o.length===0)e.push(s);else for(const a of o)e.push(s.child(a))}else e.push(s)})),new Ve(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(e,t,r,s,o,a,u){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=o,this.data=a,this.documentState=u}static newInvalidDocument(e){return new Te(e,0,U.min(),U.min(),U.min(),Pe.empty(),0)}static newFoundDocument(e,t,r,s){return new Te(e,1,t,U.min(),r,s,0)}static newNoDocument(e,t){return new Te(e,2,t,U.min(),U.min(),Pe.empty(),0)}static newUnknownDocument(e,t){return new Te(e,3,t,U.min(),U.min(),Pe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Pe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Pe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Te&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Te(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(e,t){this.position=e,this.inclusive=t}}function gc(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const o=e[s],a=n.position[s];if(o.field.isKeyField()?r=M.comparator(M.fromName(a.referenceValue),t.key):r=nn(a,t.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function _c(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!je(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(e,t="asc"){this.field=e,this.dir=t}}function ug(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cl{}class se extends cl{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new hg(e,t,r):t==="array-contains"?new pg(e,r):t==="in"?new mg(e,r):t==="not-in"?new gg(e,r):t==="array-contains-any"?new _g(e,r):new se(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new dg(e,r):new fg(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(nn(t,this.value)):t!==null&&Et(this.value)===Et(t)&&this.matchesComparison(nn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return L(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class qe extends cl{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new qe(e,t)}matches(e){return ul(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function ul(n){return n.op==="and"}function ll(n){return lg(n)&&ul(n)}function lg(n){for(const e of n.filters)if(e instanceof qe)return!1;return!0}function wi(n){if(n instanceof se)return n.field.canonicalString()+n.op.toString()+rn(n.value);if(ll(n))return n.filters.map((e=>wi(e))).join(",");{const e=n.filters.map((t=>wi(t))).join(",");return`${n.op}(${e})`}}function hl(n,e){return n instanceof se?(function(r,s){return s instanceof se&&r.op===s.op&&r.field.isEqual(s.field)&&je(r.value,s.value)})(n,e):n instanceof qe?(function(r,s){return s instanceof qe&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((o,a,u)=>o&&hl(a,s.filters[u])),!0):!1})(n,e):void L(19439)}function dl(n){return n instanceof se?(function(t){return`${t.field.canonicalString()} ${t.op} ${rn(t.value)}`})(n):n instanceof qe?(function(t){return t.op.toString()+" {"+t.getFilters().map(dl).join(" ,")+"}"})(n):"Filter"}class hg extends se{constructor(e,t,r){super(e,t,r),this.key=M.fromName(r.referenceValue)}matches(e){const t=M.comparator(e.key,this.key);return this.matchesComparison(t)}}class dg extends se{constructor(e,t){super(e,"in",t),this.keys=fl("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class fg extends se{constructor(e,t){super(e,"not-in",t),this.keys=fl("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function fl(n,e){return(e.arrayValue?.values||[]).map((t=>M.fromName(t.referenceValue)))}class pg extends se{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Yi(t)&&Kn(t.arrayValue,this.value)}}class mg extends se{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Kn(this.value.arrayValue,t)}}class gg extends se{constructor(e,t){super(e,"not-in",t)}matches(e){if(Kn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Kn(this.value.arrayValue,t)}}class _g extends se{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Yi(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>Kn(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yg{constructor(e,t=null,r=[],s=[],o=null,a=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=o,this.startAt=a,this.endAt=u,this.Te=null}}function yc(n,e=null,t=[],r=[],s=null,o=null,a=null){return new yg(n,e,t,r,s,o,a)}function Zi(n){const e=F(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>wi(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(o){return o.field.canonicalString()+o.dir})(r))).join(","),fs(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>rn(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>rn(r))).join(",")),e.Te=t}return e.Te}function eo(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!ug(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!hl(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!_c(n.startAt,e.startAt)&&_c(n.endAt,e.endAt)}function Ai(n){return M.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(e,t=null,r=[],s=[],o=null,a="F",u=null,h=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=o,this.limitType=a,this.startAt=u,this.endAt=h,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function Eg(n,e,t,r,s,o,a,u){return new ms(n,e,t,r,s,o,a,u)}function to(n){return new ms(n)}function Ec(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Tg(n){return n.collectionGroup!==null}function Un(n){const e=F(n);if(e.Ie===null){e.Ie=[];const t=new Set;for(const o of e.explicitOrderBy)e.Ie.push(o),t.add(o.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new ie(he.comparator);return a.filters.forEach((h=>{h.getFlattenedFilters().forEach((d=>{d.isInequality()&&(u=u.add(d.field))}))})),u})(e).forEach((o=>{t.has(o.canonicalString())||o.isKeyField()||e.Ie.push(new ns(o,r))})),t.has(he.keyField().canonicalString())||e.Ie.push(new ns(he.keyField(),r))}return e.Ie}function xe(n){const e=F(n);return e.Ee||(e.Ee=Ig(e,Un(n))),e.Ee}function Ig(n,e){if(n.limitType==="F")return yc(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const o=s.dir==="desc"?"asc":"desc";return new ns(s.field,o)}));const t=n.endAt?new ts(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ts(n.startAt.position,n.startAt.inclusive):null;return yc(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Ri(n,e,t){return new ms(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function gs(n,e){return eo(xe(n),xe(e))&&n.limitType===e.limitType}function pl(n){return`${Zi(xe(n))}|lt:${n.limitType}`}function zt(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>dl(s))).join(", ")}]`),fs(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>rn(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>rn(s))).join(",")),`Target(${r})`})(xe(n))}; limitType=${n.limitType})`}function _s(n,e){return e.isFoundDocument()&&(function(r,s){const o=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):M.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)})(n,e)&&(function(r,s){for(const o of Un(r))if(!o.field.isKeyField()&&s.data.field(o.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const o of r.filters)if(!o.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(a,u,h){const d=gc(a,u,h);return a.inclusive?d<=0:d<0})(r.startAt,Un(r),s)||r.endAt&&!(function(a,u,h){const d=gc(a,u,h);return a.inclusive?d>=0:d>0})(r.endAt,Un(r),s))})(n,e)}function vg(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function ml(n){return(e,t)=>{let r=!1;for(const s of Un(n)){const o=wg(s,e,t);if(o!==0)return o;r=r||s.field.isKeyField()}return 0}}function wg(n,e,t){const r=n.field.isKeyField()?M.comparator(e.key,t.key):(function(o,a,u){const h=a.data.field(o),d=u.data.field(o);return h!==null&&d!==null?nn(h,d):L(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return L(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,o]of r)if(this.equalsFn(s,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],e))return void(s[o]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){vt(this.inner,((t,r)=>{for(const[s,o]of r)e(s,o)}))}isEmpty(){return Zu(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ag=new Z(M.comparator);function Ze(){return Ag}const gl=new Z(M.comparator);function Dn(...n){let e=gl;for(const t of n)e=e.insert(t.key,t);return e}function _l(n){let e=gl;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function Ct(){return Fn()}function yl(){return Fn()}function Fn(){return new Lt((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Rg=new Z(M.comparator),Sg=new ie(M.comparator);function $(...n){let e=Sg;for(const t of n)e=e.add(t);return e}const Pg=new ie(q);function Cg(){return Pg}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function no(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Yr(e)?"-0":e}}function El(n){return{integerValue:""+n}}function bg(n,e){return tg(e)?El(e):no(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ys{constructor(){this._=void 0}}function kg(n,e,t){return n instanceof Qn?(function(s,o){const a={fields:{[nl]:{stringValue:tl},[sl]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return o&&Ji(o)&&(o=ps(o)),o&&(a.fields[rl]=o),{mapValue:a}})(t,e):n instanceof Xn?Il(n,e):n instanceof Jn?vl(n,e):(function(s,o){const a=Tl(s,o),u=Tc(a)+Tc(s.Ae);return vi(a)&&vi(s.Ae)?El(u):no(s.serializer,u)})(n,e)}function Vg(n,e,t){return n instanceof Xn?Il(n,e):n instanceof Jn?vl(n,e):t}function Tl(n,e){return n instanceof rs?(function(r){return vi(r)||(function(o){return!!o&&"doubleValue"in o})(r)})(e)?e:{integerValue:0}:null}class Qn extends ys{}class Xn extends ys{constructor(e){super(),this.elements=e}}function Il(n,e){const t=wl(e);for(const r of n.elements)t.some((s=>je(s,r)))||t.push(r);return{arrayValue:{values:t}}}class Jn extends ys{constructor(e){super(),this.elements=e}}function vl(n,e){let t=wl(e);for(const r of n.elements)t=t.filter((s=>!je(s,r)));return{arrayValue:{values:t}}}class rs extends ys{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function Tc(n){return te(n.integerValue||n.doubleValue)}function wl(n){return Yi(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dg{constructor(e,t){this.field=e,this.transform=t}}function Ng(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof Xn&&s instanceof Xn||r instanceof Jn&&s instanceof Jn?tn(r.elements,s.elements,je):r instanceof rs&&s instanceof rs?je(r.Ae,s.Ae):r instanceof Qn&&s instanceof Qn})(n.transform,e.transform)}class Og{constructor(e,t){this.version=e,this.transformResults=t}}class Ke{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ke}static exists(e){return new Ke(void 0,e)}static updateTime(e){return new Ke(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Br(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Es{}function Al(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Sl(n.key,Ke.none()):new Ts(n.key,n.data,Ke.none());{const t=n.data,r=Pe.empty();let s=new ie(he.comparator);for(let o of e.fields)if(!s.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?r.delete(o):r.set(o,a),s=s.add(o)}return new xt(n.key,r,new Ve(s.toArray()),Ke.none())}}function Mg(n,e,t){n instanceof Ts?(function(s,o,a){const u=s.value.clone(),h=vc(s.fieldTransforms,o,a.transformResults);u.setAll(h),o.convertToFoundDocument(a.version,u).setHasCommittedMutations()})(n,e,t):n instanceof xt?(function(s,o,a){if(!Br(s.precondition,o))return void o.convertToUnknownDocument(a.version);const u=vc(s.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Rl(s)),h.setAll(u),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()})(n,e,t):(function(s,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function Bn(n,e,t,r){return n instanceof Ts?(function(o,a,u,h){if(!Br(o.precondition,a))return u;const d=o.value.clone(),p=wc(o.fieldTransforms,h,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null})(n,e,t,r):n instanceof xt?(function(o,a,u,h){if(!Br(o.precondition,a))return u;const d=wc(o.fieldTransforms,h,a),p=a.data;return p.setAll(Rl(o)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),u===null?null:u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map((y=>y.field)))})(n,e,t,r):(function(o,a,u){return Br(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u})(n,e,t)}function Lg(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),o=Tl(r.transform,s||null);o!=null&&(t===null&&(t=Pe.empty()),t.set(r.field,o))}return t||null}function Ic(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&tn(r,s,((o,a)=>Ng(o,a)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ts extends Es{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class xt extends Es{constructor(e,t,r,s,o=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Rl(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function vc(n,e,t){const r=new Map;K(n.length===t.length,32656,{Re:t.length,Ve:n.length});for(let s=0;s<t.length;s++){const o=n[s],a=o.transform,u=e.data.field(o.field);r.set(o.field,Vg(a,u,t[s]))}return r}function wc(n,e,t){const r=new Map;for(const s of n){const o=s.transform,a=t.data.field(s.field);r.set(s.field,kg(o,a,e))}return r}class Sl extends Es{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class xg extends Es{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ug{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const o=this.mutations[s];o.key.isEqual(e.key)&&Mg(o,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Bn(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Bn(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=yl();return this.mutations.forEach((s=>{const o=e.get(s.key),a=o.overlayedDocument;let u=this.applyToLocalView(a,o.mutatedFields);u=t.has(s.key)?null:u;const h=Al(a,u);h!==null&&r.set(s.key,h),a.isValidDocument()||a.convertToNoDocument(U.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),$())}isEqual(e){return this.batchId===e.batchId&&tn(this.mutations,e.mutations,((t,r)=>Ic(t,r)))&&tn(this.baseMutations,e.baseMutations,((t,r)=>Ic(t,r)))}}class ro{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){K(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let s=(function(){return Rg})();const o=e.mutations;for(let a=0;a<o.length;a++)s=s.insert(o[a].key,r[a].version);return new ro(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fg{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bg{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ne,W;function jg(n){switch(n){case C.OK:return L(64938);case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0;default:return L(15467,{code:n})}}function Pl(n){if(n===void 0)return Ye("GRPC error has no .code"),C.UNKNOWN;switch(n){case ne.OK:return C.OK;case ne.CANCELLED:return C.CANCELLED;case ne.UNKNOWN:return C.UNKNOWN;case ne.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case ne.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case ne.INTERNAL:return C.INTERNAL;case ne.UNAVAILABLE:return C.UNAVAILABLE;case ne.UNAUTHENTICATED:return C.UNAUTHENTICATED;case ne.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case ne.NOT_FOUND:return C.NOT_FOUND;case ne.ALREADY_EXISTS:return C.ALREADY_EXISTS;case ne.PERMISSION_DENIED:return C.PERMISSION_DENIED;case ne.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case ne.ABORTED:return C.ABORTED;case ne.OUT_OF_RANGE:return C.OUT_OF_RANGE;case ne.UNIMPLEMENTED:return C.UNIMPLEMENTED;case ne.DATA_LOSS:return C.DATA_LOSS;default:return L(39323,{code:n})}}(W=ne||(ne={}))[W.OK=0]="OK",W[W.CANCELLED=1]="CANCELLED",W[W.UNKNOWN=2]="UNKNOWN",W[W.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",W[W.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",W[W.NOT_FOUND=5]="NOT_FOUND",W[W.ALREADY_EXISTS=6]="ALREADY_EXISTS",W[W.PERMISSION_DENIED=7]="PERMISSION_DENIED",W[W.UNAUTHENTICATED=16]="UNAUTHENTICATED",W[W.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",W[W.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",W[W.ABORTED=10]="ABORTED",W[W.OUT_OF_RANGE=11]="OUT_OF_RANGE",W[W.UNIMPLEMENTED=12]="UNIMPLEMENTED",W[W.INTERNAL=13]="INTERNAL",W[W.UNAVAILABLE=14]="UNAVAILABLE",W[W.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qg(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $g=new pt([4294967295,4294967295],0);function Ac(n){const e=qg().encode(n),t=new $u;return t.update(e),new Uint8Array(t.digest())}function Rc(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),o=e.getUint32(12,!0);return[new pt([t,r],0),new pt([s,o],0)]}class so{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Nn(`Invalid padding: ${t}`);if(r<0)throw new Nn(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Nn(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Nn(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=pt.fromNumber(this.ge)}ye(e,t,r){let s=e.add(t.multiply(pt.fromNumber(r)));return s.compare($g)===1&&(s=new pt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Ac(e),[r,s]=Rc(t);for(let o=0;o<this.hashCount;o++){const a=this.ye(r,s,o);if(!this.we(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,o=new Uint8Array(Math.ceil(e/8)),a=new so(o,s,t);return r.forEach((u=>a.insert(u))),a}insert(e){if(this.ge===0)return;const t=Ac(e),[r,s]=Rc(t);for(let o=0;o<this.hashCount;o++){const a=this.ye(r,s,o);this.Se(a)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Nn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is{constructor(e,t,r,s,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,ir.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Is(U.min(),s,new Z(q),Ze(),$())}}class ir{constructor(e,t,r,s,o){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new ir(r,t,$(),$(),$())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{constructor(e,t,r,s){this.be=e,this.removedTargetIds=t,this.key=r,this.De=s}}class Cl{constructor(e,t){this.targetId=e,this.Ce=t}}class bl{constructor(e,t,r=de.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Sc{constructor(){this.ve=0,this.Fe=Pc(),this.Me=de.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=$(),t=$(),r=$();return this.Fe.forEach(((s,o)=>{switch(o){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:L(38017,{changeType:o})}})),new ir(this.Me,this.xe,e,t,r)}qe(){this.Oe=!1,this.Fe=Pc()}Qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,K(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class zg{constructor(e){this.Ge=e,this.ze=new Map,this.je=Ze(),this.Je=Vr(),this.He=Vr(),this.Ye=new Z(q)}Ze(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Xe(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,(t=>{const r=this.nt(t);switch(e.state){case 0:this.rt(t)&&r.Le(e.resumeToken);break;case 1:r.Ke(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.Ke(),r.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(r.We(),r.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),r.Le(e.resumeToken));break;default:L(56790,{state:e.state})}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach(((r,s)=>{this.rt(s)&&t(s)}))}st(e){const t=e.targetId,r=e.Ce.count,s=this.ot(t);if(s){const o=s.target;if(Ai(o))if(r===0){const a=new M(o.path);this.et(t,a,Te.newNoDocument(a,U.min()))}else K(r===1,20013,{expectedCount:r});else{const a=this._t(t);if(a!==r){const u=this.ut(e),h=u?this.ct(u,e,a):1;if(h!==0){this.it(t);const d=h===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(t,d)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:o=0}=t;let a,u;try{a=yt(r).toUint8Array()}catch(h){if(h instanceof el)return en("Decoding the base64 bloom filter in existence filter failed ("+h.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw h}try{u=new so(a,s,o)}catch(h){return en(h instanceof Nn?"BloomFilter error: ":"Applying bloom filter failed: ",h),null}return u.ge===0?null:u}ct(e,t,r){return t.Ce.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.Ge.getRemoteKeysForTarget(t);let s=0;return r.forEach((o=>{const a=this.Ge.ht(),u=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;e.mightContain(u)||(this.et(t,o,null),s++)})),s}Tt(e){const t=new Map;this.ze.forEach(((o,a)=>{const u=this.ot(a);if(u){if(o.current&&Ai(u.target)){const h=new M(u.target.path);this.It(h).has(a)||this.Et(a,h)||this.et(a,h,Te.newNoDocument(h,e))}o.Be&&(t.set(a,o.ke()),o.qe())}}));let r=$();this.He.forEach(((o,a)=>{let u=!0;a.forEachWhile((h=>{const d=this.ot(h);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)})),u&&(r=r.add(o))})),this.je.forEach(((o,a)=>a.setReadTime(e)));const s=new Is(e,t,this.Ye,this.je,r);return this.je=Ze(),this.Je=Vr(),this.He=Vr(),this.Ye=new Z(q),s}Xe(e,t){if(!this.rt(e))return;const r=this.Et(e,t.key)?2:0;this.nt(e).Qe(t.key,r),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.dt(t.key).add(e))}et(e,t,r){if(!this.rt(e))return;const s=this.nt(e);this.Et(e,t)?s.Qe(t,1):s.$e(t),this.He=this.He.insert(t,this.dt(t).delete(e)),this.He=this.He.insert(t,this.dt(t).add(e)),r&&(this.je=this.je.insert(t,r))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let t=this.ze.get(e);return t||(t=new Sc,this.ze.set(e,t)),t}dt(e){let t=this.He.get(e);return t||(t=new ie(q),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new ie(q),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||D("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new Sc),this.Ge.getRemoteKeysForTarget(e).forEach((t=>{this.et(e,t,null)}))}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Vr(){return new Z(M.comparator)}function Pc(){return new Z(M.comparator)}const Hg={asc:"ASCENDING",desc:"DESCENDING"},Wg={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Gg={and:"AND",or:"OR"};class Kg{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Si(n,e){return n.useProto3Json||fs(e)?e:{value:e}}function ss(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function kl(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Qg(n,e){return ss(n,e.toTimestamp())}function Ue(n){return K(!!n,49232),U.fromTimestamp((function(t){const r=_t(t);return new J(r.seconds,r.nanos)})(n))}function io(n,e){return Pi(n,e).canonicalString()}function Pi(n,e){const t=(function(s){return new Y(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Vl(n){const e=Y.fromString(n);return K(Ll(e),10190,{key:e.toString()}),e}function Ci(n,e){return io(n.databaseId,e.path)}function ai(n,e){const t=Vl(e);if(t.get(1)!==n.databaseId.projectId)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new M(Nl(t))}function Dl(n,e){return io(n.databaseId,e)}function Xg(n){const e=Vl(n);return e.length===4?Y.emptyPath():Nl(e)}function bi(n){return new Y(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function Nl(n){return K(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Cc(n,e,t){return{name:Ci(n,e),fields:t.value.mapValue.fields}}function Jg(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:L(39313,{state:d})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],o=(function(d,p){return d.useProto3Json?(K(p===void 0||typeof p=="string",58123),de.fromBase64String(p||"")):(K(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),de.fromUint8Array(p||new Uint8Array))})(n,e.targetChange.resumeToken),a=e.targetChange.cause,u=a&&(function(d){const p=d.code===void 0?C.UNKNOWN:Pl(d.code);return new O(p,d.message||"")})(a);t=new bl(r,s,o,u||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=ai(n,r.document.name),o=Ue(r.document.updateTime),a=r.document.createTime?Ue(r.document.createTime):U.min(),u=new Pe({mapValue:{fields:r.document.fields}}),h=Te.newFoundDocument(s,o,a,u),d=r.targetIds||[],p=r.removedTargetIds||[];t=new jr(d,p,h.key,h)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=ai(n,r.document),o=r.readTime?Ue(r.readTime):U.min(),a=Te.newNoDocument(s,o),u=r.removedTargetIds||[];t=new jr([],u,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=ai(n,r.document),o=r.removedTargetIds||[];t=new jr([],o,s,null)}else{if(!("filter"in e))return L(11601,{Rt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:o}=r,a=new Bg(s,o),u=r.targetId;t=new Cl(u,a)}}return t}function Yg(n,e){let t;if(e instanceof Ts)t={update:Cc(n,e.key,e.value)};else if(e instanceof Sl)t={delete:Ci(n,e.key)};else if(e instanceof xt)t={update:Cc(n,e.key,e.data),updateMask:a_(e.fieldMask)};else{if(!(e instanceof xg))return L(16599,{Vt:e.type});t={verify:Ci(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(o,a){const u=a.transform;if(u instanceof Qn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof Xn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Jn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof rs)return{fieldPath:a.field.canonicalString(),increment:u.Ae};throw L(20930,{transform:a.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,o){return o.updateTime!==void 0?{updateTime:Qg(s,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:L(27497)})(n,e.precondition)),t}function Zg(n,e){return n&&n.length>0?(K(e!==void 0,14353),n.map((t=>(function(s,o){let a=s.updateTime?Ue(s.updateTime):Ue(o);return a.isEqual(U.min())&&(a=Ue(o)),new Og(a,s.transformResults||[])})(t,e)))):[]}function e_(n,e){return{documents:[Dl(n,e.path)]}}function t_(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Dl(n,s);const o=(function(d){if(d.length!==0)return Ml(qe.create(d,"and"))})(e.filters);o&&(t.structuredQuery.where=o);const a=(function(d){if(d.length!==0)return d.map((p=>(function(I){return{field:Ht(I.field),direction:s_(I.dir)}})(p)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const u=Si(n,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=(function(d){return{before:d.inclusive,values:d.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(d){return{before:!d.inclusive,values:d.position}})(e.endAt)),{ft:t,parent:s}}function n_(n){let e=Xg(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){K(r===1,65062);const p=t.from[0];p.allDescendants?s=p.collectionId:e=e.child(p.collectionId)}let o=[];t.where&&(o=(function(y){const I=Ol(y);return I instanceof qe&&ll(I)?I.getFilters():[I]})(t.where));let a=[];t.orderBy&&(a=(function(y){return y.map((I=>(function(k){return new ns(Wt(k.field),(function(V){switch(V){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(k.direction))})(I)))})(t.orderBy));let u=null;t.limit&&(u=(function(y){let I;return I=typeof y=="object"?y.value:y,fs(I)?null:I})(t.limit));let h=null;t.startAt&&(h=(function(y){const I=!!y.before,P=y.values||[];return new ts(P,I)})(t.startAt));let d=null;return t.endAt&&(d=(function(y){const I=!y.before,P=y.values||[];return new ts(P,I)})(t.endAt)),Eg(e,s,a,o,u,"F",h,d)}function r_(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return L(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Ol(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Wt(t.unaryFilter.field);return se.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Wt(t.unaryFilter.field);return se.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=Wt(t.unaryFilter.field);return se.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Wt(t.unaryFilter.field);return se.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return L(61313);default:return L(60726)}})(n):n.fieldFilter!==void 0?(function(t){return se.create(Wt(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return L(58110);default:return L(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return qe.create(t.compositeFilter.filters.map((r=>Ol(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return L(1026)}})(t.compositeFilter.op))})(n):L(30097,{filter:n})}function s_(n){return Hg[n]}function i_(n){return Wg[n]}function o_(n){return Gg[n]}function Ht(n){return{fieldPath:n.canonicalString()}}function Wt(n){return he.fromServerFormat(n.fieldPath)}function Ml(n){return n instanceof se?(function(t){if(t.op==="=="){if(mc(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NAN"}};if(pc(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(mc(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NOT_NAN"}};if(pc(t.value))return{unaryFilter:{field:Ht(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ht(t.field),op:i_(t.op),value:t.value}}})(n):n instanceof qe?(function(t){const r=t.getFilters().map((s=>Ml(s)));return r.length===1?r[0]:{compositeFilter:{op:o_(t.op),filters:r}}})(n):L(54877,{filter:n})}function a_(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Ll(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t,r,s,o=U.min(),a=U.min(),u=de.EMPTY_BYTE_STRING,h=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=h}withSequenceNumber(e){return new lt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new lt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new lt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new lt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class c_{constructor(e){this.yt=e}}function u_(n){const e=n_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Ri(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(){this.Cn=new h_}addToCollectionParentIndex(e,t){return this.Cn.add(t),S.resolve()}getCollectionParents(e,t){return S.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return S.resolve()}deleteFieldIndex(e,t){return S.resolve()}deleteAllFieldIndexes(e){return S.resolve()}createTargetIndexes(e,t){return S.resolve()}getDocumentsMatchingTarget(e,t){return S.resolve(null)}getIndexType(e,t){return S.resolve(0)}getFieldIndexes(e,t){return S.resolve([])}getNextCollectionGroupToUpdate(e){return S.resolve(null)}getMinOffset(e,t){return S.resolve(gt.min())}getMinOffsetFromCollectionGroup(e,t){return S.resolve(gt.min())}updateCollectionGroup(e,t,r){return S.resolve()}updateIndexEntries(e,t){return S.resolve()}}class h_{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ie(Y.comparator),o=!s.has(r);return this.index[t]=s.add(r),o}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ie(Y.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},xl=41943040;class Re{static withCacheSize(e){return new Re(e,Re.DEFAULT_COLLECTION_PERCENTILE,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re.DEFAULT_COLLECTION_PERCENTILE=10,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Re.DEFAULT=new Re(xl,Re.DEFAULT_COLLECTION_PERCENTILE,Re.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Re.DISABLED=new Re(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new sn(0)}static cr(){return new sn(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kc="LruGarbageCollector",d_=1048576;function Vc([n,e],[t,r]){const s=q(n,t);return s===0?q(e,r):s}class f_{constructor(e){this.Ir=e,this.buffer=new ie(Vc),this.Er=0}dr(){return++this.Er}Ar(e){const t=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Vc(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class p_{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(e){D(kc,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){dn(t)?D(kc,"Ignoring IndexedDB error during garbage collection: ",t):await hn(t)}await this.Vr(3e5)}))}}class m_{constructor(e,t){this.mr=e,this.params=t}calculateTargetCount(e,t){return this.mr.gr(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return S.resolve(ds.ce);const r=new f_(t);return this.mr.forEachTarget(e,(s=>r.Ar(s.sequenceNumber))).next((()=>this.mr.pr(e,(s=>r.Ar(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.mr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.mr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(D("LruGarbageCollector","Garbage collection skipped; disabled"),S.resolve(bc)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(D("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),bc):this.yr(e,t)))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,t){let r,s,o,a,u,h,d;const p=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((y=>(y>this.params.maximumSequenceNumbersToCollect?(D("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${y}`),s=this.params.maximumSequenceNumbersToCollect):s=y,a=Date.now(),this.nthSequenceNumber(e,s)))).next((y=>(r=y,u=Date.now(),this.removeTargets(e,r,t)))).next((y=>(o=y,h=Date.now(),this.removeOrphanedDocuments(e,r)))).next((y=>(d=Date.now(),$t()<=j.DEBUG&&D("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${s} in `+(u-a)+`ms
	Removed ${o} targets in `+(h-u)+`ms
	Removed ${y} documents in `+(d-h)+`ms
Total Duration: ${d-p}ms`),S.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:o,documentsRemoved:y}))))}}function g_(n,e){return new m_(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class __{constructor(){this.changes=new Lt((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Te.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?S.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E_{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Bn(r.mutation,s,Ve.empty(),J.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,$()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=$()){const s=Ct();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((o=>{let a=Dn();return o.forEach(((u,h)=>{a=a.insert(u,h.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const r=Ct();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,$())))}populateOverlays(e,t,r){const s=[];return r.forEach((o=>{t.has(o)||s.push(o)})),this.documentOverlayCache.getOverlays(e,s).next((o=>{o.forEach(((a,u)=>{t.set(a,u)}))}))}computeViews(e,t,r,s){let o=Ze();const a=Fn(),u=(function(){return Fn()})();return t.forEach(((h,d)=>{const p=r.get(d.key);s.has(d.key)&&(p===void 0||p.mutation instanceof xt)?o=o.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),Bn(p.mutation,d,p.mutation.getFieldMask(),J.now())):a.set(d.key,Ve.empty())})),this.recalculateAndSaveOverlays(e,o).next((h=>(h.forEach(((d,p)=>a.set(d,p))),t.forEach(((d,p)=>u.set(d,new y_(p,a.get(d)??null)))),u)))}recalculateAndSaveOverlays(e,t){const r=Fn();let s=new Z(((a,u)=>a-u)),o=$();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const u of a)u.keys().forEach((h=>{const d=t.get(h);if(d===null)return;let p=r.get(h)||Ve.empty();p=u.applyToLocalView(d,p),r.set(h,p);const y=(s.get(u.batchId)||$()).add(h);s=s.insert(u.batchId,y)}))})).next((()=>{const a=[],u=s.getReverseIterator();for(;u.hasNext();){const h=u.getNext(),d=h.key,p=h.value,y=yl();p.forEach((I=>{if(!o.has(I)){const P=Al(t.get(I),r.get(I));P!==null&&y.set(I,P),o=o.add(I)}})),a.push(this.documentOverlayCache.saveOverlays(e,d,y))}return S.waitFor(a)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return(function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0})(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Tg(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((o=>{const a=s-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-o.size):S.resolve(Ct());let u=Hn,h=o;return a.next((d=>S.forEach(d,((p,y)=>(u<y.largestBatchId&&(u=y.largestBatchId),o.get(p)?S.resolve():this.remoteDocumentCache.getEntry(e,p).next((I=>{h=h.insert(p,I)}))))).next((()=>this.populateOverlays(e,d,o))).next((()=>this.computeViews(e,h,d,$()))).next((p=>({batchId:u,changes:_l(p)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new M(t)).next((r=>{let s=Dn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const o=t.collectionGroup;let a=Dn();return this.indexManager.getCollectionParents(e,o).next((u=>S.forEach(u,(h=>{const d=(function(y,I){return new ms(I,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)})(t,h.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next((p=>{p.forEach(((y,I)=>{a=a.insert(y,I)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,o,s)))).next((a=>{o.forEach(((h,d)=>{const p=d.getKey();a.get(p)===null&&(a=a.insert(p,Te.newInvalidDocument(p)))}));let u=Dn();return a.forEach(((h,d)=>{const p=o.get(h);p!==void 0&&Bn(p.mutation,d,Ve.empty(),J.now()),_s(t,d)&&(u=u.insert(h,d))})),u}))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T_{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,t){return S.resolve(this.Lr.get(t))}saveBundleMetadata(e,t){return this.Lr.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:Ue(s.createTime)}})(t)),S.resolve()}getNamedQuery(e,t){return S.resolve(this.kr.get(t))}saveNamedQuery(e,t){return this.kr.set(t.name,(function(s){return{name:s.name,query:u_(s.bundledQuery),readTime:Ue(s.readTime)}})(t)),S.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I_{constructor(){this.overlays=new Z(M.comparator),this.qr=new Map}getOverlay(e,t){return S.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Ct();return S.forEach(t,(s=>this.getOverlay(e,s).next((o=>{o!==null&&r.set(s,o)})))).next((()=>r))}saveOverlays(e,t,r){return r.forEach(((s,o)=>{this.St(e,t,o)})),S.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.qr.get(r);return s!==void 0&&(s.forEach((o=>this.overlays=this.overlays.remove(o))),this.qr.delete(r)),S.resolve()}getOverlaysForCollection(e,t,r){const s=Ct(),o=t.length+1,a=new M(t.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const h=u.getNext().value,d=h.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>r&&s.set(h.getKey(),h)}return S.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let o=new Z(((d,p)=>d-p));const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let p=o.get(d.largestBatchId);p===null&&(p=Ct(),o=o.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const u=Ct(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach(((d,p)=>u.set(d,p))),!(u.size()>=s)););return S.resolve(u)}St(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.qr.get(s.largestBatchId).delete(r.key);this.qr.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new Fg(t,r));let o=this.qr.get(t);o===void 0&&(o=$(),this.qr.set(t,o)),this.qr.set(t,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class v_{constructor(){this.sessionToken=de.EMPTY_BYTE_STRING}getSessionToken(e){return S.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,S.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oo{constructor(){this.Qr=new ie(oe.$r),this.Ur=new ie(oe.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,t){const r=new oe(e,t);this.Qr=this.Qr.add(r),this.Ur=this.Ur.add(r)}Wr(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Gr(new oe(e,t))}zr(e,t){e.forEach((r=>this.removeReference(r,t)))}jr(e){const t=new M(new Y([])),r=new oe(t,e),s=new oe(t,e+1),o=[];return this.Ur.forEachInRange([r,s],(a=>{this.Gr(a),o.push(a.key)})),o}Jr(){this.Qr.forEach((e=>this.Gr(e)))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const t=new M(new Y([])),r=new oe(t,e),s=new oe(t,e+1);let o=$();return this.Ur.forEachInRange([r,s],(a=>{o=o.add(a.key)})),o}containsKey(e){const t=new oe(e,0),r=this.Qr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class oe{constructor(e,t){this.key=e,this.Yr=t}static $r(e,t){return M.comparator(e.key,t.key)||q(e.Yr,t.Yr)}static Kr(e,t){return q(e.Yr,t.Yr)||M.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w_{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.tr=1,this.Zr=new ie(oe.$r)}checkEmpty(e){return S.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const o=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Ug(o,t,r,s);this.mutationQueue.push(a);for(const u of s)this.Zr=this.Zr.add(new oe(u.key,o)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return S.resolve(a)}lookupMutationBatch(e,t){return S.resolve(this.Xr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.ei(r),o=s<0?0:s;return S.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return S.resolve(this.mutationQueue.length===0?Xi:this.tr-1)}getAllMutationBatches(e){return S.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new oe(t,0),s=new oe(t,Number.POSITIVE_INFINITY),o=[];return this.Zr.forEachInRange([r,s],(a=>{const u=this.Xr(a.Yr);o.push(u)})),S.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(q);return t.forEach((s=>{const o=new oe(s,0),a=new oe(s,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([o,a],(u=>{r=r.add(u.Yr)}))})),S.resolve(this.ti(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let o=r;M.isDocumentKey(o)||(o=o.child(""));const a=new oe(new M(o),0);let u=new ie(q);return this.Zr.forEachWhile((h=>{const d=h.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(u=u.add(h.Yr)),!0)}),a),S.resolve(this.ti(u))}ti(e){const t=[];return e.forEach((r=>{const s=this.Xr(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){K(this.ni(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Zr;return S.forEach(t.mutations,(s=>{const o=new oe(s.key,t.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.Zr=r}))}ir(e){}containsKey(e,t){const r=new oe(t,0),s=this.Zr.firstAfterOrEqual(r);return S.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,S.resolve()}ni(e,t){return this.ei(e)}ei(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Xr(e){const t=this.ei(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A_{constructor(e){this.ri=e,this.docs=(function(){return new Z(M.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),o=s?s.size:0,a=this.ri(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return S.resolve(r?r.document.mutableCopy():Te.newInvalidDocument(t))}getEntries(e,t){let r=Ze();return t.forEach((s=>{const o=this.docs.get(s);r=r.insert(s,o?o.document.mutableCopy():Te.newInvalidDocument(s))})),S.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let o=Ze();const a=t.path,u=new M(a.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(u);for(;h.hasNext();){const{key:d,value:{document:p}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||Jm(Xm(p),r)<=0||(s.has(p.key)||_s(t,p))&&(o=o.insert(p.key,p.mutableCopy()))}return S.resolve(o)}getAllFromCollectionGroup(e,t,r,s){L(9500)}ii(e,t){return S.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new R_(this)}getSize(e){return S.resolve(this.size)}}class R_ extends __{constructor(e){super(),this.Nr=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.Nr.addEntry(e,s)):this.Nr.removeEntry(r)})),S.waitFor(t)}getFromCache(e,t){return this.Nr.getEntry(e,t)}getAllFromCache(e,t){return this.Nr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S_{constructor(e){this.persistence=e,this.si=new Lt((t=>Zi(t)),eo),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.oi=0,this._i=new oo,this.targetCount=0,this.ai=sn.ur()}forEachTarget(e,t){return this.si.forEach(((r,s)=>t(s))),S.resolve()}getLastRemoteSnapshotVersion(e){return S.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return S.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),S.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.oi&&(this.oi=t),S.resolve()}Pr(e){this.si.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ai=new sn(t),this.highestTargetId=t),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,t){return this.Pr(t),this.targetCount+=1,S.resolve()}updateTargetData(e,t){return this.Pr(t),S.resolve()}removeTargetData(e,t){return this.si.delete(t.target),this._i.jr(t.targetId),this.targetCount-=1,S.resolve()}removeTargets(e,t,r){let s=0;const o=[];return this.si.forEach(((a,u)=>{u.sequenceNumber<=t&&r.get(u.targetId)===null&&(this.si.delete(a),o.push(this.removeMatchingKeysForTargetId(e,u.targetId)),s++)})),S.waitFor(o).next((()=>s))}getTargetCount(e){return S.resolve(this.targetCount)}getTargetData(e,t){const r=this.si.get(t)||null;return S.resolve(r)}addMatchingKeys(e,t,r){return this._i.Wr(t,r),S.resolve()}removeMatchingKeys(e,t,r){this._i.zr(t,r);const s=this.persistence.referenceDelegate,o=[];return s&&t.forEach((a=>{o.push(s.markPotentiallyOrphaned(e,a))})),S.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this._i.jr(t),S.resolve()}getMatchingKeysForTargetId(e,t){const r=this._i.Hr(t);return S.resolve(r)}containsKey(e,t){return S.resolve(this._i.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ul{constructor(e,t){this.ui={},this.overlays={},this.ci=new ds(0),this.li=!1,this.li=!0,this.hi=new v_,this.referenceDelegate=e(this),this.Pi=new S_(this),this.indexManager=new l_,this.remoteDocumentCache=(function(s){return new A_(s)})((r=>this.referenceDelegate.Ti(r))),this.serializer=new c_(t),this.Ii=new T_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new I_,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ui[e.toKey()];return r||(r=new w_(t,this.referenceDelegate),this.ui[e.toKey()]=r),r}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,t,r){D("MemoryPersistence","Starting transaction:",e);const s=new P_(this.ci.next());return this.referenceDelegate.Ei(),r(s).next((o=>this.referenceDelegate.di(s).next((()=>o)))).toPromise().then((o=>(s.raiseOnCommittedEvent(),o)))}Ai(e,t){return S.or(Object.values(this.ui).map((r=>()=>r.containsKey(e,t))))}}class P_ extends Zm{constructor(e){super(),this.currentSequenceNumber=e}}class ao{constructor(e){this.persistence=e,this.Ri=new oo,this.Vi=null}static mi(e){return new ao(e)}get fi(){if(this.Vi)return this.Vi;throw L(60996)}addReference(e,t,r){return this.Ri.addReference(r,t),this.fi.delete(r.toString()),S.resolve()}removeReference(e,t,r){return this.Ri.removeReference(r,t),this.fi.add(r.toString()),S.resolve()}markPotentiallyOrphaned(e,t){return this.fi.add(t.toString()),S.resolve()}removeTarget(e,t){this.Ri.jr(t.targetId).forEach((s=>this.fi.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((o=>this.fi.add(o.toString())))})).next((()=>r.removeTargetData(e,t)))}Ei(){this.Vi=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return S.forEach(this.fi,(r=>{const s=M.fromPath(r);return this.gi(e,s).next((o=>{o||t.removeEntry(s,U.min())}))})).next((()=>(this.Vi=null,t.apply(e))))}updateLimboDocument(e,t){return this.gi(e,t).next((r=>{r?this.fi.delete(t.toString()):this.fi.add(t.toString())}))}Ti(e){return 0}gi(e,t){return S.or([()=>S.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ai(e,t)])}}class is{constructor(e,t){this.persistence=e,this.pi=new Lt((r=>ng(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=g_(this,t)}static mi(e,t){return new is(e,t)}Ei(){}di(e){return S.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}gr(e){const t=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}wr(e){let t=0;return this.pr(e,(r=>{t++})).next((()=>t))}pr(e,t){return S.forEach(this.pi,((r,s)=>this.br(e,r,s).next((o=>o?S.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),o=s.newChangeBuffer();return s.ii(e,(a=>this.br(e,a,t).next((u=>{u||(r++,o.removeEntry(a,U.min()))})))).next((()=>o.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.pi.set(t,e.currentSequenceNumber),S.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),S.resolve()}removeReference(e,t,r){return this.pi.set(r,e.currentSequenceNumber),S.resolve()}updateLimboDocument(e,t){return this.pi.set(t,e.currentSequenceNumber),S.resolve()}Ti(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Ur(e.data.value)),t}br(e,t,r){return S.or([()=>this.persistence.Ai(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.pi.get(t);return S.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class co{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Es=r,this.ds=s}static As(e,t){let r=$(),s=$();for(const o of t.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:s=s.add(o.doc.key)}return new co(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C_{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b_{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=(function(){return gd()?8:eg(Ie())>0?6:4})()}initialize(e,t){this.ps=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,r,s){const o={result:null};return this.ys(e,t).next((a=>{o.result=a})).next((()=>{if(!o.result)return this.ws(e,t,s,r).next((a=>{o.result=a}))})).next((()=>{if(o.result)return;const a=new C_;return this.Ss(e,t,a).next((u=>{if(o.result=u,this.Vs)return this.bs(e,t,a,u.size)}))})).next((()=>o.result))}bs(e,t,r,s){return r.documentReadCount<this.fs?($t()<=j.DEBUG&&D("QueryEngine","SDK will not create cache indexes for query:",zt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),S.resolve()):($t()<=j.DEBUG&&D("QueryEngine","Query:",zt(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.gs*s?($t()<=j.DEBUG&&D("QueryEngine","The SDK decides to create cache indexes for query:",zt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xe(t))):S.resolve())}ys(e,t){if(Ec(t))return S.resolve(null);let r=xe(t);return this.indexManager.getIndexType(e,r).next((s=>s===0?null:(t.limit!==null&&s===1&&(t=Ri(t,null,"F"),r=xe(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next((o=>{const a=$(...o);return this.ps.getDocuments(e,a).next((u=>this.indexManager.getMinOffset(e,r).next((h=>{const d=this.Ds(t,u);return this.Cs(t,d,a,h.readTime)?this.ys(e,Ri(t,null,"F")):this.vs(e,d,t,h)}))))})))))}ws(e,t,r,s){return Ec(t)||s.isEqual(U.min())?S.resolve(null):this.ps.getDocuments(e,r).next((o=>{const a=this.Ds(t,o);return this.Cs(t,a,r,s)?S.resolve(null):($t()<=j.DEBUG&&D("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),zt(t)),this.vs(e,a,t,Qm(s,Hn)).next((u=>u)))}))}Ds(e,t){let r=new ie(ml(e));return t.forEach(((s,o)=>{_s(e,o)&&(r=r.add(o))})),r}Cs(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(s)>0)}Ss(e,t,r){return $t()<=j.DEBUG&&D("QueryEngine","Using full collection scan to execute query:",zt(t)),this.ps.getDocumentsMatchingQuery(e,t,gt.min(),r)}vs(e,t,r,s){return this.ps.getDocumentsMatchingQuery(e,r,s).next((o=>(t.forEach((a=>{o=o.insert(a.key,a)})),o)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uo="LocalStore",k_=3e8;class V_{constructor(e,t,r,s){this.persistence=e,this.Fs=t,this.serializer=s,this.Ms=new Z(q),this.xs=new Lt((o=>Zi(o)),eo),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(r)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new E_(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Ms)))}}function D_(n,e,t,r){return new V_(n,e,t,r)}async function Fl(n,e){const t=F(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((o=>(s=o,t.Bs(e),t.mutationQueue.getAllMutationBatches(r)))).next((o=>{const a=[],u=[];let h=$();for(const d of s){a.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}for(const d of o){u.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}return t.localDocuments.getDocuments(r,h).next((d=>({Ls:d,removedBatchIds:a,addedBatchIds:u})))}))}))}function N_(n,e){const t=F(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),o=t.Ns.newChangeBuffer({trackRemovals:!0});return(function(u,h,d,p){const y=d.batch,I=y.keys();let P=S.resolve();return I.forEach((k=>{P=P.next((()=>p.getEntry(h,k))).next((N=>{const V=d.docVersions.get(k);K(V!==null,48541),N.version.compareTo(V)<0&&(y.applyToRemoteDocument(N,d),N.isValidDocument()&&(N.setReadTime(d.commitVersion),p.addEntry(N)))}))})),P.next((()=>u.mutationQueue.removeMutationBatch(h,y)))})(t,r,e,o).next((()=>o.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(u){let h=$();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(h=h.add(u.batch.mutations[d].key));return h})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function Bl(n){const e=F(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.Pi.getLastRemoteSnapshotVersion(t)))}function O_(n,e){const t=F(n),r=e.snapshotVersion;let s=t.Ms;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(o=>{const a=t.Ns.newChangeBuffer({trackRemovals:!0});s=t.Ms;const u=[];e.targetChanges.forEach(((p,y)=>{const I=s.get(y);if(!I)return;u.push(t.Pi.removeMatchingKeys(o,p.removedDocuments,y).next((()=>t.Pi.addMatchingKeys(o,p.addedDocuments,y))));let P=I.withSequenceNumber(o.currentSequenceNumber);e.targetMismatches.get(y)!==null?P=P.withResumeToken(de.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):p.resumeToken.approximateByteSize()>0&&(P=P.withResumeToken(p.resumeToken,r)),s=s.insert(y,P),(function(N,V,z){return N.resumeToken.approximateByteSize()===0||V.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=k_?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0})(I,P,p)&&u.push(t.Pi.updateTargetData(o,P))}));let h=Ze(),d=$();if(e.documentUpdates.forEach((p=>{e.resolvedLimboDocuments.has(p)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(o,p))})),u.push(M_(o,a,e.documentUpdates).next((p=>{h=p.ks,d=p.qs}))),!r.isEqual(U.min())){const p=t.Pi.getLastRemoteSnapshotVersion(o).next((y=>t.Pi.setTargetsMetadata(o,o.currentSequenceNumber,r)));u.push(p)}return S.waitFor(u).next((()=>a.apply(o))).next((()=>t.localDocuments.getLocalViewOfDocuments(o,h,d))).next((()=>h))})).then((o=>(t.Ms=s,o)))}function M_(n,e,t){let r=$(),s=$();return t.forEach((o=>r=r.add(o))),e.getEntries(n,r).next((o=>{let a=Ze();return t.forEach(((u,h)=>{const d=o.get(u);h.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(u)),h.isNoDocument()&&h.version.isEqual(U.min())?(e.removeEntry(u,h.readTime),a=a.insert(u,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||h.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(h),a=a.insert(u,h)):D(uo,"Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",h.version)})),{ks:a,qs:s}}))}function L_(n,e){const t=F(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Xi),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function x_(n,e){const t=F(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.Pi.getTargetData(r,e).next((o=>o?(s=o,S.resolve(s)):t.Pi.allocateTargetId(r).next((a=>(s=new lt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Pi.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.Ms.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Ms=t.Ms.insert(r.targetId,r),t.xs.set(e,r.targetId)),r}))}async function ki(n,e,t){const r=F(n),s=r.Ms.get(e),o=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",o,(a=>r.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!dn(a))throw a;D(uo,`Failed to update sequence numbers for target ${e}: ${a}`)}r.Ms=r.Ms.remove(e),r.xs.delete(s.target)}function Dc(n,e,t){const r=F(n);let s=U.min(),o=$();return r.persistence.runTransaction("Execute query","readwrite",(a=>(function(h,d,p){const y=F(h),I=y.xs.get(p);return I!==void 0?S.resolve(y.Ms.get(I)):y.Pi.getTargetData(d,p)})(r,a,xe(e)).next((u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(a,u.targetId).next((h=>{o=h}))})).next((()=>r.Fs.getDocumentsMatchingQuery(a,e,t?s:U.min(),t?o:$()))).next((u=>(U_(r,vg(e),u),{documents:u,Qs:o})))))}function U_(n,e,t){let r=n.Os.get(e)||U.min();t.forEach(((s,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)})),n.Os.set(e,r)}class Nc{constructor(){this.activeTargetIds=Cg()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class F_{constructor(){this.Mo=new Nc,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,t,r){this.xo[e]=t}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new Nc,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B_{Oo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oc="ConnectivityMonitor";class Mc{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){D(Oc,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){D(Oc,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Dr=null;function Vi(){return Dr===null?Dr=(function(){return 268435456+Math.round(2147483648*Math.random())})():Dr++,"0x"+Dr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci="RestConnection",j_={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class q_{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Uo=t+"://"+e.host,this.Ko=`projects/${r}/databases/${s}`,this.Wo=this.databaseId.database===Zr?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Go(e,t,r,s,o){const a=Vi(),u=this.zo(e,t.toUriEncodedString());D(ci,`Sending RPC '${e}' ${a}:`,u,r);const h={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(h,s,o);const{host:d}=new URL(u),p=an(d);return this.Jo(e,u,h,r,p).then((y=>(D(ci,`Received RPC '${e}' ${a}: `,y),y)),(y=>{throw en(ci,`RPC '${e}' ${a} failed with error: `,y,"url: ",u,"request:",r),y}))}Ho(e,t,r,s,o,a){return this.Go(e,t,r,s,o)}jo(e,t,r){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+ln})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,o)=>e[o]=s)),r&&r.headers.forEach(((s,o)=>e[o]=s))}zo(e,t){const r=j_[e];return`${this.Uo}/v1/${t}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $_{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ye="WebChannelConnection";class z_ extends q_{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,r,s,o){const a=Vi();return new Promise(((u,h)=>{const d=new zu;d.setWithCredentials(!0),d.listenOnce(Hu.COMPLETE,(()=>{try{switch(d.getLastErrorCode()){case xr.NO_ERROR:const y=d.getResponseJson();D(ye,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(y)),u(y);break;case xr.TIMEOUT:D(ye,`RPC '${e}' ${a} timed out`),h(new O(C.DEADLINE_EXCEEDED,"Request time out"));break;case xr.HTTP_ERROR:const I=d.getStatus();if(D(ye,`RPC '${e}' ${a} failed with status:`,I,"response text:",d.getResponseText()),I>0){let P=d.getResponseJson();Array.isArray(P)&&(P=P[0]);const k=P?.error;if(k&&k.status&&k.message){const N=(function(z){const B=z.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf(B)>=0?B:C.UNKNOWN})(k.status);h(new O(N,k.message))}else h(new O(C.UNKNOWN,"Server responded with status "+d.getStatus()))}else h(new O(C.UNAVAILABLE,"Connection failed."));break;default:L(9055,{l_:e,streamId:a,h_:d.getLastErrorCode(),P_:d.getLastError()})}}finally{D(ye,`RPC '${e}' ${a} completed.`)}}));const p=JSON.stringify(s);D(ye,`RPC '${e}' ${a} sending request:`,s),d.send(t,"POST",p,r,15)}))}T_(e,t,r){const s=Vi(),o=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Ku(),u=Gu(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.jo(h.initMessageHeaders,t,r),h.encodeInitMessageHeaders=!0;const p=o.join("");D(ye,`Creating RPC '${e}' stream ${s}: ${p}`,h);const y=a.createWebChannel(p,h);this.I_(y);let I=!1,P=!1;const k=new $_({Yo:V=>{P?D(ye,`Not sending because RPC '${e}' stream ${s} is closed:`,V):(I||(D(ye,`Opening RPC '${e}' stream ${s} transport.`),y.open(),I=!0),D(ye,`RPC '${e}' stream ${s} sending:`,V),y.send(V))},Zo:()=>y.close()}),N=(V,z,B)=>{V.listen(z,(H=>{try{B(H)}catch(ce){setTimeout((()=>{throw ce}),0)}}))};return N(y,Vn.EventType.OPEN,(()=>{P||(D(ye,`RPC '${e}' stream ${s} transport opened.`),k.o_())})),N(y,Vn.EventType.CLOSE,(()=>{P||(P=!0,D(ye,`RPC '${e}' stream ${s} transport closed`),k.a_(),this.E_(y))})),N(y,Vn.EventType.ERROR,(V=>{P||(P=!0,en(ye,`RPC '${e}' stream ${s} transport errored. Name:`,V.name,"Message:",V.message),k.a_(new O(C.UNAVAILABLE,"The operation could not be completed")))})),N(y,Vn.EventType.MESSAGE,(V=>{if(!P){const z=V.data[0];K(!!z,16349);const B=z,H=B?.error||B[0]?.error;if(H){D(ye,`RPC '${e}' stream ${s} received error:`,H);const ce=H.status;let De=(function(m){const _=ne[m];if(_!==void 0)return Pl(_)})(ce),fe=H.message;De===void 0&&(De=C.INTERNAL,fe="Unknown error status: "+ce+" with message "+H.message),P=!0,k.a_(new O(De,fe)),y.close()}else D(ye,`RPC '${e}' stream ${s} received:`,z),k.u_(z)}})),N(u,Wu.STAT_EVENT,(V=>{V.stat===Ei.PROXY?D(ye,`RPC '${e}' stream ${s} detected buffering proxy`):V.stat===Ei.NOPROXY&&D(ye,`RPC '${e}' stream ${s} detected no buffering proxy`)})),setTimeout((()=>{k.__()}),0),k}terminate(){this.c_.forEach((e=>e.close())),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter((t=>t===e))}}function ui(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vs(n){return new Kg(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jl{constructor(e,t,r=1e3,s=1.5,o=6e4){this.Mi=e,this.timerId=t,this.d_=r,this.A_=s,this.R_=o,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),s=Math.max(0,t-r);s>0&&D("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,s,(()=>(this.f_=Date.now(),e()))),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lc="PersistentStream";class ql{constructor(e,t,r,s,o,a,u,h){this.Mi=e,this.S_=r,this.b_=s,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=h,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new jl(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,(()=>this.k_())))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===C.RESOURCE_EXHAUSTED?(Ye(t.toString()),Ye("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(t)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.D_===t&&this.G_(r,s)}),(r=>{e((()=>{const s=new O(C.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(s)}))}))}G_(e,t){const r=this.W_(this.D_);this.stream=this.j_(e,t),this.stream.Xo((()=>{r((()=>this.listener.Xo()))})),this.stream.t_((()=>{r((()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,(()=>(this.O_()&&(this.state=3),Promise.resolve()))),this.listener.t_())))})),this.stream.r_((s=>{r((()=>this.z_(s)))})),this.stream.onMessage((s=>{r((()=>++this.F_==1?this.J_(s):this.onNext(s)))}))}N_(){this.state=5,this.M_.p_((async()=>{this.state=0,this.start()}))}z_(e){return D(Lc,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return t=>{this.Mi.enqueueAndForget((()=>this.D_===e?t():(D(Lc,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class H_ extends ql{constructor(e,t,r,s,o,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=o}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=Jg(this.serializer,e),r=(function(o){if(!("targetChange"in o))return U.min();const a=o.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?Ue(a.readTime):U.min()})(e);return this.listener.H_(t,r)}Y_(e){const t={};t.database=bi(this.serializer),t.addTarget=(function(o,a){let u;const h=a.target;if(u=Ai(h)?{documents:e_(o,h)}:{query:t_(o,h).ft},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=kl(o,a.resumeToken);const d=Si(o,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(U.min())>0){u.readTime=ss(o,a.snapshotVersion.toTimestamp());const d=Si(o,a.expectedCount);d!==null&&(u.expectedCount=d)}return u})(this.serializer,e);const r=r_(this.serializer,e);r&&(t.labels=r),this.q_(t)}Z_(e){const t={};t.database=bi(this.serializer),t.removeTarget=e,this.q_(t)}}class W_ extends ql{constructor(e,t,r,s,o,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=o}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return K(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,K(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){K(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=Zg(e.writeResults,e.commitTime),r=Ue(e.commitTime);return this.listener.na(r,t)}ra(){const e={};e.database=bi(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>Yg(this.serializer,r)))};this.q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G_{}class K_ extends G_{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.ia=!1}sa(){if(this.ia)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,t,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,a])=>this.connection.Go(e,Pi(t,r),s,o,a))).catch((o=>{throw o.name==="FirebaseError"?(o.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(C.UNKNOWN,o.toString())}))}Ho(e,t,r,s,o){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,u])=>this.connection.Ho(e,Pi(t,r),s,a,u,o))).catch((a=>{throw a.name==="FirebaseError"?(a.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new O(C.UNKNOWN,a.toString())}))}terminate(){this.ia=!0,this.connection.terminate()}}class Q_{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve()))))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Ye(t),this.aa=!1):D("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt="RemoteStore";class X_{constructor(e,t,r,s,o){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=o,this.Aa.Oo((a=>{r.enqueueAndForget((async()=>{Ut(this)&&(D(Mt,"Restarting streams for network reachability change."),await(async function(h){const d=F(h);d.Ea.add(4),await or(d),d.Ra.set("Unknown"),d.Ea.delete(4),await ws(d)})(this))}))})),this.Ra=new Q_(r,s)}}async function ws(n){if(Ut(n))for(const e of n.da)await e(!0)}async function or(n){for(const e of n.da)await e(!1)}function $l(n,e){const t=F(n);t.Ia.has(e.targetId)||(t.Ia.set(e.targetId,e),po(t)?fo(t):fn(t).O_()&&ho(t,e))}function lo(n,e){const t=F(n),r=fn(t);t.Ia.delete(e),r.O_()&&zl(t,e),t.Ia.size===0&&(r.O_()?r.L_():Ut(t)&&t.Ra.set("Unknown"))}function ho(n,e){if(n.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}fn(n).Y_(e)}function zl(n,e){n.Va.Ue(e),fn(n).Z_(e)}function fo(n){n.Va=new zg({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ia.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),fn(n).start(),n.Ra.ua()}function po(n){return Ut(n)&&!fn(n).x_()&&n.Ia.size>0}function Ut(n){return F(n).Ea.size===0}function Hl(n){n.Va=void 0}async function J_(n){n.Ra.set("Online")}async function Y_(n){n.Ia.forEach(((e,t)=>{ho(n,e)}))}async function Z_(n,e){Hl(n),po(n)?(n.Ra.ha(e),fo(n)):n.Ra.set("Unknown")}async function ey(n,e,t){if(n.Ra.set("Online"),e instanceof bl&&e.state===2&&e.cause)try{await(async function(s,o){const a=o.cause;for(const u of o.targetIds)s.Ia.has(u)&&(await s.remoteSyncer.rejectListen(u,a),s.Ia.delete(u),s.Va.removeTarget(u))})(n,e)}catch(r){D(Mt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await os(n,r)}else if(e instanceof jr?n.Va.Ze(e):e instanceof Cl?n.Va.st(e):n.Va.tt(e),!t.isEqual(U.min()))try{const r=await Bl(n.localStore);t.compareTo(r)>=0&&await(function(o,a){const u=o.Va.Tt(a);return u.targetChanges.forEach(((h,d)=>{if(h.resumeToken.approximateByteSize()>0){const p=o.Ia.get(d);p&&o.Ia.set(d,p.withResumeToken(h.resumeToken,a))}})),u.targetMismatches.forEach(((h,d)=>{const p=o.Ia.get(h);if(!p)return;o.Ia.set(h,p.withResumeToken(de.EMPTY_BYTE_STRING,p.snapshotVersion)),zl(o,h);const y=new lt(p.target,h,d,p.sequenceNumber);ho(o,y)})),o.remoteSyncer.applyRemoteEvent(u)})(n,t)}catch(r){D(Mt,"Failed to raise snapshot:",r),await os(n,r)}}async function os(n,e,t){if(!dn(e))throw e;n.Ea.add(1),await or(n),n.Ra.set("Offline"),t||(t=()=>Bl(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{D(Mt,"Retrying IndexedDB access"),await t(),n.Ea.delete(1),await ws(n)}))}function Wl(n,e){return e().catch((t=>os(n,t,e)))}async function As(n){const e=F(n),t=Tt(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Xi;for(;ty(e);)try{const s=await L_(e.localStore,r);if(s===null){e.Ta.length===0&&t.L_();break}r=s.batchId,ny(e,s)}catch(s){await os(e,s)}Gl(e)&&Kl(e)}function ty(n){return Ut(n)&&n.Ta.length<10}function ny(n,e){n.Ta.push(e);const t=Tt(n);t.O_()&&t.X_&&t.ea(e.mutations)}function Gl(n){return Ut(n)&&!Tt(n).x_()&&n.Ta.length>0}function Kl(n){Tt(n).start()}async function ry(n){Tt(n).ra()}async function sy(n){const e=Tt(n);for(const t of n.Ta)e.ea(t.mutations)}async function iy(n,e,t){const r=n.Ta.shift(),s=ro.from(r,e,t);await Wl(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await As(n)}async function oy(n,e){e&&Tt(n).X_&&await(async function(r,s){if((function(a){return jg(a)&&a!==C.ABORTED})(s.code)){const o=r.Ta.shift();Tt(r).B_(),await Wl(r,(()=>r.remoteSyncer.rejectFailedWrite(o.batchId,s))),await As(r)}})(n,e),Gl(n)&&Kl(n)}async function xc(n,e){const t=F(n);t.asyncQueue.verifyOperationInProgress(),D(Mt,"RemoteStore received new credentials");const r=Ut(t);t.Ea.add(3),await or(t),r&&t.Ra.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ea.delete(3),await ws(t)}async function ay(n,e){const t=F(n);e?(t.Ea.delete(2),await ws(t)):e||(t.Ea.add(2),await or(t),t.Ra.set("Unknown"))}function fn(n){return n.ma||(n.ma=(function(t,r,s){const o=F(t);return o.sa(),new H_(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)})(n.datastore,n.asyncQueue,{Xo:J_.bind(null,n),t_:Y_.bind(null,n),r_:Z_.bind(null,n),H_:ey.bind(null,n)}),n.da.push((async e=>{e?(n.ma.B_(),po(n)?fo(n):n.Ra.set("Unknown")):(await n.ma.stop(),Hl(n))}))),n.ma}function Tt(n){return n.fa||(n.fa=(function(t,r,s){const o=F(t);return o.sa(),new W_(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)})(n.datastore,n.asyncQueue,{Xo:()=>Promise.resolve(),t_:ry.bind(null,n),r_:oy.bind(null,n),ta:sy.bind(null,n),na:iy.bind(null,n)}),n.da.push((async e=>{e?(n.fa.B_(),await As(n)):(await n.fa.stop(),n.Ta.length>0&&(D(Mt,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))}))),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e,t,r,s,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=o,this.deferred=new mt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,o){const a=Date.now()+r,u=new mo(e,t,a,s,o);return u.start(r),u}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function go(n,e){if(Ye("AsyncQueue",`${e}: ${n}`),dn(n))return new O(C.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{static emptySet(e){return new Jt(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||M.comparator(t.key,r.key):(t,r)=>M.comparator(t.key,r.key),this.keyedMap=Dn(),this.sortedSet=new Z(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Jt)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,o=r.getNext().key;if(!s.isEqual(o))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Jt;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uc{constructor(){this.ga=new Z(M.comparator)}track(e){const t=e.doc.key,r=this.ga.get(t);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(t,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(t):e.type===1&&r.type===2?this.ga=this.ga.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):L(63341,{Rt:e,pa:r}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal(((t,r)=>{e.push(r)})),e}}class on{constructor(e,t,r,s,o,a,u,h,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=h,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,o){const a=[];return t.forEach((u=>{a.push({type:0,doc:u})})),new on(e,t,Jt.emptySet(t),a,r,s,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&gs(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cy{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some((e=>e.Da()))}}class uy{constructor(){this.queries=Fc(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,r){const s=F(t),o=s.queries;s.queries=Fc(),o.forEach(((a,u)=>{for(const h of u.Sa)h.onError(r)}))})(this,new O(C.ABORTED,"Firestore shutting down"))}}function Fc(){return new Lt((n=>pl(n)),gs)}async function ly(n,e){const t=F(n);let r=3;const s=e.query;let o=t.queries.get(s);o?!o.ba()&&e.Da()&&(r=2):(o=new cy,r=e.Da()?0:1);try{switch(r){case 0:o.wa=await t.onListen(s,!0);break;case 1:o.wa=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const u=go(a,`Initialization of query '${zt(e.query)}' failed`);return void e.onError(u)}t.queries.set(s,o),o.Sa.push(e),e.va(t.onlineState),o.wa&&e.Fa(o.wa)&&_o(t)}async function hy(n,e){const t=F(n),r=e.query;let s=3;const o=t.queries.get(r);if(o){const a=o.Sa.indexOf(e);a>=0&&(o.Sa.splice(a,1),o.Sa.length===0?s=e.Da()?0:1:!o.ba()&&e.Da()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function dy(n,e){const t=F(n);let r=!1;for(const s of e){const o=s.query,a=t.queries.get(o);if(a){for(const u of a.Sa)u.Fa(s)&&(r=!0);a.wa=s}}r&&_o(t)}function fy(n,e,t){const r=F(n),s=r.queries.get(e);if(s)for(const o of s.Sa)o.onError(t);r.queries.delete(e)}function _o(n){n.Ca.forEach((e=>{e.next()}))}var Di,Bc;(Bc=Di||(Di={})).Ma="default",Bc.Cache="cache";class py{constructor(e,t,r){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new on(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const r=t!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=on.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Di.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ql{constructor(e){this.key=e}}class Xl{constructor(e){this.key=e}}class my{constructor(e,t){this.query=e,this.Ya=t,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=$(),this.mutatedKeys=$(),this.eu=ml(e),this.tu=new Jt(this.eu)}get nu(){return this.Ya}ru(e,t){const r=t?t.iu:new Uc,s=t?t.tu:this.tu;let o=t?t.mutatedKeys:this.mutatedKeys,a=s,u=!1;const h=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal(((p,y)=>{const I=s.get(p),P=_s(this.query,y)?y:null,k=!!I&&this.mutatedKeys.has(I.key),N=!!P&&(P.hasLocalMutations||this.mutatedKeys.has(P.key)&&P.hasCommittedMutations);let V=!1;I&&P?I.data.isEqual(P.data)?k!==N&&(r.track({type:3,doc:P}),V=!0):this.su(I,P)||(r.track({type:2,doc:P}),V=!0,(h&&this.eu(P,h)>0||d&&this.eu(P,d)<0)&&(u=!0)):!I&&P?(r.track({type:0,doc:P}),V=!0):I&&!P&&(r.track({type:1,doc:I}),V=!0,(h||d)&&(u=!0)),V&&(P?(a=a.add(P),o=N?o.add(p):o.delete(p)):(a=a.delete(p),o=o.delete(p)))})),this.query.limit!==null)for(;a.size>this.query.limit;){const p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),o=o.delete(p.key),r.track({type:1,doc:p})}return{tu:a,iu:r,Cs:u,mutatedKeys:o}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const o=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const a=e.iu.ya();a.sort(((p,y)=>(function(P,k){const N=V=>{switch(V){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return L(20277,{Rt:V})}};return N(P)-N(k)})(p.type,y.type)||this.eu(p.doc,y.doc))),this.ou(r),s=s??!1;const u=t&&!s?this._u():[],h=this.Xa.size===0&&this.current&&!s?1:0,d=h!==this.Za;return this.Za=h,a.length!==0||d?{snapshot:new on(this.query,e.tu,o,a,e.mutatedKeys,h===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Uc,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach((t=>this.Ya=this.Ya.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ya=this.Ya.delete(t))),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=$(),this.tu.forEach((r=>{this.uu(r.key)&&(this.Xa=this.Xa.add(r.key))}));const t=[];return e.forEach((r=>{this.Xa.has(r)||t.push(new Xl(r))})),this.Xa.forEach((r=>{e.has(r)||t.push(new Ql(r))})),t}cu(e){this.Ya=e.Qs,this.Xa=$();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return on.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const yo="SyncEngine";class gy{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class _y{constructor(e){this.key=e,this.hu=!1}}class yy{constructor(e,t,r,s,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Pu={},this.Tu=new Lt((u=>pl(u)),gs),this.Iu=new Map,this.Eu=new Set,this.du=new Z(M.comparator),this.Au=new Map,this.Ru=new oo,this.Vu={},this.mu=new Map,this.fu=sn.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function Ey(n,e,t=!0){const r=nh(n);let s;const o=r.Tu.get(e);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),s=o.view.lu()):s=await Jl(r,e,t,!0),s}async function Ty(n,e){const t=nh(n);await Jl(t,e,!0,!1)}async function Jl(n,e,t,r){const s=await x_(n.localStore,xe(e)),o=s.targetId,a=n.sharedClientState.addLocalQueryTarget(o,t);let u;return r&&(u=await Iy(n,e,o,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&$l(n.remoteStore,s),u}async function Iy(n,e,t,r,s){n.pu=(y,I,P)=>(async function(N,V,z,B){let H=V.view.ru(z);H.Cs&&(H=await Dc(N.localStore,V.query,!1).then((({documents:v})=>V.view.ru(v,H))));const ce=B&&B.targetChanges.get(V.targetId),De=B&&B.targetMismatches.get(V.targetId)!=null,fe=V.view.applyChanges(H,N.isPrimaryClient,ce,De);return qc(N,V.targetId,fe.au),fe.snapshot})(n,y,I,P);const o=await Dc(n.localStore,e,!0),a=new my(e,o.Qs),u=a.ru(o.documents),h=ir.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(u,n.isPrimaryClient,h);qc(n,t,d.au);const p=new gy(e,t,a);return n.Tu.set(e,p),n.Iu.has(t)?n.Iu.get(t).push(e):n.Iu.set(t,[e]),d.snapshot}async function vy(n,e,t){const r=F(n),s=r.Tu.get(e),o=r.Iu.get(s.targetId);if(o.length>1)return r.Iu.set(s.targetId,o.filter((a=>!gs(a,e)))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await ki(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&lo(r.remoteStore,s.targetId),Ni(r,s.targetId)})).catch(hn)):(Ni(r,s.targetId),await ki(r.localStore,s.targetId,!0))}async function wy(n,e){const t=F(n),r=t.Tu.get(e),s=t.Iu.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),lo(t.remoteStore,r.targetId))}async function Ay(n,e,t){const r=Vy(n);try{const s=await(function(a,u){const h=F(a),d=J.now(),p=u.reduce(((P,k)=>P.add(k.key)),$());let y,I;return h.persistence.runTransaction("Locally write mutations","readwrite",(P=>{let k=Ze(),N=$();return h.Ns.getEntries(P,p).next((V=>{k=V,k.forEach(((z,B)=>{B.isValidDocument()||(N=N.add(z))}))})).next((()=>h.localDocuments.getOverlayedDocuments(P,k))).next((V=>{y=V;const z=[];for(const B of u){const H=Lg(B,y.get(B.key).overlayedDocument);H!=null&&z.push(new xt(B.key,H,al(H.value.mapValue),Ke.exists(!0)))}return h.mutationQueue.addMutationBatch(P,d,z,u)})).next((V=>{I=V;const z=V.applyToLocalDocumentSet(y,N);return h.documentOverlayCache.saveOverlays(P,V.batchId,z)}))})).then((()=>({batchId:I.batchId,changes:_l(y)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(a,u,h){let d=a.Vu[a.currentUser.toKey()];d||(d=new Z(q)),d=d.insert(u,h),a.Vu[a.currentUser.toKey()]=d})(r,s.batchId,t),await ar(r,s.changes),await As(r.remoteStore)}catch(s){const o=go(s,"Failed to persist write");t.reject(o)}}async function Yl(n,e){const t=F(n);try{const r=await O_(t.localStore,e);e.targetChanges.forEach(((s,o)=>{const a=t.Au.get(o);a&&(K(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.hu=!0:s.modifiedDocuments.size>0?K(a.hu,14607):s.removedDocuments.size>0&&(K(a.hu,42227),a.hu=!1))})),await ar(t,r,e)}catch(r){await hn(r)}}function jc(n,e,t){const r=F(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tu.forEach(((o,a)=>{const u=a.view.va(e);u.snapshot&&s.push(u.snapshot)})),(function(a,u){const h=F(a);h.onlineState=u;let d=!1;h.queries.forEach(((p,y)=>{for(const I of y.Sa)I.va(u)&&(d=!0)})),d&&_o(h)})(r.eventManager,e),s.length&&r.Pu.H_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Ry(n,e,t){const r=F(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Au.get(e),o=s&&s.key;if(o){let a=new Z(M.comparator);a=a.insert(o,Te.newNoDocument(o,U.min()));const u=$().add(o),h=new Is(U.min(),new Map,new Z(q),a,u);await Yl(r,h),r.du=r.du.remove(o),r.Au.delete(e),Eo(r)}else await ki(r.localStore,e,!1).then((()=>Ni(r,e,t))).catch(hn)}async function Sy(n,e){const t=F(n),r=e.batch.batchId;try{const s=await N_(t.localStore,e);eh(t,r,null),Zl(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await ar(t,s)}catch(s){await hn(s)}}async function Py(n,e,t){const r=F(n);try{const s=await(function(a,u){const h=F(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",(d=>{let p;return h.mutationQueue.lookupMutationBatch(d,u).next((y=>(K(y!==null,37113),p=y.keys(),h.mutationQueue.removeMutationBatch(d,y)))).next((()=>h.mutationQueue.performConsistencyCheck(d))).next((()=>h.documentOverlayCache.removeOverlaysForBatchId(d,p,u))).next((()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p))).next((()=>h.localDocuments.getDocuments(d,p)))}))})(r.localStore,e);eh(r,e,t),Zl(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await ar(r,s)}catch(s){await hn(s)}}function Zl(n,e){(n.mu.get(e)||[]).forEach((t=>{t.resolve()})),n.mu.delete(e)}function eh(n,e,t){const r=F(n);let s=r.Vu[r.currentUser.toKey()];if(s){const o=s.get(e);o&&(t?o.reject(t):o.resolve(),s=s.remove(e)),r.Vu[r.currentUser.toKey()]=s}}function Ni(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Iu.get(e))n.Tu.delete(r),t&&n.Pu.yu(r,t);n.Iu.delete(e),n.isPrimaryClient&&n.Ru.jr(e).forEach((r=>{n.Ru.containsKey(r)||th(n,r)}))}function th(n,e){n.Eu.delete(e.path.canonicalString());const t=n.du.get(e);t!==null&&(lo(n.remoteStore,t),n.du=n.du.remove(e),n.Au.delete(t),Eo(n))}function qc(n,e,t){for(const r of t)r instanceof Ql?(n.Ru.addReference(r.key,e),Cy(n,r)):r instanceof Xl?(D(yo,"Document no longer in limbo: "+r.key),n.Ru.removeReference(r.key,e),n.Ru.containsKey(r.key)||th(n,r.key)):L(19791,{wu:r})}function Cy(n,e){const t=e.key,r=t.path.canonicalString();n.du.get(t)||n.Eu.has(r)||(D(yo,"New document in limbo: "+t),n.Eu.add(r),Eo(n))}function Eo(n){for(;n.Eu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const e=n.Eu.values().next().value;n.Eu.delete(e);const t=new M(Y.fromString(e)),r=n.fu.next();n.Au.set(r,new _y(t)),n.du=n.du.insert(t,r),$l(n.remoteStore,new lt(xe(to(t.path)),r,"TargetPurposeLimboResolution",ds.ce))}}async function ar(n,e,t){const r=F(n),s=[],o=[],a=[];r.Tu.isEmpty()||(r.Tu.forEach(((u,h)=>{a.push(r.pu(h,e,t).then((d=>{if((d||t)&&r.isPrimaryClient){const p=d?!d.fromCache:t?.targetChanges.get(h.targetId)?.current;r.sharedClientState.updateQueryState(h.targetId,p?"current":"not-current")}if(d){s.push(d);const p=co.As(h.targetId,d);o.push(p)}})))})),await Promise.all(a),r.Pu.H_(s),await(async function(h,d){const p=F(h);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(y=>S.forEach(d,(I=>S.forEach(I.Es,(P=>p.persistence.referenceDelegate.addReference(y,I.targetId,P))).next((()=>S.forEach(I.ds,(P=>p.persistence.referenceDelegate.removeReference(y,I.targetId,P)))))))))}catch(y){if(!dn(y))throw y;D(uo,"Failed to update sequence numbers: "+y)}for(const y of d){const I=y.targetId;if(!y.fromCache){const P=p.Ms.get(I),k=P.snapshotVersion,N=P.withLastLimboFreeSnapshotVersion(k);p.Ms=p.Ms.insert(I,N)}}})(r.localStore,o))}async function by(n,e){const t=F(n);if(!t.currentUser.isEqual(e)){D(yo,"User change. New user:",e.toKey());const r=await Fl(t.localStore,e);t.currentUser=e,(function(o,a){o.mu.forEach((u=>{u.forEach((h=>{h.reject(new O(C.CANCELLED,a))}))})),o.mu.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ar(t,r.Ls)}}function ky(n,e){const t=F(n),r=t.Au.get(e);if(r&&r.hu)return $().add(r.key);{let s=$();const o=t.Iu.get(e);if(!o)return s;for(const a of o){const u=t.Tu.get(a);s=s.unionWith(u.view.nu)}return s}}function nh(n){const e=F(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Yl.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=ky.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Ry.bind(null,e),e.Pu.H_=dy.bind(null,e.eventManager),e.Pu.yu=fy.bind(null,e.eventManager),e}function Vy(n){const e=F(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Sy.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Py.bind(null,e),e}class as{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=vs(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return D_(this.persistence,new b_,e.initialUser,this.serializer)}Cu(e){return new Ul(ao.mi,this.serializer)}Du(e){return new F_}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}as.provider={build:()=>new as};class Dy extends as{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){K(this.persistence.referenceDelegate instanceof is,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new p_(r,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?Re.withCacheSize(this.cacheSizeBytes):Re.DEFAULT;return new Ul((r=>is.mi(r,t)),this.serializer)}}class Oi{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>jc(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=by.bind(null,this.syncEngine),await ay(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new uy})()}createDatastore(e){const t=vs(e.databaseInfo.databaseId),r=(function(o){return new z_(o)})(e.databaseInfo);return(function(o,a,u,h){return new K_(o,a,u,h)})(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,o,a,u){return new X_(r,s,o,a,u)})(this.localStore,this.datastore,e.asyncQueue,(t=>jc(this.syncEngine,t,0)),(function(){return Mc.v()?new Mc:new B_})())}createSyncEngine(e,t){return(function(s,o,a,u,h,d,p){const y=new yy(s,o,a,u,h,d);return p&&(y.gu=!0),y})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await(async function(t){const r=F(t);D(Mt,"RemoteStore shutting down."),r.Ea.add(5),await or(r),r.Aa.shutdown(),r.Ra.set("Unknown")})(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}Oi.provider={build:()=>new Oi};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ny{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Ye("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const It="FirestoreClient";class Oy{constructor(e,t,r,s,o){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Ee.UNAUTHENTICATED,this.clientId=Ki.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,(async a=>{D(It,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(r,(a=>(D(It,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new mt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=go(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function li(n,e){n.asyncQueue.verifyOperationInProgress(),D(It,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await Fl(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function $c(n,e){n.asyncQueue.verifyOperationInProgress();const t=await My(n);D(It,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>xc(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>xc(e.remoteStore,s))),n._onlineComponents=e}async function My(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){D(It,"Using user provided OfflineComponentProvider");try{await li(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===C.FAILED_PRECONDITION||s.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;en("Error using user provided cache. Falling back to memory cache: "+t),await li(n,new as)}}else D(It,"Using default OfflineComponentProvider"),await li(n,new Dy(void 0));return n._offlineComponents}async function rh(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(D(It,"Using user provided OnlineComponentProvider"),await $c(n,n._uninitializedComponentsProvider._online)):(D(It,"Using default OnlineComponentProvider"),await $c(n,new Oi))),n._onlineComponents}function Ly(n){return rh(n).then((e=>e.syncEngine))}async function xy(n){const e=await rh(n),t=e.eventManager;return t.onListen=Ey.bind(null,e.syncEngine),t.onUnlisten=vy.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Ty.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=wy.bind(null,e.syncEngine),t}function Uy(n,e,t={}){const r=new mt;return n.asyncQueue.enqueueAndForget((async()=>(function(o,a,u,h,d){const p=new Ny({next:I=>{p.Nu(),a.enqueueAndForget((()=>hy(o,y)));const P=I.docs.has(u);!P&&I.fromCache?d.reject(new O(C.UNAVAILABLE,"Failed to get document because the client is offline.")):P&&I.fromCache&&h&&h.source==="server"?d.reject(new O(C.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(I)},error:I=>d.reject(I)}),y=new py(to(u.path),p,{includeMetadataChanges:!0,qa:!0});return ly(o,y)})(await xy(n),n.asyncQueue,e,t,r))),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sh(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zc=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ih="firestore.googleapis.com",Hc=!0;class Wc{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new O(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ih,this.ssl=Hc}else this.host=e.host,this.ssl=e.ssl??Hc;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=xl;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<d_)throw new O(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Km("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=sh(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class To{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Wc({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Wc(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new xm;switch(r.type){case"firstParty":return new jm(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new O(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=zc.get(t);r&&(D("ComponentProvider","Removing Datastore"),zc.delete(t),r.terminate())})(this),Promise.resolve()}}function Fy(n,e,t,r={}){n=zn(n,To);const s=an(e),o=n._getSettings(),a={...o,emulatorOptions:n._getEmulatorOptions()},u=`${e}:${t}`;s&&(su(`https://${u}`),iu("Firestore",!0)),o.host!==ih&&o.host!==u&&en("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const h={...o,host:u,ssl:s,emulatorOptions:r};if(!Vt(h,a)&&(n._setSettings(h),r.mockUserToken)){let d,p;if(typeof r.mockUserToken=="string")d=r.mockUserToken,p=Ee.MOCK_USER;else{d=ad(r.mockUserToken,n._app?.options.projectId);const y=r.mockUserToken.sub||r.mockUserToken.user_id;if(!y)throw new O(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ee(y)}n._authCredentials=new Um(new Xu(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Io{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Io(this.firestore,e,this._query)}}class ae{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Yn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ae(this.firestore,e,this._key)}toJSON(){return{type:ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(sr(t,ae._jsonSchema))return new ae(e,r||null,new M(Y.fromString(t.referencePath)))}}ae._jsonSchemaVersion="firestore/documentReference/1.0",ae._jsonSchema={type:re("string",ae._jsonSchemaVersion),referencePath:re("string")};class Yn extends Io{constructor(e,t,r){super(e,t,to(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ae(this.firestore,null,new M(e))}withConverter(e){return new Yn(this.firestore,e,this._path)}}function IE(n,e,...t){if(n=Ae(n),arguments.length===1&&(e=Ki.newId()),Gm("doc","path",e),n instanceof To){const r=Y.fromString(e,...t);return oc(r),new ae(n,null,new M(r))}{if(!(n instanceof ae||n instanceof Yn))throw new O(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Y.fromString(e,...t));return oc(r),new ae(n.firestore,n instanceof Yn?n.converter:null,new M(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gc="AsyncQueue";class Kc{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new jl(this,"async_queue_retry"),this._c=()=>{const r=ui();r&&D(Gc,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const t=ui();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=ui();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise((()=>{}));const t=new mt;return this.cc((()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Xu.push(e),this.lc())))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!dn(e))throw e;D(Gc,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_((()=>this.lc()))}}cc(e){const t=this.ac.then((()=>(this.rc=!0,e().catch((r=>{throw this.nc=r,this.rc=!1,Ye("INTERNAL UNHANDLED ERROR: ",Qc(r)),r})).then((r=>(this.rc=!1,r))))));return this.ac=t,t}enqueueAfterDelay(e,t,r){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const s=mo.createAndSchedule(this,e,t,r,(o=>this.hc(o)));return this.tc.push(s),s}uc(){this.nc&&L(47125,{Pc:Qc(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then((()=>{this.tc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()}))}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function Qc(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class vo extends To{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Kc,this._persistenceKey=s?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Kc(e),this._firestoreClient=void 0,await e}}}function vE(n,e){const t=typeof n=="object"?n:uu(),r=typeof n=="string"?n:Zr,s=xi(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const o=id("firestore");o&&Fy(s,...o)}return s}function oh(n){if(n._terminated)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||By(n),n._firestoreClient}function By(n){const e=n._freezeSettings(),t=(function(s,o,a,u){return new ig(s,o,a,u.host,u.ssl,u.experimentalForceLongPolling,u.experimentalAutoDetectLongPolling,sh(u.experimentalLongPollingOptions),u.useFetchStreams,u.isUsingEmulator)})(n._databaseId,n._app?.options.appId||"",n._persistenceKey,e);n._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new Oy(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(s){const o=s?._online.build();return{_offline:s?._offline.build(o),_online:o}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ce(de.fromBase64String(e))}catch(t){throw new O(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ce(de.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Ce._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(sr(e,Ce._jsonSchema))return Ce.fromBase64String(e.bytes)}}Ce._jsonSchemaVersion="firestore/bytes/1.0",Ce._jsonSchema={type:re("string",Ce._jsonSchemaVersion),bytes:re("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new he(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fe{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return q(this._lat,e._lat)||q(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Fe._jsonSchemaVersion}}static fromJSON(e){if(sr(e,Fe._jsonSchema))return new Fe(e.latitude,e.longitude)}}Fe._jsonSchemaVersion="firestore/geoPoint/1.0",Fe._jsonSchema={type:re("string",Fe._jsonSchemaVersion),latitude:re("number"),longitude:re("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==s[o])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Be._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(sr(e,Be._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Be(e.vectorValues);throw new O(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Be._jsonSchemaVersion="firestore/vectorValue/1.0",Be._jsonSchema={type:re("string",Be._jsonSchemaVersion),vectorValues:re("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jy=/^__.*__$/;class ah{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new xt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function ch(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw L(40011,{Ac:n})}}class wo{constructor(e,t,r,s,o,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,o===void 0&&this.Rc(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new wo({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){const t=this.path?.child(e),r=this.Vc({path:t,fc:!1});return r.gc(e),r}yc(e){const t=this.path?.child(e),r=this.Vc({path:t,fc:!1});return r.Rc(),r}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return cs(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(e.length===0)throw this.Sc("Document fields must not be empty");if(ch(this.Ac)&&jy.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class qy{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||vs(e)}Cc(e,t,r,s=!1){return new wo({Ac:e,methodName:t,Dc:r,path:he.emptyPath(),fc:!1,bc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function $y(n){const e=n._freezeSettings(),t=vs(n._databaseId);return new qy(n._databaseId,!!e.ignoreUndefinedProperties,t)}class Ps extends Ss{_toFieldTransform(e){if(e.Ac!==2)throw e.Ac===1?e.Sc(`${this._methodName}() can only appear at the top level of your update data`):e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ps}}class Ao extends Ss{_toFieldTransform(e){return new Dg(e.path,new Qn)}isEqual(e){return e instanceof Ao}}function zy(n,e,t,r){const s=n.Cc(1,e,t);lh("Data must be an object, but it was:",s,r);const o=[],a=Pe.empty();vt(r,((h,d)=>{const p=Ro(e,h,t);d=Ae(d);const y=s.yc(p);if(d instanceof Ps)o.push(p);else{const I=Cs(d,y);I!=null&&(o.push(p),a.set(p,I))}}));const u=new Ve(o);return new ah(a,u,s.fieldTransforms)}function Hy(n,e,t,r,s,o){const a=n.Cc(1,e,t),u=[Xc(e,r,t)],h=[s];if(o.length%2!=0)throw new O(C.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let I=0;I<o.length;I+=2)u.push(Xc(e,o[I])),h.push(o[I+1]);const d=[],p=Pe.empty();for(let I=u.length-1;I>=0;--I)if(!Ky(d,u[I])){const P=u[I];let k=h[I];k=Ae(k);const N=a.yc(P);if(k instanceof Ps)d.push(P);else{const V=Cs(k,N);V!=null&&(d.push(P),p.set(P,V))}}const y=new Ve(d);return new ah(p,y,a.fieldTransforms)}function Cs(n,e){if(uh(n=Ae(n)))return lh("Unsupported field value:",e,n),Wy(n,e);if(n instanceof Ss)return(function(r,s){if(!ch(s.Ac))throw s.Sc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Sc(`${r._methodName}() is not currently supported inside arrays`);const o=r._toFieldTransform(s);o&&s.fieldTransforms.push(o)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.fc&&e.Ac!==4)throw e.Sc("Nested arrays are not supported");return(function(r,s){const o=[];let a=0;for(const u of r){let h=Cs(u,s.wc(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}})(n,e)}return(function(r,s){if((r=Ae(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return bg(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const o=J.fromDate(r);return{timestampValue:ss(s.serializer,o)}}if(r instanceof J){const o=new J(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ss(s.serializer,o)}}if(r instanceof Fe)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ce)return{bytesValue:kl(s.serializer,r._byteString)};if(r instanceof ae){const o=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(o))throw s.Sc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:io(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Be)return(function(a,u){return{mapValue:{fields:{[il]:{stringValue:ol},[es]:{arrayValue:{values:a.toArray().map((d=>{if(typeof d!="number")throw u.Sc("VectorValues must only contain numeric values.");return no(u.serializer,d)}))}}}}}})(r,s);throw s.Sc(`Unsupported field value: ${Qi(r)}`)})(n,e)}function Wy(n,e){const t={};return Zu(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):vt(n,((r,s)=>{const o=Cs(s,e.mc(r));o!=null&&(t[r]=o)})),{mapValue:{fields:t}}}function uh(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof J||n instanceof Fe||n instanceof Ce||n instanceof ae||n instanceof Ss||n instanceof Be)}function lh(n,e,t){if(!uh(t)||!Ju(t)){const r=Qi(t);throw r==="an object"?e.Sc(n+" a custom object"):e.Sc(n+" "+r)}}function Xc(n,e,t){if((e=Ae(e))instanceof Rs)return e._internalPath;if(typeof e=="string")return Ro(n,e);throw cs("Field path arguments must be of type string or ",n,!1,void 0,t)}const Gy=new RegExp("[~\\*/\\[\\]]");function Ro(n,e,t){if(e.search(Gy)>=0)throw cs(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Rs(...e.split("."))._internalPath}catch{throw cs(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function cs(n,e,t,r,s){const o=r&&!r.isEmpty(),a=s!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${r}`),a&&(h+=` in document ${s}`),h+=")"),new O(C.INVALID_ARGUMENT,u+n+h)}function Ky(n,e){return n.some((t=>t.isEqual(e)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(e,t,r,s,o){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Qy(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(dh("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Qy extends hh{data(){return super.data()}}function dh(n,e){return typeof e=="string"?Ro(n,e):e instanceof Rs?e._internalPath:e._delegate._internalPath}class Xy{convertValue(e,t="none"){switch(Et(e)){case 0:return null;case 1:return e.booleanValue;case 2:return te(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(yt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw L(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return vt(e,((s,o)=>{r[s]=this.convertValue(o,t)})),r}convertVectorValue(e){const t=e.fields?.[es].arrayValue?.values?.map((r=>te(r.doubleValue)));return new Be(t)}convertGeoPoint(e){return new Fe(te(e.latitude),te(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=ps(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Wn(e));default:return null}}convertTimestamp(e){const t=_t(e);return new J(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Y.fromString(e);K(Ll(r),9688,{name:e});const s=new Gn(r.get(1),r.get(3)),o=new M(r.popFirst(5));return s.isEqual(t)||Ye(`Document ${o} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),o}}class On{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class kt extends hh{constructor(e,t,r,s,o,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=o}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new qr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(dh("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=kt._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}kt._jsonSchemaVersion="firestore/documentSnapshot/1.0",kt._jsonSchema={type:re("string",kt._jsonSchemaVersion),bundleSource:re("string","DocumentSnapshot"),bundleName:re("string"),bundle:re("string")};class qr extends kt{data(e={}){return super.data(e)}}class jn{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new On(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new qr(this._firestore,this._userDataWriter,r.key,r,new On(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,o){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((u=>{const h=new qr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new On(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:h,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((u=>o||u.type!==3)).map((u=>{const h=new qr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new On(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,p=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),p=a.indexOf(u.doc.key)),{type:Jy(u.type),doc:h,oldIndex:d,newIndex:p}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=jn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ki.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((o=>{o._document!==null&&(t.push(o._document),r.push(this._userDataWriter.convertObjectMap(o._document.data.value.mapValue.fields,"previous")),s.push(o.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Jy(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return L(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wE(n){n=zn(n,ae);const e=zn(n.firestore,vo);return Uy(oh(e),n._key).then((t=>eE(e,n,t)))}jn._jsonSchemaVersion="firestore/querySnapshot/1.0",jn._jsonSchema={type:re("string",jn._jsonSchemaVersion),bundleSource:re("string","QuerySnapshot"),bundleName:re("string"),bundle:re("string")};class Yy extends Xy{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ce(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ae(this.firestore,null,t)}}function AE(n,e,t,...r){n=zn(n,ae);const s=zn(n.firestore,vo),o=$y(s);let a;return a=typeof(e=Ae(e))=="string"||e instanceof Rs?Hy(o,"updateDoc",n._key,e,t,r):zy(o,"updateDoc",n._key,e),Zy(s,[a.toMutation(n._key,Ke.exists(!0))])}function Zy(n,e){return(function(r,s){const o=new mt;return r.asyncQueue.enqueueAndForget((async()=>Ay(await Ly(r),s,o))),o.promise})(oh(n),e)}function eE(n,e,t){const r=t.docs.get(e._key),s=new Yy(n);return new kt(n,s,e._key,r,new On(t.hasPendingWrites,t.fromCache),e.converter)}function RE(){return new Ao("serverTimestamp")}(function(e,t=!0){(function(s){ln=s})(cn),Yt(new Dt("firestore",((r,{instanceIdentifier:s,options:o})=>{const a=r.getProvider("app").getImmediate(),u=new vo(new Fm(r.getProvider("auth-internal")),new qm(a,r.getProvider("app-check-internal")),(function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new O(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Gn(d.options.projectId,p)})(a,s),a);return o={useFetchStreams:t,...o},u._setSettings(o),u}),"PUBLIC").setMultipleInstances(!0)),ft(nc,rc,e),ft(nc,rc,"esm2020")})();var tE="firebase",nE="12.2.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ft(tE,nE,"app");export{yE as $,id as A,Vt as B,Dt as C,od as D,ad as E,an as F,su as G,iu as H,cn as I,Zn as J,Wd as K,Mi as L,et as M,fd as N,_d as O,yd as P,gE as Q,iE as R,dE as S,vE as T,EE as U,bf as V,wE as W,IE as X,AE as Y,RE as Z,Yt as _,Qh as a,_E as a0,lE as b,uE as c,pE as d,Zc as e,Xh as f,fE as g,Oe as h,j as i,Ca as j,cE as k,aE as l,hE as m,vd as n,ld as o,pd as p,er as q,ft as r,oE as s,Ae as t,rE as u,mE as v,Zh as w,sE as x,uu as y,xi as z};
