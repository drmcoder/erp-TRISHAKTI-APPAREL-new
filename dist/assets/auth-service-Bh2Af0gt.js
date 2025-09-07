import{L as rs,a as f,_ as Ae,C as ke,r as fe,s as N,j as Ut,c as $,b as pe,m as Ke,d as Yi,S as ji,e as Qi,f as Me,g as Xi,h as Ji,i as Zi,D as os,q as er,k as tr,l as nr,n as dn,o as as,p as sr,t as nt,u as ir,v as st,w as rr,x as or,y as ls,z as De,A as ar,B as cs,E as lr,F as us,G as cr,H as ur,I as hr,J as hs,K as dr,M as ds,N as fr,O as pr,P as _r,Q as fn,R as gr,T as mr,U as yr,V as vr,W as qe,X as oe,Y as pn,Z as _n,$ as Cr,a0 as Ir}from"./firebase-Cc6h_MKV.js";var gn={};const mn="@firebase/database",yn="1.1.0";/**
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
 */let fs="";function Er(n){fs=n}/**
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
 */class Tr{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),N(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Ut(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
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
 */class wr{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return $(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
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
 */const ps=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new Tr(e)}}catch{}return new wr},X=ps("localStorage"),Sr=ps("sessionStorage");/**
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
 */const he=new rs("@firebase/database"),Rr=(function(){let n=1;return function(){return n++}})(),_s=function(n){const e=Yi(n),t=new ji;t.update(e);const s=t.digest();return Qi.encodeByteArray(s)},xe=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=xe.apply(null,s):typeof s=="object"?e+=N(s):e+=s,e+=" "}return e};let we=null,vn=!0;const Nr=function(n,e){f(!0,"Can't turn on custom loggers persistently."),he.logLevel=Zi.VERBOSE,we=he.log.bind(he)},A=function(...n){if(vn===!0&&(vn=!1,we===null&&Sr.get("logging_enabled")===!0&&Nr()),we){const e=xe.apply(null,n);we(e)}},Le=function(n){return function(...e){A(n,...e)}},St=function(...n){const e="FIREBASE INTERNAL ERROR: "+xe(...n);he.error(e)},z=function(...n){const e=`FIREBASE FATAL ERROR: ${xe(...n)}`;throw he.error(e),new Error(e)},D=function(...n){const e="FIREBASE WARNING: "+xe(...n);he.warn(e)},br=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&D("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},gs=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},Ar=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},_e="[MIN_NAME]",Z="[MAX_NAME]",me=function(n,e){if(n===e)return 0;if(n===_e||e===Z)return-1;if(e===_e||n===Z)return 1;{const t=Cn(n),s=Cn(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},kr=function(n,e){return n===e?0:n<e?-1:1},Ce=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+N(e))},Wt=function(n){if(typeof n!="object"||n===null)return N(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=N(e[s]),t+=":",t+=Wt(n[e[s]]);return t+="}",t},ms=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let i=0;i<t;i+=e)i+e>t?s.push(n.substring(i,t)):s.push(n.substring(i,i+e));return s};function W(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const ys=function(n){f(!gs(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let i,r,o,a,l;n===0?(r=0,o=0,i=1/n===-1/0?1:0):(i=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(a=Math.min(Math.floor(Math.log(n)/Math.LN2),s),r=a+s,o=Math.round(n*Math.pow(2,t-a)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-s-t))));const c=[];for(l=t;l;l-=1)c.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)c.push(r%2?1:0),r=Math.floor(r/2);c.push(i?1:0),c.reverse();const u=c.join("");let h="";for(l=0;l<64;l+=8){let d=parseInt(u.substr(l,8),2).toString(16);d.length===1&&(d="0"+d),h=h+d}return h.toLowerCase()},Pr=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},Or=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"},Mr=new RegExp("^-?(0*)\\d{1,10}$"),Dr=-2147483648,xr=2147483647,Cn=function(n){if(Mr.test(n)){const e=Number(n);if(e>=Dr&&e<=xr)return e}return null},Fe=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw D("Exception was thrown by user callback.",t),e},Math.floor(0))}},Lr=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Se=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
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
 */class Fr{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,Ji(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t?.getImmediate({optional:!0}),this.appCheck||t?.get().then(s=>this.appCheck=s)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.appCheckProvider?.get().then(t=>t.addTokenListener(e))}notifyForInvalidToken(){D(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
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
 */class Ur{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(i=>this.auth_=i)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(A("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',D(e)}}class Ve{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Ve.OWNER="owner";/**
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
 */const Gt="5",vs="v",Cs="s",Is="r",Es="f",Ts=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,ws="ls",Ss="p",Rt="ac",Rs="websocket",Ns="long_polling";/**
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
 */class bs{constructor(e,t,s,i,r=!1,o="",a=!1,l=!1,c=null){this.secure=t,this.namespace=s,this.webSocketOnly=i,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=l,this.emulatorOptions=c,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=X.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&X.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Wr(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function As(n,e,t){f(typeof e=="string","typeof type must == string"),f(typeof t=="object","typeof params must == object");let s;if(e===Rs)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Ns)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Wr(n)&&(t.ns=n.namespace);const i=[];return W(t,(r,o)=>{i.push(r+"="+o)}),s+i.join("&")}/**
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
 */class Gr{constructor(){this.counters_={}}incrementCounter(e,t=1){$(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return ir(this.counters_)}}/**
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
 */const pt={},_t={};function qt(n){const e=n.toString();return pt[e]||(pt[e]=new Gr),pt[e]}function qr(n,e){const t=n.toString();return _t[t]||(_t[t]=e()),_t[t]}/**
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
 */class Hr{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let i=0;i<s.length;++i)s[i]&&Fe(()=>{this.onMessage_(s[i])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
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
 */const In="start",Br="close",Vr="pLPCommand",Kr="pRTLPCB",ks="id",Ps="pw",Os="ser",zr="cb",$r="seg",Yr="ts",jr="d",Qr="dframe",Ms=1870,Ds=30,Xr=Ms-Ds,Jr=25e3,Zr=3e4;class ce{constructor(e,t,s,i,r,o,a){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Le(e),this.stats_=qt(t),this.urlFn=l=>(this.appCheckToken&&(l[Rt]=this.appCheckToken),As(t,Ns,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Hr(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Zr)),Ar(()=>{if(this.isClosed_)return;this.scriptTagHolder=new Ht((...r)=>{const[o,a,l,c,u]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===In)this.id=a,this.password=l;else if(o===Br)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{const[o,a]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);const s={};s[In]="t",s[Os]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[zr]=this.scriptTagHolder.uniqueCallbackIdentifier),s[vs]=Gt,this.transportSessionId&&(s[Cs]=this.transportSessionId),this.lastSessionId&&(s[ws]=this.lastSessionId),this.applicationId&&(s[Ss]=this.applicationId),this.appCheckToken&&(s[Rt]=this.appCheckToken),typeof location<"u"&&location.hostname&&Ts.test(location.hostname)&&(s[Is]=Es);const i=this.urlFn(s);this.log_("Connecting via long-poll to "+i),this.scriptTagHolder.addTag(i,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){ce.forceAllow_=!0}static forceDisallow(){ce.forceDisallow_=!0}static isAvailable(){return ce.forceAllow_?!0:!ce.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Pr()&&!Or()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=N(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=rr(t),i=ms(s,Xr);for(let r=0;r<i.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,i.length,i[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[Qr]="t",s[ks]=e,s[Ps]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=N(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class Ht{constructor(e,t,s,i){this.onDisconnect=s,this.urlFn=i,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Rr(),window[Vr+this.uniqueCallbackIdentifier]=e,window[Kr+this.uniqueCallbackIdentifier]=t,this.myIFrame=Ht.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){A("frame writing exception"),a.stack&&A(a.stack),A(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||A("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[ks]=this.myID,e[Ps]=this.myPW,e[Os]=this.currentSerial;let t=this.urlFn(e),s="",i=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+Ds+s.length<=Ms;){const o=this.pendingSegs.shift();s=s+"&"+$r+i+"="+o.seg+"&"+Yr+i+"="+o.ts+"&"+jr+i+"="+o.d,i++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},i=setTimeout(s,Math.floor(Jr)),r=()=>{clearTimeout(i),s()};this.addTag(e,r)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const i=s.readyState;(!i||i==="loaded"||i==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{A("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
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
 */const eo=16384,to=45e3;let ze=null;typeof MozWebSocket<"u"?ze=MozWebSocket:typeof WebSocket<"u"&&(ze=WebSocket);class G{constructor(e,t,s,i,r,o,a){this.connId=e,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Le(this.connId),this.stats_=qt(t),this.connURL=G.connectionURL_(t,o,a,i,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,i,r){const o={};return o[vs]=Gt,typeof location<"u"&&location.hostname&&Ts.test(location.hostname)&&(o[Is]=Es),t&&(o[Cs]=t),s&&(o[ws]=s),i&&(o[Rt]=i),r&&(o[Ss]=r),As(e,Rs,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,X.set("previous_websocket_failure",!0);try{let s;or(),this.mySock=new ze(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_()}}start(){}static forceDisallow(){G.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&ze!==null&&!G.forceDisallow_}static previouslyFailed(){return X.isInMemoryStorage||X.get("previous_websocket_failure")===!0}markConnectionHealthy(){X.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=Ut(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(f(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=N(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=ms(t,eo);s.length>1&&this.sendString_(String(s.length));for(let i=0;i<s.length;i++)this.sendString_(s[i])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(to))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}G.responsesRequiredToBeHealthy=2;G.healthyTimeout=3e4;/**
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
 */class Pe{static get ALL_TRANSPORTS(){return[ce,G]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=G&&G.isAvailable();let s=t&&!G.previouslyFailed();if(e.webSocketOnly&&(t||D("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[G];else{const i=this.transports_=[];for(const r of Pe.ALL_TRANSPORTS)r&&r.isAvailable()&&i.push(r);Pe.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Pe.globalTransportInitialized_=!1;/**
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
 */const no=6e4,so=5e3,io=10*1024,ro=100*1024,gt="t",En="d",oo="s",Tn="r",ao="e",wn="o",Sn="a",Rn="n",Nn="p",lo="h";class co{constructor(e,t,s,i,r,o,a,l,c,u){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=i,this.authToken_=r,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=l,this.onKill_=c,this.lastSessionId=u,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Le("c:"+this.id+":"),this.transportManager_=new Pe(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const i=e.healthyTimeout||0;i>0&&(this.healthyTimeout_=Se(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>ro?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>io?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(i)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(gt in e){const t=e[gt];t===Sn?this.upgradeIfSecondaryHealthy_():t===Tn?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===wn&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Ce("t",e),s=Ce("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Nn,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Sn,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Rn,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Ce("t",e),s=Ce("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Ce(gt,e);if(En in e){const s=e[En];if(t===lo){const i={...s};this.repoInfo_.isUsingEmulator&&(i.h=this.repoInfo_.host),this.onHandshake_(i)}else if(t===Rn){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let i=0;i<this.pendingDataMessages.length;++i)this.onDataMessage_(this.pendingDataMessages[i]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===oo?this.onConnectionShutdown_(s):t===Tn?this.onReset_(s):t===ao?St("Server Error: "+s):t===wn?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):St("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,i=e.h;this.sessionId=e.s,this.repoInfo_.host=i,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),Gt!==s&&D("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),Se(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(no))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Se(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(so))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Nn,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(X.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
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
 */class xs{put(e,t,s,i){}merge(e,t,s,i){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
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
 */class Ls{constructor(e){this.allowedEvents_=e,this.listeners_={},f(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let i=0;i<s.length;i++)s[i].callback.apply(s[i].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const i=this.getInitialEvent(e);i&&t.apply(s,i)}off(e,t,s){this.validateEventType_(e);const i=this.listeners_[e]||[];for(let r=0;r<i.length;r++)if(i[r].callback===t&&(!s||s===i[r].context)){i.splice(r,1);return}}validateEventType_(e){f(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
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
 */class $e extends Ls{static getInstance(){return new $e}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!as()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return f(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
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
 */const bn=32,An=768;class T{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let i=0;i<this.pieces_.length;i++)this.pieces_[i].length>0&&(this.pieces_[s]=this.pieces_[i],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function C(){return new T("")}function m(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function j(n){return n.pieces_.length-n.pieceNum_}function E(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new T(n.pieces_,e)}function Fs(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function uo(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Us(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Ws(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new T(e,0)}function R(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof T)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let i=0;i<s.length;i++)s[i].length>0&&t.push(s[i])}return new T(t,0)}function g(n){return n.pieceNum_>=n.pieces_.length}function U(n,e){const t=m(n),s=m(e);if(t===null)return e;if(t===s)return U(E(n),E(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function Gs(n,e){if(j(n)!==j(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function q(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(j(n)>j(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class ho{constructor(e,t){this.errorPrefix_=t,this.parts_=Us(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=st(this.parts_[s]);qs(this)}}function fo(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=st(e),qs(n)}function po(n){const e=n.parts_.pop();n.byteLength_-=st(e),n.parts_.length>0&&(n.byteLength_-=1)}function qs(n){if(n.byteLength_>An)throw new Error(n.errorPrefix_+"has a key path longer than "+An+" bytes ("+n.byteLength_+").");if(n.parts_.length>bn)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+bn+") or object contains a cycle "+Q(n))}function Q(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
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
 */class Bt extends Ls{static getInstance(){return new Bt}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}getInitialEvent(e){return f(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
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
 */const Ie=1e3,_o=300*1e3,kn=30*1e3,go=1.3,mo=3e4,yo="server_kill",Pn=3;class K extends xs{constructor(e,t,s,i,r,o,a,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=i,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=l,this.id=K.nextPersistentConnectionId_++,this.log_=Le("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Ie,this.maxReconnectDelay_=_o,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");Bt.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&$e.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const i=++this.requestNumber_,r={r:i,a:e,b:t};this.log_(N(r)),f(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),s&&(this.requestCBHash_[i]=s)}get(e){this.initConnection_();const t=new os,i={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const a=o.d;o.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(i),this.outstandingGetCount_++;const r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,s,i){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),f(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const a={onComplete:i,hashFn:t,query:e,tag:s};this.listens.get(o).set(r,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),i=t._queryIdentifier;this.log_("Listen on "+s+" for "+i);const r={p:s},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,a=>{const l=a.d,c=a.s;K.warnOnListenWarnings_(l,t),(this.listens.get(s)&&this.listens.get(s).get(i))===e&&(this.log_("listen response",a),c!=="ok"&&this.removeListen_(s,i),e.onComplete&&e.onComplete(c,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&$(e,"w")){const s=pe(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const i='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();D(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${i} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||tr(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=kn)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=nr(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,i=>{const r=i.s,o=i.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),i=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+i),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,i)&&this.connected_&&this.sendUnlisten_(s,i,e._queryObject,t)}sendUnlisten_(e,t,s,i){this.log_("Unlisten on "+e+" for "+t);const r={p:e},o="n";i&&(r.q=s,r.t=i),this.sendRequest(o,r)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,i){const r={p:t,d:s};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{i&&setTimeout(()=>{i(o.s,o.d)},Math.floor(0))})}put(e,t,s,i){this.putInternal("p",e,t,s,i)}merge(e,t,s,i){this.putInternal("m",e,t,s,i)}putInternal(e,t,s,i,r){this.initConnection_();const o={p:t,d:s};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:i}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,i=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),i&&i(r.s,r.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const r=s.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+N(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):St("Unrecognized action received from server: "+N(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){f(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Ie,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Ie,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>mo&&(this.reconnectDelay_=Ie),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*go)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),i=this.id+":"+K.nextConnectionId_++,r=this.lastSessionId;let o=!1,a=null;const l=function(){a?a.close():(o=!0,s())},c=function(h){f(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(h)};this.realtime_={close:l,sendRequest:c};const u=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[h,d]=await Promise.all([this.authTokenProvider_.getToken(u),this.appCheckTokenProvider_.getToken(u)]);o?A("getToken() completed but was canceled"):(A("getToken() completed. Creating connection."),this.authToken_=h&&h.accessToken,this.appCheckToken_=d&&d.token,a=new co(i,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,p=>{D(p+" ("+this.repoInfo_.toString()+")"),this.interrupt(yo)},r))}catch(h){this.log_("Failed to get token: "+h),o||(this.repoInfo_.nodeAdmin&&D(h),l())}}}interrupt(e){A("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){A("Resuming connection for reason: "+e),delete this.interruptReasons_[e],dn(this.interruptReasons_)&&(this.reconnectDelay_=Ie,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(r=>Wt(r)).join("$"):s="default";const i=this.removeListen_(e,s);i&&i.onComplete&&i.onComplete("permission_denied")}removeListen_(e,t){const s=new T(e).toString();let i;if(this.listens.has(s)){const r=this.listens.get(s);i=r.get(t),r.delete(t),r.size===0&&this.listens.delete(s)}else i=void 0;return i}onAuthRevoked_(e,t){A("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Pn&&(this.reconnectDelay_=kn,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){A("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Pn&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+fs.replace(/\./g,"-")]=1,as()?e["framework.cordova"]=1:sr()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=$e.getInstance().currentlyOnline();return dn(this.interruptReasons_)&&e}}K.nextPersistentConnectionId_=0;K.nextConnectionId_=0;/**
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
 */class y{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new y(e,t)}}/**
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
 */class it{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new y(_e,e),i=new y(_e,t);return this.compare(s,i)!==0}minPost(){return y.MIN}}/**
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
 */let He;class Hs extends it{static get __EMPTY_NODE(){return He}static set __EMPTY_NODE(e){He=e}compare(e,t){return me(e.name,t.name)}isDefinedOn(e){throw Me("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return y.MIN}maxPost(){return new y(Z,He)}makePost(e,t){return f(typeof e=="string","KeyIndex indexValue must always be a string."),new y(e,He)}toString(){return".key"}}const de=new Hs;/**
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
 */class Be{constructor(e,t,s,i,r=null){this.isReverse_=i,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?s(e.key,t):1,i&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class S{constructor(e,t,s,i,r){this.key=e,this.value=t,this.color=s??S.RED,this.left=i??O.EMPTY_NODE,this.right=r??O.EMPTY_NODE}copy(e,t,s,i,r){return new S(e??this.key,t??this.value,s??this.color,i??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let i=this;const r=s(e,i.key);return r<0?i=i.copy(null,null,null,i.left.insert(e,t,s),null):r===0?i=i.copy(null,t,null,null,null):i=i.copy(null,null,null,null,i.right.insert(e,t,s)),i.fixUp_()}removeMin_(){if(this.left.isEmpty())return O.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,i;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return O.EMPTY_NODE;i=s.right.min_(),s=s.copy(i.key,i.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,S.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,S.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}S.RED=!0;S.BLACK=!1;class vo{copy(e,t,s,i,r){return this}insert(e,t,s){return new S(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class O{constructor(e,t=O.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new O(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,S.BLACK,null,null))}remove(e){return new O(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,S.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,i=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return i?i.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(i=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new Be(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new Be(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new Be(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new Be(this.root_,null,this.comparator_,!0,e)}}O.EMPTY_NODE=new vo;/**
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
 */function Co(n,e){return me(n.name,e.name)}function Vt(n,e){return me(n,e)}/**
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
 */let Nt;function Io(n){Nt=n}const Bs=function(n){return typeof n=="number"?"number:"+ys(n):"string:"+n},Vs=function(n){if(n.isLeafNode()){const e=n.val();f(typeof e=="string"||typeof e=="number"||typeof e=="object"&&$(e,".sv"),"Priority must be a string or number.")}else f(n===Nt||n.isEmpty(),"priority of unexpected type.");f(n===Nt||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
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
 */let On;class w{static set __childrenNodeConstructor(e){On=e}static get __childrenNodeConstructor(){return On}constructor(e,t=w.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,f(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Vs(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new w(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:w.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return g(e)?this:m(e)===".priority"?this.priorityNode_:w.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:w.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=m(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(f(s!==".priority"||j(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,w.__childrenNodeConstructor.EMPTY_NODE.updateChild(E(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+Bs(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=ys(this.value_):e+=this.value_,this.lazyHash_=_s(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===w.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof w.__childrenNodeConstructor?-1:(f(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,i=w.VALUE_TYPE_ORDER.indexOf(t),r=w.VALUE_TYPE_ORDER.indexOf(s);return f(i>=0,"Unknown leaf type: "+t),f(r>=0,"Unknown leaf type: "+s),i===r?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-i}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}w.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
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
 */let Ks,zs;function Eo(n){Ks=n}function To(n){zs=n}class wo extends it{compare(e,t){const s=e.node.getPriority(),i=t.node.getPriority(),r=s.compareTo(i);return r===0?me(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return y.MIN}maxPost(){return new y(Z,new w("[PRIORITY-POST]",zs))}makePost(e,t){const s=Ks(e);return new y(t,new w("[PRIORITY-POST]",s))}toString(){return".priority"}}const P=new wo;/**
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
 */const So=Math.log(2);class Ro{constructor(e){const t=r=>parseInt(Math.log(r)/So,10),s=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const i=s(this.count);this.bits_=e+1&i}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Ye=function(n,e,t,s){n.sort(e);const i=function(l,c){const u=c-l;let h,d;if(u===0)return null;if(u===1)return h=n[l],d=t?t(h):h,new S(d,h.node,S.BLACK,null,null);{const p=parseInt(u/2,10)+l,_=i(l,p),b=i(p+1,c);return h=n[p],d=t?t(h):h,new S(d,h.node,S.BLACK,_,b)}},r=function(l){let c=null,u=null,h=n.length;const d=function(_,b){const L=h-_,dt=h;h-=_;const Ge=i(L+1,dt),ft=n[L],$i=t?t(ft):ft;p(new S($i,ft.node,b,null,Ge))},p=function(_){c?(c.left=_,c=_):(u=_,c=_)};for(let _=0;_<l.count;++_){const b=l.nextBitIsOne(),L=Math.pow(2,l.count-(_+1));b?d(L,S.BLACK):(d(L,S.BLACK),d(L,S.RED))}return u},o=new Ro(n.length),a=r(o);return new O(s||e,a)};/**
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
 */let mt;const ae={};class V{static get Default(){return f(ae&&P,"ChildrenNode.ts has not been loaded"),mt=mt||new V({".priority":ae},{".priority":P}),mt}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=pe(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof O?t:null}hasIndex(e){return $(this.indexSet_,e.toString())}addIndex(e,t){f(e!==de,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let i=!1;const r=t.getIterator(y.Wrap);let o=r.getNext();for(;o;)i=i||e.isDefinedOn(o.node),s.push(o),o=r.getNext();let a;i?a=Ye(s,e.getCompare()):a=ae;const l=e.toString(),c={...this.indexSet_};c[l]=e;const u={...this.indexes_};return u[l]=a,new V(u,c)}addToIndexes(e,t){const s=Ke(this.indexes_,(i,r)=>{const o=pe(this.indexSet_,r);if(f(o,"Missing index implementation for "+r),i===ae)if(o.isDefinedOn(e.node)){const a=[],l=t.getIterator(y.Wrap);let c=l.getNext();for(;c;)c.name!==e.name&&a.push(c),c=l.getNext();return a.push(e),Ye(a,o.getCompare())}else return ae;else{const a=t.get(e.name);let l=i;return a&&(l=l.remove(new y(e.name,a))),l.insert(e,e.node)}});return new V(s,this.indexSet_)}removeFromIndexes(e,t){const s=Ke(this.indexes_,i=>{if(i===ae)return i;{const r=t.get(e.name);return r?i.remove(new y(e.name,r)):i}});return new V(s,this.indexSet_)}}/**
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
 */let Ee;class v{static get EMPTY_NODE(){return Ee||(Ee=new v(new O(Vt),null,V.Default))}constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&Vs(this.priorityNode_),this.children_.isEmpty()&&f(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Ee}updatePriority(e){return this.children_.isEmpty()?this:new v(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Ee:t}}getChild(e){const t=m(e);return t===null?this:this.getImmediateChild(t).getChild(E(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(f(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new y(e,t);let i,r;t.isEmpty()?(i=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(s,this.children_)):(i=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(s,this.children_));const o=i.isEmpty()?Ee:this.priorityNode_;return new v(i,o,r)}}updateChild(e,t){const s=m(e);if(s===null)return t;{f(m(e)!==".priority"||j(e)===1,".priority must be the last token in a path");const i=this.getImmediateChild(s).updateChild(E(e),t);return this.updateImmediateChild(s,i)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,i=0,r=!0;if(this.forEachChild(P,(o,a)=>{t[o]=a.val(e),s++,r&&v.INTEGER_REGEXP_.test(o)?i=Math.max(i,Number(o)):r=!1}),!e&&r&&i<2*s){const o=[];for(const a in t)o[a]=t[a];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+Bs(this.getPriority().val())+":"),this.forEachChild(P,(t,s)=>{const i=s.hash();i!==""&&(e+=":"+t+":"+i)}),this.lazyHash_=e===""?"":_s(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const i=this.resolveIndex_(s);if(i){const r=i.getPredecessorKey(new y(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new y(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new y(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(i=>t(i.name,i.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,i=>i);{const i=this.children_.getIteratorFrom(e.name,y.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)<0;)i.getNext(),r=i.peek();return i}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,i=>i);{const i=this.children_.getReverseIteratorFrom(e.name,y.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)>0;)i.getNext(),r=i.peek();return i}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===Ue?-1:0}withIndex(e){if(e===de||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new v(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===de||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(P),i=t.getIterator(P);let r=s.getNext(),o=i.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=s.getNext(),o=i.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===de?null:this.indexMap_.get(e.toString())}}v.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class No extends v{constructor(){super(new O(Vt),v.EMPTY_NODE,V.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return v.EMPTY_NODE}isEmpty(){return!1}}const Ue=new No;Object.defineProperties(y,{MIN:{value:new y(_e,v.EMPTY_NODE)},MAX:{value:new y(Z,Ue)}});Hs.__EMPTY_NODE=v.EMPTY_NODE;w.__childrenNodeConstructor=v;Io(Ue);To(Ue);/**
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
 */const bo=!0;function k(n,e=null){if(n===null)return v.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),f(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new w(t,k(e))}if(!(n instanceof Array)&&bo){const t=[];let s=!1;if(W(n,(o,a)=>{if(o.substring(0,1)!=="."){const l=k(a);l.isEmpty()||(s=s||!l.getPriority().isEmpty(),t.push(new y(o,l)))}}),t.length===0)return v.EMPTY_NODE;const r=Ye(t,Co,o=>o.name,Vt);if(s){const o=Ye(t,P.getCompare());return new v(r,k(e),new V({".priority":o},{".priority":P}))}else return new v(r,k(e),V.Default)}else{let t=v.EMPTY_NODE;return W(n,(s,i)=>{if($(n,s)&&s.substring(0,1)!=="."){const r=k(i);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(s,r))}}),t.updatePriority(k(e))}}Eo(k);/**
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
 */class Ao extends it{constructor(e){super(),this.indexPath_=e,f(!g(e)&&m(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),i=this.extractChild(t.node),r=s.compareTo(i);return r===0?me(e.name,t.name):r}makePost(e,t){const s=k(e),i=v.EMPTY_NODE.updateChild(this.indexPath_,s);return new y(t,i)}maxPost(){const e=v.EMPTY_NODE.updateChild(this.indexPath_,Ue);return new y(Z,e)}toString(){return Us(this.indexPath_,0).join("/")}}/**
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
 */class ko extends it{compare(e,t){const s=e.node.compareTo(t.node);return s===0?me(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return y.MIN}maxPost(){return y.MAX}makePost(e,t){const s=k(e);return new y(t,s)}toString(){return".value"}}const Po=new ko;/**
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
 */function Oo(n){return{type:"value",snapshotNode:n}}function Mo(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function Do(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Mn(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function xo(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
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
 */class Kt{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=P}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return f(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return f(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:_e}hasEnd(){return this.endSet_}getIndexEndValue(){return f(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return f(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Z}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return f(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===P}copy(){const e=new Kt;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Dn(n){const e={};if(n.isDefault())return e;let t;if(n.index_===P?t="$priority":n.index_===Po?t="$value":n.index_===de?t="$key":(f(n.index_ instanceof Ao,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=N(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=N(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+N(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=N(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+N(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function xn(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==P&&(e.i=n.index_.toString()),e}/**
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
 */class je extends xs{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(f(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,s,i){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=i,this.log_=Le("p:rest:"),this.listens_={}}listen(e,t,s,i){const r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);const o=je.getListenId_(e,s),a={};this.listens_[o]=a;const l=Dn(e._queryParams);this.restRequest_(r+".json",l,(c,u)=>{let h=u;if(c===404&&(h=null,c=null),c===null&&this.onDataUpdate_(r,h,!1,s),pe(this.listens_,o)===a){let d;c?c===401?d="permission_denied":d="rest_error:"+c:d="ok",i(d,null)}})}unlisten(e,t){const s=je.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Dn(e._queryParams),s=e._path.toString(),i=new os;return this.restRequest_(s+".json",t,(r,o)=>{let a=o;r===404&&(a=null,r=null),r===null?(this.onDataUpdate_(s,a,!1,null),i.resolve(a)):i.reject(new Error(a))}),i.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([i,r])=>{i&&i.accessToken&&(t.auth=i.accessToken),r&&r.token&&(t.ac=r.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+er(t);this.log_("Sending REST request for "+o);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(s&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let l=null;if(a.status>=200&&a.status<300){try{l=Ut(a.responseText)}catch{D("Failed to parse JSON response for "+o+": "+a.responseText)}s(null,l)}else a.status!==401&&a.status!==404&&D("Got unsuccessful REST response for "+o+" Status: "+a.status),s(a.status);s=null}},a.open("GET",o,!0),a.send()})}}/**
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
 */class Lo{constructor(){this.rootNode_=v.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
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
 */function Qe(){return{value:null,children:new Map}}function $s(n,e,t){if(g(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=m(e);n.children.has(s)||n.children.set(s,Qe());const i=n.children.get(s);e=E(e),$s(i,e,t)}}function bt(n,e,t){n.value!==null?t(e,n.value):Fo(n,(s,i)=>{const r=new T(e.toString()+"/"+s);bt(i,r,t)})}function Fo(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
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
 */class Uo{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&W(this.last_,(s,i)=>{t[s]=t[s]-i}),this.last_=e,t}}/**
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
 */const Ln=10*1e3,Wo=30*1e3,Go=300*1e3;class qo{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new Uo(e);const s=Ln+(Wo-Ln)*Math.random();Se(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;W(e,(i,r)=>{r>0&&$(this.statsToReport_,i)&&(t[i]=r,s=!0)}),s&&this.server_.reportStats(t),Se(this.reportStats_.bind(this),Math.floor(Math.random()*2*Go))}}/**
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
 */var B;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(B||(B={}));function Ys(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function js(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function Qs(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
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
 */class Xe{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=B.ACK_USER_WRITE,this.source=Ys()}operationForChild(e){if(g(this.path)){if(this.affectedTree.value!=null)return f(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new T(e));return new Xe(C(),t,this.revert)}}else return f(m(this.path)===e,"operationForChild called for unrelated child."),new Xe(E(this.path),this.affectedTree,this.revert)}}/**
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
 */class ee{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=B.OVERWRITE}operationForChild(e){return g(this.path)?new ee(this.source,C(),this.snap.getImmediateChild(e)):new ee(this.source,E(this.path),this.snap)}}/**
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
 */class Oe{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=B.MERGE}operationForChild(e){if(g(this.path)){const t=this.children.subtree(new T(e));return t.isEmpty()?null:t.value?new ee(this.source,C(),t.value):new Oe(this.source,C(),t)}else return f(m(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new Oe(this.source,E(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
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
 */class zt{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(g(e))return this.isFullyInitialized()&&!this.filtered_;const t=m(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}function Ho(n,e,t,s){const i=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(xo(o.childName,o.snapshotNode))}),Te(n,i,"child_removed",e,s,t),Te(n,i,"child_added",e,s,t),Te(n,i,"child_moved",r,s,t),Te(n,i,"child_changed",e,s,t),Te(n,i,"value",e,s,t),i}function Te(n,e,t,s,i,r){const o=s.filter(a=>a.type===t);o.sort((a,l)=>Vo(n,a,l)),o.forEach(a=>{const l=Bo(n,a,r);i.forEach(c=>{c.respondsTo(a.type)&&e.push(c.createEvent(l,n.query_))})})}function Bo(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function Vo(n,e,t){if(e.childName==null||t.childName==null)throw Me("Should only compare child_ events.");const s=new y(e.childName,e.snapshotNode),i=new y(t.childName,t.snapshotNode);return n.index_.compare(s,i)}/**
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
 */function Xs(n,e){return{eventCache:n,serverCache:e}}function Re(n,e,t,s){return Xs(new zt(e,t,s),n.serverCache)}function Js(n,e,t,s){return Xs(n.eventCache,new zt(e,t,s))}function At(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function te(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
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
 */let yt;const Ko=()=>(yt||(yt=new O(kr)),yt);class I{static fromObject(e){let t=new I(null);return W(e,(s,i)=>{t=t.set(new T(s),i)}),t}constructor(e,t=Ko()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:C(),value:this.value};if(g(e))return null;{const s=m(e),i=this.children.get(s);if(i!==null){const r=i.findRootMostMatchingPathAndValue(E(e),t);return r!=null?{path:R(new T(s),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(g(e))return this;{const t=m(e),s=this.children.get(t);return s!==null?s.subtree(E(e)):new I(null)}}set(e,t){if(g(e))return new I(t,this.children);{const s=m(e),r=(this.children.get(s)||new I(null)).set(E(e),t),o=this.children.insert(s,r);return new I(this.value,o)}}remove(e){if(g(e))return this.children.isEmpty()?new I(null):new I(null,this.children);{const t=m(e),s=this.children.get(t);if(s){const i=s.remove(E(e));let r;return i.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,i),this.value===null&&r.isEmpty()?new I(null):new I(this.value,r)}else return this}}get(e){if(g(e))return this.value;{const t=m(e),s=this.children.get(t);return s?s.get(E(e)):null}}setTree(e,t){if(g(e))return t;{const s=m(e),r=(this.children.get(s)||new I(null)).setTree(E(e),t);let o;return r.isEmpty()?o=this.children.remove(s):o=this.children.insert(s,r),new I(this.value,o)}}fold(e){return this.fold_(C(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((i,r)=>{s[i]=r.fold_(R(e,i),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,C(),t)}findOnPath_(e,t,s){const i=this.value?s(t,this.value):!1;if(i)return i;if(g(e))return null;{const r=m(e),o=this.children.get(r);return o?o.findOnPath_(E(e),R(t,r),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,C(),t)}foreachOnPath_(e,t,s){if(g(e))return this;{this.value&&s(t,this.value);const i=m(e),r=this.children.get(i);return r?r.foreachOnPath_(E(e),R(t,i),s):new I(null)}}foreach(e){this.foreach_(C(),e)}foreach_(e,t){this.children.inorderTraversal((s,i)=>{i.foreach_(R(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
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
 */class H{constructor(e){this.writeTree_=e}static empty(){return new H(new I(null))}}function Ne(n,e,t){if(g(e))return new H(new I(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const i=s.path;let r=s.value;const o=U(i,e);return r=r.updateChild(o,t),new H(n.writeTree_.set(i,r))}else{const i=new I(t),r=n.writeTree_.setTree(e,i);return new H(r)}}}function Fn(n,e,t){let s=n;return W(t,(i,r)=>{s=Ne(s,R(e,i),r)}),s}function Un(n,e){if(g(e))return H.empty();{const t=n.writeTree_.setTree(e,new I(null));return new H(t)}}function kt(n,e){return ie(n,e)!=null}function ie(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(U(t.path,e)):null}function Wn(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(P,(s,i)=>{e.push(new y(s,i))}):n.writeTree_.children.inorderTraversal((s,i)=>{i.value!=null&&e.push(new y(s,i.value))}),e}function Y(n,e){if(g(e))return n;{const t=ie(n,e);return t!=null?new H(new I(t)):new H(n.writeTree_.subtree(e))}}function Pt(n){return n.writeTree_.isEmpty()}function ge(n,e){return Zs(C(),n.writeTree_,e)}function Zs(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((i,r)=>{i===".priority"?(f(r.value!==null,"Priority writes must always be leaf nodes"),s=r.value):t=Zs(R(n,i),r,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(R(n,".priority"),s)),t}}/**
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
 */function ei(n,e){return ri(e,n)}function zo(n,e,t,s,i){f(s>n.lastWriteId,"Stacking an older write on top of newer ones"),i===void 0&&(i=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:i}),i&&(n.visibleWrites=Ne(n.visibleWrites,e,t)),n.lastWriteId=s}function $o(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function Yo(n,e){const t=n.allWrites.findIndex(a=>a.writeId===e);f(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let i=s.visible,r=!1,o=n.allWrites.length-1;for(;i&&o>=0;){const a=n.allWrites[o];a.visible&&(o>=t&&jo(a,s.path)?i=!1:q(s.path,a.path)&&(r=!0)),o--}if(i){if(r)return Qo(n),!0;if(s.snap)n.visibleWrites=Un(n.visibleWrites,s.path);else{const a=s.children;W(a,l=>{n.visibleWrites=Un(n.visibleWrites,R(s.path,l))})}return!0}else return!1}function jo(n,e){if(n.snap)return q(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&q(R(n.path,t),e))return!0;return!1}function Qo(n){n.visibleWrites=ti(n.allWrites,Xo,C()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function Xo(n){return n.visible}function ti(n,e,t){let s=H.empty();for(let i=0;i<n.length;++i){const r=n[i];if(e(r)){const o=r.path;let a;if(r.snap)q(t,o)?(a=U(t,o),s=Ne(s,a,r.snap)):q(o,t)&&(a=U(o,t),s=Ne(s,C(),r.snap.getChild(a)));else if(r.children){if(q(t,o))a=U(t,o),s=Fn(s,a,r.children);else if(q(o,t))if(a=U(o,t),g(a))s=Fn(s,C(),r.children);else{const l=pe(r.children,m(a));if(l){const c=l.getChild(E(a));s=Ne(s,C(),c)}}}else throw Me("WriteRecord should have .snap or .children")}}return s}function ni(n,e,t,s,i){if(!s&&!i){const r=ie(n.visibleWrites,e);if(r!=null)return r;{const o=Y(n.visibleWrites,e);if(Pt(o))return t;if(t==null&&!kt(o,C()))return null;{const a=t||v.EMPTY_NODE;return ge(o,a)}}}else{const r=Y(n.visibleWrites,e);if(!i&&Pt(r))return t;if(!i&&t==null&&!kt(r,C()))return null;{const o=function(c){return(c.visible||i)&&(!s||!~s.indexOf(c.writeId))&&(q(c.path,e)||q(e,c.path))},a=ti(n.allWrites,o,e),l=t||v.EMPTY_NODE;return ge(a,l)}}}function Jo(n,e,t){let s=v.EMPTY_NODE;const i=ie(n.visibleWrites,e);if(i)return i.isLeafNode()||i.forEachChild(P,(r,o)=>{s=s.updateImmediateChild(r,o)}),s;if(t){const r=Y(n.visibleWrites,e);return t.forEachChild(P,(o,a)=>{const l=ge(Y(r,new T(o)),a);s=s.updateImmediateChild(o,l)}),Wn(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}else{const r=Y(n.visibleWrites,e);return Wn(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}}function Zo(n,e,t,s,i){f(s||i,"Either existingEventSnap or existingServerSnap must exist");const r=R(e,t);if(kt(n.visibleWrites,r))return null;{const o=Y(n.visibleWrites,r);return Pt(o)?i.getChild(t):ge(o,i.getChild(t))}}function ea(n,e,t,s){const i=R(e,t),r=ie(n.visibleWrites,i);if(r!=null)return r;if(s.isCompleteForChild(t)){const o=Y(n.visibleWrites,i);return ge(o,s.getNode().getImmediateChild(t))}else return null}function ta(n,e){return ie(n.visibleWrites,e)}function na(n,e,t,s,i,r,o){let a;const l=Y(n.visibleWrites,e),c=ie(l,C());if(c!=null)a=c;else if(t!=null)a=ge(l,t);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){const u=[],h=o.getCompare(),d=r?a.getReverseIteratorFrom(s,o):a.getIteratorFrom(s,o);let p=d.getNext();for(;p&&u.length<i;)h(p,s)!==0&&u.push(p),p=d.getNext();return u}else return[]}function sa(){return{visibleWrites:H.empty(),allWrites:[],lastWriteId:-1}}function Ot(n,e,t,s){return ni(n.writeTree,n.treePath,e,t,s)}function si(n,e){return Jo(n.writeTree,n.treePath,e)}function Gn(n,e,t,s){return Zo(n.writeTree,n.treePath,e,t,s)}function Je(n,e){return ta(n.writeTree,R(n.treePath,e))}function ia(n,e,t,s,i,r){return na(n.writeTree,n.treePath,e,t,s,i,r)}function $t(n,e,t){return ea(n.writeTree,n.treePath,e,t)}function ii(n,e){return ri(R(n.treePath,e),n.writeTree)}function ri(n,e){return{treePath:n,writeTree:e}}/**
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
 */class ra{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;f(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),f(s!==".priority","Only non-priority child changes can be tracked.");const i=this.changeMap.get(s);if(i){const r=i.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(s,Mn(s,e.snapshotNode,i.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(s,Do(s,i.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(s,Mo(s,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(s,Mn(s,e.snapshotNode,i.oldSnap));else throw Me("Illegal combination of changes: "+e+" occurred after "+i)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
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
 */class oa{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const oi=new oa;class Yt{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new zt(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return $t(this.writes_,e,s)}}getChildAfterChild(e,t,s){const i=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:te(this.viewCache_),r=ia(this.writes_,i,t,1,s,e);return r.length===0?null:r[0]}}function aa(n,e){f(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),f(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function la(n,e,t,s,i){const r=new ra;let o,a;if(t.type===B.OVERWRITE){const c=t;c.source.fromUser?o=Mt(n,e,c.path,c.snap,s,i,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered()&&!g(c.path),o=Ze(n,e,c.path,c.snap,s,i,a,r))}else if(t.type===B.MERGE){const c=t;c.source.fromUser?o=ua(n,e,c.path,c.children,s,i,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered(),o=Dt(n,e,c.path,c.children,s,i,a,r))}else if(t.type===B.ACK_USER_WRITE){const c=t;c.revert?o=fa(n,e,c.path,s,i,r):o=ha(n,e,c.path,c.affectedTree,s,i,r)}else if(t.type===B.LISTEN_COMPLETE)o=da(n,e,t.path,s,r);else throw Me("Unknown operation type: "+t.type);const l=r.getChanges();return ca(e,o,l),{viewCache:o,changes:l}}function ca(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const i=s.getNode().isLeafNode()||s.getNode().isEmpty(),r=At(n);(t.length>0||!n.eventCache.isFullyInitialized()||i&&!s.getNode().equals(r)||!s.getNode().getPriority().equals(r.getPriority()))&&t.push(Oo(At(e)))}}function ai(n,e,t,s,i,r){const o=e.eventCache;if(Je(s,t)!=null)return e;{let a,l;if(g(t))if(f(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const c=te(e),u=c instanceof v?c:v.EMPTY_NODE,h=si(s,u);a=n.filter.updateFullNode(e.eventCache.getNode(),h,r)}else{const c=Ot(s,te(e));a=n.filter.updateFullNode(e.eventCache.getNode(),c,r)}else{const c=m(t);if(c===".priority"){f(j(t)===1,"Can't have a priority with additional path components");const u=o.getNode();l=e.serverCache.getNode();const h=Gn(s,t,u,l);h!=null?a=n.filter.updatePriority(u,h):a=o.getNode()}else{const u=E(t);let h;if(o.isCompleteForChild(c)){l=e.serverCache.getNode();const d=Gn(s,t,o.getNode(),l);d!=null?h=o.getNode().getImmediateChild(c).updateChild(u,d):h=o.getNode().getImmediateChild(c)}else h=$t(s,c,e.serverCache);h!=null?a=n.filter.updateChild(o.getNode(),c,h,u,i,r):a=o.getNode()}}return Re(e,a,o.isFullyInitialized()||g(t),n.filter.filtersNodes())}}function Ze(n,e,t,s,i,r,o,a){const l=e.serverCache;let c;const u=o?n.filter:n.filter.getIndexedFilter();if(g(t))c=u.updateFullNode(l.getNode(),s,null);else if(u.filtersNodes()&&!l.isFiltered()){const p=l.getNode().updateChild(t,s);c=u.updateFullNode(l.getNode(),p,null)}else{const p=m(t);if(!l.isCompleteForPath(t)&&j(t)>1)return e;const _=E(t),L=l.getNode().getImmediateChild(p).updateChild(_,s);p===".priority"?c=u.updatePriority(l.getNode(),L):c=u.updateChild(l.getNode(),p,L,_,oi,null)}const h=Js(e,c,l.isFullyInitialized()||g(t),u.filtersNodes()),d=new Yt(i,h,r);return ai(n,h,t,i,d,a)}function Mt(n,e,t,s,i,r,o){const a=e.eventCache;let l,c;const u=new Yt(i,e,r);if(g(t))c=n.filter.updateFullNode(e.eventCache.getNode(),s,o),l=Re(e,c,!0,n.filter.filtersNodes());else{const h=m(t);if(h===".priority")c=n.filter.updatePriority(e.eventCache.getNode(),s),l=Re(e,c,a.isFullyInitialized(),a.isFiltered());else{const d=E(t),p=a.getNode().getImmediateChild(h);let _;if(g(d))_=s;else{const b=u.getCompleteChild(h);b!=null?Fs(d)===".priority"&&b.getChild(Ws(d)).isEmpty()?_=b:_=b.updateChild(d,s):_=v.EMPTY_NODE}if(p.equals(_))l=e;else{const b=n.filter.updateChild(a.getNode(),h,_,d,u,o);l=Re(e,b,a.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function qn(n,e){return n.eventCache.isCompleteForChild(e)}function ua(n,e,t,s,i,r,o){let a=e;return s.foreach((l,c)=>{const u=R(t,l);qn(e,m(u))&&(a=Mt(n,a,u,c,i,r,o))}),s.foreach((l,c)=>{const u=R(t,l);qn(e,m(u))||(a=Mt(n,a,u,c,i,r,o))}),a}function Hn(n,e,t){return t.foreach((s,i)=>{e=e.updateChild(s,i)}),e}function Dt(n,e,t,s,i,r,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,c;g(t)?c=s:c=new I(null).setTree(t,s);const u=e.serverCache.getNode();return c.children.inorderTraversal((h,d)=>{if(u.hasChild(h)){const p=e.serverCache.getNode().getImmediateChild(h),_=Hn(n,p,d);l=Ze(n,l,new T(h),_,i,r,o,a)}}),c.children.inorderTraversal((h,d)=>{const p=!e.serverCache.isCompleteForChild(h)&&d.value===null;if(!u.hasChild(h)&&!p){const _=e.serverCache.getNode().getImmediateChild(h),b=Hn(n,_,d);l=Ze(n,l,new T(h),b,i,r,o,a)}}),l}function ha(n,e,t,s,i,r,o){if(Je(i,t)!=null)return e;const a=e.serverCache.isFiltered(),l=e.serverCache;if(s.value!=null){if(g(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return Ze(n,e,t,l.getNode().getChild(t),i,r,a,o);if(g(t)){let c=new I(null);return l.getNode().forEachChild(de,(u,h)=>{c=c.set(new T(u),h)}),Dt(n,e,t,c,i,r,a,o)}else return e}else{let c=new I(null);return s.foreach((u,h)=>{const d=R(t,u);l.isCompleteForPath(d)&&(c=c.set(u,l.getNode().getChild(d)))}),Dt(n,e,t,c,i,r,a,o)}}function da(n,e,t,s,i){const r=e.serverCache,o=Js(e,r.getNode(),r.isFullyInitialized()||g(t),r.isFiltered());return ai(n,o,t,s,oi,i)}function fa(n,e,t,s,i,r){let o;if(Je(s,t)!=null)return e;{const a=new Yt(s,e,i),l=e.eventCache.getNode();let c;if(g(t)||m(t)===".priority"){let u;if(e.serverCache.isFullyInitialized())u=Ot(s,te(e));else{const h=e.serverCache.getNode();f(h instanceof v,"serverChildren would be complete if leaf node"),u=si(s,h)}u=u,c=n.filter.updateFullNode(l,u,r)}else{const u=m(t);let h=$t(s,u,e.serverCache);h==null&&e.serverCache.isCompleteForChild(u)&&(h=l.getImmediateChild(u)),h!=null?c=n.filter.updateChild(l,u,h,E(t),a,r):e.eventCache.getNode().hasChild(u)?c=n.filter.updateChild(l,u,v.EMPTY_NODE,E(t),a,r):c=l,c.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Ot(s,te(e)),o.isLeafNode()&&(c=n.filter.updateFullNode(c,o,r)))}return o=e.serverCache.isFullyInitialized()||Je(s,C())!=null,Re(e,c,o,n.filter.filtersNodes())}}function pa(n,e){const t=te(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!g(e)&&!t.getImmediateChild(m(e)).isEmpty())?t.getChild(e):null}function Bn(n,e,t,s){e.type===B.MERGE&&e.source.queryId!==null&&(f(te(n.viewCache_),"We should always have a full cache before handling merges"),f(At(n.viewCache_),"Missing event cache, even though we have a server cache"));const i=n.viewCache_,r=la(n.processor_,i,e,t,s);return aa(n.processor_,r.viewCache),f(r.viewCache.serverCache.isFullyInitialized()||!i.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,_a(n,r.changes,r.viewCache.eventCache.getNode())}function _a(n,e,t,s){const i=n.eventRegistrations_;return Ho(n.eventGenerator_,e,t,i)}/**
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
 */let Vn;function ga(n){f(!Vn,"__referenceConstructor has already been defined"),Vn=n}function jt(n,e,t,s){const i=e.source.queryId;if(i!==null){const r=n.views.get(i);return f(r!=null,"SyncTree gave us an op for an invalid query."),Bn(r,e,t,s)}else{let r=[];for(const o of n.views.values())r=r.concat(Bn(o,e,t,s));return r}}function Qt(n,e){let t=null;for(const s of n.views.values())t=t||pa(s,e);return t}/**
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
 */let Kn;function ma(n){f(!Kn,"__referenceConstructor has already been defined"),Kn=n}class zn{constructor(e){this.listenProvider_=e,this.syncPointTree_=new I(null),this.pendingWriteTree_=sa(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function ya(n,e,t,s,i){return zo(n.pendingWriteTree_,e,t,s,i),i?ot(n,new ee(Ys(),e,t)):[]}function ue(n,e,t=!1){const s=$o(n.pendingWriteTree_,e);if(Yo(n.pendingWriteTree_,e)){let r=new I(null);return s.snap!=null?r=r.set(C(),!0):W(s.children,o=>{r=r.set(new T(o),!0)}),ot(n,new Xe(s.path,r,t))}else return[]}function rt(n,e,t){return ot(n,new ee(js(),e,t))}function va(n,e,t){const s=I.fromObject(t);return ot(n,new Oe(js(),e,s))}function Ca(n,e,t,s){const i=hi(n,s);if(i!=null){const r=di(i),o=r.path,a=r.queryId,l=U(o,e),c=new ee(Qs(a),l,t);return fi(n,o,c)}else return[]}function Ia(n,e,t,s){const i=hi(n,s);if(i){const r=di(i),o=r.path,a=r.queryId,l=U(o,e),c=I.fromObject(t),u=new Oe(Qs(a),l,c);return fi(n,o,u)}else return[]}function li(n,e,t){const i=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,a)=>{const l=U(o,e),c=Qt(a,l);if(c)return c});return ni(i,e,r,t,!0)}function ot(n,e){return ci(e,n.syncPointTree_,null,ei(n.pendingWriteTree_,C()))}function ci(n,e,t,s){if(g(n.path))return ui(n,e,t,s);{const i=e.get(C());t==null&&i!=null&&(t=Qt(i,C()));let r=[];const o=m(n.path),a=n.operationForChild(o),l=e.children.get(o);if(l&&a){const c=t?t.getImmediateChild(o):null,u=ii(s,o);r=r.concat(ci(a,l,c,u))}return i&&(r=r.concat(jt(i,n,s,t))),r}}function ui(n,e,t,s){const i=e.get(C());t==null&&i!=null&&(t=Qt(i,C()));let r=[];return e.children.inorderTraversal((o,a)=>{const l=t?t.getImmediateChild(o):null,c=ii(s,o),u=n.operationForChild(o);u&&(r=r.concat(ui(u,a,l,c)))}),i&&(r=r.concat(jt(i,n,s,t))),r}function hi(n,e){return n.tagToQueryMap.get(e)}function di(n){const e=n.indexOf("$");return f(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new T(n.substr(0,e))}}function fi(n,e,t){const s=n.syncPointTree_.get(e);f(s,"Missing sync point for query tag that we're tracking");const i=ei(n.pendingWriteTree_,e);return jt(s,t,i,null)}/**
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
 */class Xt{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new Xt(t)}node(){return this.node_}}class Jt{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=R(this.path_,e);return new Jt(this.syncTree_,t)}node(){return li(this.syncTree_,this.path_)}}const Ea=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},$n=function(n,e,t){if(!n||typeof n!="object")return n;if(f(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return Ta(n[".sv"],e,t);if(typeof n[".sv"]=="object")return wa(n[".sv"],e);f(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},Ta=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:f(!1,"Unexpected server value: "+n)}},wa=function(n,e,t){n.hasOwnProperty("increment")||f(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&f(!1,"Unexpected increment value: "+s);const i=e.node();if(f(i!==null&&typeof i<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!i.isLeafNode())return s;const o=i.getValue();return typeof o!="number"?s:o+s},Sa=function(n,e,t,s){return Zt(e,new Jt(t,n),s)},Ra=function(n,e,t){return Zt(n,new Xt(e),t)};function Zt(n,e,t){const s=n.getPriority().val(),i=$n(s,e.getImmediateChild(".priority"),t);let r;if(n.isLeafNode()){const o=n,a=$n(o.getValue(),e,t);return a!==o.getValue()||i!==o.getPriority().val()?new w(a,k(i)):n}else{const o=n;return r=o,i!==o.getPriority().val()&&(r=r.updatePriority(new w(i))),o.forEachChild(P,(a,l)=>{const c=Zt(l,e.getImmediateChild(a),t);c!==l&&(r=r.updateImmediateChild(a,c))}),r}}/**
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
 */class en{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function tn(n,e){let t=e instanceof T?e:new T(e),s=n,i=m(t);for(;i!==null;){const r=pe(s.node.children,i)||{children:{},childCount:0};s=new en(i,s,r),t=E(t),i=m(t)}return s}function ye(n){return n.node.value}function pi(n,e){n.node.value=e,xt(n)}function _i(n){return n.node.childCount>0}function Na(n){return ye(n)===void 0&&!_i(n)}function at(n,e){W(n.node.children,(t,s)=>{e(new en(t,n,s))})}function gi(n,e,t,s){t&&e(n),at(n,i=>{gi(i,e,!0)})}function ba(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function We(n){return new T(n.parent===null?n.name:We(n.parent)+"/"+n.name)}function xt(n){n.parent!==null&&Aa(n.parent,n.name,n)}function Aa(n,e,t){const s=Na(t),i=$(n.node.children,e);s&&i?(delete n.node.children[e],n.node.childCount--,xt(n)):!s&&!i&&(n.node.children[e]=t.node,n.node.childCount++,xt(n))}/**
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
 */const ka=/[\[\].#$\/\u0000-\u001F\u007F]/,Pa=/[\[\].#$\u0000-\u001F\u007F]/,vt=10*1024*1024,mi=function(n){return typeof n=="string"&&n.length!==0&&!ka.test(n)},Oa=function(n){return typeof n=="string"&&n.length!==0&&!Pa.test(n)},Ma=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Oa(n)},yi=function(n,e,t){const s=t instanceof T?new ho(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Q(s));if(typeof e=="function")throw new Error(n+"contains a function "+Q(s)+" with contents = "+e.toString());if(gs(e))throw new Error(n+"contains "+e.toString()+" "+Q(s));if(typeof e=="string"&&e.length>vt/3&&st(e)>vt)throw new Error(n+"contains a string greater than "+vt+" utf8 bytes "+Q(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let i=!1,r=!1;if(W(e,(o,a)=>{if(o===".value")i=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!mi(o)))throw new Error(n+" contains an invalid key ("+o+") "+Q(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);fo(s,o),yi(n,a,s),po(s)}),i&&r)throw new Error(n+' contains ".value" child '+Q(s)+" in addition to actual children.")}},Da=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!mi(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!Ma(t))throw new Error(Xi(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
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
 */class xa{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function La(n,e){let t=null;for(let s=0;s<e.length;s++){const i=e[s],r=i.getPath();t!==null&&!Gs(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(i)}t&&n.eventLists_.push(t)}function re(n,e,t){La(n,t),Fa(n,s=>q(s,e)||q(e,s))}function Fa(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const i=n.eventLists_[s];if(i){const r=i.path;e(r)?(Ua(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function Ua(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();we&&A("event: "+t.toString()),Fe(s)}}}/**
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
 */const Wa="repo_interrupt",Ga=25;class qa{constructor(e,t,s,i){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=i,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new xa,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Qe(),this.transactionQueueTree_=new en,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Ha(n,e,t){if(n.stats_=qt(n.repoInfo_),n.forceRestClient_||Lr())n.server_=new je(n.repoInfo_,(s,i,r,o)=>{Yn(n,s,i,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>jn(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{N(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new K(n.repoInfo_,e,(s,i,r,o)=>{Yn(n,s,i,r,o)},s=>{jn(n,s)},s=>{Va(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=qr(n.repoInfo_,()=>new qo(n.stats_,n.server_)),n.infoData_=new Lo,n.infoSyncTree_=new zn({startListening:(s,i,r,o)=>{let a=[];const l=n.infoData_.getNode(s._path);return l.isEmpty()||(a=rt(n.infoSyncTree_,s._path,l),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),nn(n,"connected",!1),n.serverSyncTree_=new zn({startListening:(s,i,r,o)=>(n.server_.listen(s,r,i,(a,l)=>{const c=o(a,l);re(n.eventQueue_,s._path,c)}),[]),stopListening:(s,i)=>{n.server_.unlisten(s,i)}})}function Ba(n){const t=n.infoData_.getNode(new T(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function vi(n){return Ea({timestamp:Ba(n)})}function Yn(n,e,t,s,i){n.dataUpdateCount++;const r=new T(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(i)if(s){const l=Ke(t,c=>k(c));o=Ia(n.serverSyncTree_,r,l,i)}else{const l=k(t);o=Ca(n.serverSyncTree_,r,l,i)}else if(s){const l=Ke(t,c=>k(c));o=va(n.serverSyncTree_,r,l)}else{const l=k(t);o=rt(n.serverSyncTree_,r,l)}let a=r;o.length>0&&(a=rn(n,r)),re(n.eventQueue_,a,o)}function jn(n,e){nn(n,"connected",e),e===!1&&za(n)}function Va(n,e){W(e,(t,s)=>{nn(n,t,s)})}function nn(n,e,t){const s=new T("/.info/"+e),i=k(t);n.infoData_.updateSnapshot(s,i);const r=rt(n.infoSyncTree_,s,i);re(n.eventQueue_,s,r)}function Ka(n){return n.nextWriteId_++}function za(n){Ci(n,"onDisconnectEvents");const e=vi(n),t=Qe();bt(n.onDisconnect_,C(),(i,r)=>{const o=Sa(i,r,n.serverSyncTree_,e);$s(t,i,o)});let s=[];bt(t,C(),(i,r)=>{s=s.concat(rt(n.serverSyncTree_,i,r));const o=Qa(n,i);rn(n,o)}),n.onDisconnect_=Qe(),re(n.eventQueue_,C(),s)}function $a(n){n.persistentConnection_&&n.persistentConnection_.interrupt(Wa)}function Ci(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),A(t,...e)}function Ii(n,e,t){return li(n.serverSyncTree_,e,t)||v.EMPTY_NODE}function sn(n,e=n.transactionQueueTree_){if(e||lt(n,e),ye(e)){const t=Ti(n,e);f(t.length>0,"Sending zero length transaction queue"),t.every(i=>i.status===0)&&Ya(n,We(e),t)}else _i(e)&&at(e,t=>{sn(n,t)})}function Ya(n,e,t){const s=t.map(c=>c.currentWriteId),i=Ii(n,e,s);let r=i;const o=i.hash();for(let c=0;c<t.length;c++){const u=t[c];f(u.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),u.status=1,u.retryCount++;const h=U(e,u.path);r=r.updateChild(h,u.currentOutputSnapshotRaw)}const a=r.val(!0),l=e;n.server_.put(l.toString(),a,c=>{Ci(n,"transaction put response",{path:l.toString(),status:c});let u=[];if(c==="ok"){const h=[];for(let d=0;d<t.length;d++)t[d].status=2,u=u.concat(ue(n.serverSyncTree_,t[d].currentWriteId)),t[d].onComplete&&h.push(()=>t[d].onComplete(null,!0,t[d].currentOutputSnapshotResolved)),t[d].unwatcher();lt(n,tn(n.transactionQueueTree_,e)),sn(n,n.transactionQueueTree_),re(n.eventQueue_,e,u);for(let d=0;d<h.length;d++)Fe(h[d])}else{if(c==="datastale")for(let h=0;h<t.length;h++)t[h].status===3?t[h].status=4:t[h].status=0;else{D("transaction at "+l.toString()+" failed: "+c);for(let h=0;h<t.length;h++)t[h].status=4,t[h].abortReason=c}rn(n,e)}},o)}function rn(n,e){const t=Ei(n,e),s=We(t),i=Ti(n,t);return ja(n,i,s),s}function ja(n,e,t){if(e.length===0)return;const s=[];let i=[];const o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const l=e[a],c=U(t,l.path);let u=!1,h;if(f(c!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)u=!0,h=l.abortReason,i=i.concat(ue(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=Ga)u=!0,h="maxretry",i=i.concat(ue(n.serverSyncTree_,l.currentWriteId,!0));else{const d=Ii(n,l.path,o);l.currentInputSnapshot=d;const p=e[a].update(d.val());if(p!==void 0){yi("transaction failed: Data returned ",p,l.path);let _=k(p);typeof p=="object"&&p!=null&&$(p,".priority")||(_=_.updatePriority(d.getPriority()));const L=l.currentWriteId,dt=vi(n),Ge=Ra(_,d,dt);l.currentOutputSnapshotRaw=_,l.currentOutputSnapshotResolved=Ge,l.currentWriteId=Ka(n),o.splice(o.indexOf(L),1),i=i.concat(ya(n.serverSyncTree_,l.path,Ge,l.currentWriteId,l.applyLocally)),i=i.concat(ue(n.serverSyncTree_,L,!0))}else u=!0,h="nodata",i=i.concat(ue(n.serverSyncTree_,l.currentWriteId,!0))}re(n.eventQueue_,t,i),i=[],u&&(e[a].status=2,(function(d){setTimeout(d,Math.floor(0))})(e[a].unwatcher),e[a].onComplete&&(h==="nodata"?s.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):s.push(()=>e[a].onComplete(new Error(h),!1,null))))}lt(n,n.transactionQueueTree_);for(let a=0;a<s.length;a++)Fe(s[a]);sn(n,n.transactionQueueTree_)}function Ei(n,e){let t,s=n.transactionQueueTree_;for(t=m(e);t!==null&&ye(s)===void 0;)s=tn(s,t),e=E(e),t=m(e);return s}function Ti(n,e){const t=[];return wi(n,e,t),t.sort((s,i)=>s.order-i.order),t}function wi(n,e,t){const s=ye(e);if(s)for(let i=0;i<s.length;i++)t.push(s[i]);at(e,i=>{wi(n,i,t)})}function lt(n,e){const t=ye(e);if(t){let s=0;for(let i=0;i<t.length;i++)t[i].status!==2&&(t[s]=t[i],s++);t.length=s,pi(e,t.length>0?t:void 0)}at(e,s=>{lt(n,s)})}function Qa(n,e){const t=We(Ei(n,e)),s=tn(n.transactionQueueTree_,e);return ba(s,i=>{Ct(n,i)}),Ct(n,s),gi(s,i=>{Ct(n,i)}),t}function Ct(n,e){const t=ye(e);if(t){const s=[];let i=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(f(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(f(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),i=i.concat(ue(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&s.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?pi(e,void 0):t.length=r+1,re(n.eventQueue_,We(e),i);for(let o=0;o<s.length;o++)Fe(s[o])}}/**
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
 */function Xa(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let i=t[s];try{i=decodeURIComponent(i.replace(/\+/g," "))}catch{}e+="/"+i}return e}function Ja(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):D(`Invalid query segment '${t}' in query '${n}'`)}return e}const Qn=function(n,e){const t=Za(n),s=t.namespace;t.domain==="firebase.com"&&z(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&z("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||br();const i=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new bs(t.host,t.secure,s,i,e,"",s!==t.subdomain),path:new T(t.pathString)}},Za=function(n){let e="",t="",s="",i="",r="",o=!0,a="https",l=443;if(typeof n=="string"){let c=n.indexOf("//");c>=0&&(a=n.substring(0,c-1),n=n.substring(c+2));let u=n.indexOf("/");u===-1&&(u=n.length);let h=n.indexOf("?");h===-1&&(h=n.length),e=n.substring(0,Math.min(u,h)),u<h&&(i=Xa(n.substring(u,h)));const d=Ja(n.substring(Math.min(n.length,h)));c=e.indexOf(":"),c>=0?(o=a==="https"||a==="wss",l=parseInt(e.substring(c+1),10)):c=e.length;const p=e.slice(0,c);if(p.toLowerCase()==="localhost")t="localhost";else if(p.split(".").length<=2)t=p;else{const _=e.indexOf(".");s=e.substring(0,_).toLowerCase(),t=e.substring(_+1),r=s}"ns"in d&&(r=d.ns)}return{host:e,port:l,domain:t,subdomain:s,secure:o,scheme:a,pathString:i,namespace:r}};/**
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
 */class on{constructor(e,t,s,i){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=i}get key(){return g(this._path)?null:Fs(this._path)}get ref(){return new ve(this._repo,this._path)}get _queryIdentifier(){const e=xn(this._queryParams),t=Wt(e);return t==="{}"?"default":t}get _queryObject(){return xn(this._queryParams)}isEqual(e){if(e=nt(e),!(e instanceof on))return!1;const t=this._repo===e._repo,s=Gs(this._path,e._path),i=this._queryIdentifier===e._queryIdentifier;return t&&s&&i}toJSON(){return this.toString()}toString(){return this._repo.toString()+uo(this._path)}}class ve extends on{constructor(e,t){super(e,t,new Kt,!1)}get parent(){const e=Ws(this._path);return e===null?null:new ve(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}ga(ve);ma(ve);/**
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
 */const el="FIREBASE_DATABASE_EMULATOR_HOST",Lt={};let tl=!1;function nl(n,e,t,s){const i=e.lastIndexOf(":"),r=e.substring(0,i),o=us(r);n.repoInfo_=new bs(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),s&&(n.authTokenProvider_=s)}function sl(n,e,t,s,i){let r=s||n.options.databaseURL;r===void 0&&(n.options.projectId||z("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),A("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=Qn(r,i),a=o.repoInfo,l;typeof process<"u"&&gn&&(l=gn[el]),l?(r=`http://${l}?ns=${a.namespace}`,o=Qn(r,i),a=o.repoInfo):o.repoInfo.secure;const c=new Ur(n.name,n.options,e);Da("Invalid Firebase Database URL",o),g(o.path)||z("Database URL must point to the root of a Firebase Database (not including a child path).");const u=rl(a,n,c,new Fr(n,t));return new ol(u,n)}function il(n,e){const t=Lt[e];(!t||t[n.key]!==n)&&z(`Database ${e}(${n.repoInfo_}) has already been deleted.`),$a(n),delete t[n.key]}function rl(n,e,t,s){let i=Lt[e.name];i||(i={},Lt[e.name]=i);let r=i[n.toURLString()];return r&&z("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new qa(n,tl,t,s),i[n.toURLString()]=r,r}class ol{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Ha(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new ve(this._repo,C())),this._rootInternal}_delete(){return this._rootInternal!==null&&(il(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&z("Cannot call "+e+" on a deleted database.")}}function al(n=ls(),e){const t=De(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=ar("database");s&&ll(t,...s)}return t}function ll(n,e,t,s={}){n=nt(n),n._checkNotDeleted("useEmulator");const i=`${e}:${t}`,r=n._repoInternal;if(n._instanceStarted){if(i===n._repoInternal.repoInfo_.host&&cs(s,r.repoInfo_.emulatorOptions))return;z("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(r.repoInfo_.nodeAdmin)s.mockUserToken&&z('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new Ve(Ve.OWNER);else if(s.mockUserToken){const a=typeof s.mockUserToken=="string"?s.mockUserToken:lr(s.mockUserToken,n.app.options.projectId);o=new Ve(a)}us(e)&&(cr(e),ur("Database",!0)),nl(r,i,s,o)}/**
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
 */function cl(n){Er(hr),Ae(new ke("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return sl(s,i,r,t)},"PUBLIC").setMultipleInstances(!0)),fe(mn,yn,n),fe(mn,yn,"esm2020")}K.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};K.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};cl();const Si="@firebase/installations",an="0.6.19";/**
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
 */const Ri=1e4,Ni=`w:${an}`,bi="FIS_v2",ul="https://firebaseinstallations.googleapis.com/v1",hl=3600*1e3,dl="installations",fl="Installations";/**
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
 */const pl={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},ne=new hs(dl,fl,pl);function Ai(n){return n instanceof ds&&n.code.includes("request-failed")}/**
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
 */function ki({projectId:n}){return`${ul}/projects/${n}/installations`}function Pi(n){return{token:n.token,requestStatus:2,expiresIn:gl(n.expiresIn),creationTime:Date.now()}}async function Oi(n,e){const s=(await e.json()).error;return ne.create("request-failed",{requestName:n,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function Mi({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function _l(n,{refreshToken:e}){const t=Mi(n);return t.append("Authorization",ml(e)),t}async function Di(n){const e=await n();return e.status>=500&&e.status<600?n():e}function gl(n){return Number(n.replace("s","000"))}function ml(n){return`${bi} ${n}`}/**
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
 */async function yl({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const s=ki(n),i=Mi(n),r=e.getImmediate({optional:!0});if(r){const c=await r.getHeartbeatsHeader();c&&i.append("x-firebase-client",c)}const o={fid:t,authVersion:bi,appId:n.appId,sdkVersion:Ni},a={method:"POST",headers:i,body:JSON.stringify(o)},l=await Di(()=>fetch(s,a));if(l.ok){const c=await l.json();return{fid:c.fid||t,registrationStatus:2,refreshToken:c.refreshToken,authToken:Pi(c.authToken)}}else throw await Oi("Create Installation",l)}/**
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
 */function xi(n){return new Promise(e=>{setTimeout(e,n)})}/**
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
 */function vl(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const Cl=/^[cdef][\w-]{21}$/,Ft="";function Il(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=El(n);return Cl.test(t)?t:Ft}catch{return Ft}}function El(n){return vl(n).substr(0,22)}/**
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
 */function ct(n){return`${n.appName}!${n.appId}`}/**
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
 */const Li=new Map;function Fi(n,e){const t=ct(n);Ui(t,e),Tl(t,e)}function Ui(n,e){const t=Li.get(n);if(t)for(const s of t)s(e)}function Tl(n,e){const t=wl();t&&t.postMessage({key:n,fid:e}),Sl()}let J=null;function wl(){return!J&&"BroadcastChannel"in self&&(J=new BroadcastChannel("[Firebase] FID Change"),J.onmessage=n=>{Ui(n.data.key,n.data.fid)}),J}function Sl(){Li.size===0&&J&&(J.close(),J=null)}/**
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
 */const Rl="firebase-installations-database",Nl=1,se="firebase-installations-store";let It=null;function ln(){return It||(It=dr(Rl,Nl,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(se)}}})),It}async function et(n,e){const t=ct(n),i=(await ln()).transaction(se,"readwrite"),r=i.objectStore(se),o=await r.get(t);return await r.put(e,t),await i.done,(!o||o.fid!==e.fid)&&Fi(n,e.fid),e}async function Wi(n){const e=ct(n),s=(await ln()).transaction(se,"readwrite");await s.objectStore(se).delete(e),await s.done}async function ut(n,e){const t=ct(n),i=(await ln()).transaction(se,"readwrite"),r=i.objectStore(se),o=await r.get(t),a=e(o);return a===void 0?await r.delete(t):await r.put(a,t),await i.done,a&&(!o||o.fid!==a.fid)&&Fi(n,a.fid),a}/**
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
 */async function cn(n){let e;const t=await ut(n.appConfig,s=>{const i=bl(s),r=Al(n,i);return e=r.registrationPromise,r.installationEntry});return t.fid===Ft?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function bl(n){const e=n||{fid:Il(),registrationStatus:0};return Gi(e)}function Al(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(ne.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},s=kl(n,t);return{installationEntry:t,registrationPromise:s}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Pl(n)}:{installationEntry:e}}async function kl(n,e){try{const t=await yl(n,e);return et(n.appConfig,t)}catch(t){throw Ai(t)&&t.customData.serverCode===409?await Wi(n.appConfig):await et(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function Pl(n){let e=await Xn(n.appConfig);for(;e.registrationStatus===1;)await xi(100),e=await Xn(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:s}=await cn(n);return s||t}return e}function Xn(n){return ut(n,e=>{if(!e)throw ne.create("installation-not-found");return Gi(e)})}function Gi(n){return Ol(n)?{fid:n.fid,registrationStatus:0}:n}function Ol(n){return n.registrationStatus===1&&n.registrationTime+Ri<Date.now()}/**
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
 */async function Ml({appConfig:n,heartbeatServiceProvider:e},t){const s=Dl(n,t),i=_l(n,t),r=e.getImmediate({optional:!0});if(r){const c=await r.getHeartbeatsHeader();c&&i.append("x-firebase-client",c)}const o={installation:{sdkVersion:Ni,appId:n.appId}},a={method:"POST",headers:i,body:JSON.stringify(o)},l=await Di(()=>fetch(s,a));if(l.ok){const c=await l.json();return Pi(c)}else throw await Oi("Generate Auth Token",l)}function Dl(n,{fid:e}){return`${ki(n)}/${e}/authTokens:generate`}/**
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
 */async function un(n,e=!1){let t;const s=await ut(n.appConfig,r=>{if(!qi(r))throw ne.create("not-registered");const o=r.authToken;if(!e&&Fl(o))return r;if(o.requestStatus===1)return t=xl(n,e),r;{if(!navigator.onLine)throw ne.create("app-offline");const a=Wl(r);return t=Ll(n,a),a}});return t?await t:s.authToken}async function xl(n,e){let t=await Jn(n.appConfig);for(;t.authToken.requestStatus===1;)await xi(100),t=await Jn(n.appConfig);const s=t.authToken;return s.requestStatus===0?un(n,e):s}function Jn(n){return ut(n,e=>{if(!qi(e))throw ne.create("not-registered");const t=e.authToken;return Gl(t)?{...e,authToken:{requestStatus:0}}:e})}async function Ll(n,e){try{const t=await Ml(n,e),s={...e,authToken:t};return await et(n.appConfig,s),t}catch(t){if(Ai(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Wi(n.appConfig);else{const s={...e,authToken:{requestStatus:0}};await et(n.appConfig,s)}throw t}}function qi(n){return n!==void 0&&n.registrationStatus===2}function Fl(n){return n.requestStatus===2&&!Ul(n)}function Ul(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+hl}function Wl(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function Gl(n){return n.requestStatus===1&&n.requestTime+Ri<Date.now()}/**
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
 */async function ql(n){const e=n,{installationEntry:t,registrationPromise:s}=await cn(e);return s?s.catch(console.error):un(e).catch(console.error),t.fid}/**
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
 */async function Hl(n,e=!1){const t=n;return await Bl(t),(await un(t,e)).token}async function Bl(n){const{registrationPromise:e}=await cn(n);e&&await e}/**
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
 */function Vl(n){if(!n||!n.options)throw Et("App Configuration");if(!n.name)throw Et("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw Et(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Et(n){return ne.create("missing-app-config-values",{valueName:n})}/**
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
 */const Hi="installations",Kl="installations-internal",zl=n=>{const e=n.getProvider("app").getImmediate(),t=Vl(e),s=De(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},$l=n=>{const e=n.getProvider("app").getImmediate(),t=De(e,Hi).getImmediate();return{getId:()=>ql(t),getToken:i=>Hl(t,i)}};function Yl(){Ae(new ke(Hi,zl,"PUBLIC")),Ae(new ke(Kl,$l,"PRIVATE"))}Yl();fe(Si,an);fe(Si,an,"esm2020");/**
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
 */const tt="analytics",jl="firebase_id",Ql="origin",Xl=60*1e3,Jl="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",hn="https://www.googletagmanager.com/gtag/js";/**
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
 */const M=new rs("@firebase/analytics");/**
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
 */const Zl={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},x=new hs("analytics","Analytics",Zl);/**
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
 */function ec(n){if(!n.startsWith(hn)){const e=x.create("invalid-gtag-resource",{gtagURL:n});return M.warn(e.message),""}return n}function Bi(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function tc(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function nc(n,e){const t=tc("firebase-js-sdk-policy",{createScriptURL:ec}),s=document.createElement("script"),i=`${hn}?l=${n}&id=${e}`;s.src=t?t?.createScriptURL(i):i,s.async=!0,document.head.appendChild(s)}function sc(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function ic(n,e,t,s,i,r){const o=s[i];try{if(o)await e[o];else{const l=(await Bi(t)).find(c=>c.measurementId===i);l&&await e[l.appId]}}catch(a){M.error(a)}n("config",i,r)}async function rc(n,e,t,s,i){try{let r=[];if(i&&i.send_to){let o=i.send_to;Array.isArray(o)||(o=[o]);const a=await Bi(t);for(const l of o){const c=a.find(h=>h.measurementId===l),u=c&&e[c.appId];if(u)r.push(u);else{r=[];break}}}r.length===0&&(r=Object.values(e)),await Promise.all(r),n("event",s,i||{})}catch(r){M.error(r)}}function oc(n,e,t,s){async function i(r,...o){try{if(r==="event"){const[a,l]=o;await rc(n,e,t,a,l)}else if(r==="config"){const[a,l]=o;await ic(n,e,t,s,a,l)}else if(r==="consent"){const[a,l]=o;n("consent",a,l)}else if(r==="get"){const[a,l,c]=o;n("get",a,l,c)}else if(r==="set"){const[a]=o;n("set",a)}else n(r,...o)}catch(a){M.error(a)}}return i}function ac(n,e,t,s,i){let r=function(...o){window[s].push(arguments)};return window[i]&&typeof window[i]=="function"&&(r=window[i]),window[i]=oc(r,n,e,t),{gtagCore:r,wrappedGtag:window[i]}}function lc(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(hn)&&t.src.includes(n))return t;return null}/**
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
 */const cc=30,uc=1e3;class hc{constructor(e={},t=uc){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Vi=new hc;function dc(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function fc(n){const{appId:e,apiKey:t}=n,s={method:"GET",headers:dc(t)},i=Jl.replace("{app-id}",e),r=await fetch(i,s);if(r.status!==200&&r.status!==304){let o="";try{const a=await r.json();a.error?.message&&(o=a.error.message)}catch{}throw x.create("config-fetch-failed",{httpStatus:r.status,responseMessage:o})}return r.json()}async function pc(n,e=Vi,t){const{appId:s,apiKey:i,measurementId:r}=n.options;if(!s)throw x.create("no-app-id");if(!i){if(r)return{measurementId:r,appId:s};throw x.create("no-api-key")}const o=e.getThrottleMetadata(s)||{backoffCount:0,throttleEndTimeMillis:Date.now()},a=new mc;return setTimeout(async()=>{a.abort()},Xl),Ki({appId:s,apiKey:i,measurementId:r},o,a,e)}async function Ki(n,{throttleEndTimeMillis:e,backoffCount:t},s,i=Vi){const{appId:r,measurementId:o}=n;try{await _c(s,e)}catch(a){if(o)return M.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${a?.message}]`),{appId:r,measurementId:o};throw a}try{const a=await fc(n);return i.deleteThrottleMetadata(r),a}catch(a){const l=a;if(!gc(l)){if(i.deleteThrottleMetadata(r),o)return M.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${l?.message}]`),{appId:r,measurementId:o};throw a}const c=Number(l?.customData?.httpStatus)===503?fn(t,i.intervalMillis,cc):fn(t,i.intervalMillis),u={throttleEndTimeMillis:Date.now()+c,backoffCount:t+1};return i.setThrottleMetadata(r,u),M.debug(`Calling attemptFetch again in ${c} millis`),Ki(n,u,s,i)}}function _c(n,e){return new Promise((t,s)=>{const i=Math.max(e-Date.now(),0),r=setTimeout(t,i);n.addEventListener(()=>{clearTimeout(r),s(x.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function gc(n){if(!(n instanceof ds)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class mc{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function yc(n,e,t,s,i){if(i&&i.global){n("event",t,s);return}else{const r=await e,o={...s,send_to:r};n("event",t,o)}}/**
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
 */async function vc(){if(pr())try{await _r()}catch(n){return M.warn(x.create("indexeddb-unavailable",{errorInfo:n?.toString()}).message),!1}else return M.warn(x.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Cc(n,e,t,s,i,r,o){const a=pc(n);a.then(d=>{t[d.measurementId]=d.appId,n.options.measurementId&&d.measurementId!==n.options.measurementId&&M.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${d.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(d=>M.error(d)),e.push(a);const l=vc().then(d=>{if(d)return s.getId()}),[c,u]=await Promise.all([a,l]);lc(r)||nc(r,c.measurementId),i("js",new Date);const h=o?.config??{};return h[Ql]="firebase",h.update=!0,u!=null&&(h[jl]=u),i("config",c.measurementId,h),c.measurementId}/**
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
 */class Ic{constructor(e){this.app=e}_delete(){return delete be[this.app.options.appId],Promise.resolve()}}let be={},Zn=[];const es={};let Tt="dataLayer",Ec="gtag",ts,zi,ns=!1;function Tc(){const n=[];if(fr()&&n.push("This is a browser extension environment."),gr()||n.push("Cookies are not available."),n.length>0){const e=n.map((s,i)=>`(${i+1}) ${s}`).join(" "),t=x.create("invalid-analytics-context",{errorInfo:e});M.warn(t.message)}}function wc(n,e,t){Tc();const s=n.options.appId;if(!s)throw x.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)M.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw x.create("no-api-key");if(be[s]!=null)throw x.create("already-exists",{id:s});if(!ns){sc(Tt);const{wrappedGtag:r,gtagCore:o}=ac(be,Zn,es,Tt,Ec);zi=r,ts=o,ns=!0}return be[s]=Cc(n,Zn,es,e,ts,Tt,t),new Ic(n)}function Sc(n=ls()){n=nt(n);const e=De(n,tt);return e.isInitialized()?e.getImmediate():Rc(n)}function Rc(n,e={}){const t=De(n,tt);if(t.isInitialized()){const i=t.getImmediate();if(cs(e,t.getOptions()))return i;throw x.create("already-initialized")}return t.initialize({options:e})}function Nc(n,e,t,s){n=nt(n),yc(zi,be[n.app.options.appId],e,t,s).catch(i=>M.error(i))}const ss="@firebase/analytics",is="0.10.18";function bc(){Ae(new ke(tt,(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),i=e.getProvider("installations-internal").getImmediate();return wc(s,i,t)},"PUBLIC")),Ae(new ke("analytics-internal",n,"PRIVATE")),fe(ss,is),fe(ss,is,"esm2020");function n(e){try{const t=e.getProvider(tt).getImmediate();return{logEvent:(s,i,r)=>Nc(t,s,i,r)}}catch(t){throw x.create("interop-component-reg-failed",{reason:t})}}}bc();const Ac={apiKey:"AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw",authDomain:"erp-for-tsa.firebaseapp.com",databaseURL:"https://erp-for-tsa-default-rtdb.firebaseio.com",projectId:"erp-for-tsa",storageBucket:"erp-for-tsa.firebasestorage.app",messagingSenderId:"271232983905",appId:"1:271232983905:web:7d06c8f5ec269824759b20",measurementId:"G-6CYWPS4N0G"},ht=vr(Ac),le=mr(ht),wt=yr(ht);al(ht);Sc(ht);const F={OPERATORS:"operators",SUPERVISORS:"supervisors",MANAGEMENT:"management",BUNDLES:"bundles",WORK_ASSIGNMENTS:"workAssignments",WORK_ITEMS:"workItems",WORK_COMPLETIONS:"workCompletions",WIP_ENTRIES:"wipEntries",WIP_ROLLS:"wipRolls",ASSIGNMENT_HISTORY:"assignmentHistory",QUALITY_ISSUES:"qualityIssues",NOTIFICATIONS:"notifications",DAILY_REPORTS:"dailyReports",PRODUCTION_STATS:"productionStats",EFFICIENCY_LOGS:"efficiencyLogs",SIZE_CONFIGS:"sizeConfigs",MACHINE_CONFIGS:"machineConfigs",ARTICLE_TEMPLATES:"articleTemplates",DELETED_TEMPLATES:"deletedTemplates",SYSTEM_SETTINGS:"systemSettings",WAGE_RECORDS:"wageRecords",LINE_STATUS:"lineStatus",DAMAGE_REPORTS:"damage_reports",DAMAGE_NOTIFICATIONS:"damage_notifications",OPERATOR_WALLETS:"operatorWallets"};class Pc{static async findUser(e){try{const t=await qe(oe(le,F.OPERATORS,e));if(t.exists())return{success:!0,data:{id:t.id,...t.data()}};const s=await qe(oe(le,F.SUPERVISORS,e));if(s.exists())return{success:!0,data:{id:s.id,...s.data()}};const i=await qe(oe(le,F.MANAGEMENT,e));return i.exists()?{success:!0,data:{id:i.id,...i.data()}}:{success:!1,error:"User not found"}}catch(t){return console.error("Error finding user:",t),{success:!1,error:t instanceof Error?t.message:"Unknown error"}}}static async getUserById(e,t){try{let s;switch(t){case"operator":s=F.OPERATORS;break;case"supervisor":s=F.SUPERVISORS;break;case"management":case"admin":s=F.MANAGEMENT;break;default:throw new Error("Invalid user role")}const i=await qe(oe(le,s,e));return i.exists()?{success:!0,data:{id:i.id,...i.data()}}:{success:!1,error:"User not found"}}catch(s){return console.error("Error getting user by ID:",s),{success:!1,error:s instanceof Error?s.message:"Unknown error"}}}static async login(e){try{const t=await this.findUser(e.username);if(!t.success||!t.data)return{success:!1,error:"Invalid username or password"};const s=t.data;if(!s.active)return{success:!1,error:"Account is deactivated. Please contact administrator."};if(e.password!=="password123")return{success:!1,error:"Invalid username or password"};const r=s.role==="operator"?F.OPERATORS:s.role==="supervisor"?F.SUPERVISORS:F.MANAGEMENT;return await pn(oe(le,r,s.id),{lastLogin:_n()}),{success:!0,data:{...s,lastLogin:new Date}}}catch(t){return console.error("Login error:",t),{success:!1,error:t instanceof Error?t.message:"Login failed"}}}static async logout(e){try{return wt.currentUser&&await Cr(wt),console.log("User logged out successfully"),{success:!0}}catch(t){return console.error("Logout error:",t),{success:!1,error:t instanceof Error?t.message:"Logout failed"}}}static async updateUserProfile(e,t,s){try{const i=t==="operator"?F.OPERATORS:t==="supervisor"?F.SUPERVISORS:F.MANAGEMENT;return await pn(oe(le,i,e),{...s,updatedAt:_n()}),{success:!0}}catch(i){return console.error("Error updating user profile:",i),{success:!1,error:i instanceof Error?i.message:"Update failed"}}}static async changePassword(e,t,s,i){try{return console.log("Password change requested for user:",e),{success:!0}}catch(r){return console.error("Error changing password:",r),{success:!1,error:r instanceof Error?r.message:"Password change failed"}}}static hasPermission(e,t){return e?e.role==="admin"||e.permissions.includes("*")?!0:e.permissions.includes(t):!1}static async validateSession(e,t){try{return await this.getUserById(e,t)}catch(s){return console.error("Session validation error:",s),{success:!1,error:"Session validation failed"}}}static onAuthStateChanged(e){return Ir(wt,e)}}export{Pc as AuthService};
