webpackJsonp([1],[,function(e,n,t){var i=t(0),o=t(3);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),n.shake=function(e,n){n=void 0===n?10:n;var t=2*n;return i(e).width(i(e).width()).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},n.onLongPress=function(e,n){var t=!1,i=function(e){t=!0},o=function(e){t=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(t)return n(e)})},n.setProgress=function(e,n,t){var i=e.children[0],o=e.children[1];n=Math.floor(n),e.className=n>=100?"progress success":"progress active",i.style.width=n+"%",i.innerText=n+"%",void 0!==t&&(o.innerText=t)},n.handleLogin=function(e){var t=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:t,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),n.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},n.handleError=function(e,t,r,a){var l=o.get("csrf_token");return r.headers["X-Csrf-Token"]!==l?(i.ajaxSetup({headers:{"X-Csrf-Token":l}}),r.headers["X-Csrf-Token"]=l,void i.ajax(r)):401===t.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void n.handleLogin(function(){i("#login-overlay").hide(),i.ajax(r)})):(void 0!==t.responseJSON?alert(t.responseJSON.message):alert(t.responseText),n.shake(i("main > .frame")),void console.log(e,t,r,a))}},,function(e,n,t){var i,o;!function(r){var a=!1;if(i=r,void 0!==(o="function"==typeof i?i.call(n,t,n,e):i)&&(e.exports=o),a=!0,e.exports=r(),a=!0,!a){var l=window.Cookies,c=window.Cookies=r();c.noConflict=function(){return window.Cookies=l,c}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var t=arguments[e];for(var i in t)n[i]=t[i]}return n}function n(t){function i(n,o,r){var a;if("undefined"!=typeof document){if(arguments.length>1){if(r=e({path:"/"},i.defaults,r),"number"==typeof r.expires){var l=new Date;l.setMilliseconds(l.getMilliseconds()+864e5*r.expires),r.expires=l}r.expires=r.expires?r.expires.toUTCString():"";try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(e){}o=t.write?t.write(o,n):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=encodeURIComponent(String(n)),n=n.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),n=n.replace(/[\(\)]/g,escape);var c="";for(var s in r)r[s]&&(c+="; "+s,!0!==r[s]&&(c+="="+r[s]));return document.cookie=n+"="+o+c}n||(a={});for(var u=document.cookie?document.cookie.split("; "):[],f=/(%[0-9A-Z]{2})+/g,d=0;d<u.length;d++){var p=u[d].split("="),h=p.slice(1).join("=");this.json||'"'!==h.charAt(0)||(h=h.slice(1,-1));try{var v=p[0].replace(f,decodeURIComponent);if(h=t.read?t.read(h,v):t(h,v)||h.replace(f,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch(e){}if(n===v){a=h;break}n||(a[v]=h)}catch(e){}}return a}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(n,t){i(n,"",e(t,{expires:-1}))},i.withConverter=n,i}return n(function(){})})},function(e,n){function t(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function i(e){return e.replace(/^.*\//,"")}function o(e,n){e=e.trim(),e.startsWith("/")||(e=n+"/"+e);for(var t=e.split("/"),i=[],o=0;o<t.length;o++)".."===t[o]?i.length>=1&&i.pop():""!==t[o]&&"."!==t[o]&&i.push(t[o]);return"/"+i.join("/")}n.dirName=t,n.fileName=i,n.convert=o},function(e,n){var t;t=function(){return this}();try{t=t||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(t=window)}e.exports=t},,,,,,,,,,function(e,n,t){"use strict";(function(n){function i(e,n){function t(e){return-1!==se.containers.indexOf(e)||ce.isContainer(e)}function i(e){var n=e?"remove":"add";o(E,n,"mousedown",S),o(E,n,"mouseup",B)}function l(e){o(E,e?"remove":"add","mousemove",k)}function v(e){var n=e?"remove":"add";b[n](E,"selectstart",x),b[n](E,"click",x)}function g(){i(!0),B({})}function x(e){ae&&e.preventDefault()}function S(e){if(ee=e.clientX,ne=e.clientY,!(1!==r(e)||e.metaKey||e.ctrlKey)){var n=e.target,t=O(n);t&&(ae=t,l(),"mousedown"===e.type&&(h(n)?n.focus():e.preventDefault()))}}function k(e){if(ae){if(0===r(e))return void B({});if(void 0===e.clientX||e.clientX!==ee||void 0===e.clientY||e.clientY!==ne){if(ce.ignoreInputTextSelection){var n=y("clientX",e),t=y("clientY",e);if(h(C.elementFromPoint(n,t)))return}var i=ae;l(!0),v(),I(),A(i);var o=a(W);Z=y("pageX",e)-o.left,Q=y("pageY",e)-o.top,T.add(oe||W,"gu-transit"),H(),X(e)}}}function O(e){if(!(se.dragging&&V||t(e))){for(var n=e;p(e)&&!1===t(p(e));){if(ce.invalid(e,n))return;if(!(e=p(e)))return}var i=p(e);if(i&&!ce.invalid(e,n)){if(ce.moves(e,i,n,m(e)))return{item:e,source:i}}}}function L(e){return!!O(e)}function P(e){var n=O(e);n&&A(n)}function A(e){$(e.item,e.source)&&(oe=e.item.cloneNode(!0),se.emit("cloned",oe,e.item,"copy")),z=e.source,W=e.item,te=ie=m(e.item),se.dragging=!0,se.emit("drag",W,z)}function G(){return!1}function I(){if(se.dragging){var e=oe||W;K(e,p(e))}}function N(){ae=!1,l(!0),v(!0)}function B(e){if(N(),se.dragging){var n=oe||W,t=y("clientX",e),i=y("clientY",e),o=c(V,t,i),r=U(o,t,i);r&&(oe&&ce.copySortSource||!oe||r!==z)?K(n,r):ce.removeOnSpill?R():M()}}function K(e,n){var t=p(e);oe&&ce.copySortSource&&n===z&&t.removeChild(W),D(n)?se.emit("cancel",e,z,z):se.emit("drop",e,n,z,ie),j()}function R(){if(se.dragging){var e=oe||W,n=p(e);n&&n.removeChild(e),se.emit(oe?"cancel":"remove",e,n,z),j()}}function M(e){if(se.dragging){var n=arguments.length>0?e:ce.revertOnSpill,t=oe||W,i=p(t),o=D(i);!1===o&&n&&(oe?i&&i.removeChild(oe):z.insertBefore(t,te)),o||n?se.emit("cancel",t,z,z):se.emit("drop",t,i,z,ie),j()}}function j(){var e=oe||W;N(),J(),e&&T.rm(e,"gu-transit"),re&&clearTimeout(re),se.dragging=!1,le&&se.emit("out",e,le,z),se.emit("dragend",e),z=W=oe=te=ie=re=le=null}function D(e,n){var t;return t=void 0!==n?n:V?ie:m(oe||W),e===z&&t===te}function U(e,n,i){for(var o=e;o&&!function(){if(!1===t(o))return!1;var r=Y(o,e),a=q(o,r,n,i);return!!D(o,a)||ce.accepts(W,o,z,a)}();)o=p(o);return o}function X(e){function n(e){se.emit(e,a,le,z)}if(V){e.preventDefault();var t=y("clientX",e),i=y("clientY",e),o=t-Z,r=i-Q;V.style.left=o+"px",V.style.top=r+"px";var a=oe||W,l=c(V,t,i),s=U(l,t,i),u=null!==s&&s!==le;(u||null===s)&&(function(){le&&n("out")}(),le=s,function(){u&&n("over")}());var f=p(a);if(s===z&&oe&&!ce.copySortSource)return void(f&&f.removeChild(a));var d,h=Y(s,l);if(null!==h)d=q(s,h,t,i);else{if(!0!==ce.revertOnSpill||oe)return void(oe&&f&&f.removeChild(a));d=te,s=z}(null===d&&u||d!==a&&d!==m(a))&&(ie=d,s.insertBefore(a,d),se.emit("shadow",a,s,z))}}function _(e){T.rm(e,"gu-hide")}function F(e){se.dragging&&T.add(e,"gu-hide")}function H(){if(!V){var e=W.getBoundingClientRect();V=W.cloneNode(!0),V.style.width=f(e)+"px",V.style.height=d(e)+"px",T.rm(V,"gu-transit"),T.add(V,"gu-mirror"),ce.mirrorContainer.appendChild(V),o(E,"add","mousemove",X),T.add(ce.mirrorContainer,"gu-unselectable"),se.emit("cloned",V,W,"mirror")}}function J(){V&&(T.rm(ce.mirrorContainer,"gu-unselectable"),o(E,"remove","mousemove",X),p(V).removeChild(V),V=null)}function Y(e,n){for(var t=n;t!==e&&p(t)!==e;)t=p(t);return t===E?null:t}function q(e,n,t,i){function o(e){return e?m(n):n}var r="horizontal"===ce.direction;return n!==e?function(){var e=n.getBoundingClientRect();return o(r?t>e.left+f(e)/2:i>e.top+d(e)/2)}():function(){var n,o,a,l=e.children.length;for(n=0;n<l;n++){if(o=e.children[n],a=o.getBoundingClientRect(),r&&a.left+a.width/2>t)return o;if(!r&&a.top+a.height/2>i)return o}return null}()}function $(e,n){return"boolean"==typeof ce.copy?ce.copy:ce.copy(e,n)}1===arguments.length&&!1===Array.isArray(e)&&(n=e,e=[]);var V,z,W,Z,Q,ee,ne,te,ie,oe,re,ae,le=null,ce=n||{};void 0===ce.moves&&(ce.moves=u),void 0===ce.accepts&&(ce.accepts=u),void 0===ce.invalid&&(ce.invalid=G),void 0===ce.containers&&(ce.containers=e||[]),void 0===ce.isContainer&&(ce.isContainer=s),void 0===ce.copy&&(ce.copy=!1),void 0===ce.copySortSource&&(ce.copySortSource=!1),void 0===ce.revertOnSpill&&(ce.revertOnSpill=!1),void 0===ce.removeOnSpill&&(ce.removeOnSpill=!1),void 0===ce.direction&&(ce.direction="vertical"),void 0===ce.ignoreInputTextSelection&&(ce.ignoreInputTextSelection=!0),void 0===ce.mirrorContainer&&(ce.mirrorContainer=C.body);var se=w({containers:ce.containers,start:P,end:I,cancel:M,remove:R,destroy:g,canMove:L,dragging:!1});return!0===ce.removeOnSpill&&se.on("over",_).on("out",F),i(),se}function o(e,t,i,o){var r={mouseup:"touchend",mousedown:"touchstart",mousemove:"touchmove"},a={mouseup:"pointerup",mousedown:"pointerdown",mousemove:"pointermove"},l={mouseup:"MSPointerUp",mousedown:"MSPointerDown",mousemove:"MSPointerMove"};n.navigator.pointerEnabled?b[t](e,a[i],o):n.navigator.msPointerEnabled?b[t](e,l[i],o):(b[t](e,r[i],o),b[t](e,i,o))}function r(e){if(void 0!==e.touches)return e.touches.length;if(void 0!==e.which&&0!==e.which)return e.which;if(void 0!==e.buttons)return e.buttons;var n=e.button;return void 0!==n?1&n?1:2&n?3:4&n?2:0:void 0}function a(e){var n=e.getBoundingClientRect();return{left:n.left+l("scrollLeft","pageXOffset"),top:n.top+l("scrollTop","pageYOffset")}}function l(e,t){return void 0!==n[t]?n[t]:E.clientHeight?E[e]:C.body[e]}function c(e,n,t){var i,o=e||{},r=o.className;return o.className+=" gu-hide",i=C.elementFromPoint(n,t),o.className=r,i}function s(){return!1}function u(){return!0}function f(e){return e.width||e.right-e.left}function d(e){return e.height||e.bottom-e.top}function p(e){return e.parentNode===C?null:e.parentNode}function h(e){return"INPUT"===e.tagName||"TEXTAREA"===e.tagName||"SELECT"===e.tagName||v(e)}function v(e){return!!e&&("false"!==e.contentEditable&&("true"===e.contentEditable||v(p(e))))}function m(e){return e.nextElementSibling||function(){var n=e;do{n=n.nextSibling}while(n&&1!==n.nodeType);return n}()}function g(e){return e.targetTouches&&e.targetTouches.length?e.targetTouches[0]:e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e}function y(e,n){var t=g(n),i={pageX:"clientX",pageY:"clientY"};return e in i&&!(e in t)&&i[e]in t&&(e=i[e]),t[e]}var w=t(36),b=t(37),T=t(40),C=document,E=C.documentElement;e.exports=i}).call(n,t(5))},,function(e,n){},,,,,,,function(e,n){e.exports=function(e,n){return Array.prototype.slice.call(e,n)}},,,,,,,,,,,function(e,n,t){"use strict";var i=t(48);e.exports=function(e,n,t){e&&i(function(){e.apply(t||null,n||[])})}},function(e,n,t){"use strict";var i=t(24),o=t(35);e.exports=function(e,n){var t=n||{},r={};return void 0===e&&(e={}),e.on=function(n,t){return r[n]?r[n].push(t):r[n]=[t],e},e.once=function(n,t){return t._once=!0,e.on(n,t),e},e.off=function(n,t){var i=arguments.length;if(1===i)delete r[n];else if(0===i)r={};else{var o=r[n];if(!o)return e;o.splice(o.indexOf(t),1)}return e},e.emit=function(){var n=i(arguments);return e.emitterSnapshot(n.shift()).apply(this,n)},e.emitterSnapshot=function(n){var a=(r[n]||[]).slice(0);return function(){var r=i(arguments),l=this||e;if("error"===n&&!1!==t.throws&&!a.length)throw 1===r.length?r[0]:r;return a.forEach(function(i){t.async?o(i,r,l):i.apply(l,r),i._once&&e.off(n,i)}),e}},e}},function(e,n,t){"use strict";(function(n){function i(e,n,t,i){return e.addEventListener(n,t,i)}function o(e,n,t){return e.attachEvent("on"+n,s(e,n,t))}function r(e,n,t,i){return e.removeEventListener(n,t,i)}function a(e,n,t){var i=u(e,n,t);if(i)return e.detachEvent("on"+n,i)}function l(e,n,t){var i=-1===p.indexOf(n)?function(){return new d(n,{detail:t})}():function(){var e;return h.createEvent?(e=h.createEvent("Event"),e.initEvent(n,!0,!0)):h.createEventObject&&(e=h.createEventObject()),e}();e.dispatchEvent?e.dispatchEvent(i):e.fireEvent("on"+n,i)}function c(e,t,i){return function(t){var o=t||n.event;o.target=o.target||o.srcElement,o.preventDefault=o.preventDefault||function(){o.returnValue=!1},o.stopPropagation=o.stopPropagation||function(){o.cancelBubble=!0},o.which=o.which||o.keyCode,i.call(e,o)}}function s(e,n,t){var i=u(e,n,t)||c(e,n,t);return g.push({wrapper:i,element:e,type:n,fn:t}),i}function u(e,n,t){var i=f(e,n,t);if(i){var o=g[i].wrapper;return g.splice(i,1),o}}function f(e,n,t){var i,o;for(i=0;i<g.length;i++)if(o=g[i],o.element===e&&o.type===n&&o.fn===t)return i}var d=t(39),p=t(38),h=n.document,v=i,m=r,g=[];n.addEventListener||(v=o,m=a),e.exports={add:v,remove:m,fabricate:l}}).call(n,t(5))},function(e,n,t){"use strict";(function(n){var t=[],i="",o=/^on/;for(i in n)o.test(i)&&t.push(i.slice(2));e.exports=t}).call(n,t(5))},function(e,n,t){(function(n){var t=n.CustomEvent;e.exports=function(){try{var e=new t("cat",{detail:{foo:"bar"}});return"cat"===e.type&&"bar"===e.detail.foo}catch(e){}return!1}()?t:"function"==typeof document.createEvent?function(e,n){var t=document.createEvent("CustomEvent");return n?t.initCustomEvent(e,n.bubbles,n.cancelable,n.detail):t.initCustomEvent(e,!1,!1,void 0),t}:function(e,n){var t=document.createEventObject();return t.type=e,n?(t.bubbles=Boolean(n.bubbles),t.cancelable=Boolean(n.cancelable),t.detail=n.detail):(t.bubbles=!1,t.cancelable=!1,t.detail=void 0),t}}).call(n,t(5))},function(e,n,t){"use strict";function i(e){var n=a[e];return n?n.lastIndex=0:a[e]=n=new RegExp(l+e+c,"g"),n}function o(e,n){var t=e.className;t.length?i(n).test(t)||(e.className+=" "+n):e.className=n}function r(e,n){e.className=e.className.replace(i(n)," ").trim()}var a={},l="(?:^|\\s)",c="(?:\\s|$)";e.exports={add:o,rm:r}},,,,,function(e,n){function t(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function o(e){if(u===setTimeout)return setTimeout(e,0);if((u===t||!u)&&setTimeout)return u=setTimeout,setTimeout(e,0);try{return u(e,0)}catch(n){try{return u.call(null,e,0)}catch(n){return u.call(this,e,0)}}}function r(e){if(f===clearTimeout)return clearTimeout(e);if((f===i||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(e);try{return f(e)}catch(n){try{return f.call(null,e)}catch(n){return f.call(this,e)}}}function a(){v&&p&&(v=!1,p.length?h=p.concat(h):m=-1,h.length&&l())}function l(){if(!v){var e=o(a);v=!0;for(var n=h.length;n;){for(p=h,h=[];++m<n;)p&&p[m].run();m=-1,n=h.length}p=null,v=!1,r(e)}}function c(e,n){this.fun=e,this.array=n}function s(){}var u,f,d=e.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:t}catch(e){u=t}try{f="function"==typeof clearTimeout?clearTimeout:i}catch(e){f=i}}();var p,h=[],v=!1,m=-1;d.nextTick=function(e){var n=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)n[t-1]=arguments[t];h.push(new c(e,n)),1!==h.length||v||o(l)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=s,d.addListener=s,d.once=s,d.off=s,d.removeListener=s,d.removeAllListeners=s,d.emit=s,d.prependListener=s,d.prependOnceListener=s,d.listeners=function(e){return[]},d.binding=function(e){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(e){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(e,n,t){(function(e,n){!function(e,t){"use strict";function i(e){"function"!=typeof e&&(e=new Function(""+e));for(var n=new Array(arguments.length-1),t=0;t<n.length;t++)n[t]=arguments[t+1];var i={callback:e,args:n};return s[c]=i,l(c),c++}function o(e){delete s[e]}function r(e){var n=e.callback,i=e.args;switch(i.length){case 0:n();break;case 1:n(i[0]);break;case 2:n(i[0],i[1]);break;case 3:n(i[0],i[1],i[2]);break;default:n.apply(t,i)}}function a(e){if(u)setTimeout(a,0,e);else{var n=s[e];if(n){u=!0;try{r(n)}finally{o(e),u=!1}}}}if(!e.setImmediate){var l,c=1,s={},u=!1,f=e.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(e);d=d&&d.setTimeout?d:e,"[object process]"==={}.toString.call(e.process)?function(){l=function(e){n.nextTick(function(){a(e)})}}():function(){if(e.postMessage&&!e.importScripts){var n=!0,t=e.onmessage;return e.onmessage=function(){n=!1},e.postMessage("","*"),e.onmessage=t,n}}()?function(){var n="setImmediate$"+Math.random()+"$",t=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(n)&&a(+t.data.slice(n.length))};e.addEventListener?e.addEventListener("message",t,!1):e.attachEvent("onmessage",t),l=function(t){e.postMessage(n+t,"*")}}():e.MessageChannel?function(){var e=new MessageChannel;e.port1.onmessage=function(e){a(e.data)},l=function(n){e.port2.postMessage(n)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var e=f.documentElement;l=function(n){var t=f.createElement("script");t.onreadystatechange=function(){a(n),t.onreadystatechange=null,e.removeChild(t),t=null},e.appendChild(t)}}():function(){l=function(e){setTimeout(a,0,e)}}(),d.setImmediate=i,d.clearImmediate=o}}("undefined"==typeof self?void 0===e?this:e:self)}).call(n,t(5),t(45))},,function(e,n,t){(function(n){var t,i="function"==typeof n;t=i?function(e){n(e)}:function(e){setTimeout(e,0)},e.exports=t}).call(n,t(49).setImmediate)},function(e,n,t){function i(e,n){this._id=e,this._clearFn=n}var o=Function.prototype.apply;n.setTimeout=function(){return new i(o.call(setTimeout,window,arguments),clearTimeout)},n.setInterval=function(){return new i(o.call(setInterval,window,arguments),clearInterval)},n.clearTimeout=n.clearInterval=function(e){e&&e.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(window,this._id)},n.enroll=function(e,n){clearTimeout(e._idleTimeoutId),e._idleTimeout=n},n.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},n._unrefActive=n.active=function(e){clearTimeout(e._idleTimeoutId);var n=e._idleTimeout;n>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},n))},t(46),n.setImmediate=setImmediate,n.clearImmediate=clearImmediate},,,,,,function(e,n,t){function i(e,n){V=n.path||"/",Y.empty(),b(),g(V)}function o(e){}function r(e,n){p(n.path||"/")}function a(e){e.on("dragenter",function(n){return null===e.data("path")||event.dataTransfer.types.indexOf("Files")<0?event.dataTransfer.dropEffect="none":(event.dataTransfer.dropEffect="copy",e.addClass("accept")),!1}),e.on("dragleave",function(n){return e.removeClass("accept"),!1}),e.on("dragover",function(n){return null===e.data("path")||event.dataTransfer.types.indexOf("Files")<0?event.dataTransfer.dropEffect="none":(event.dataTransfer.dropEffect="copy",e.addClass("accept")),!1}),e.on("drop",function(n){if(null===e.data("path"))return!1;e.removeClass("accept");for(var t=event.dataTransfer.files,i=new FormData,o=0;o<t.length;o++)i.append("file"+o,t[o]),s(e,{name:t[o].name,path:e.data("path")+"/"+t[o].name,type:"uploading"});var r=new XMLHttpRequest,a=function(){void 0!==r.responseJSON?alert(r.responseJSON.message):alert(r.responseText),F.shake(_("main > .frame"))};return r.open("POST",BLOGSTEP.PATH+"/api/upload?path="+e.data("path")),BLOGSTEP.addToken(r),r.send(i),r.onreadystatechange=function(){if(4===this.readyState){200!==this.status&&a();var n=e.data("path");e.data("path",null),w(e,n)}},!1})}function l(e,n){Z[n.path]={link:e,data:n},e.hasClass("file-directory")||e.dblclick(function(){if(!te)return BLOGSTEP.open(_(this).data("path")),!1}),F.onLongPress(e[0],function(t){return t.preventDefault(),t.stopPropagation(),e.hasClass("active")?v(n.path):m(n.path),te=!0,!1}),e.on("dragstart",function(e){var t="application/octet-stream:"+encodeURIComponent(n.name)+":"+location.origin+BLOGSTEP.PATH+"/api/download?path="+encodeURIComponent(n.path);e.originalEvent.dataTransfer.setData("DownloadURL",t)}),e.click(function(t){if(t.ctrlKey||te)e.hasClass("active")?v(n.path):m(n.path);else if(t.shiftKey){var i=Q[Q.length-1],o=ee;if(e.hasClass("active")||m(n.path),ee!==o&&(i=Q[0]),Z.hasOwnProperty(i)){var r=Z[i].link;if(r.parent().is(e.parent())){var a=!1;e.parent().children().each(function(){var n=_(this);(n.is(e)||n.is(r))&&(a=!a),a&&!n.hasClass("active")&&m(n.data("path"))})}}}else p(n.path);return!1})}function c(e){var n=_('<a class="file">');return n.text(e.name),z.filter(function(n){return n===e.path}).length>0&&n.addClass("active"),e.read||n.addClass("locked"),n.attr("draggable",!0),n.attr("data-path",e.path),n.attr("href",BLOGSTEP.PATH+"/app/files?path="+e.path),n.addClass("file-"+e.type),l(n,e),n}function s(e,n){var t=c(n);return e.children(".files-list").append(t),t}function u(e,n){Z.hasOwnProperty(n.path)||c(n);var t,i=_('<div class="file-info">'),o="Edit";switch(n.type.toLowerCase()){case"jpeg":case"jpg":case"png":case"ico":t=_('<img class="file-thumbnail">'),t.attr("src",BLOGSTEP.PATH+"/api/download?path="+encodeURIComponent(n.path)),o="View";break;case"webm":o="Play";default:t=_('<span class="file">'),t.addClass("file-"+n.type),n.read||t.addClass("locked")}var r=_('<span class="file-name">');r.text(n.name);var a=_('<span class="file-modified">');a.text(new Date(1e3*n.modified).toString());var l=_('<span class="file-access">');if(l.text(n.modeString+" "+n.owner+":"+n.group+" ("+(n.read?"r":"-")+(n.write?"w":"-")+")"),i.append(t).append(r).append(a).append(l),n.read){_("<button>"+o+"</button>").click(function(){BLOGSTEP.open(n.path)}).appendTo(i)}e.children(".files-list").replaceWith(i)}function f(){z.length<=1||(z.pop(),V=z[z.length-1],te=!1,z.length>1?(Q=[V],J.enableGroup("selection"),J.enableGroup("selection-single")):(Q=[],J.disableGroup("selection"),J.disableGroup("selection-single")),ee=z[z.length-1],y(),J.setArgs({path:V}))}function d(){$.data("path",null),w($,V)}function p(e){g(e),Z.hasOwnProperty(e)&&Z[e].link.addClass("active"),J.setArgs({path:V})}function h(){if(1===Q.length&&Q[0]===ee)return void f();Q.forEach(function(e){Z[e].link.removeClass("active")}),Q=[],te=!1,J.disableGroup("selection"),J.disableGroup("selection-single"),p(ee)}function v(e){var n=Q.indexOf(e);if(n>=0)if(Q.splice(n,1),console.log(Q),Z[e].link.removeClass("active"),0===Q.length)te=!1,$.next().children(".file-info").empty(),p(ee);else{1===Q.length?J.enableGroup("selection-single"):J.disableGroup("selection-single");var t=$.next().children(".file-info");if(t.length>0){var i=t.children(".file-name");i.text(Q.length+" files")}}}function m(e){var n=H.dirName(e);if(n!==ee){if(Q.length>1)return;ee=n;for(var t=[],i=0;i<z.length;i++)if(z[i]===ee&&i+1<z.length){t.push(z[i+1]);break}g(n),Q=t,Q.length>0&&Z[Q[0]].link.addClass("active")}else 1===Q.length&&H.dirName(Q[0])!==ee&&(Q=[]);J.enableGroup("selection"),Q.push(e),J.disableGroup("dir"),1===Q.length?J.enableGroup("selection-single"):J.disableGroup("selection-single"),console.log(Q,ee),Z[e].link.addClass("active");var o=$.next().children(".file-info");if(o.length>0){o.empty();var r=_('<span class="file file-multiple">'),a=_('<span class="file-name">');a.text(Q.length+" files"),o.append(r).append(a)}else if($.next().length>0){$.next().empty();var o=_('<div class="file-info">');o.appendTo($.next());var r=_('<span class="file file-multiple">'),a=_('<span class="file-name">');a.text(Q.length+" files"),o.append(r).append(a)}}function g(e){var n=e.split("/"),e="";z=["/"];for(var t=0;t<n.length;t++)".."===n[t]?z.length>1&&(z.pop(),e=z[z.length-1]):""!==n[t]&&"."!==n[t]&&(e+="/"+n[t],z.push(e));V=z[z.length-1],te=!1,z.length>1?(Q=[e],J.enableGroup("selection"),J.enableGroup("selection-single")):(Q=[],J.disableGroup("selection"),J.disableGroup("selection-single")),ee=z[z.length-1],y()}function y(){console.log("stack",z,"cwd",V,"stackOffset",ne);var e=Y.children(),n=e.length;if(ne=Math.max(0,z.length-n),Y.find("a").removeClass("active"),$.children(".filter").remove(),$=e.eq(Math.min(n,z.length)-1),z.length>=W)for(var t=0;t<n;t++){var i=e.eq(t);ne+t<z.length?w(i,z[ne+t]):w(i,null)}else for(var t=n-1;t>=0;t--){var i=e.eq(t);ne+t<z.length?w(i,z[ne+t]):w(i,null)}W=z.length,_(".header-path").text(V),document.title=V+" – Files"}function w(e,n){if(e.data("path")!==n||null===n){var t=e.children(".files-list");0===t.length&&(e.empty(),t=_('<div class="files-list">'),e.append(t)),t.empty(),e.data("path",null),e.removeClass("readonly"),e.next().data("path")===n?(e.data("path",n),e.next().children(".files-list").children().appendTo(t),e.next().hasClass("readonly")&&e.addClass("readonly")):e.prev().data("path")===n?(e.data("path",n),e.prev().children(".files-list").children().appendTo(t),e.prev().hasClass("readonly")&&e.addClass("readonly")):null!==n&&(e.addClass("loading"),BLOGSTEP.get("list-files",{path:n}).done(function(i){if(e.removeClass("loading"),t.empty(),e.removeClass("readonly"),e.data("path",n),i.write||e.addClass("readonly"),Z.hasOwnProperty(i.path)||c(i),"directory"===i.type&&void 0!==i.files){for(var o=0;o<i.files.length;o++){var r=i.files[o];s(e,r)}e.is($)&&J.enableGroup("dir")}else u(e,i),e.is($)&&J.disableGroup("dir");e.trigger("loaded")}))}Z.hasOwnProperty(n)&&(Z[n].link.addClass("active"),e.is($)&&("directory"===Z[n].data.type?J.enableGroup("dir"):J.disableGroup("dir")))}function b(){var e=Y.children().length,n=Math.max(1,Math.floor(Y.width()/200));if(n>e)for(var t=n-e,i=0;i<t;i++){var o=_('<div class="files-panel">');o.append('<div class="files-list">'),o.appendTo(Y),a(o)}else{if(!(n<e))return!1;for(var r=e-n,i=0;i<r;i++)Y.children().last().remove()}return Y.children().css("width",100/n+"%"),!0}function T(e){var n=!0;e===e.toLowerCase()&&(n=!1);var t=null;return $.find(".file").each(function(){var i=_(this).text();if(n||(i=i.toLowerCase()),i.slice(0,e.length)===e)return t=_(this),!1}),t}function C(){var e=$.children(".filter");if($.find(".match").removeClass("match"),e.length>0)if(""===e.val())e.remove();else{var n=T(e.val());null!==n&&n.addClass("match")}}function E(e){if(_("input:focus").length>0)return!0;if(e.ctrlKey||e.shiftKey||e.altKey||e.metaKey)return!0;var n=$.children(".filter");return 1!==e.key.length||(0!==n.length||(_('<input type="text" class="filter">').val(e.key).appendTo($).focus().keydown(function(e){if(!(e.ctrlKey||e.shiftKey||e.altKey||e.metaKey)){if("Escape"===e.key)return _(this).remove(),C(),!1;if("Enter"===e.key){var n=$.find(".match");return n.length>0&&(_(this).remove(),n.click()),!1}}}).keyup(C).blur(function(){_(this).remove(),C()}),C(),!1))}function x(){history.back()}function S(){history.go(1)}function k(){p("/")}function O(){var e=prompt("Enter the new name:");if(null!==e){if(""===e)return void alert("Invalid name");var n;n="/"===V?V+e:V+"/"+e,BLOGSTEP.post("make-dir",{path:n}).done(function(e){s($,e),p(n)})}}function L(){var e=prompt("Enter the new name:");if(null!==e){if(""===e)return void alert("Invalid name");var n;n="/"===V?V+e:V+"/"+e,BLOGSTEP.post("make-file",{path:n}).done(function(e){s($,e),p(n)})}}function P(){var e=_('<input type="file" />').appendTo(_("body")),n=$;e.hide(),e.click(),e.change(function(){for(var t=e[0].files,i=new FormData,o=0;o<t.length;o++)i.append("file"+o,t[o]),s(n,{name:t[o].name,path:n.data("path")+"/"+t[o].name,type:"uploading"});var r=new XMLHttpRequest,a=function(){void 0!==r.responseJSON?alert(r.responseJSON.message):alert(r.responseText),F.shake(_("main > .frame"))};return r.open("POST",BLOGSTEP.PATH+"/api/upload?path="+encodeURIComponent(n.data("path"))),BLOGSTEP.addToken(r),r.onreadystatechange=function(){if(4===this.readyState){200!==this.status&&a();var t=n.data("path");n.data("path",null),w(n,t),e.remove()}},r.send(i),!1})}function A(){BLOGSTEP.run("terminal",{path:V})}function G(){if(!(z.length<=1)){if(1!==Q.length)return void alert("Cannot rename multiple files");var e=Q[0],n=prompt("Enter the new name:",Z[e].data.name);if(null!==n){""===n&&alert("Invalid name");var t=H.convert(n,H.dirName(e));BLOGSTEP.post("move",{path:e,destination:t}).done(function(e){p(t),d()})}}}function I(){var e,n={};1===Q.length?(e=confirm("Permanently delete file: "+Q[0]),n.path=Q[0]):(e=confirm("Permanently delete "+Q.length+" files?"),n.paths=Q),e&&BLOGSTEP.post("delete",n).done(function(e){h(),d()})}function N(){if(1===Q.length){var e=Z[Q[0]].data;location.href=BLOGSTEP.PATH+"/api/download/"+encodeURIComponent(e.name)+"?force&path="+encodeURIComponent(e.path)}else for(var n=0;n<Q.length;n++){var e=Z[Q[n]].data,t=_("<iframe>");t.hide(),t.attr("src",BLOGSTEP.PATH+"/api/download/"+encodeURIComponent(e.name)+"?force&path="+encodeURIComponent(e.path)),t.on("load",function(){console.log("download finished"),t.remove()}),t.appendTo(_("body"))}}function B(){if(1===Q.length)Z[Q[0]].link.clone().removeClass("active").appendTo(q);else{var e=Q,n=_('<a class="file file-multiple">');n.text(Q.length+" files"),n.data("paths",e),n.appendTo(q)}h()}function K(){if(1===Q.length)Z[Q[0]].link.clone().removeClass("active").addClass("duplicate").appendTo(q);else{var e=Q,n=_('<a class="file file-multiple duplicate">');n.text(Q.length+" files"),n.data("paths",e),n.appendTo(q)}h()}function R(){if(q.children().length>0){var e=q.children().last(),n=e.hasClass("duplicate"),t={},i=[];if(void 0!==e.data("paths"))t.paths={},e.data("paths").forEach(function(e){t.paths[e]=H.convert(Z[e].data.name,V),i.push(Z[e])});else{t.path=e.data("path");var o=Z[t.path];t.destination=H.convert(o.data.name,V),i.push(o)}BLOGSTEP.post(n?"copy":"move",t).done(function(t){e.remove(),n||i.forEach(function(e){e.link.remove()}),d()})}}function M(){$.find(".file").each(function(){m(_(this).data("path"))})}function j(){var e=$.find(".file:focus");if(e.length>0){var n=e.prev();n.length>0&&n.focus()}else $.find(".file").last().focus()}function D(){var e=$.find(".file:focus");if(e.length>0){var n=e.next();n.length>0&&n.focus()}else $.find(".file").first().focus()}function U(){var e=$.find(".file:focus");e.length>0&&(p(e.data("path")),$.one("loaded",function(){_(this).find(".file").first().focus()}))}function X(){if(z.length>1){var e=V;f(),Z[e].link.focus()}}var _=t(0),F=t(1),H=t(4);t(15);t(17);var J=null,Y=null,q=null,$=null,V=null,z=[],W=0,Z={},Q=[],ee="/",ne=0,te=!1,ie=V;window.onpopstate=function(e){null!==e.state?g(e.state.cwd):ie!==V&&g(ie)},BLOGSTEP.init("files",function(e){J=e,e.defineAction("back",x,["nav"]),e.defineAction("foreward",S,["nav"]),e.defineAction("up",f,["nav"]),e.defineAction("home",k,["nav"]),e.defineAction("new-folder",O,["dir"]),e.defineAction("new-file",L,["dir"]),e.defineAction("upload",P,["dir"]),e.defineAction("terminal",A,["selection-single"]),e.defineAction("rename",G,["selection-single"]),e.defineAction("trash",I,["selection"]),e.defineAction("download",N,["selection"]),e.defineAction("cut",B,["selection"]),e.defineAction("copy",K,["selection"]),e.defineAction("paste",R,["dir"]),e.defineAction("select-all",M,["dir"]),e.defineAction("remove-selection",function(){1===Q.length&&Q[0]===ee||h()},["dir"]),e.defineAction("focus-prev",j,["nav"]),e.defineAction("focus-next",D,["nav"]),e.defineAction("enter",U,["nav"]),e.defineAction("exit",X,["nav"]),e.bindKey("F2","rename"),e.bindKey("C-C","copy"),e.bindKey("C-X","cut"),e.bindKey("C-V","paste"),e.bindKey("Delete","trash"),e.bindKey("C-A","select-all"),e.bindKey("Escape","remove-selection"),e.bindKey("C-H","exit"),e.bindKey("C-K","focus-prev"),e.bindKey("C-J","focus-next"),e.bindKey("C-L","enter"),e.bindKey("ArrowLeft","exit"),e.bindKey("ArrowUp","focus-prev"),e.bindKey("ArrowDown","focus-next"),e.bindKey("ArrowRight","enter"),e.disableGroup("selection"),e.disableGroup("selection-single"),e.disableGroup("dir"),e.onOpen=i,e.onClose=o,e.onReopen=r,e.onKeydown=E,e.onResize=function(){b()&&y()};var n=e.addMenu("Files");n.addItem("New folder","new-folder"),n.addItem("New file","new-file"),n.addItem("Download","download"),Y=e.frame.find(".files-columns"),q=e.frame.find(".files-shelf > .files-grid"),$=Y.children().first(),Y.click(function(e){e.defaultPrevented||1===Q.length&&Q[0]===ee||h()})})}],[55]);
//# sourceMappingURL=files.js.map