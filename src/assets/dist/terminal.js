webpackJsonp([6],{1:function(e,t,n){function o(e,t){for(var n=e.toLowerCase().split(/-|\+/),o={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],i=0;i<n.length-1;i++)switch(n[i]){case"c":o.ctrlKey="c-";break;case"a":o.altKey="a-";break;case"s":o.shiftKey="s-"}e=o.ctrlKey+o.altKey+o.shiftKey+e,p[e]=t}function i(e,t,n){u[e]=t,f('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1}),void 0!==n&&n.forEach(function(t){d.hasOwnProperty(t)||(d[t]=[]),d[t].push(e)})}function a(e){u[e]()}function r(e){d.hasOwnProperty(e)&&d[e].forEach(function(e){c(e)})}function s(e){d.hasOwnProperty(e)&&d[e].forEach(function(e){l(e)})}function c(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(c)}function l(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(l)}var f=n(0);t.define=i,t.enable=c,t.disable=l,t.enableGroup=r,t.disableGroup=s,t.activate=a,t.bind=o;var u={},d={},p={};f(window).keydown(function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),e.metaKey&&(t+="m-"),t+=e.key.toLowerCase(),p.hasOwnProperty(t)?(a(p[t]),!1):void 0}})},2:function(e,t,n){var o=n(0),i=n(4);o.ajaxSetup({headers:{"X-Csrf-Token":i.get("csrf_token")}}),t.shake=function(e,t){t=void 0===t?10:t;var n=2*t;return o(e).width(o(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){o(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,o=function(e){n=!0},i=function(e){n=!1};e.addEventListener("touchstart",o),e.addEventListener("touchend",i),e.addEventListener("touchcancel",i),e.addEventListener("touchmove",i),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var o=e.children[0],i=e.children[1];t=Math.floor(t),e.className=t>=100?"progress success":"progress active",o.style.width=t+"%",o.innerText=t+"%",void 0!==n&&(i.innerText=n)},t.handleLogin=function(e){var n=o("body").data("path").replace(/\/$/,"");o("#login").find("input").prop("disabled",!1),o("#login-frame").show(),o("#login").submit(function(){return o(this).find("input").prop("disabled",!0),o.ajax({url:n,method:"post",data:{username:o("#login-username").val(),password:o("#login-password").val(),remember:o("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){o("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){o(this).hide().css({overflow:"",whiteSpace:"",width:""}),o("#login").off("submit"),o("#login-password").val(""),e()})},error:function(e){o("#login").find("input").prop("disabled",!1),t.shake(o("#login-frame")),o("#login-username").select(),o("#login-password").val("")},global:!1}),!1})},t.handleError=function(e,n,a,r){var s=i.get("csrf_token");return a.headers["X-Csrf-Token"]!==s?(o.ajaxSetup({headers:{"X-Csrf-Token":s}}),a.headers["X-Csrf-Token"]=s,void o.ajax(a)):401===n.status?(o("#login-overlay").show(),""===o("#login-username").val()?o("#login-username").focus():o("#login-password").focus(),void t.handleLogin(function(){o("#login-overlay").hide(),o.ajax(a)})):(void 0!==n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(o("main > .frame")),void console.log(e,n,a,r))}},4:function(e,t,n){var o,i;!function(a){var r=!1;if(o=a,void 0!==(i="function"==typeof o?o.call(t,n,t,e):o)&&(e.exports=i),r=!0,e.exports=a(),r=!0,!r){var s=window.Cookies,c=window.Cookies=a();c.noConflict=function(){return window.Cookies=s,c}}}(function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var o in n)t[o]=n[o]}return t}function t(n){function o(t,i,a){var r;if("undefined"!=typeof document){if(arguments.length>1){if(a=e({path:"/"},o.defaults,a),"number"==typeof a.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*a.expires),a.expires=s}a.expires=a.expires?a.expires.toUTCString():"";try{r=JSON.stringify(i),/^[\{\[]/.test(r)&&(i=r)}catch(e){}i=n.write?n.write(i,t):encodeURIComponent(String(i)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)),t=t.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),t=t.replace(/[\(\)]/g,escape);var c="";for(var l in a)a[l]&&(c+="; "+l,!0!==a[l]&&(c+="="+a[l]));return document.cookie=t+"="+i+c}t||(r={});for(var f=document.cookie?document.cookie.split("; "):[],u=/(%[0-9A-Z]{2})+/g,d=0;d<f.length;d++){var p=f[d].split("="),h=p.slice(1).join("=");this.json||'"'!==h.charAt(0)||(h=h.slice(1,-1));try{var v=p[0].replace(u,decodeURIComponent);if(h=n.read?n.read(h,v):n(h,v)||h.replace(u,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch(e){}if(t===v){r=h;break}t||(r[v]=h)}catch(e){}}return r}}return o.set=o,o.get=function(e){return o.call(o,e)},o.getJSON=function(){return o.apply({json:!0},[].slice.call(arguments))},o.defaults={},o.remove=function(t,n){o(t,"",e(n,{expires:-1}))},o.withConverter=t,o}return t(function(){})})},57:function(e,t,n){function o(e){e=e.trim(),e.startsWith("~")?e=y.home+e.substr(1):e.startsWith("/")||(e=w+"/"+e);for(var t=e.split("/"),n=[],o=0;o<t.length;o++)".."===t[o]?n.length>=1&&n.pop():""!==t[o]&&"."!==t[o]&&n.push(t[o]);return"/"+n.join("/")}function i(){p.val(h),p[0].scrollTop=p[0].scrollHeight}function a(e){h+=e,i()}function r(e){a(e+"\n")}function s(e){p.attr("readonly",!1).focus(),m=e}function c(e,t,n){t.request_token=b,f.ajax({url:k+"/api/"+e,method:"post",data:t,success:n,error:function(t){d.shake(f(".frame")),r(404===t.status?t.status+" "+e+": command not found":void 0!==t.responseJSON?t.status+"("+t.responseJSON.code+") "+t.responseJSON.message:t.status+" "+t.statusText+": "+t.responseText)},complete:l})}function l(){a(y.username+" "+w+"> "),g=-1,s(function(e){var t=e.trim().match(/^([^ ]+)(?: (.*))?/);if(null===t)r("Invalid command"),l();else{var n=t[1];if(S.hasOwnProperty(n))S[n](void 0===t[2]?"":t[2]);else try{c(n,void 0===t[2]?{}:JSON.parse(t[2]),function(e){r(JSON.stringify(e,null,"  "))})}catch(e){r(e),l()}}})}var f=n(0),u=n(1),d=n(2),p=f("#terminal"),h="",v=[],g=-1,m=null,y={},w=p.data("path"),k=f("body").data("path").replace(/\/$/,""),b=p.data("token"),x=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];u.define("close",function(){location.href=k+"/files?path="+w});var S={clear:function(e){h="",i(),l()},cd:function(e){var t=o(e);c("list-files?path="+t,{},function(e){"directory"===e.type?w=t:r("not a directory")})},pwd:function(e){r(w),l()},ls:function(e){c("list-files?path="+w,{},function(e){void 0!==e.files&&e.files.forEach(function(e){var t=e.modeString;t+=" \t"+e.owner,t+=" \t"+e.group;var n=new Date(1e3*e.modified);t+=" \t"+n.getFullYear(),t+=" "+x[n.getMonth()],t+=" "+n.getDate(),t+=" \t"+e.name,"directory"===e.type&&(t+="/"),r(t)})})},touch:function(e){c("make-file",{path:o(e)},function(e){})},mkdir:function(e){c("make-dir",{path:o(e)},function(e){})},rm:function(e){c("delete",{path:o(e)},function(e){})},cp:function(e){e=e.split(" "),c("copy",{path:o(e[0]),destination:o(e[1])},function(e){})},mv:function(e){e=e.split(" "),c("move",{path:o(e[0]),destination:o(e[1])},function(e){})},cat:function(e){c("download?path="+o(e),{},function(e){r(e)})},exit:function(e){location.href=k+"/files?path="+o(e)},open:function(e){location.href=k+"/open?path="+o(e)},edit:function(e){location.href=k+"/edit?path="+o(e)},cedit:function(e){location.href=k+"/code-edit?path="+o(e)}};p.attr("readonly",!0),p.keydown(function(e){if("Enter"!==e.key||e.shiftKey){if("ArrowUp"==e.key)null!==m&&v.length>0&&(g<0?g=v.length-1:g>0&&g--,p.val(h+v[g])),e.preventDefault(),e.stopPropagation();else if("ArrowDown"==e.key)null!==m&&v.length>0&&g>=0&&(g<v.length-1?(g++,p.val(h+v[g])):(g=-1,p.val(h))),e.preventDefault(),e.stopPropagation();else if("ArrowLeft"==e.key||"Backspace"==e.key){var t=p[0].selectionStart,n=p[0].selectionEnd;t===n&&t<=h.length&&(e.preventDefault(),e.stopPropagation())}}else{if(null!==m){p.attr("readonly",!0).blur();var o=p.val().substr(h.length);v.push(o),h+=o+"\n",i();var a=m;m=null,a(o)}e.preventDefault(),e.stopPropagation()}}),p.click(function(){var e=p[0].selectionStart;e===p[0].selectionEnd&&e<h.length&&(p[0].selectionStart=p.val().length)}),c("who-am-i",{},function(e){y=e})}},[57]);
//# sourceMappingURL=terminal.js.map