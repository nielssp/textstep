webpackJsonp([3],{1:function(e,n,t){function i(e,n){for(var t=e.toLowerCase().split(/-|\+/),i={ctrlKey:"",altKey:"",shiftKey:""},e=t[t.length-1],o=0;o<t.length-1;o++)switch(t[o]){case"c":i.ctrlKey="c-";break;case"a":i.altKey="a-";break;case"s":i.shiftKey="s-"}e=i.ctrlKey+i.altKey+i.shiftKey+e,p[e]=n}function o(e,n,t){l[e]=n,d('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),n(),!1}),void 0!==t&&t.forEach(function(n){f.hasOwnProperty(n)||(f[n]=[]),f[n].push(e)})}function r(e){l[e]()}function a(e){f.hasOwnProperty(e)&&f[e].forEach(function(e){c(e)})}function s(e){f.hasOwnProperty(e)&&f[e].forEach(function(e){u(e)})}function c(e){"string"==typeof e?d('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(c)}function u(e){"string"==typeof e?d('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(u)}var d=t(0);n.define=o,n.enable=c,n.disable=u,n.enableGroup=a,n.disableGroup=s,n.activate=r,n.bind=i;var l={},f={},p={};d(window).keydown(function(e){if(!e.defaultPrevented){var n="";return e.ctrlKey&&(n+="c-"),e.altKey&&(n+="a-"),e.shiftKey&&(n+="s-"),e.metaKey&&(n+="m-"),n+=e.key.toLowerCase(),p.hasOwnProperty(n)?(r(p[n]),!1):void 0}})},2:function(e,n,t){var i=t(0),o=t(4);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),n.shake=function(e,n){n=void 0===n?10:n;var t=2*n;return i(e).width(i(e).width()).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},n.onLongPress=function(e,n){var t=!1,i=function(e){t=!0},o=function(e){t=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(t)return n(e)})},n.setProgress=function(e,n,t){var i=e.children[0],o=e.children[1];n=Math.floor(n),e.className=n>=100?"progress success":"progress active",i.style.width=n+"%",i.innerText=n+"%",void 0!==t&&(o.innerText=t)},n.handleLogin=function(e){var t=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:t,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),n.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},n.handleError=function(e,t,r,a){var s=o.get("csrf_token");return r.headers["X-Csrf-Token"]!==s?(i.ajaxSetup({headers:{"X-Csrf-Token":s}}),r.headers["X-Csrf-Token"]=s,void i.ajax(r)):401===t.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void n.handleLogin(function(){i("#login-overlay").hide(),i.ajax(r)})):(void 0!==t.responseJSON?alert(t.responseJSON.message):alert(t.responseText),n.shake(i("main > .frame")),void console.log(e,t,r,a))}},4:function(e,n,t){var i,o;!function(r){var a=!1;if(i=r,void 0!==(o="function"==typeof i?i.call(n,t,n,e):i)&&(e.exports=o),a=!0,e.exports=r(),a=!0,!a){var s=window.Cookies,c=window.Cookies=r();c.noConflict=function(){return window.Cookies=s,c}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var t=arguments[e];for(var i in t)n[i]=t[i]}return n}function n(t){function i(n,o,r){var a;if("undefined"!=typeof document){if(arguments.length>1){if(r=e({path:"/"},i.defaults,r),"number"==typeof r.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*r.expires),r.expires=s}r.expires=r.expires?r.expires.toUTCString():"";try{a=JSON.stringify(o),/^[\{\[]/.test(a)&&(o=a)}catch(e){}o=t.write?t.write(o,n):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=encodeURIComponent(String(n)),n=n.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),n=n.replace(/[\(\)]/g,escape);var c="";for(var u in r)r[u]&&(c+="; "+u,!0!==r[u]&&(c+="="+r[u]));return document.cookie=n+"="+o+c}n||(a={});for(var d=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,f=0;f<d.length;f++){var p=d[f].split("="),h=p.slice(1).join("=");this.json||'"'!==h.charAt(0)||(h=h.slice(1,-1));try{var m=p[0].replace(l,decodeURIComponent);if(h=t.read?t.read(h,m):t(h,m)||h.replace(l,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch(e){}if(n===m){a=h;break}n||(a[m]=h)}catch(e){}}return a}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(n,t){i(n,"",e(t,{expires:-1}))},i.withConverter=n,i}return n(function(){})})},5:function(e,n){function t(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function i(e){return e.replace(/^.*\//,"")}function o(e,n){e=e.trim(),e.startsWith("/")||(e=n+"/"+e);for(var t=e.split("/"),i=[],o=0;o<t.length;o++)".."===t[o]?i.length>=1&&i.pop():""!==t[o]&&"."!==t[o]&&i.push(t[o]);return"/"+i.join("/")}n.dirName=t,n.fileName=i,n.convert=o},60:function(e,n,t){function i(e){this.name=e,this.state="loading",this.frame=null,this.onInit=null,this.onSuspend=null,this.onResume=null,this.onClose=null}function o(e){s[e]=new i(e),r.ajax({url:BLOGSTEP.PATH+"/api/load",data:{name:e},method:"get",success:function(n){var t=r("<div></div>");t.html(n);var i=t.find('link[rel="stylesheet"]'),o=t.find("script[src]");s[e].frame=t.find(".frame"),s[e].state="loaded",r("head").append(i),r("main").append(s[e].frame),r("body").append(o)}})}var r=t(0),a=(t(1),t(2));t(5);r(document).ajaxError(a.handleError),window.BLOGSTEP={};var s={};i.prototype.init=function(){if("loaded"!==this.state)return void console.error("init: unexpected state",this.state,"app",this.name);this.state="initializing",null!==this.onInit&&this.onInit(this),this.state="running"},i.prototype.suspend=function(){if("running"!==this.state)return void console.error("suspend: unexpected state",this.state,"app",this.name);this.state="suspending",null!==this.onSuspend&&this.onSuspend(this),"suspending"===this.state&&(this.frame.hide(),this.state="suspended")},i.prototype.resume=function(){if("suspended"!==this.state)return void console.error("resume: unexpected state",this.state,"app",this.name);this.state="resuming",null!==this.onResume&&this.onResume(this),"resuming"===this.state&&(this.frame.show(),this.state="running")},BLOGSTEP.PATH=r("body").data("path").replace(/\/$/,""),BLOGSTEP.init=function(e,n){s[e].onInit=n,s[e].init()},BLOGSTEP.run=function(e){},BLOGSTEP.server={},BLOGSTEP.server.get=function(e,n,t){},r(document).ready(function(){r.ajax({url:BLOGSTEP.PATH+"/api/who-am-i",method:"get",success:function(e){r("#workspace-menu").show(),r("#workspace-menu .username").text(e.username),r("#login-username").val(e.username),r("#login-overlay").addClass("login-overlay-dark"),o("test")}})})}},[60]);
//# sourceMappingURL=workspace.js.map