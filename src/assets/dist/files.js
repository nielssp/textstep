webpackJsonp([1],[,,function(e,n,t){"use strict";function i(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function o(e){return e.replace(/^.*\//,"")}function r(e,n){e=e.trim(),e.startsWith("/")||(e=n+"/"+e);for(var t=e.split("/"),i=[],o=0;o<t.length;o++)".."===t[o]?i.length>=1&&i.pop():""!==t[o]&&"."!==t[o]&&i.push(t[o]);return"/"+i.join("/")}n.dirName=i,n.fileName=o,n.convert=r},function(e,n,t){"use strict";var i=t(0),o=t(4);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),n.shake=function(e,n){n=void 0===n?10:n;var t=2*n;return i(e).width(i(e).width()).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},n.onLongPress=function(e,n){var t=!1,i=function(e){t=!0},o=function(e){t=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(t)return n(e)})},n.setProgress=function(e,n,t){var i=e.children[0],o=e.children[1];n=Math.floor(n),e.className=n>=100?"progress success":"progress active",i.style.width=n+"%",i.innerText=n+"%",void 0!==t&&(o.innerText=t)},n.handleLogin=function(e){var t=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:t,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),n.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},n.handleError=function(e,t,r,a){var l=o.get("csrf_token");return r.headers["X-Csrf-Token"]!==l?(i.ajaxSetup({headers:{"X-Csrf-Token":l}}),r.headers["X-Csrf-Token"]=l,void i.ajax(r)):401===t.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void n.handleLogin(function(){i("#login-overlay").hide(),i.ajax(r)})):(void 0!==t.responseJSON?alert(t.responseJSON.message):alert(t.responseText),n.shake(i("main > .frame.active")),void console.log(e,t,r,a))}},function(e,n,t){var i,o;!function(r){var a=!1;if(i=r,void 0!==(o="function"==typeof i?i.call(n,t,n,e):i)&&(e.exports=o),a=!0,e.exports=r(),a=!0,!a){var l=window.Cookies,c=window.Cookies=r();c.noConflict=function(){return window.Cookies=l,c}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var t=arguments[e];for(var i in t)n[i]=t[i]}return n}function n(t){function i(n,o,r){var a;if("undefined"!=typeof document){if(arguments.length>1){if(r=e({path:"/"},i.defaults,r),"number"==typeof r.expires){var l=new Date;l.setMilliseconds(l.getMilliseconds()+864e5*r.expires),r.expires=l}r.expires=r.expires?r.expires.toUTCString():"";try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(e){}o=t.write?t.write(o,n):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=encodeURIComponent(String(n)),n=n.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),n=n.replace(/[\(\)]/g,escape);var c="";for(var s in r)r[s]&&(c+="; "+s,!0!==r[s]&&(c+="="+r[s]));return document.cookie=n+"="+o+c}n||(a={});for(var u=document.cookie?document.cookie.split("; "):[],f=/(%[0-9A-Z]{2})+/g,d=0;d<u.length;d++){var p=u[d].split("="),h=p.slice(1).join("=");this.json||'"'!==h.charAt(0)||(h=h.slice(1,-1));try{var v=p[0].replace(f,decodeURIComponent);if(h=t.read?t.read(h,v):t(h,v)||h.replace(f,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch(e){}if(n===v){a=h;break}n||(a[v]=h)}catch(e){}}return a}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(n,t){i(n,"",e(t,{expires:-1}))},i.withConverter=n,i}return n(function(){})})},function(e,n){var t;t=function(){return this}();try{t=t||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(t=window)}e.exports=t},,,,,,,,,function(e,n,t){"use strict";(function(n){function i(e,n){function t(e){return-1!==se.containers.indexOf(e)||ce.isContainer(e)}function i(e){var n=e?"remove":"add";o(E,n,"mousedown",S),o(E,n,"mouseup",N)}function l(e){o(E,e?"remove":"add","mousemove",k)}function v(e){var n=e?"remove":"add";b[n](E,"selectstart",x),b[n](E,"click",x)}function g(){i(!0),N({})}function x(e){ae&&e.preventDefault()}function S(e){if(ee=e.clientX,ne=e.clientY,!(1!==r(e)||e.metaKey||e.ctrlKey)){var n=e.target,t=O(n);t&&(ae=t,l(),"mousedown"===e.type&&(h(n)?n.focus():e.preventDefault()))}}function k(e){if(ae){if(0===r(e))return void N({});if(void 0===e.clientX||e.clientX!==ee||void 0===e.clientY||e.clientY!==ne){if(ce.ignoreInputTextSelection){var n=y("clientX",e),t=y("clientY",e);if(h(C.elementFromPoint(n,t)))return}var i=ae;l(!0),v(),I(),A(i);var o=a(W);Z=y("pageX",e)-o.left,Q=y("pageY",e)-o.top,T.add(oe||W,"gu-transit"),H(),U(e)}}}function O(e){if(!(se.dragging&&z||t(e))){for(var n=e;p(e)&&!1===t(p(e));){if(ce.invalid(e,n))return;if(!(e=p(e)))return}var i=p(e);if(i&&!ce.invalid(e,n)){if(ce.moves(e,i,n,m(e)))return{item:e,source:i}}}}function L(e){return!!O(e)}function P(e){var n=O(e);n&&A(n)}function A(e){$(e.item,e.source)&&(oe=e.item.cloneNode(!0),se.emit("cloned",oe,e.item,"copy")),V=e.source,W=e.item,te=ie=m(e.item),se.dragging=!0,se.emit("drag",W,V)}function G(){return!1}function I(){if(se.dragging){var e=oe||W;K(e,p(e))}}function B(){ae=!1,l(!0),v(!0)}function N(e){if(B(),se.dragging){var n=oe||W,t=y("clientX",e),i=y("clientY",e),o=c(z,t,i),r=j(o,t,i);r&&(oe&&ce.copySortSource||!oe||r!==V)?K(n,r):ce.removeOnSpill?R():F()}}function K(e,n){var t=p(e);oe&&ce.copySortSource&&n===V&&t.removeChild(W),M(n)?se.emit("cancel",e,V,V):se.emit("drop",e,n,V,ie),D()}function R(){if(se.dragging){var e=oe||W,n=p(e);n&&n.removeChild(e),se.emit(oe?"cancel":"remove",e,n,V),D()}}function F(e){if(se.dragging){var n=arguments.length>0?e:ce.revertOnSpill,t=oe||W,i=p(t),o=M(i);!1===o&&n&&(oe?i&&i.removeChild(oe):V.insertBefore(t,te)),o||n?se.emit("cancel",t,V,V):se.emit("drop",t,i,V,ie),D()}}function D(){var e=oe||W;B(),J(),e&&T.rm(e,"gu-transit"),re&&clearTimeout(re),se.dragging=!1,le&&se.emit("out",e,le,V),se.emit("dragend",e),V=W=oe=te=ie=re=le=null}function M(e,n){var t;return t=void 0!==n?n:z?ie:m(oe||W),e===V&&t===te}function j(e,n,i){for(var o=e;o&&!function(){if(!1===t(o))return!1;var r=Y(o,e),a=q(o,r,n,i);return!!M(o,a)||ce.accepts(W,o,V,a)}();)o=p(o);return o}function U(e){function n(e){se.emit(e,a,le,V)}if(z){e.preventDefault();var t=y("clientX",e),i=y("clientY",e),o=t-Z,r=i-Q;z.style.left=o+"px",z.style.top=r+"px";var a=oe||W,l=c(z,t,i),s=j(l,t,i),u=null!==s&&s!==le;(u||null===s)&&(function(){le&&n("out")}(),le=s,function(){u&&n("over")}());var f=p(a);if(s===V&&oe&&!ce.copySortSource)return void(f&&f.removeChild(a));var d,h=Y(s,l);if(null!==h)d=q(s,h,t,i);else{if(!0!==ce.revertOnSpill||oe)return void(oe&&f&&f.removeChild(a));d=te,s=V}(null===d&&u||d!==a&&d!==m(a))&&(ie=d,s.insertBefore(a,d),se.emit("shadow",a,s,V))}}function X(e){T.rm(e,"gu-hide")}function _(e){se.dragging&&T.add(e,"gu-hide")}function H(){if(!z){var e=W.getBoundingClientRect();z=W.cloneNode(!0),z.style.width=f(e)+"px",z.style.height=d(e)+"px",T.rm(z,"gu-transit"),T.add(z,"gu-mirror"),ce.mirrorContainer.appendChild(z),o(E,"add","mousemove",U),T.add(ce.mirrorContainer,"gu-unselectable"),se.emit("cloned",z,W,"mirror")}}function J(){z&&(T.rm(ce.mirrorContainer,"gu-unselectable"),o(E,"remove","mousemove",U),p(z).removeChild(z),z=null)}function Y(e,n){for(var t=n;t!==e&&p(t)!==e;)t=p(t);return t===E?null:t}function q(e,n,t,i){function o(e){return e?m(n):n}var r="horizontal"===ce.direction;return n!==e?function(){var e=n.getBoundingClientRect();return o(r?t>e.left+f(e)/2:i>e.top+d(e)/2)}():function(){var n,o,a,l=e.children.length;for(n=0;n<l;n++){if(o=e.children[n],a=o.getBoundingClientRect(),r&&a.left+a.width/2>t)return o;if(!r&&a.top+a.height/2>i)return o}return null}()}function $(e,n){return"boolean"==typeof ce.copy?ce.copy:ce.copy(e,n)}1===arguments.length&&!1===Array.isArray(e)&&(n=e,e=[]);var z,V,W,Z,Q,ee,ne,te,ie,oe,re,ae,le=null,ce=n||{};void 0===ce.moves&&(ce.moves=u),void 0===ce.accepts&&(ce.accepts=u),void 0===ce.invalid&&(ce.invalid=G),void 0===ce.containers&&(ce.containers=e||[]),void 0===ce.isContainer&&(ce.isContainer=s),void 0===ce.copy&&(ce.copy=!1),void 0===ce.copySortSource&&(ce.copySortSource=!1),void 0===ce.revertOnSpill&&(ce.revertOnSpill=!1),void 0===ce.removeOnSpill&&(ce.removeOnSpill=!1),void 0===ce.direction&&(ce.direction="vertical"),void 0===ce.ignoreInputTextSelection&&(ce.ignoreInputTextSelection=!0),void 0===ce.mirrorContainer&&(ce.mirrorContainer=C.body);var se=w({containers:ce.containers,start:P,end:I,cancel:F,remove:R,destroy:g,canMove:L,dragging:!1});return!0===ce.removeOnSpill&&se.on("over",X).on("out",_),i(),se}function o(e,t,i,o){var r={mouseup:"touchend",mousedown:"touchstart",mousemove:"touchmove"},a={mouseup:"pointerup",mousedown:"pointerdown",mousemove:"pointermove"},l={mouseup:"MSPointerUp",mousedown:"MSPointerDown",mousemove:"MSPointerMove"};n.navigator.pointerEnabled?b[t](e,a[i],o):n.navigator.msPointerEnabled?b[t](e,l[i],o):(b[t](e,r[i],o),b[t](e,i,o))}function r(e){if(void 0!==e.touches)return e.touches.length;if(void 0!==e.which&&0!==e.which)return e.which;if(void 0!==e.buttons)return e.buttons;var n=e.button;return void 0!==n?1&n?1:2&n?3:4&n?2:0:void 0}function a(e){var n=e.getBoundingClientRect();return{left:n.left+l("scrollLeft","pageXOffset"),top:n.top+l("scrollTop","pageYOffset")}}function l(e,t){return void 0!==n[t]?n[t]:E.clientHeight?E[e]:C.body[e]}function c(e,n,t){var i,o=e||{},r=o.className;return o.className+=" gu-hide",i=C.elementFromPoint(n,t),o.className=r,i}function s(){return!1}function u(){return!0}function f(e){return e.width||e.right-e.left}function d(e){return e.height||e.bottom-e.top}function p(e){return e.parentNode===C?null:e.parentNode}function h(e){return"INPUT"===e.tagName||"TEXTAREA"===e.tagName||"SELECT"===e.tagName||v(e)}function v(e){return!!e&&("false"!==e.contentEditable&&("true"===e.contentEditable||v(p(e))))}function m(e){return e.nextElementSibling||function(){var n=e;do{n=n.nextSibling}while(n&&1!==n.nodeType);return n}()}function g(e){return e.targetTouches&&e.targetTouches.length?e.targetTouches[0]:e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e}function y(e,n){var t=g(n),i={pageX:"clientX",pageY:"clientY"};return e in i&&!(e in t)&&i[e]in t&&(e=i[e]),t[e]}var w=t(45),b=t(46),T=t(49),C=document,E=C.documentElement;e.exports=i}).call(n,t(5))},,function(e,n){},,,,,,,function(e,n){e.exports=function(e,n){return Array.prototype.slice.call(e,n)}},,,,,function(e,n,t){"use strict";function i(e,n){console.log("open",n.path),V=n.path||"/",q.empty(),T(),y(V)}function o(e){console.log("close")}function r(e,n){console.log("reopen",n.path),h(n.path||"/")}function a(e){e.on("dragenter",function(n){return null===e.data("path")||event.dataTransfer.types.indexOf("Files")<0?event.dataTransfer.dropEffect="none":(event.dataTransfer.dropEffect="copy",e.addClass("accept")),!1}),e.on("dragleave",function(n){return e.removeClass("accept"),!1}),e.on("dragover",function(n){return null===e.data("path")||event.dataTransfer.types.indexOf("Files")<0?event.dataTransfer.dropEffect="none":(event.dataTransfer.dropEffect="copy",e.addClass("accept")),!1}),e.on("drop",function(n){if(null===e.data("path"))return!1;e.removeClass("accept");for(var t=event.dataTransfer.files,i=new FormData,o=0;o<t.length;o++)i.append("file"+o,t[o]),s(e,{name:t[o].name,path:e.data("path")+"/"+t[o].name,type:"uploading"});var r=new XMLHttpRequest,a=function(){void 0!==r.responseJSON?alert(r.responseJSON.message):alert(r.responseText),H.shake(_("main > .frame"))};return r.open("POST",BLOGSTEP.PATH+"/api/upload?path="+e.data("path")),BLOGSTEP.addToken(r),r.send(i),r.onreadystatechange=function(){if(4===this.readyState){200!==this.status&&a();var n=e.data("path");e.data("path",null),b(e,n)}},!1})}function l(e,n){Q[n.path]={link:e,data:n},e.hasClass("file-directory")||e.dblclick(function(){if(!ie)return BLOGSTEP.open(_(this).data("path")),!1}),H.onLongPress(e[0],function(t){return t.preventDefault(),t.stopPropagation(),e.hasClass("active")?m(n.path):g(n.path),ie=!0,!1}),e.on("dragstart",function(e){var t="application/octet-stream:"+encodeURIComponent(n.name)+":"+location.origin+BLOGSTEP.PATH+"/api/download?path="+encodeURIComponent(n.path);e.originalEvent.dataTransfer.setData("DownloadURL",t)}),e.click(function(t){if(t.ctrlKey||ie)e.hasClass("active")?m(n.path):g(n.path);else if(t.shiftKey){var i=ee[ee.length-1],o=ne;if(e.hasClass("active")||g(n.path),ne!==o&&(i=ee[0]),Q.hasOwnProperty(i)){var r=Q[i].link;if(r.parent().is(e.parent())){var a=!1;e.parent().children().each(function(){var n=_(this);(n.is(e)||n.is(r))&&(a=!a),a&&!n.hasClass("active")&&g(n.data("path"))})}}}else h(n.path);return!1})}function c(e){var n=_('<a class="file">');return n.text(e.name),W.filter(function(n){return n===e.path}).length>0&&n.addClass("active"),e.read||n.addClass("locked"),n.attr("draggable",!0),n.attr("data-path",e.path),n.attr("href",BLOGSTEP.PATH+"/app/files?path="+e.path),n.addClass("file-"+e.type),l(n,e),n}function s(e,n){var t=c(n);return e.children(".files-list").append(t),t}function u(e){return e<1024?e+" B":e<1048576?parseFloat(e/1024).toFixed(1)+" KiB":e<1073741824?parseFloat(e/1048576).toFixed(1)+" MiB":e<1099511627776?parseFloat(e/1073741824).toFixed(1)+" GiB":e<0x4000000000000?parseFloat(e/1099511627776).toFixed(1)+" TiB":void 0}function f(e,n){Q.hasOwnProperty(n.path)||c(n);var t,i=_('<div class="file-info">'),o="Edit";switch(n.type.toLowerCase()){case"jpeg":case"jpg":case"png":case"ico":t=_('<img class="file-thumbnail">'),t.attr("src",BLOGSTEP.PATH+"/api/thumbnail?path="+encodeURIComponent(n.path)+"&width=200&height=200"),o="View";break;case"webm":o="Play";default:t=_('<span class="file">'),t.addClass("file-"+n.type),n.read||t.addClass("locked")}var r=_('<span class="file-name">');r.text(n.name);var a=_('<span class="file-size">');a.text(u(n.size));var l=_('<span class="file-modified">');l.text(new Date(1e3*n.modified).toString());var s=_('<span class="file-access">');if(s.text(n.modeString+" "+n.owner+":"+n.group+" ("+(n.read?"r":"-")+(n.write?"w":"-")+")"),i.append(t).append(r).append(a).append(l).append(s),n.read){_("<button>"+o+"</button>").click(function(){BLOGSTEP.open(n.path)}).appendTo(i)}e.children(".files-list").replaceWith(i)}function d(){W.length<=1||(W.pop(),V=W[W.length-1],ie=!1,W.length>1?(ee=[V],Y.enableGroup("selection"),Y.enableGroup("selection-single")):(ee=[],Y.disableGroup("selection"),Y.disableGroup("selection-single")),ne=W[W.length-1],w(),Y.setArgs({path:V}))}function p(){z.data("path",null),b(z,V)}function h(e){e!==V&&(y(e),Q.hasOwnProperty(e)&&Q[e].link.addClass("active"),Y.setArgs({path:V}))}function v(){if(1===ee.length&&ee[0]===ne)return void d();ee.forEach(function(e){Q[e].link.removeClass("active")}),ee=[],ie=!1,Y.disableGroup("selection"),Y.disableGroup("selection-single"),h(ne)}function m(e){var n=ee.indexOf(e);if(n>=0)if(ee.splice(n,1),console.log(ee),Q[e].link.removeClass("active"),0===ee.length)ie=!1,z.next().children(".file-info").empty(),h(ne);else{1===ee.length?Y.enableGroup("selection-single"):Y.disableGroup("selection-single");var t=z.next().children(".file-info");if(t.length>0){var i=t.children(".file-name");i.text(ee.length+" files")}}}function g(e){var n=J.dirName(e);if(n!==ne){if(ee.length>1)return;ne=n;for(var t=[],i=0;i<W.length;i++)if(W[i]===ne&&i+1<W.length){t.push(W[i+1]);break}y(n),ee=t,ee.length>0&&Q[ee[0]].link.addClass("active")}else 1===ee.length&&J.dirName(ee[0])!==ne&&(ee=[]);Y.enableGroup("selection"),ee.push(e),Y.disableGroup("dir"),1===ee.length?Y.enableGroup("selection-single"):Y.disableGroup("selection-single"),console.log(ee,ne),Q[e].link.addClass("active");var o=z.next().children(".file-info");if(o.length>0){o.empty();var r=_('<span class="file file-multiple">'),a=_('<span class="file-name">');a.text(ee.length+" files"),o.append(r).append(a)}else if(z.next().length>0){z.next().empty();var o=_('<div class="file-info">');o.appendTo(z.next());var r=_('<span class="file file-multiple">'),a=_('<span class="file-name">');a.text(ee.length+" files"),o.append(r).append(a)}}function y(e){var n=e.split("/"),e="";W=["/"];for(var t=0;t<n.length;t++)".."===n[t]?W.length>1&&(W.pop(),e=W[W.length-1]):""!==n[t]&&"."!==n[t]&&(e+="/"+n[t],W.push(e));V=W[W.length-1],ie=!1,W.length>1?(ee=[e],Y.enableGroup("selection"),Y.enableGroup("selection-single")):(ee=[],Y.disableGroup("selection"),Y.disableGroup("selection-single")),ne=W[W.length-1],w()}function w(){console.log("stack",W,"cwd",V,"stackOffset",te);var e=q.children(),n=e.length;if(te=Math.max(0,W.length-n),q.find("a").removeClass("active"),z.children(".filter").remove(),z=e.eq(Math.min(n,W.length)-1),W.length>=Z)for(var t=0;t<n;t++){var i=e.eq(t);te+t<W.length?b(i,W[te+t]):b(i,null)}else for(var t=n-1;t>=0;t--){var i=e.eq(t);te+t<W.length?b(i,W[te+t]):b(i,null)}Z=W.length,Y.setTitle(V+" – Files")}function b(e,n){if(e.data("path")!==n||null===n){var t=e.children(".files-list");0===t.length&&(e.empty(),t=_('<div class="files-list">'),e.append(t)),t.empty(),e.data("path",null),e.removeClass("readonly"),e.next().data("path")===n?(e.data("path",n),e.next().children(".files-list").children().appendTo(t),e.next().hasClass("readonly")&&e.addClass("readonly")):e.prev().data("path")===n?(e.data("path",n),e.prev().children(".files-list").children().appendTo(t),e.prev().hasClass("readonly")&&e.addClass("readonly")):null!==n&&(e.addClass("loading"),BLOGSTEP.get("list-files",{path:n}).done(function(i){if(e.removeClass("loading"),t.empty(),e.removeClass("readonly"),e.data("path",n),i.write||e.addClass("readonly"),Q.hasOwnProperty(i.path)||c(i),"directory"===i.type&&void 0!==i.files){for(var o=0;o<i.files.length;o++){var r=i.files[o];s(e,r)}e.is(z)&&Y.enableGroup("dir")}else f(e,i),e.is(z)&&Y.disableGroup("dir");e.trigger("loaded")}))}Q.hasOwnProperty(n)&&(Q[n].link.addClass("active"),e.is(z)&&("directory"===Q[n].data.type?Y.enableGroup("dir"):Y.disableGroup("dir")))}function T(){var e=q.children().length,n=Math.max(1,Math.floor(q.width()/200));if(n>e)for(var t=n-e,i=0;i<t;i++){var o=_('<div class="files-panel">');o.append('<div class="files-list">'),o.appendTo(q),a(o)}else{if(!(n<e))return!1;for(var r=e-n,i=0;i<r;i++)q.children().last().remove()}return q.children().css("width",100/n+"%"),!0}function C(e){var n=!0;e===e.toLowerCase()&&(n=!1);var t=null;return z.find(".file").each(function(){var i=_(this).text();if(n||(i=i.toLowerCase()),i.slice(0,e.length)===e)return t=_(this),!1}),t}function E(){var e=z.children(".filter");if(q.find(".match").removeClass("match"),e.length>0)if(""===e.val())e.remove();else{var n=C(e.val());null!==n&&n.addClass("match")}}function x(e){if(_("input:focus").length>0)return!0;if(e.ctrlKey||e.altKey||e.metaKey)return!0;var n=z.children(".filter");return 1!==e.key.length||(0!==n.length||(e.preventDefault(),_('<input type="text" class="filter">').val(e.key).appendTo(z).focus().keydown(function(e){if(!(e.ctrlKey||e.shiftKey||e.altKey||e.metaKey)){if("Escape"===e.key)return _(this).remove(),E(),!1;if("Enter"===e.key){var n=z.find(".match");return n.length>0&&(_(this).remove(),n.removeClass("match"),n.click()),!1}}}).keyup(E).blur(function(){_(this).remove(),E()}),E(),!1))}function S(){history.back()}function k(){history.go(1)}function O(){h("/")}function L(){Y.prompt("New folder","Enter the new name:").done(function(e){if(null!==e){if(""===e)return void Y.alert("New folder","Invalid name");var n;n="/"===V?V+e:V+"/"+e,BLOGSTEP.post("make-dir",{path:n}).done(function(e){s(z,e),h(n)})}})}function P(){Y.prompt("New file","Enter the new name:").done(function(e){if(null!==e){if(""===e)return void Y.alert("New file","Invalid name");var n;n="/"===V?V+e:V+"/"+e,BLOGSTEP.post("make-file",{path:n}).done(function(e){s(z,e),h(n)})}})}function A(){var e=_('<input type="file" />').appendTo(_("body")),n=z;e.hide(),e.click(),e.change(function(){for(var t=e[0].files,i=new FormData,o=0;o<t.length;o++)i.append("file"+o,t[o]),s(n,{name:t[o].name,path:n.data("path")+"/"+t[o].name,type:"uploading"});var r=new XMLHttpRequest,a=function(){void 0!==r.responseJSON?alert(r.responseJSON.message):alert(r.responseText),H.shake(_("main > .frame"))};return r.open("POST",BLOGSTEP.PATH+"/api/upload?path="+encodeURIComponent(n.data("path"))),BLOGSTEP.addToken(r),r.onreadystatechange=function(){if(4===this.readyState){200!==this.status&&a();var t=n.data("path");n.data("path",null),b(n,t),e.remove()}},r.send(i),!1})}function G(){BLOGSTEP.run("terminal",{path:V})}function I(){if(!(W.length<=1)){if(1!==ee.length)return void alert("Cannot rename multiple files");var e=ee[0];Y.prompt("Rename","Enter the new name:",Q[e].data.name).done(function(n){if(null!==n){if(""===n)return void Y.alert("Rename","Invalid name");var t=J.convert(n,J.dirName(e));BLOGSTEP.post("move",{path:e,destination:t}).done(function(e){h(t),p()})}})}}function B(){var e,n={};if(1===ee.length){e='Permanently delete "'+Q[ee[0]].data.name+'"?',n.path=ee[0]}else e="Permanently delete the "+ee.length+" selected files?",n.paths=ee;Y.confirm("Files",e,["Delete","Cancel"],"Delete").done(function(e){"Delete"===e&&BLOGSTEP.post("delete",n).done(function(e){v(),p()})})}function N(){if(1===ee.length){var e=Q[ee[0]].data;location.href=BLOGSTEP.PATH+"/api/download/"+encodeURIComponent(e.name)+"?force&path="+encodeURIComponent(e.path)}else for(var n=0;n<ee.length;n++){var e=Q[ee[n]].data,t=_("<iframe>");t.hide(),t.attr("src",BLOGSTEP.PATH+"/api/download/"+encodeURIComponent(e.name)+"?force&path="+encodeURIComponent(e.path)),t.on("load",function(){console.log("download finished"),t.remove()}),t.appendTo(_("body"))}}function K(){if(1===ee.length)Q[ee[0]].link.clone().removeClass("active").appendTo($);else{var e=ee,n=_('<a class="file file-multiple">');n.text(ee.length+" files"),n.data("paths",e),n.appendTo($)}v()}function R(){if(1===ee.length)Q[ee[0]].link.clone().removeClass("active").addClass("duplicate").appendTo($);else{var e=ee,n=_('<a class="file file-multiple duplicate">');n.text(ee.length+" files"),n.data("paths",e),n.appendTo($)}v()}function F(){if($.children().length>0){var e=$.children().last(),n=e.hasClass("duplicate"),t={},i=[];if(void 0!==e.data("paths"))t.paths={},e.data("paths").forEach(function(e){t.paths[e]=J.convert(Q[e].data.name,V),i.push(Q[e])});else{t.path=e.data("path");var o=Q[t.path];t.destination=J.convert(o.data.name,V),i.push(o)}BLOGSTEP.post(n?"copy":"move",t).done(function(t){e.remove(),n||i.forEach(function(e){e.link.remove()}),p()})}}function D(){z.find(".file").each(function(){g(_(this).data("path"))})}function M(){var e=z.find(".file:focus");if(e.length>0){var n=e.prev();n.length>0&&n.focus()}else z.find(".file").last().focus()}function j(){var e=z.find(".file:focus");if(e.length>0){var n=e.next();n.length>0&&n.focus()}else z.find(".file").first().focus()}function U(){var e=z.find(".file:focus");e.length>0&&(h(e.data("path")),z.one("loaded",function(){_(this).find(".file").first().focus()}))}function X(){if(W.length>1){var e=V;d(),Q[e].link.focus()}}var _=t(0),H=t(3),J=t(2);t(14);t(16);var Y=null,q=null,$=null,z=null,V=null,W=[],Z=0,Q={},ee=[],ne="/",te=0,ie=!1;BLOGSTEP.init("files",function(e){Y=e,e.defineAction("back",S,["nav"]),e.defineAction("foreward",k,["nav"]),e.defineAction("up",d,["nav"]),e.defineAction("home",O,["nav"]),e.defineAction("new-folder",L,["dir"]),e.defineAction("new-file",P,["dir"]),e.defineAction("upload",A,["dir"]),e.defineAction("terminal",G,["selection-single"]),e.defineAction("rename",I,["selection-single"]),e.defineAction("trash",B,["selection"]),e.defineAction("download",N,["selection"]),e.defineAction("cut",K,["selection"]),e.defineAction("copy",R,["selection"]),e.defineAction("paste",F,["dir"]),e.defineAction("select-all",D,["dir"]),e.defineAction("remove-selection",function(){1===ee.length&&ee[0]===ne||v()},["dir"]),e.defineAction("focus-prev",M,["nav"]),e.defineAction("focus-next",j,["nav"]),e.defineAction("enter",U,["nav"]),e.defineAction("exit",X,["nav"]),e.bindKey("F2","rename"),e.bindKey("C-C","copy"),e.bindKey("C-X","cut"),e.bindKey("C-V","paste"),e.bindKey("Delete","trash"),e.bindKey("C-A","select-all"),e.bindKey("Escape","remove-selection"),e.bindKey("C-H","exit"),e.bindKey("C-K","focus-prev"),e.bindKey("C-J","focus-next"),e.bindKey("C-L","enter"),e.bindKey("ArrowLeft","exit"),e.bindKey("ArrowUp","focus-prev"),e.bindKey("ArrowDown","focus-next"),e.bindKey("ArrowRight","enter"),e.disableGroup("selection"),e.disableGroup("selection-single"),e.disableGroup("dir"),e.onOpen=i,e.onClose=o,e.onReopen=r,e.onKeydown=x,e.onResize=function(){T()&&w()};var n=e.addMenu("Files");n.addItem("New folder","new-folder"),n.addItem("New file","new-file"),n.addItem("Download","download"),q=e.frame.find(".files-columns"),$=e.frame.find(".files-shelf > .files-grid"),z=q.children().first(),q.click(function(e){e.defaultPrevented||1===ee.length&&ee[0]===ne||v()})})},,,,,,,,,,,,,,,,function(e,n,t){"use strict";var i=t(57);e.exports=function(e,n,t){e&&i(function(){e.apply(t||null,n||[])})}},function(e,n,t){"use strict";var i=t(23),o=t(44);e.exports=function(e,n){var t=n||{},r={};return void 0===e&&(e={}),e.on=function(n,t){return r[n]?r[n].push(t):r[n]=[t],e},e.once=function(n,t){return t._once=!0,e.on(n,t),e},e.off=function(n,t){var i=arguments.length;if(1===i)delete r[n];else if(0===i)r={};else{var o=r[n];if(!o)return e;o.splice(o.indexOf(t),1)}return e},e.emit=function(){var n=i(arguments);return e.emitterSnapshot(n.shift()).apply(this,n)},e.emitterSnapshot=function(n){var a=(r[n]||[]).slice(0);return function(){var r=i(arguments),l=this||e;if("error"===n&&!1!==t.throws&&!a.length)throw 1===r.length?r[0]:r;return a.forEach(function(i){t.async?o(i,r,l):i.apply(l,r),i._once&&e.off(n,i)}),e}},e}},function(e,n,t){"use strict";(function(n){function i(e,n,t,i){return e.addEventListener(n,t,i)}function o(e,n,t){return e.attachEvent("on"+n,s(e,n,t))}function r(e,n,t,i){return e.removeEventListener(n,t,i)}function a(e,n,t){var i=u(e,n,t);if(i)return e.detachEvent("on"+n,i)}function l(e,n,t){var i=-1===p.indexOf(n)?function(){return new d(n,{detail:t})}():function(){var e;return h.createEvent?(e=h.createEvent("Event"),e.initEvent(n,!0,!0)):h.createEventObject&&(e=h.createEventObject()),e}();e.dispatchEvent?e.dispatchEvent(i):e.fireEvent("on"+n,i)}function c(e,t,i){return function(t){var o=t||n.event;o.target=o.target||o.srcElement,o.preventDefault=o.preventDefault||function(){o.returnValue=!1},o.stopPropagation=o.stopPropagation||function(){o.cancelBubble=!0},o.which=o.which||o.keyCode,i.call(e,o)}}function s(e,n,t){var i=u(e,n,t)||c(e,n,t);return g.push({wrapper:i,element:e,type:n,fn:t}),i}function u(e,n,t){var i=f(e,n,t);if(i){var o=g[i].wrapper;return g.splice(i,1),o}}function f(e,n,t){var i,o;for(i=0;i<g.length;i++)if(o=g[i],o.element===e&&o.type===n&&o.fn===t)return i}var d=t(48),p=t(47),h=n.document,v=i,m=r,g=[];n.addEventListener||(v=o,m=a),e.exports={add:v,remove:m,fabricate:l}}).call(n,t(5))},function(e,n,t){"use strict";(function(n){var t=[],i="",o=/^on/;for(i in n)o.test(i)&&t.push(i.slice(2));e.exports=t}).call(n,t(5))},function(e,n,t){(function(n){var t=n.CustomEvent;e.exports=function(){try{var e=new t("cat",{detail:{foo:"bar"}});return"cat"===e.type&&"bar"===e.detail.foo}catch(e){}return!1}()?t:"function"==typeof document.createEvent?function(e,n){var t=document.createEvent("CustomEvent");return n?t.initCustomEvent(e,n.bubbles,n.cancelable,n.detail):t.initCustomEvent(e,!1,!1,void 0),t}:function(e,n){var t=document.createEventObject();return t.type=e,n?(t.bubbles=Boolean(n.bubbles),t.cancelable=Boolean(n.cancelable),t.detail=n.detail):(t.bubbles=!1,t.cancelable=!1,t.detail=void 0),t}}).call(n,t(5))},function(e,n,t){"use strict";function i(e){var n=a[e];return n?n.lastIndex=0:a[e]=n=new RegExp(l+e+c,"g"),n}function o(e,n){var t=e.className;t.length?i(n).test(t)||(e.className+=" "+n):e.className=n}function r(e,n){e.className=e.className.replace(i(n)," ").trim()}var a={},l="(?:^|\\s)",c="(?:\\s|$)";e.exports={add:o,rm:r}},,,,,function(e,n){function t(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function o(e){if(u===setTimeout)return setTimeout(e,0);if((u===t||!u)&&setTimeout)return u=setTimeout,setTimeout(e,0);try{return u(e,0)}catch(n){try{return u.call(null,e,0)}catch(n){return u.call(this,e,0)}}}function r(e){if(f===clearTimeout)return clearTimeout(e);if((f===i||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(e);try{return f(e)}catch(n){try{return f.call(null,e)}catch(n){return f.call(this,e)}}}function a(){v&&p&&(v=!1,p.length?h=p.concat(h):m=-1,h.length&&l())}function l(){if(!v){var e=o(a);v=!0;for(var n=h.length;n;){for(p=h,h=[];++m<n;)p&&p[m].run();m=-1,n=h.length}p=null,v=!1,r(e)}}function c(e,n){this.fun=e,this.array=n}function s(){}var u,f,d=e.exports={};!function(){try{u="function"==typeof setTimeout?setTimeout:t}catch(e){u=t}try{f="function"==typeof clearTimeout?clearTimeout:i}catch(e){f=i}}();var p,h=[],v=!1,m=-1;d.nextTick=function(e){var n=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)n[t-1]=arguments[t];h.push(new c(e,n)),1!==h.length||v||o(l)},c.prototype.run=function(){this.fun.apply(null,this.array)},d.title="browser",d.browser=!0,d.env={},d.argv=[],d.version="",d.versions={},d.on=s,d.addListener=s,d.once=s,d.off=s,d.removeListener=s,d.removeAllListeners=s,d.emit=s,d.prependListener=s,d.prependOnceListener=s,d.listeners=function(e){return[]},d.binding=function(e){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(e){throw new Error("process.chdir is not supported")},d.umask=function(){return 0}},function(e,n,t){(function(e,n){!function(e,t){"use strict";function i(e){"function"!=typeof e&&(e=new Function(""+e));for(var n=new Array(arguments.length-1),t=0;t<n.length;t++)n[t]=arguments[t+1];var i={callback:e,args:n};return s[c]=i,l(c),c++}function o(e){delete s[e]}function r(e){var n=e.callback,i=e.args;switch(i.length){case 0:n();break;case 1:n(i[0]);break;case 2:n(i[0],i[1]);break;case 3:n(i[0],i[1],i[2]);break;default:n.apply(t,i)}}function a(e){if(u)setTimeout(a,0,e);else{var n=s[e];if(n){u=!0;try{r(n)}finally{o(e),u=!1}}}}if(!e.setImmediate){var l,c=1,s={},u=!1,f=e.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(e);d=d&&d.setTimeout?d:e,"[object process]"==={}.toString.call(e.process)?function(){l=function(e){n.nextTick(function(){a(e)})}}():function(){if(e.postMessage&&!e.importScripts){var n=!0,t=e.onmessage;return e.onmessage=function(){n=!1},e.postMessage("","*"),e.onmessage=t,n}}()?function(){var n="setImmediate$"+Math.random()+"$",t=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(n)&&a(+t.data.slice(n.length))};e.addEventListener?e.addEventListener("message",t,!1):e.attachEvent("onmessage",t),l=function(t){e.postMessage(n+t,"*")}}():e.MessageChannel?function(){var e=new MessageChannel;e.port1.onmessage=function(e){a(e.data)},l=function(n){e.port2.postMessage(n)}}():f&&"onreadystatechange"in f.createElement("script")?function(){var e=f.documentElement;l=function(n){var t=f.createElement("script");t.onreadystatechange=function(){a(n),t.onreadystatechange=null,e.removeChild(t),t=null},e.appendChild(t)}}():function(){l=function(e){setTimeout(a,0,e)}}(),d.setImmediate=i,d.clearImmediate=o}}("undefined"==typeof self?void 0===e?this:e:self)}).call(n,t(5),t(54))},,function(e,n,t){(function(n){var t,i="function"==typeof n;t=i?function(e){n(e)}:function(e){setTimeout(e,0)},e.exports=t}).call(n,t(58).setImmediate)},function(e,n,t){function i(e,n){this._id=e,this._clearFn=n}var o=Function.prototype.apply;n.setTimeout=function(){return new i(o.call(setTimeout,window,arguments),clearTimeout)},n.setInterval=function(){return new i(o.call(setInterval,window,arguments),clearInterval)},n.clearTimeout=n.clearInterval=function(e){e&&e.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(window,this._id)},n.enroll=function(e,n){clearTimeout(e._idleTimeoutId),e._idleTimeout=n},n.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},n._unrefActive=n.active=function(e){clearTimeout(e._idleTimeoutId);var n=e._idleTimeout;n>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},n))},t(55),n.setImmediate=setImmediate,n.clearImmediate=clearImmediate}],[28]);
//# sourceMappingURL=files.js.map