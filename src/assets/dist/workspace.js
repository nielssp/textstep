webpackJsonp([4],{2:function(e,t,n){"use strict";function i(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function o(e){return e.replace(/^.*\//,"")}function s(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var n=e.split("/"),i=[],o=0;o<n.length;o++)".."===n[o]?i.length>=1&&i.pop():""!==n[o]&&"."!==n[o]&&i.push(n[o]);return"/"+i.join("/")}t.dirName=i,t.fileName=o,t.convert=s},3:function(e,t,n){"use strict";var i=n(0),o=n(4);i.ajaxSetup({headers:{"X-Csrf-Token":o.get("csrf_token")}}),t.shake=function(e,t){t=void 0===t?10:t;var n=2*t;return i(e).width(i(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,i=function(e){n=!0},o=function(e){n=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var i=e.children[0],o=e.children[1];t=Math.floor(t),e.className=t>=100?"progress success":"progress active",i.style.width=t+"%",i.innerText=t+"%",void 0!==n&&(o.innerText=n)},t.handleLogin=function(e){var n=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:n,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),t.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},t.handleError=function(e,n,s,r){var a=o.get("csrf_token");return s.headers["X-Csrf-Token"]!==a?(i.ajaxSetup({headers:{"X-Csrf-Token":a}}),s.headers["X-Csrf-Token"]=a,void i.ajax(s)):401===n.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void t.handleLogin(function(){i("#login-overlay").hide(),i.ajax(s)})):(void 0!==n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(i("main > .frame.active")),void console.log(e,n,s,r))}},33:function(e,t,n){"use strict";function i(e,t){this.app=e,this.title=t,this.frame=c("<div><header></header><nav><ul></ul></div>"),this.header=this.frame.find("header"),this.itemList=this.frame.find("ul"),this.header.text(t)}function o(e){this.deferred=null,this.parent=e,this.overlay=c('<div class="dialog-overlay">'),this.frame=c('<div class="frame">').appendTo(this.overlay),this.head=c('<div class="frame-head">').appendTo(this.frame),this.body=c('<form class="frame-body">').appendTo(this.frame),c('<div class="frame-title">').appendTo(this.head)}function s(e){this.name=e,this.title="",this.state="loading",this.deferred=null,this.args=null,this.frame=null,this.head=null,this.body=null,this.dockFrame=null,this.actions={},this.actionGroups={},this.keyMap={},this.menus=[],this.toolFrames={},this.onInit=null,this.onSuspend=null,this.onResume=null,this.onOpen=null,this.onReopen=null,this.onFocus=null,this.onKeydown=null,this.onUnfocus=null,this.onClose=null,this.onResize=null,this.isUnsaved=null}function r(e){var t=c.Deferred();return f.hasOwnProperty(e)?null===f[e].deferred?t.resolve(f[e]):f[e].deferred.then(t.resolve,t.reject):(f[e]=new s(e),f[e].deferred=t,BLOGSTEP.get("load",{name:e},"html").done(function(n){var i=c("<div></div>");i.html(n);var o=i.children('link[rel="stylesheet"]'),s=i.children("script[src]");f[e].frame=i.children(".frame"),f[e].head=f[e].frame.children(".frame-head"),f[e].body=f[e].frame.children(".frame-body"),f[e].title=f[e].head.find(".frame-title").text(),f[e].state="loaded",i.children(".tool-frame").each(function(){f[e].toolFrames[c(this).data("name")]=c(this)});var r=i.children(".dock-frame").first();0===r.length&&(r=c('<div class="dock-frame">'),c("<img>").attr("src",BLOGSTEP.PATH+"/assets/img/icons/32/app.png").attr("alt",e).appendTo(r),c("<label>").text(e).appendTo(r)),r.click(function(){BLOGSTEP.restore(e)}),f[e].dockFrame=r,c("head").append(o),c("main").append(f[e].frame),s.each(function(){c.getScript(c(this).attr("src")).fail(t.reject)})}).fail(t.reject)),t.promise()}function a(e){c("#login").find("input").prop("disabled",!1),c("#login-frame").show(),c("#login").submit(function(){c(this).find("input").prop("disabled",!0);var t={username:c("#login-username").val(),password:c("#login-password").val(),remember:c("#login-remember").is(":checked")?{remember:"remember"}:null};return BLOGSTEP.post("login",t).done(function(){c("#login").find("input").prop("disabled",!1),c("#workspace-menu .username").text(t.username),c("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){c(this).hide().css({overflow:"",whiteSpace:"",width:""}),c("#login").off("submit"),c("#login-password").val(""),e()})}).fail(function(){c("#login").find("input").prop("disabled",!1),d.shake(c("#login-frame")),c("#login-username").select(),c("#login-password").val("")}),!1})}var l=n(67),h=function(e){return e&&e.__esModule?e:{default:e}}(l),c=n(0),u=n(4),d=n(3),p=n(2);window.BLOGSTEP={},window.BLOGSTEP.ui=d,window.BLOGSTEP.paths=p,window.BLOGSTEP.config=new h.default(function(e){return BLOGSTEP.get("get-conf",{keys:e})},function(e){return BLOGSTEP.post("set-conf",{data:e})});var f={},m=[],v=null,g=!1,y=null;i.prototype.addItem=function(e,t){var n=c("<button/>");n.text(e),"string"==typeof t&&n.attr("data-action",t);var i=this.app;n.click(function(){i.activate(t)});var o=c("<li>");o.append(n);for(var s in this.app.keyMap)this.app.keyMap.hasOwnProperty(s)&&this.app.keyMap[s]===t&&n.append('<span class="shortcut">'+s+"</span>");this.itemList.append(o)},o.prototype.setTitle=function(e){this.head.find(".frame-title").text(e)},o.prototype.open=function(){return this.deferred=c.Deferred(),this.parent.children(".dialog-overlay").length>0?this.deferred.reject():this.overlay.appendTo(this.parent),this.deferred.promise()},o.prototype.close=function(e){this.overlay.detach(),this.deferred.resolve(e)},o.alert=function(e,t,n){var i=new o(e);i.setTitle(t),c('<div class="frame-content">').text(n).appendTo(i.body);var s=c('<div class="frame-footer frame-footer-buttons">').appendTo(i.body),r=c("<button>").text("OK").appendTo(s);r.click(function(){i.close()}).keydown(function(e){"Escape"===e.key&&i.close(null)});var a=i.open();return r.focus(),a},o.confirm=function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:["OK","Cancel"],s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"OK",r=new o(e);r.setTitle(t),c('<div class="frame-content">').text(n).appendTo(r.body);for(var a=c('<div class="frame-footer frame-footer-buttons">').appendTo(r.body),l=null,h=0;h<i.length;h++){a.append(" ");var u=c("<button>").text(i[h]).appendTo(a);u.click(function(){r.close(c(this).text())}).keydown(function(e){"Escape"===e.key&&r.close(null)}),i[h]===s&&(l=u)}var d=r.open();return null!==l&&l.focus(),d},o.prompt=function(e,t,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"",s=new o(e);s.setTitle(t);var r=c('<div class="frame-content">').appendTo(s.body);c("<div>").text(n).appendTo(r);var a=c('<input type="text">').appendTo(r),l=c('<div class="frame-footer frame-footer-buttons">').appendTo(s.body);s.body.submit(function(e){s.close(a.val())}),a.keydown(function(e){"Escape"===e.key&&s.close(null)}),c('<input type="submit">').text("OK").appendTo(l).click(function(){s.close(a.val())}).keydown(function(e){"Escape"===e.key&&s.close(null)}),l.append(" "),c("<button>").text("Cancel").appendTo(l).click(function(){s.close(null)}).keydown(function(e){"Escape"===e.key&&s.close(null)});var h=s.open();return a.focus(),i.length>0&&(a.val(i),a[0].setSelectionRange(0,i.length)),h},s.prototype.addMenu=function(e){var t=new i(this,e);return this.menus.push(t),t},s.prototype.alert=function(e,t){return o.alert(this.body,e,t)},s.prototype.confirm=function(e,t,n,i){return o.confirm(this.body,e,t,n,i)},s.prototype.prompt=function(e,t,n){return o.prompt(this.body,e,t,n)},s.prototype.keydown=function(e){if(!e.defaultPrevented&&!this.isDialogOpen()){if(null!==this.onKeydown&&!this.onKeydown(e))return!1;var t="";return e.ctrlKey&&(t+="Ctrl+"),e.altKey&&(t+="Alt+"),e.shiftKey&&(t+="Shift+"),e.metaKey&&(t+="Meta+"),t+=e.key.toUpperCase(),this.keyMap.hasOwnProperty(t)?(e.preventDefault(),this.activate(this.keyMap[t]),!1):void 0}},s.prototype.bindKey=function(e,t){for(var n=e.toLowerCase().split(/-|\+/),i={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],o=0;o<n.length-1;o++)switch(n[o]){case"c":i.ctrlKey="Ctrl+";break;case"a":i.altKey="Alt+";break;case"s":i.shiftKey="Shift+";break;case"m":i.metaKey="Meta+"}e=i.ctrlKey+i.altKey+i.shiftKey+e.toUpperCase(),this.keyMap[e]=t},s.prototype.defineAction=function(e,t,n){var i=this;this.actions[e]=t,this.frame.find('[data-action="'+e+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),i.activate(e),!1}),void 0!==n&&n.forEach(function(t){this.actionGroups.hasOwnProperty(t)||(this.actionGroups[t]=[]),this.actionGroups[t].push(e)},this)},s.prototype.activate=function(e){"string"==typeof e?this.actions[e].apply(this,[e]):e.apply(this)},s.prototype.isDialogOpen=function(){return this.body.children(".dialog-overlay").length>0},s.prototype.enableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.enableAction,this)},s.prototype.disableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.disableAction,this)},s.prototype.enableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!1),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!1)})):e.forEach(this.enableAction,this)},s.prototype.disableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!0),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!0)})):e.forEach(this.disableAction,this)},s.prototype.setTitle=function(e){this.title=e,this.head.find(".frame-title").text(this.title),this.dockFrame.attr("title",this.title),document.title=this.title},s.prototype.setArgs=function(e){if(this.args=e,!g){var t=BLOGSTEP.PATH+"/app/"+this.name;c.isEmptyObject(e)||(t+="?"+c.param(e).replace(/%2F/gi,"/")),null!==y&&(document.title=y),history.pushState({app:this.name,args:e},y,t),document.title=this.title,y=this.title}},s.prototype.init=function(){if("loaded"!==this.state)return void console.error("init: unexpected state",this.state,"app",this.name);this.state="initializing",this.defineAction("close",this.close),this.bindKey("c-s-c","close"),null!==this.onInit&&this.onInit(this);for(var e in this.toolFrames)this.toolFrames.hasOwnProperty(e)&&c("#menu").prepend(this.toolFrames[e]);for(var t=0;t<this.menus.length;t++)c("#menu").prepend(this.menus[t].frame);this.state="initialized"},s.prototype.open=function(e){if("initialized"!==this.state)return void console.error(this.name+": open: unexpected state:",this.state);this.state="opening",this.setTitle(this.title),this.frame.addClass("active").show();for(var t=0;t<this.menus.length;t++)this.menus[t].frame.show();for(var n in this.toolFrames)this.toolFrames.hasOwnProperty(n)&&this.toolFrames[n].show();if(null!==this.onOpen)try{this.onOpen(this,e||{})}catch(e){return console.error(this.name+": open: exception caught:",e),alert("Could not open application: "+this.name),void this.kill()}null!==this.dockFrame&&c("#dock").append(this.dockFrame),this.setArgs(e),this.state="running"},s.prototype.kill=function(){if(this.state="closing",null!==this.onClose)try{this.onClose(this)}catch(e){}this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();v===this&&(m.length>0?(v=m.pop(),v.resume()):v=null),null!==this.dockFrame&&this.dockFrame.detach(),this.state="initialized"},s.prototype.close=function(e){if("running"!==this.state)return void console.error(this.name+": close: unexpected state:",this.state);if(this.state="closing",null!==this.onClose){if(!1===this.onClose(this,e))return this.state="running",!1}this.frame.removeClass("active").hide();for(var t=0;t<this.menus.length;t++)this.menus[t].frame.hide();for(var n in this.toolFrames)this.toolFrames.hasOwnProperty(n)&&this.toolFrames[n].hide();return v===this&&(m.length>0?(v=m.pop(),v.resume()):v=null),null!==this.dockFrame&&this.dockFrame.detach(),this.state="initialized",!0},s.prototype.reopen=function(e){if("running"!==this.state)return void console.error(this.name+": reopen: unexpected state:",this.state);if(null!==this.onReopen)try{this.onReopen(this,e||{})}catch(e){return console.error(this.name+": reopen: exception caught:",e),alert("Could not open application: "+this.name),void this.kill()}else this.state="closing",null!==this.onClose&&this.onClose(this),this.state="initialized",this.open(e)},s.prototype.suspend=function(){if("running"!==this.state)return void console.error(this.name+": suspend: unexpected state:",this.state);if(this.state="suspending",null!==this.onSuspend&&this.onSuspend(this),"suspending"===this.state){this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();this.state="suspended"}},s.prototype.resume=function(){if("suspended"!==this.state)return void console.error(this.name+": resume: unexpected state:",this.state);this.state="resuming",this.setTitle(this.title),this.frame.addClass("active").show();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.show();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].show();null!==this.onResume&&this.onResume(this),this.setArgs(this.args),null!==this.onResize&&this.onResize(),this.state="running"},BLOGSTEP.PATH=c("body").data("path").replace(/\/$/,""),BLOGSTEP.init=function(e,t){f[e].onInit=t,f[e].init(),null!==f[e].deferred&&(f[e].deferred.resolve(f[e]),f[e].deferred=null)},BLOGSTEP.restore=function(e){if(f.hasOwnProperty(e)){if("suspended"===f[e].state){null!==v&&(v.suspend(),m.push(v)),v=f[e];var t=m.indexOf(f[e]);return t>=0&&m.splice(t,1),f[e].resume(),!0}if("running"===f[e].state)return!0}return!1},BLOGSTEP.getTasks=function(){return Object.values(f)},BLOGSTEP.run=function(e,t){var n=c.Deferred();if(t=t||{},f.hasOwnProperty(e)){if("running"===f[e].state)f[e].reopen(t);else if(null!==v&&(v.suspend(),m.push(v)),v=f[e],"suspended"===f[e].state){var i=m.indexOf(f[e]);i>=0&&m.splice(i,1),f[e].resume(),f[e].reopen(t)}else f[e].open(t);n.resolve(f[e])}else null!==v&&(v.suspend(),m.push(v),v=null),r(e).done(function(e){v=e,e.open(t),n.resolve(e)});return n.promise()},BLOGSTEP.open=function(e){var t=p.fileName(e);t.match(/\.md/i)?BLOGSTEP.run("editor",{path:e}):t.match(/\.webm/i)?BLOGSTEP.run("player",{path:e}):t.match(/\.(?:jpe?g|png|gif|ico)/i)?BLOGSTEP.run("viewer",{path:e}):t.match(/\.(?:php|log|json|html|css|js|sass|scss)/i)?BLOGSTEP.run("code-editor",{path:e}):BLOGSTEP.get("list-files",{path:e}).done(function(t){"directory"===t.type?BLOGSTEP.run("files",{path:e}):BLOGSTEP.run("code-editor",{path:e})})},BLOGSTEP.getToken=function(){return u.get("csrf_token")},BLOGSTEP.addToken=function(e){e.setRequestHeader("X-Csrf-Token",BLOGSTEP.getToken())},BLOGSTEP.ajax=function(e,t,n,i){var o=c.Deferred(),s={url:e,method:t,data:n,dataType:i,headers:{"X-Csrf-Token":BLOGSTEP.getToken()}},r=c.ajax(s);return r.done(o.resolve),r.fail(function(e,t,n){console.log(e,t,n);var i=BLOGSTEP.getToken();if(s.headers["X-Csrf-Token"]!==i&&(s.headers["X-Csrf-Token"]=i,400===r.status))return void c.ajax(s).then(o.resolve,o.reject);if(401===r.status)return c("#login-overlay").show(),""===c("#login-username").val()?c("#login-username").focus():c("#login-password").focus(),void a(function(){c("#login-overlay").hide(),c.ajax(s).then(o.resolve,o.reject)});void 0!==r.responseJSON&&alert(r.responseJSON.message),d.shake(c("main > .frame.active"));var l=Array.prototype.slice.call(arguments);o.rejectWith(r,l)}),o.promise()},BLOGSTEP.get=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"get",t,n)},BLOGSTEP.post=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"post",t,n)},c.ajaxSetup({headers:{"X-Csrf-Token":BLOGSTEP.getToken()}}),c(document).ready(function(){BLOGSTEP.get("who-am-i").done(function(e){c("#workspace-menu").show(),c("#workspace-menu .username").text(e.username),c('#workspace-menu [data-action="file-system"]').click(function(){BLOGSTEP.restore("files")||BLOGSTEP.run("files")}),c('#workspace-menu [data-action="builder"]').click(function(){BLOGSTEP.run("builder")}),c('#workspace-menu [data-action="terminal"]').click(function(){BLOGSTEP.run("terminal")}),c('#workspace-menu [data-action="control-panel"]').click(function(){BLOGSTEP.run("control-panel")}),c('#workspace-menu [data-action="switch-user"]').click(function(){BLOGSTEP.post("logout").done(function(){c("#login-overlay").show(),c("#login-frame").show(),c("#login-username").select().focus(),a(function(){c("#login-overlay").hide()})})}),c('#workspace-menu [data-action="logout"]').click(function(){BLOGSTEP.post("logout").done(function(){location.reload()})}),c("#login-username").val(e.username),c("#login-overlay").addClass("login-overlay-dark");var t=c("body").data("run");if(""!==t){var n=c("body").data("args");console.log(n),BLOGSTEP.run(t,n)}else BLOGSTEP.run("files",{path:"/"})})}),c(document).on("click",'[data-action="toggle-menu"]',function(e){return c("body").toggleClass("show-menu"),!1}),c("body").click(function(e){c("body").hasClass("show-menu")&&c("body").removeClass("show-menu")}),c(document).on("click","[data-toggle] > *",function(e){c(this).is(c(this).parent().data("toggle"))&&c(this).toggleClass("active")}),c(document).on("click","[data-choice] > *",function(e){var t=c(this).parent().data("choice");c(this).is(t)&&(c(this).parent().children(t).removeClass("active"),c(this).addClass("active"))}),c(window).resize(function(){for(var e in f)f.hasOwnProperty(e)&&"running"===f[e].state&&null!==f[e].onResize&&f[e].onResize()}),c(window).keydown(function(e){for(var t in f)f.hasOwnProperty(t)&&"running"===f[t].state&&f[t].keydown(e)}),window.onpopstate=function(e){null!==e.state&&(g=!0,BLOGSTEP.run(e.state.app,e.state.args),g=!1)},window.onbeforeunload=function(e){for(var t in f)if(f.hasOwnProperty(t)&&("running"===f[t].state||"suspended"===f[t].state)&&null!==f[t].isUnsaved&&f[t].isUnsaved())return"suspended"===f[t].state&&BLOGSTEP.restore(t),"Unsaved data in: "+f[t].title}},4:function(e,t,n){var i,o;!function(s){var r=!1;if(i=s,void 0!==(o="function"==typeof i?i.call(t,n,t,e):i)&&(e.exports=o),r=!0,e.exports=s(),r=!0,!r){var a=window.Cookies,l=window.Cookies=s();l.noConflict=function(){return window.Cookies=a,l}}}(function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var i in n)t[i]=n[i]}return t}function t(n){function i(t,o,s){var r;if("undefined"!=typeof document){if(arguments.length>1){if(s=e({path:"/"},i.defaults,s),"number"==typeof s.expires){var a=new Date;a.setMilliseconds(a.getMilliseconds()+864e5*s.expires),s.expires=a}s.expires=s.expires?s.expires.toUTCString():"";try{r=JSON.stringify(o),/^[\{\[]/.test(r)&&(o=r)}catch(e){}o=n.write?n.write(o,t):encodeURIComponent(String(o)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)),t=t.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),t=t.replace(/[\(\)]/g,escape);var l="";for(var h in s)s[h]&&(l+="; "+h,!0!==s[h]&&(l+="="+s[h]));return document.cookie=t+"="+o+l}t||(r={});for(var c=document.cookie?document.cookie.split("; "):[],u=/(%[0-9A-Z]{2})+/g,d=0;d<c.length;d++){var p=c[d].split("="),f=p.slice(1).join("=");this.json||'"'!==f.charAt(0)||(f=f.slice(1,-1));try{var m=p[0].replace(u,decodeURIComponent);if(f=n.read?n.read(f,m):n(f,m)||f.replace(u,decodeURIComponent),this.json)try{f=JSON.parse(f)}catch(e){}if(t===m){r=f;break}t||(r[m]=f)}catch(e){}}return r}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(t,n){i(t,"",e(n,{expires:-1}))},i.withConverter=t,i}return t(function(){})})},67:function(e,t,n){"use strict";function i(e,t){this.getter=e,this.setter=t,this.root=this,this.ns="",this.data={}}function o(){this.listeners=[],this.value=null,this.dirty=!1}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;i.prototype.getSubconfig=function(e){var t=new i(null,null);return t.root=this.root,t.ns=this.ns+e+".",t},i.prototype.get=function(e){return""!==this.ns?this.root.get(this.ns+e):(this.data.hasOwnProperty(e)||(this.data[e]=new o),this.data[e])},i.prototype.update=function(){var e=[];for(var t in this.data)this.data.hasOwnProperty(t)&&e.push(t);var n=this;this.getter(e).done(function(e){for(var t in e)n.data.hasOwnProperty(t)||(n.data[t]=new o),n.data[t].set(e[t]),n.data[t].dirty=!1})},i.prototype.commit=function(){var e={};for(var t in this.data)this.data.hasOwnProperty(t)&&this.data[t].dirty&&(e[t]=this.data[t].get());var n=this;this.setter(e).done(function(e){for(var t=0;t<e.length;t++)n.data[e[t]].dirty=!1})},o.prototype.bind=function(e){if(e.is("input")){var t=this;e.val(this.value),e.on("keydown keyup",function(){t.set(e.val())}),this.change(function(t){e.val(t)})}},o.prototype.change=function(e){this.listeners.push(e)},o.prototype.set=function(e){this.value=e,this.dirty=!0;for(var t=0;t<this.listeners.length;t++)this.listeners[t].apply(this,[e])},o.prototype.get=function(){return this.value}}},[33]);
//# sourceMappingURL=workspace.js.map