webpackJsonp([7],{1:function(e,n,t){function o(e,n){for(var t=e.toLowerCase().split(/-|\+/),o={ctrlKey:"",altKey:"",shiftKey:""},e=t[t.length-1],a=0;a<t.length-1;a++)switch(t[a]){case"c":o.ctrlKey="c-";break;case"a":o.altKey="a-";break;case"s":o.shiftKey="s-"}e=o.ctrlKey+o.altKey+o.shiftKey+e,h[e]=n}function a(e,n,t){l[e]=n,f('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),n(),!1}),void 0!==t&&t.forEach(function(n){u.hasOwnProperty(n)||(u[n]=[]),u[n].push(e)})}function i(e){l[e]()}function r(e){u.hasOwnProperty(e)&&u[e].forEach(function(e){c(e)})}function s(e){u.hasOwnProperty(e)&&u[e].forEach(function(e){d(e)})}function c(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(c)}function d(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(d)}var f=t(0);n.define=a,n.enable=c,n.disable=d,n.enableGroup=r,n.disableGroup=s,n.activate=i,n.bind=o;var l={},u={},h={};f(window).keydown(function(e){if(!e.defaultPrevented){var n="";return e.ctrlKey&&(n+="c-"),e.altKey&&(n+="a-"),e.shiftKey&&(n+="s-"),e.metaKey&&(n+="m-"),n+=e.key.toLowerCase(),h.hasOwnProperty(n)?(i(h[n]),!1):void 0}})},2:function(e,n,t){var o=t(0),a=t(4);o.ajaxSetup({headers:{"X-Csrf-Token":a.get("csrf_token")}}),n.shake=function(e,n){n=void 0===n?10:n;var t=2*n;return o(e).width(o(e).width()).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).queue(function(){o(e).css("width","").css("margin-left","").finish()})},n.onLongPress=function(e,n){var t=!1,o=function(e){t=!0},a=function(e){t=!1};e.addEventListener("touchstart",o),e.addEventListener("touchend",a),e.addEventListener("touchcancel",a),e.addEventListener("touchmove",a),e.addEventListener("contextmenu",function(e){if(t)return n(e)})},n.setProgress=function(e,n,t){var o=e.children[0],a=e.children[1];n=Math.floor(n),e.className=n>=100?"progress success":"progress active",o.style.width=n+"%",o.innerText=n+"%",void 0!==t&&(a.innerText=t)},n.handleLogin=function(e){var t=o("body").data("path").replace(/\/$/,"");o("#login").find("input").prop("disabled",!1),o(".login-frame").show(),o("#login").submit(function(){var a=o(this).find('[name="request_token"]').val();return o(this).find("input").prop("disabled",!0),o.ajax({url:t,method:"post",data:{request_token:a,username:o("#username").val(),password:o("#password").val(),remember:o("#remember_remember").is(":checked")?{remember:"remember"}:null},success:function(){o(".login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){o(this).hide().css({overflow:"",whiteSpace:"",width:""}),o("#login").off("submit"),o("#password").val(""),e()})},error:function(e){o("#login").find("input").prop("disabled",!1),n.shake(o(".login-frame")),o("#username").select(),o("#password").val("")},global:!1}),!1})},n.handleError=function(e,t,i,r){var s=a.get("csrf_token");return i.headers["X-Csrf-Token"]!==s?(o.ajaxSetup({headers:{"X-Csrf-Token":s}}),i.headers["X-Csrf-Token"]=s,void o.ajax(i)):401===t.status?(o("#login-overlay").show(),o("#password").focus(),void n.handleLogin(function(){o("#login-overlay").hide(),o.ajax(i)})):(void 0!==t.responseJSON?alert(t.responseJSON.message):alert(t.responseText),n.shake(o("main > .frame")),void console.log(e,t,i,r))}},4:function(e,n,t){var o,a;!function(i){var r=!1;if(o=i,void 0!==(a="function"==typeof o?o.call(n,t,n,e):o)&&(e.exports=a),r=!0,e.exports=i(),r=!0,!r){var s=window.Cookies,c=window.Cookies=i();c.noConflict=function(){return window.Cookies=s,c}}}(function(){function e(){for(var e=0,n={};e<arguments.length;e++){var t=arguments[e];for(var o in t)n[o]=t[o]}return n}function n(t){function o(n,a,i){var r;if("undefined"!=typeof document){if(arguments.length>1){if(i=e({path:"/"},o.defaults,i),"number"==typeof i.expires){var s=new Date;s.setMilliseconds(s.getMilliseconds()+864e5*i.expires),i.expires=s}i.expires=i.expires?i.expires.toUTCString():"";try{r=JSON.stringify(a),/^[\{\[]/.test(r)&&(a=r)}catch(e){}a=t.write?t.write(a,n):encodeURIComponent(String(a)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),n=encodeURIComponent(String(n)),n=n.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),n=n.replace(/[\(\)]/g,escape);var c="";for(var d in i)i[d]&&(c+="; "+d,!0!==i[d]&&(c+="="+i[d]));return document.cookie=n+"="+a+c}n||(r={});for(var f=document.cookie?document.cookie.split("; "):[],l=/(%[0-9A-Z]{2})+/g,u=0;u<f.length;u++){var h=f[u].split("="),p=h.slice(1).join("=");this.json||'"'!==p.charAt(0)||(p=p.slice(1,-1));try{var v=h[0].replace(l,decodeURIComponent);if(p=t.read?t.read(p,v):t(p,v)||p.replace(l,decodeURIComponent),this.json)try{p=JSON.parse(p)}catch(e){}if(n===v){r=p;break}n||(r[v]=p)}catch(e){}}return r}}return o.set=o,o.get=function(e){return o.call(o,e)},o.getJSON=function(){return o.apply({json:!0},[].slice.call(arguments))},o.defaults={},o.remove=function(n,t){o(n,"",e(t,{expires:-1}))},o.withConverter=n,o}return n(function(){})})},56:function(e,n,t){var o=t(0),a=(t(2),t(1));window.$=o;var i=o("body").data("path").replace(/\/$/,"");o("[data-toggle]").each(function(){o(this).find(o(this).data("toggle")).click(function(){o(this).toggleClass("active")})}),o("[data-choice]").each(function(){var e=o(this).find(o(this).data("choice"));e.click(function(){e.removeClass("active"),o(this).addClass("active")})}),o('[data-action="toggle-menu"]').click(function(e){e.preventDefault(),o("body").toggleClass("show-menu"),e.stopPropagation()}),o("body").click(function(e){o("body").hasClass("show-menu")&&o("body").removeClass("show-menu")}),a.define("close",function(){var e=o(".frame-content [data-path]");e.length>0&&(location.href=i+"/files?path="+e.data("path"))})}},[56]);
//# sourceMappingURL=main.js.map