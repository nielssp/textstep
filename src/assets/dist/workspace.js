webpackJsonp([4],{2:function(e,t,n){"use strict";function i(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function o(e){return e.replace(/^.*\//,"")}function s(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var n=e.split("/"),i=[],o=0;o<n.length;o++)".."===n[o]?i.length>=1&&i.pop():""!==n[o]&&"."!==n[o]&&i.push(n[o]);return"/"+i.join("/")}t.dirName=i,t.fileName=o,t.convert=s},3:function(e,t,n){"use strict";var i=n(0),o=n(4);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),t.shake=function(e,t){t=void 0===t?10:t;var n=2*t;return i(e).width(i(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,i=function(e){n=!0},o=function(e){n=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var i=e.children[0],o=e.children[1];t=Math.floor(t),e.className=t>=100?"progress success":"progress active",i.style.width=t+"%",i.innerText=t+"%",void 0!==n&&(o.innerText=n)},t.handleLogin=function(e){var n=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:n,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),t.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},t.handleError=function(e,n,s,r){var a=o.get("csrf_token");return s.headers["X-Csrf-Token"]!==a?(i.ajaxSetup({headers:{"X-Csrf-Token":a}}),s.headers["X-Csrf-Token"]=a,void i.ajax(s)):401===n.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void t.handleLogin(function(){i("#login-overlay").hide(),i.ajax(s)})):(void 0!==n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(i("main > .frame.active")),void console.log(e,n,s,r))}},33:function(e,t,n){"use strict";function i(e,t){this.app=e,this.title=t,this.frame=l("<div><header></header><nav><ul></ul></div>"),this.header=this.frame.find("header"),this.itemList=this.frame.find("ul"),this.header.text(t)}function o(e){this.deferred=null,this.parent=e,this.overlay=l('<div class="dialog-overlay">'),this.frame=l('<div class="frame">').appendTo(this.overlay),this.head=l('<div class="frame-head">').appendTo(this.frame),this.body=l('<div class="frame-body">').appendTo(this.frame),l('<div class="frame-title">').appendTo(this.head)}function s(e){this.name=e,this.title="",this.state="loading",this.deferred=null,this.args=null,this.frame=null,this.head=null,this.body=null,this.dockFrame=null,this.actions={},this.actionGroups={},this.keyMap={},this.menus=[],this.toolFrames={},this.onInit=null,this.onSuspend=null,this.onResume=null,this.onOpen=null,this.onReopen=null,this.onFocus=null,this.onKeydown=null,this.onUnfocus=null,this.onClose=null,this.onResize=null,this.isUnsaved=null}function r(e){var t=l.Deferred();return d.hasOwnProperty(e)?null===d[e].deferred?t.resolve(d[e]):d[e].deferred.then(t.resolve,t.reject):(d[e]=new s(e),d[e].deferred=t,BLOGSTEP.get("load",{name:e},"html").done(function(n){var i=l("<div></div>");i.html(n);var o=i.children('link[rel="stylesheet"]'),s=i.children("script[src]");d[e].frame=i.children(".frame"),d[e].head=d[e].frame.children(".frame-head"),d[e].body=d[e].frame.children(".frame-body"),d[e].title=d[e].head.find(".frame-title").text(),d[e].state="loaded",i.children(".tool-frame").each(function(){d[e].toolFrames[l(this).data("name")]=l(this)});var r=i.children(".dock-frame").first();0===r.length&&(r=l('<div class="dock-frame">'),l("<img>").attr("src",BLOGSTEP.PATH+"/assets/img/icons/32/app.png").attr("alt",e).appendTo(r),l("<label>").text(e).appendTo(r)),r.click(function(){BLOGSTEP.restore(e)}),d[e].dockFrame=r,l("head").append(o),l("main").append(d[e].frame),s.each(function(){l.getScript(l(this).attr("src")).fail(t.reject)})}).fail(t.reject)),t.promise()}function a(e){l("#login").find("input").prop("disabled",!1),l("#login-frame").show(),l("#login").submit(function(){l(this).find("input").prop("disabled",!0);var t={username:l("#login-username").val(),password:l("#login-password").val(),remember:l("#login-remember").is(":checked")?{remember:"remember"}:null};return BLOGSTEP.post("login",t).done(function(){l("#login").find("input").prop("disabled",!1),l("#workspace-menu .username").text(t.username),l("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){l(this).hide().css({overflow:"",whiteSpace:"",width:""}),l("#login").off("submit"),l("#login-password").val(""),e()})}).fail(function(){l("#login").find("input").prop("disabled",!1),c.shake(l("#login-frame")),l("#login-username").select(),l("#login-password").val("")}),!1})}var l=n(0),h=n(4),c=n(3),u=n(2);window.BLOGSTEP={},window.BLOGSTEP.ui=c,window.BLOGSTEP.paths=u;var d={},p=[],f=null,m=!1,v=null;i.prototype.addItem=function(e,t){var n=l("<button/>");n.text(e),"string"==typeof t&&n.attr("data-action",t);var i=this.app;n.click(function(){i.activate(t)});var o=l("<li>");o.append(n);for(var s in this.app.keyMap)this.app.keyMap.hasOwnProperty(s)&&this.app.keyMap[s]===t&&n.append('<span class="shortcut">'+s+"</span>");this.itemList.append(o)},o.prototype.setTitle=function(e){this.head.find(".frame-title").text(e)},o.prototype.open=function(){return this.deferred=l.Deferred(),this.parent.children(".dialog-overlay").length>0?this.deferred.reject():this.overlay.appendTo(this.parent),this.deferred.promise()},o.prototype.close=function(e){this.overlay.detach(),this.deferred.resolve(e)},o.alert=function(e,t,n){var i=new o(e);i.setTitle(t),l('<div class="frame-content">').text(n).appendTo(i.body);var s=l('<div class="frame-footer frame-footer-buttons">').appendTo(i.body),r=l("<button>").text("OK").appendTo(s);r.click(function(){i.close()});var a=i.open();return r.focus(),a},o.confirm=function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:["OK","Cancel"],s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"OK",r=new o(e);r.setTitle(t),l('<div class="frame-content">').text(n).appendTo(r.body);for(var a=l('<div class="frame-footer frame-footer-buttons">').appendTo(r.body),h=null,c=0;c<i.length;c++){a.append(" ");var u=l("<button>").text(i[c]).appendTo(a);u.click(function(){r.close(l(this).text())}),i[c]===s&&(h=u)}var d=r.open();return null!==h&&h.focus(),d},s.prototype.addMenu=function(e){var t=new i(this,e);return this.menus.push(t),t},s.prototype.alert=function(e,t){return o.alert(this.body,e,t)},s.prototype.confirm=function(e,t,n,i){return o.confirm(this.body,e,t,n,i)},s.prototype.keydown=function(e){if(!e.defaultPrevented){if(null!==this.onKeydown&&!this.onKeydown(e))return!1;var t="";return e.ctrlKey&&(t+="Ctrl+"),e.altKey&&(t+="Alt+"),e.shiftKey&&(t+="Shift+"),e.metaKey&&(t+="Meta+"),t+=e.key.toUpperCase(),this.keyMap.hasOwnProperty(t)?(e.preventDefault(),this.activate(this.keyMap[t]),!1):void 0}},s.prototype.bindKey=function(e,t){for(var n=e.toLowerCase().split(/-|\+/),i={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],o=0;o<n.length-1;o++)switch(n[o]){case"c":i.ctrlKey="Ctrl+";break;case"a":i.altKey="Alt+";break;case"s":i.shiftKey="Shift+";break;case"m":i.metaKey="Meta+"}e=i.ctrlKey+i.altKey+i.shiftKey+e.toUpperCase(),this.keyMap[e]=t},s.prototype.defineAction=function(e,t,n){var i=this;this.actions[e]=t,this.frame.find('[data-action="'+e+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),i.activate(e),!1}),void 0!==n&&n.forEach(function(t){this.actionGroups.hasOwnProperty(t)||(this.actionGroups[t]=[]),this.actionGroups[t].push(e)},this)},s.prototype.activate=function(e){"string"==typeof e?this.actions[e].apply(this,[e]):e.apply(this)},s.prototype.enableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.enableAction,this)},s.prototype.disableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.disableAction,this)},s.prototype.enableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!1),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!1)})):e.forEach(this.enableAction,this)},s.prototype.disableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!0),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!0)})):e.forEach(this.disableAction,this)},s.prototype.setTitle=function(e){this.title=e,this.head.find(".frame-title").text(this.title),this.dockFrame.attr("title",this.title),document.title=this.title},s.prototype.setArgs=function(e){if(this.args=e,!m){var t=BLOGSTEP.PATH+"/app/"+this.name;l.isEmptyObject(e)||(t+="?"+l.param(e).replace(/%2F/gi,"/")),null!==v&&(document.title=v),history.pushState({app:this.name,args:e},v,t),document.title=this.title,v=this.title}},s.prototype.init=function(){if("loaded"!==this.state)return void console.error("init: unexpected state",this.state,"app",this.name);this.state="initializing",this.defineAction("close",this.close),this.bindKey("c-s-c","close"),null!==this.onInit&&this.onInit(this);for(var e in this.toolFrames)this.toolFrames.hasOwnProperty(e)&&l("#menu").prepend(this.toolFrames[e]);for(var t=0;t<this.menus.length;t++)l("#menu").prepend(this.menus[t].frame);this.state="initialized"},s.prototype.open=function(e){if("initialized"!==this.state)return void console.error(this.name+": open: unexpected state:",this.state);this.state="opening",this.setTitle(this.title),this.frame.addClass("active").show();for(var t=0;t<this.menus.length;t++)this.menus[t].frame.show();for(var n in this.toolFrames)this.toolFrames.hasOwnProperty(n)&&this.toolFrames[n].show();if(null!==this.onOpen)try{this.onOpen(this,e||{})}catch(e){return console.error(this.name+": open: exception caught:",e),alert("Could not open application: "+this.name),void this.kill()}null!==this.dockFrame&&l("#dock").append(this.dockFrame),this.setArgs(e),this.state="running"},s.prototype.kill=function(){if(this.state="closing",null!==this.onClose)try{this.onClose(this)}catch(e){}this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();f===this&&(p.length>0?(f=p.pop(),f.resume()):f=null),null!==this.dockFrame&&this.dockFrame.detach(),this.state="initialized"},s.prototype.close=function(){if("running"!==this.state)return void console.error(this.name+": close: unexpected state:",this.state);if(this.state="closing",null!==this.onClose){if(!1===this.onClose(this))return this.state="running",!1}this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();return f===this&&(p.length>0?(f=p.pop(),f.resume()):f=null),null!==this.dockFrame&&this.dockFrame.detach(),this.state="initialized",!0},s.prototype.reopen=function(e){if("running"!==this.state)return void console.error(this.name+": reopen: unexpected state:",this.state);if(null!==this.onReopen)try{this.onReopen(this,e||{})}catch(e){return console.error(this.name+": reopen: exception caught:",e),alert("Could not open application: "+this.name),void this.kill()}else this.state="closing",null!==this.onClose&&this.onClose(this),this.state="initialized",this.open(e)},s.prototype.suspend=function(){if("running"!==this.state)return void console.error(this.name+": suspend: unexpected state:",this.state);if(this.state="suspending",null!==this.onSuspend&&this.onSuspend(this),"suspending"===this.state){this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();this.state="suspended"}},s.prototype.resume=function(){if("suspended"!==this.state)return void console.error(this.name+": resume: unexpected state:",this.state);this.state="resuming",this.setTitle(this.title),this.frame.addClass("active").show();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.show();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].show();null!==this.onResume&&this.onResume(this),this.setArgs(this.args),null!==this.onResize&&this.onResize(),this.state="running"},BLOGSTEP.PATH=l("body").data("path").replace(/\/$/,""),BLOGSTEP.init=function(e,t){d[e].onInit=t,d[e].init(),null!==d[e].deferred&&(d[e].deferred.resolve(d[e]),d[e].deferred=null)},BLOGSTEP.restore=function(e){if(d.hasOwnProperty(e)){if("suspended"===d[e].state){null!==f&&(f.suspend(),p.push(f)),f=d[e];var t=p.indexOf(d[e]);return t>=0&&p.splice(t,1),d[e].resume(),!0}if("running"===d[e].state)return!0}return!1},BLOGSTEP.getTasks=function(){return Object.values(d)},BLOGSTEP.run=function(e,t){var n=l.Deferred();if(t=t||{},d.hasOwnProperty(e)){if("running"===d[e].state)d[e].reopen(t);else if(null!==f&&(f.suspend(),p.push(f)),f=d[e],"suspended"===d[e].state){var i=p.indexOf(d[e]);i>=0&&p.splice(i,1),d[e].resume(),d[e].reopen(t)}else d[e].open(t);n.resolve(d[e])}else null!==f&&(f.suspend(),p.push(f),f=null),r(e).done(function(e){f=e,e.open(t),n.resolve(e)});return n.promise()},BLOGSTEP.open=function(e){var t=u.fileName(e);t.match(/\.md/i)?BLOGSTEP.run("editor",{path:e}):t.match(/\.webm/i)?BLOGSTEP.run("player",{path:e}):t.match(/\.(?:jpe?g|png|gif|ico)/i)?BLOGSTEP.run("viewer",{path:e}):t.match(/\.(?:php|log|json|html|css|js|sass|scss)/i)?BLOGSTEP.run("code-editor",{path:e}):BLOGSTEP.get("list-files",{path:e}).done(function(t){"directory"===t.type?BLOGSTEP.run("files",{path:e}):BLOGSTEP.run("code-editor",{path:e})})},BLOGSTEP.getToken=function(){return h.get("csrf_token")},BLOGSTEP.addToken=function(e){e.setRequestHeader("X-Csrf-Token",BLOGSTEP.getToken())},BLOGSTEP.ajax=function(e,t,n,i){var o=l.Deferred(),s={url:e,method:t,data:n,dataType:i,headers:{"X-Csrf-Token":BLOGSTEP.getToken()}},r=l.ajax(s);return r.done(o.resolve),r.fail(function(e,t,n){console.log(e,t,n);var i=BLOGSTEP.getToken();if(s.headers["X-Csrf-Token"]!==i&&(s.headers["X-Csrf-Token"]=i,400===r.status))return void l.ajax(s).then(o.resolve,o.reject);if(401===r.status)return l("#login-overlay").show(),""===l("#login-username").val()?l("#login-username").focus():l("#login-password").focus(),void a(function(){l("#login-overlay").hide(),l.ajax(s).then(o.resolve,o.reject)});void 0!==r.responseJSON&&alert(r.responseJSON.message),c.shake(l("main > .frame.active"));var h=Array.prototype.slice.call(arguments);o.rejectWith(r,h)}),o.promise()},BLOGSTEP.get=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"get",t,n)},BLOGSTEP.post=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"post",t,n)},l.ajaxSetup({headers:{"X-Csrf-Token":BLOGSTEP.getToken()}}),l(document).ready(function(){BLOGSTEP.get("who-am-i").done(function(e){l("#workspace-menu").show(),l("#workspace-menu .username").text(e.username),l('#workspace-menu [data-action="file-system"]').click(function(){BLOGSTEP.restore("files")||BLOGSTEP.run("files")}),l('#workspace-menu [data-action="builder"]').click(function(){BLOGSTEP.run("builder")}),l('#workspace-menu [data-action="terminal"]').click(function(){BLOGSTEP.run("terminal")}),l('#workspace-menu [data-action="control-panel"]').click(function(){BLOGSTEP.run("control-panel")}),l('#workspace-menu [data-action="switch-user"]').click(function(){BLOGSTEP.post("logout").done(function(){l("#login-overlay").show(),l("#login-frame").show(),l("#login-username").select().focus(),a(function(){l("#login-overlay").hide()})})}),l('#workspace-menu [data-action="logout"]').click(function(){BLOGSTEP.post("logout").done(function(){location.reload()})}),l("#login-username").val(e.username),l("#login-overlay").addClass("login-overlay-dark");var t=l("body").data("run");if(""!==t){var n=l("body").data("args");console.log(n),BLOGSTEP.run(t,n)}else BLOGSTEP.run("files",{path:"/"})})}),l(document).on("click",'[data-action="toggle-menu"]',function(e){return l("body").toggleClass("show-menu"),!1}),l("body").click(function(e){l("body").hasClass("show-menu")&&l("body").removeClass("show-menu")}),l(document).on("click","[data-toggle] > *",function(e){l(this).is(l(this).parent().data("toggle"))&&l(this).toggleClass("active")}),l(document).on("click","[data-choice] > *",function(e){var t=l(this).parent().data("choice");l(this).is(t)&&(l(this).parent().children(t).removeClass("active"),l(this).addClass("active"))}),l(window).resize(function(){for(var e in d)d.hasOwnProperty(e)&&"running"===d[e].state&&null!==d[e].onResize&&d[e].onResize()}),l(window).keydown(function(e){for(var t in d)d.hasOwnProperty(t)&&"running"===d[t].state&&d[t].keydown(e)}),window.onpopstate=function(e){null!==e.state&&(m=!0,BLOGSTEP.run(e.state.app,e.state.args),m=!1)},window.onbeforeunload=function(e){for(var t in d)if(d.hasOwnProperty(t)&&("running"===d[t].state||"suspended"===d[t].state)&&null!==d[t].isUnsaved&&d[t].isUnsaved())return"suspended"===d[t].state&&BLOGSTEP.restore(t),"Unsaved data in: "+d[t].title}},4:function(e,t,n){var i,o;!function(s){var r=!1;if(i=s,void 0!==(o="function"==typeof i?i.call(t,n,t,e):i)&&(e.exports=o),r=!0,e.exports=s(),r=!0,!r){var a=window.Cookies,l=window.Cookies=s();l.noConflict=function(){return window.Cookies=a,l}}}(function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var i in n)t[i]=n[i]}return t}function t(n){function i(t,o,s){var r;if("undefined"!=typeof document){if(arguments.length>1){if(s=e({path:"/"},i.defaults,s),"number"==typeof s.expires){var a=new Date;a.setMilliseconds(a.getMilliseconds()+864e5*s.expires),s.expires=a}s.expires=s.expires?s.expires.toUTCString():"";try{r=JSON.stringify(o),/^[\{\[]/.test(r)&&(o=r)}catch(e){}o=n.write?n.write(o,t):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)),t=t.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),t=t.replace(/[\(\)]/g,escape);var l="";for(var h in s)s[h]&&(l+="; "+h,!0!==s[h]&&(l+="="+s[h]));return document.cookie=t+"="+o+l}t||(r={});for(var c=document.cookie?document.cookie.split("; "):[],u=/(%[0-9A-Z]{2})+/g,d=0;d<c.length;d++){var p=c[d].split("="),f=p.slice(1).join("=");this.json||'"'!==f.charAt(0)||(f=f.slice(1,-1));try{var m=p[0].replace(u,decodeURIComponent);if(f=n.read?n.read(f,m):n(f,m)||f.replace(u,decodeURIComponent),this.json)try{f=JSON.parse(f)}catch(e){}if(t===m){r=f;break}t||(r[m]=f)}catch(e){}}return r}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(t,n){i(t,"",e(n,{expires:-1}))},i.withConverter=t,i}return t(function(){})})}},[33]);
//# sourceMappingURL=workspace.js.map