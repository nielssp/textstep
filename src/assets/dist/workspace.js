webpackJsonp([3],{2:function(e,t,n){var i=n(0),o=n(4);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),t.shake=function(e,t){t=void 0===t?10:t;var n=2*t;return i(e).width(i(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,i=function(e){n=!0},o=function(e){n=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var i=e.children[0],o=e.children[1];t=Math.floor(t),e.className=t>=100?"progress success":"progress active",i.style.width=t+"%",i.innerText=t+"%",void 0!==n&&(o.innerText=n)},t.handleLogin=function(e){var n=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:n,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),t.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},t.handleError=function(e,n,r,s){var a=o.get("csrf_token");return r.headers["X-Csrf-Token"]!==a?(i.ajaxSetup({headers:{"X-Csrf-Token":a}}),r.headers["X-Csrf-Token"]=a,void i.ajax(r)):401===n.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void t.handleLogin(function(){i("#login-overlay").hide(),i.ajax(r)})):(void 0!==n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(i("main > .frame")),void console.log(e,n,r,s))}},4:function(e,t,n){var i,o;!function(r){var s=!1;if(i=r,void 0!==(o="function"==typeof i?i.call(t,n,t,e):i)&&(e.exports=o),s=!0,e.exports=r(),s=!0,!s){var a=window.Cookies,c=window.Cookies=r();c.noConflict=function(){return window.Cookies=a,c}}}(function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var i in n)t[i]=n[i]}return t}function t(n){function i(t,o,r){var s;if("undefined"!=typeof document){if(arguments.length>1){if(r=e({path:"/"},i.defaults,r),"number"==typeof r.expires){var a=new Date;a.setMilliseconds(a.getMilliseconds()+864e5*r.expires),r.expires=a}r.expires=r.expires?r.expires.toUTCString():"";try{s=JSON.stringify(o),/^[\{\[]/.test(s)&&(o=s)}catch(e){}o=n.write?n.write(o,t):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)),t=t.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),t=t.replace(/[\(\)]/g,escape);var c="";for(var u in r)r[u]&&(c+="; "+u,!0!==r[u]&&(c+="="+r[u]));return document.cookie=t+"="+o+c}t||(s={});for(var l=document.cookie?document.cookie.split("; "):[],d=/(%[0-9A-Z]{2})+/g,f=0;f<l.length;f++){var p=l[f].split("="),h=p.slice(1).join("=");this.json||'"'!==h.charAt(0)||(h=h.slice(1,-1));try{var m=p[0].replace(d,decodeURIComponent);if(h=n.read?n.read(h,m):n(h,m)||h.replace(d,decodeURIComponent),this.json)try{h=JSON.parse(h)}catch(e){}if(t===m){s=h;break}t||(s[m]=h)}catch(e){}}return s}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(t,n){i(t,"",e(n,{expires:-1}))},i.withConverter=t,i}return t(function(){})})},5:function(e,t){function n(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function i(e){return e.replace(/^.*\//,"")}function o(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var n=e.split("/"),i=[],o=0;o<n.length;o++)".."===n[o]?i.length>=1&&i.pop():""!==n[o]&&"."!==n[o]&&i.push(n[o]);return"/"+i.join("/")}t.dirName=n,t.fileName=i,t.convert=o},60:function(e,t,n){function i(e,t){this.app=e,this.title=t,this.frame=a("<div><header></header><nav><ul></ul></div>"),this.header=this.frame.find("header"),this.itemList=this.frame.find("ul"),this.header.text(t)}function o(e){this.name=e,this.state="loading",this.frame=null,this.actions={},this.actionGroups={},this.keyMap={},this.menus=[],this.onInit=null,this.onSuspend=null,this.onResume=null,this.onOpen=null,this.onFocus=null,this.onKeydown=null,this.onUnfocus=null,this.onClose=null,this.onResize=null}function r(e){l[e]=new o(e),BLOGSTEP.get("load",{name:e},"html").done(function(t){var n=a("<div></div>");n.html(t);var i=n.find('link[rel="stylesheet"]'),o=n.find("script[src]");l[e].frame=n.find(".frame"),l[e].state="loaded",a("head").append(i),a("main").append(l[e].frame),o.each(function(){a.getScript(a(this).attr("src"))})})}function s(e){a("#login").find("input").prop("disabled",!1),a("#login-frame").show(),a("#login").submit(function(){return a(this).find("input").prop("disabled",!0),BLOGSTEP.post("login",{username:a("#login-username").val(),password:a("#login-password").val(),remember:a("#login-remember").is(":checked")?{remember:"remember"}:null}).done(function(){a("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){a(this).hide().css({overflow:"",whiteSpace:"",width:""}),a("#login").off("submit"),a("#login-password").val(""),e()})}).fail(function(){a("#login").find("input").prop("disabled",!1),u.shake(a("#login-frame")),a("#login-username").select(),a("#login-password").val("")}),!1})}var a=n(0),c=n(4),u=n(2);n(5);window.BLOGSTEP={};var l={};i.prototype.addItem=function(e,t){var n=a("<button/>");n.text(e),"string"==typeof t&&n.attr("data-action",t);var i=this.app;n.click(function(){i.activate(t)});var o=a("<li>");o.append(n),this.itemList.append(o)},o.prototype.addMenu=function(e){var t=new i(this,e);return this.menus.push(t),t},o.prototype.init=function(){if("loaded"!==this.state)return void console.error("init: unexpected state",this.state,"app",this.name);this.state="initializing",null!==this.onInit&&this.onInit(this);for(var e=0;e<this.menus.length;e++)a("#menu").prepend(this.menus[e].frame);this.state="running"},o.prototype.keydown=function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),e.metaKey&&(t+="m-"),t+=e.key.toLowerCase(),this.keyMap.hasOwnProperty(t)?(e.preventDefault(),this.activate(this.keyMap[t]),!1):void 0}},o.prototype.bindKey=function(e,t){for(var n=e.toLowerCase().split(/-|\+/),i={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],o=0;o<n.length-1;o++)switch(n[o]){case"c":i.ctrlKey="c-";break;case"a":i.altKey="a-";break;case"s":i.shiftKey="s-"}e=i.ctrlKey+i.altKey+i.shiftKey+e,this.keyMap[e]=t},o.prototype.defineAction=function(e,t,n){this.actions[e]=t,this.frame.find('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1}),void 0!==n&&n.forEach(function(t){this.actionGroups.hasOwnProperty(t)||(this.actionGroups[t]=[]),this.actionGroups[t].push(e)})},o.prototype.activate=function(e){"string"==typeof e?this.actions[e]():e()},o.prototype.enableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(function(e){this.enableAction(e)})},o.prototype.disableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(function(e){this.disableAction(e)})},o.prototype.enableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!1),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!1)})):e.forEach(this.enableAction,this)},o.prototype.disableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!0),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!0)})):e.forEach(this.disableAction,this)},o.prototype.open=function(){},o.prototype.suspend=function(){if("running"!==this.state)return void console.error("suspend: unexpected state",this.state,"app",this.name);this.state="suspending",null!==this.onSuspend&&this.onSuspend(this),"suspending"===this.state&&(this.frame.hide(),this.state="suspended")},o.prototype.resume=function(){if("suspended"!==this.state)return void console.error("resume: unexpected state",this.state,"app",this.name);this.state="resuming",null!==this.onResume&&this.onResume(this),"resuming"===this.state&&(this.frame.show(),this.state="running")},BLOGSTEP.PATH=a("body").data("path").replace(/\/$/,""),BLOGSTEP.init=function(e,t){l[e].onInit=t,l[e].init()},BLOGSTEP.run=function(e,t){r(e)},BLOGSTEP.server={},BLOGSTEP.ajax=function(e,t,n,i){var o=a.Deferred(),r={url:e,method:t,data:n,dataType:i,headers:{"X-Csrf-Token":c.get("csrf_token")}},l=a.ajax(r);return l.done(o.resolve),l.fail(function(e,t,n){console.log(e,t,n);var i=c.get("csrf_token");if(r.headers["X-Csrf-Token"]!==i&&(r.headers["X-Csrf-Token"]=i,400===l.status))return void a.ajax(r).then(o.resolve,o.reject);if(401===l.status)return a("#login-overlay").show(),""===a("#login-username").val()?a("#login-username").focus():a("#login-password").focus(),void s(function(){a("#login-overlay").hide(),a.ajax(r).then(o.resolve,o.reject)});void 0!==l.responseJSON?alert(l.responseJSON.message):""!==l.responseText?alert(l.responseText):(alert("Internal error"),console.error(n)),u.shake(a("main > .frame"));var d=Array.prototype.slice.call(arguments);o.rejectWith(l,d)}),o.promise()},BLOGSTEP.get=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"get",t,n)},BLOGSTEP.post=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"post",t,n)},a.ajaxSetup({headers:{"X-Csrf-Token":c.get("csrf_token")}}),a(document).ready(function(){BLOGSTEP.get("who-am-i").done(function(e){a("#workspace-menu").show(),a("#workspace-menu .username").text(e.username),a('#workspace-menu [data-action="logout"]').click(function(){BLOGSTEP.post("logout").done(function(){location.reload()})}),a("#login-username").val(e.username),a("#login-overlay").addClass("login-overlay-dark"),r("test")})}),a(window).resize(function(){for(var e in l)l.hasOwnProperty(e)&&"running"===l[e].state&&null!==l[e].onResize&&l[e].onResize()}),a(window).keydown(function(e){for(var t in l)l.hasOwnProperty(t)&&"running"===l[t].state&&l[t].keydown(e)})}},[60]);
//# sourceMappingURL=workspace.js.map