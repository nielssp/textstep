webpackJsonp([3],{2:function(e,t){function n(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function i(e){return e.replace(/^.*\//,"")}function s(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var n=e.split("/"),i=[],s=0;s<n.length;s++)".."===n[s]?i.length>=1&&i.pop():""!==n[s]&&"."!==n[s]&&i.push(n[s]);return"/"+i.join("/")}t.dirName=n,t.fileName=i,t.convert=s},3:function(e,t,n){var i=n(0),s=n(4);i.ajaxSetup({headers:{"X-Csrf-Token":s.get("csrf_token")}}),t.shake=function(e,t){t=void 0===t?10:t;var n=2*t;return i(e).width(i(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){i(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,i=function(e){n=!0},s=function(e){n=!1};e.addEventListener("touchstart",i),e.addEventListener("touchend",s),e.addEventListener("touchcancel",s),e.addEventListener("touchmove",s),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var i=e.children[0],s=e.children[1];t=Math.floor(t),e.className=t>=100?"progress success":"progress active",i.style.width=t+"%",i.innerText=t+"%",void 0!==n&&(s.innerText=n)},t.handleLogin=function(e){var n=i("body").data("path").replace(/\/$/,"");i("#login").find("input").prop("disabled",!1),i("#login-frame").show(),i("#login").submit(function(){return i(this).find("input").prop("disabled",!0),i.ajax({url:n,method:"post",data:{username:i("#login-username").val(),password:i("#login-password").val(),remember:i("#login-remember").is(":checked")?{remember:"remember"}:null},success:function(){i("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){i(this).hide().css({overflow:"",whiteSpace:"",width:""}),i("#login").off("submit"),i("#login-password").val(""),e()})},error:function(e){i("#login").find("input").prop("disabled",!1),t.shake(i("#login-frame")),i("#login-username").select(),i("#login-password").val("")},global:!1}),!1})},t.handleError=function(e,n,o,r){var a=s.get("csrf_token");return o.headers["X-Csrf-Token"]!==a?(i.ajaxSetup({headers:{"X-Csrf-Token":a}}),o.headers["X-Csrf-Token"]=a,void i.ajax(o)):401===n.status?(i("#login-overlay").show(),""===i("#login-username").val()?i("#login-username").focus():i("#login-password").focus(),void t.handleLogin(function(){i("#login-overlay").hide(),i.ajax(o)})):(void 0!==n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(i("main > .frame.active")),void console.log(e,n,o,r))}},4:function(e,t,n){var i,s;!function(o){var r=!1;if(i=o,void 0!==(s="function"==typeof i?i.call(t,n,t,e):i)&&(e.exports=s),r=!0,e.exports=o(),r=!0,!r){var a=window.Cookies,l=window.Cookies=o();l.noConflict=function(){return window.Cookies=a,l}}}(function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var i in n)t[i]=n[i]}return t}function t(n){function i(t,s,o){var r;if("undefined"!=typeof document){if(arguments.length>1){if(o=e({path:"/"},i.defaults,o),"number"==typeof o.expires){var a=new Date;a.setMilliseconds(a.getMilliseconds()+864e5*o.expires),o.expires=a}o.expires=o.expires?o.expires.toUTCString():"";try{r=JSON.stringify(s),/^[\{\[]/.test(r)&&(s=r)}catch(e){}s=n.write?n.write(s,t):encodeURIComponent(String(s)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)),t=t.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),t=t.replace(/[\(\)]/g,escape);var l="";for(var u in o)o[u]&&(l+="; "+u,!0!==o[u]&&(l+="="+o[u]));return document.cookie=t+"="+s+l}t||(r={});for(var c=document.cookie?document.cookie.split("; "):[],h=/(%[0-9A-Z]{2})+/g,d=0;d<c.length;d++){var p=c[d].split("="),f=p.slice(1).join("=");this.json||'"'!==f.charAt(0)||(f=f.slice(1,-1));try{var m=p[0].replace(h,decodeURIComponent);if(f=n.read?n.read(f,m):n(f,m)||f.replace(h,decodeURIComponent),this.json)try{f=JSON.parse(f)}catch(e){}if(t===m){r=f;break}t||(r[m]=f)}catch(e){}}return r}}return i.set=i,i.get=function(e){return i.call(i,e)},i.getJSON=function(){return i.apply({json:!0},[].slice.call(arguments))},i.defaults={},i.remove=function(t,n){i(t,"",e(n,{expires:-1}))},i.withConverter=t,i}return t(function(){})})},59:function(e,t,n){function i(e,t){this.app=e,this.title=t,this.frame=a("<div><header></header><nav><ul></ul></div>"),this.header=this.frame.find("header"),this.itemList=this.frame.find("ul"),this.header.text(t)}function s(e){this.name=e,this.title="",this.state="loading",this.deferred=null,this.args=null,this.frame=null,this.dockFrame=null,this.actions={},this.actionGroups={},this.keyMap={},this.menus=[],this.toolFrames={},this.onInit=null,this.onSuspend=null,this.onResume=null,this.onOpen=null,this.onReopen=null,this.onFocus=null,this.onKeydown=null,this.onUnfocus=null,this.onClose=null,this.onResize=null,this.isUnsaved=null}function o(e){var t=a.Deferred();return h.hasOwnProperty(e)?null===h[e].deferred?t.resolve(h[e]):h[e].deferred.then(t.resolve,t.reject):(h[e]=new s(e),h[e].deferred=t,BLOGSTEP.get("load",{name:e},"html").done(function(n){var i=a("<div></div>");i.html(n);var s=i.children('link[rel="stylesheet"]'),o=i.children("script[src]");h[e].frame=i.children(".frame"),h[e].title=h[e].frame.find(".frame-header-title").text(),h[e].state="loaded",i.children(".tool-frame").each(function(){h[e].toolFrames[a(this).data("name")]=a(this)});var r=i.children(".dock-frame").first();0===r.length&&(r=a('<div class="dock-frame">'),a("<img>").attr("src",BLOGSTEP.PATH+"/assets/img/icons/32/app.png").attr("alt",e).appendTo(r),a("<label>").text(e).appendTo(r)),r.click(function(){BLOGSTEP.restore(e)}),h[e].dockFrame=r,a("head").append(s),a("main").append(h[e].frame),o.each(function(){a.getScript(a(this).attr("src")).fail(t.reject)})}).fail(t.reject)),t.promise()}function r(e){a("#login").find("input").prop("disabled",!1),a("#login-frame").show(),a("#login").submit(function(){a(this).find("input").prop("disabled",!0);var t={username:a("#login-username").val(),password:a("#login-password").val(),remember:a("#login-remember").is(":checked")?{remember:"remember"}:null};return BLOGSTEP.post("login",t).done(function(){a("#login").find("input").prop("disabled",!1),a("#workspace-menu .username").text(t.username),a("#login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){a(this).hide().css({overflow:"",whiteSpace:"",width:""}),a("#login").off("submit"),a("#login-password").val(""),e()})}).fail(function(){a("#login").find("input").prop("disabled",!1),u.shake(a("#login-frame")),a("#login-username").select(),a("#login-password").val("")}),!1})}var a=n(0),l=n(4),u=n(3),c=n(2);window.BLOGSTEP={};var h={},d=[],p=null,f=!1,m=null;i.prototype.addItem=function(e,t){var n=a("<button/>");n.text(e),"string"==typeof t&&n.attr("data-action",t);var i=this.app;n.click(function(){i.activate(t)});var s=a("<li>");s.append(n),this.itemList.append(s)},s.prototype.addMenu=function(e){var t=new i(this,e);return this.menus.push(t),t},s.prototype.keydown=function(e){if(!e.defaultPrevented){if(null!==this.onKeydown&&!this.onKeydown(e))return!1;var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),e.metaKey&&(t+="m-"),t+=e.key.toLowerCase(),this.keyMap.hasOwnProperty(t)?(e.preventDefault(),this.activate(this.keyMap[t]),!1):void 0}},s.prototype.bindKey=function(e,t){for(var n=e.toLowerCase().split(/-|\+/),i={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],s=0;s<n.length-1;s++)switch(n[s]){case"c":i.ctrlKey="c-";break;case"a":i.altKey="a-";break;case"s":i.shiftKey="s-"}e=i.ctrlKey+i.altKey+i.shiftKey+e,this.keyMap[e]=t},s.prototype.defineAction=function(e,t,n){var i=this;this.actions[e]=t,this.frame.find('[data-action="'+e+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),i.activate(e),!1}),void 0!==n&&n.forEach(function(t){this.actionGroups.hasOwnProperty(t)||(this.actionGroups[t]=[]),this.actionGroups[t].push(e)},this)},s.prototype.activate=function(e){"string"==typeof e?this.actions[e].apply(this):e.apply(this)},s.prototype.enableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.enableAction,this)},s.prototype.disableGroup=function(e){this.actionGroups.hasOwnProperty(e)&&this.actionGroups[e].forEach(this.disableAction,this)},s.prototype.enableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!1),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!1)})):e.forEach(this.enableAction,this)},s.prototype.disableAction=function(e){"string"==typeof e?(this.frame.find('[data-action="'+e+'"]').attr("disabled",!0),this.menus.forEach(function(t){t.frame.find('[data-action="'+e+'"]').attr("disabled",!0)})):e.forEach(this.disableAction,this)},s.prototype.setTitle=function(e){this.title=e,this.frame.find(".frame-header-title").text(this.title),this.dockFrame.attr("title",this.title),document.title=this.title},s.prototype.setArgs=function(e){if(this.args=e,!f){var t=BLOGSTEP.PATH+"/app/"+this.name;a.isEmptyObject(e)||(t+="?"+a.param(e).replace(/%2F/gi,"/")),null!==m&&(document.title=m),history.pushState({app:this.name,args:e},m,t),document.title=this.title,m=this.title}},s.prototype.init=function(){if("loaded"!==this.state)return void console.error("init: unexpected state",this.state,"app",this.name);this.state="initializing",this.defineAction("close",this.close),this.bindKey("c-s-c","close"),null!==this.onInit&&this.onInit(this);for(var e in this.toolFrames)this.toolFrames.hasOwnProperty(e)&&a("#menu").prepend(this.toolFrames[e]);for(var t=0;t<this.menus.length;t++)a("#menu").prepend(this.menus[t].frame);this.state="initialized"},s.prototype.open=function(e){if("initialized"!==this.state)return void console.error("open: unexpected state",this.state,"app",this.name);this.state="opening",this.setTitle(this.title),this.frame.addClass("active").show();for(var t=0;t<this.menus.length;t++)this.menus[t].frame.show();for(var n in this.toolFrames)this.toolFrames.hasOwnProperty(n)&&this.toolFrames[n].show();null!==this.onOpen&&this.onOpen(this,e||{}),null!==this.dockFrame&&a("#dock").append(this.dockFrame),this.setArgs(e),this.state="running"},s.prototype.close=function(){if("running"!==this.state)return void console.error("close: unexpected state",this.state,"app",this.name);if(this.state="closing",null!==this.onClose){if(!1===this.onClose(this))return this.state="running",!1}this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();return p===this&&d.length>0&&(p=d.pop(),p.resume()),null!==this.dockFrame&&this.dockFrame.detach(),this.state="initialized",!0},s.prototype.reopen=function(e){if("running"!==this.state)return void console.error("reopen: unexpected state",this.state,"app",this.name);null!==this.onReopen?this.onReopen(this,e||{}):(this.state="closing",null!==this.onClose&&this.onClose(this),this.state="initialized",this.open(e))},s.prototype.suspend=function(){if("running"!==this.state)return void console.error("suspend: unexpected state",this.state,"app",this.name);if(this.state="suspending",null!==this.onSuspend&&this.onSuspend(this),"suspending"===this.state){this.frame.removeClass("active").hide();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.hide();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].hide();this.state="suspended"}},s.prototype.resume=function(){if("suspended"!==this.state)return void console.error("resume: unexpected state",this.state,"app",this.name);this.state="resuming",this.setTitle(this.title),this.frame.addClass("active").show();for(var e=0;e<this.menus.length;e++)this.menus[e].frame.show();for(var t in this.toolFrames)this.toolFrames.hasOwnProperty(t)&&this.toolFrames[t].show();null!==this.onResume&&this.onResume(this),this.setArgs(this.args),null!==this.onResize&&this.onResize(),this.state="running"},BLOGSTEP.PATH=a("body").data("path").replace(/\/$/,""),BLOGSTEP.init=function(e,t){h[e].onInit=t,h[e].init(),null!==h[e].deferred&&(h[e].deferred.resolve(h[e]),h[e].deferred=null)},BLOGSTEP.restore=function(e){if(h.hasOwnProperty(e)){if("suspended"===h[e].state){null!==p&&(p.suspend(),d.push(p)),p=h[e];var t=d.indexOf(h[e]);return t>=0&&d.splice(t,1),h[e].resume(),!0}if("running"===h[e].state)return!0}return!1},BLOGSTEP.getTasks=function(){return Object.values(h)},BLOGSTEP.run=function(e,t){var n=a.Deferred();if(t=t||{},h.hasOwnProperty(e)){if("running"===h[e].state)h[e].reopen(t);else if(null!==p&&(p.suspend(),d.push(p)),p=h[e],"suspended"===h[e].state){var i=d.indexOf(h[e]);i>=0&&d.splice(i,1),h[e].resume(),h[e].reopen(t)}else h[e].open(t);n.resolve(h[e])}else null!==p&&(p.suspend(),d.push(p),p=null),o(e).done(function(e){p=e,e.open(t),n.resolve(e)});return n.promise()},BLOGSTEP.open=function(e){var t=c.fileName(e);t.match(/\.md/i)?BLOGSTEP.run("editor",{path:e}):t.match(/\.webm/i)?BLOGSTEP.run("player",{path:e}):t.match(/\.(?:jpe?g|png|gif|ico)/i)?BLOGSTEP.run("viewer",{path:e}):t.match(/\.(?:php|log|json|html|css|js|sass|scss)/i)?BLOGSTEP.run("code-editor",{path:e}):BLOGSTEP.get("list-files",{path:e}).done(function(t){"directory"===t.type?BLOGSTEP.run("files",{path:e}):BLOGSTEP.run("code-editor",{path:e})})},BLOGSTEP.getToken=function(){return l.get("csrf_token")},BLOGSTEP.addToken=function(e){e.setRequestHeader("X-Csrf-Token",BLOGSTEP.getToken())},BLOGSTEP.ajax=function(e,t,n,i){var s=a.Deferred(),o={url:e,method:t,data:n,dataType:i,headers:{"X-Csrf-Token":BLOGSTEP.getToken()}},l=a.ajax(o);return l.done(s.resolve),l.fail(function(e,t,n){console.log(e,t,n);var i=BLOGSTEP.getToken();if(o.headers["X-Csrf-Token"]!==i&&(o.headers["X-Csrf-Token"]=i,400===l.status))return void a.ajax(o).then(s.resolve,s.reject);if(401===l.status)return a("#login-overlay").show(),""===a("#login-username").val()?a("#login-username").focus():a("#login-password").focus(),void r(function(){a("#login-overlay").hide(),a.ajax(o).then(s.resolve,s.reject)});void 0!==l.responseJSON&&alert(l.responseJSON.message),u.shake(a("main > .frame.active"));var c=Array.prototype.slice.call(arguments);s.rejectWith(l,c)}),s.promise()},BLOGSTEP.get=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"get",t,n)},BLOGSTEP.post=function(e,t,n){return BLOGSTEP.ajax(BLOGSTEP.PATH+"/api/"+e,"post",t,n)},a.ajaxSetup({headers:{"X-Csrf-Token":BLOGSTEP.getToken()}}),a(document).ready(function(){BLOGSTEP.get("who-am-i").done(function(e){a("#workspace-menu").show(),a("#workspace-menu .username").text(e.username),a('#workspace-menu [data-action="file-system"]').click(function(){BLOGSTEP.restore("files")||BLOGSTEP.run("files")}),a('#workspace-menu [data-action="builder"]').click(function(){BLOGSTEP.run("builder")}),a('#workspace-menu [data-action="terminal"]').click(function(){BLOGSTEP.run("terminal")}),a('#workspace-menu [data-action="control-panel"]').click(function(){BLOGSTEP.run("control-panel")}),a('#workspace-menu [data-action="switch-user"]').click(function(){BLOGSTEP.post("logout").done(function(){a("#login-overlay").show(),a("#login-frame").show(),a("#login-username").select().focus(),r(function(){a("#login-overlay").hide()})})}),a('#workspace-menu [data-action="logout"]').click(function(){BLOGSTEP.post("logout").done(function(){location.reload()})}),a("#login-username").val(e.username),a("#login-overlay").addClass("login-overlay-dark"),BLOGSTEP.run("files",{path:"/"}).done(function(){var e=a("body").data("run");if(""!==e){var t=a("body").data("args");console.log(t),BLOGSTEP.run(e,t)}})})}),a(document).on("click",'[data-action="toggle-menu"]',function(e){return a("body").toggleClass("show-menu"),!1}),a("body").click(function(e){a("body").hasClass("show-menu")&&a("body").removeClass("show-menu")}),a(document).on("click","[data-toggle] > *",function(e){a(this).is(a(this).parent().data("toggle"))&&a(this).toggleClass("active")}),a(document).on("click","[data-choice] > *",function(e){var t=a(this).parent().data("choice");a(this).is(t)&&(a(this).parent().children(t).removeClass("active"),a(this).addClass("active"))}),a(window).resize(function(){for(var e in h)h.hasOwnProperty(e)&&"running"===h[e].state&&null!==h[e].onResize&&h[e].onResize()}),a(window).keydown(function(e){for(var t in h)h.hasOwnProperty(t)&&"running"===h[t].state&&h[t].keydown(e)}),window.onpopstate=function(e){null!==e.state&&(f=!0,BLOGSTEP.run(e.state.app,e.state.args),f=!1)},window.onbeforeunload=function(e){for(var t in h)if(h.hasOwnProperty(t)&&("running"===h[t].state||"suspended"===h[t].state)&&null!==h[t].isUnsaved&&h[t].isUnsaved())return"suspended"===h[t].state&&BLOGSTEP.restore(t),"Unsaved data in: "+h[t].title}}},[59]);
//# sourceMappingURL=workspace.js.map