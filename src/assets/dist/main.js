webpackJsonp([7],{1:function(e,t,n){function a(e,t){for(var n=e.toLowerCase().split(/-|\+/),a={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],o=0;o<n.length-1;o++)switch(n[o]){case"c":a.ctrlKey="c-";break;case"a":a.altKey="a-";break;case"s":a.shiftKey="s-"}e=a.ctrlKey+a.altKey+a.shiftKey+e,h[e]=t}function o(e,t,n){l[e]=t,f('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1}),"undefined"!=typeof n&&n.forEach(function(t){u.hasOwnProperty(t)||(u[t]=[]),u[t].push(e)})}function i(e){l[e]()}function r(e){u.hasOwnProperty(e)&&u[e].forEach(function(e){c(e)})}function s(e){u.hasOwnProperty(e)&&u[e].forEach(function(e){d(e)})}function c(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(c)}function d(e){"string"==typeof e?f('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(d)}var f=n(0);t.define=o,t.enable=c,t.disable=d,t.enableGroup=r,t.disableGroup=s,t.activate=i,t.bind=a;var l={},u={},h={};f(window).keydown(function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),e.metaKey&&(t+="m-"),t+=e.key.toLowerCase(),h.hasOwnProperty(t)?(i(h[t]),!1):void 0}})},2:function(e,t,n){var a=n(0);t.shake=function(e,t){t="undefined"==typeof t?10:t;var n=2*t;return a(e).width(a(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){a(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,a=function(e){n=!0},o=function(e){n=!1};e.addEventListener("touchstart",a),e.addEventListener("touchend",o),e.addEventListener("touchcancel",o),e.addEventListener("touchmove",o),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var a=e.children[0],o=e.children[1];t=Math.floor(t),t>=100?e.className="progress success":e.className="progress active",a.style.width=t+"%",a.innerText=t+"%","undefined"!=typeof n&&(o.innerText=n)},t.handleLogin=function(e){var n=a("body").data("path").replace(/\/$/,"");a("#login").find("input").prop("disabled",!1),a(".login-frame").show(),a("#login").submit(function(){var o=a(this).find('[name="request_token"]').val();return a(this).find("input").prop("disabled",!0),a.ajax({url:n,method:"post",data:{request_token:o,username:a("#username").val(),password:a("#password").val(),remember:a("#remember_remember").is(":checked")?{remember:"remember"}:null},success:function(){a(".login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){a(this).hide().css({overflow:"",whiteSpace:"",width:""}),a("#login").off("submit"),a("#password").val(""),e()})},error:function(e){a("#login").find("input").prop("disabled",!1),t.shake(a(".login-frame")),a("#username").select(),a("#password").val("")},global:!1}),!1})},t.handleError=function(e,n,o,i){return 401===n.status?(a("#login-overlay").show(),a("#password").focus(),void t.handleLogin(function(){a("#login-overlay").hide(),a.ajax(o)})):("undefined"!=typeof n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(a("main > .frame")),void console.log(e,n,o,i))}},54:function(e,t,n){var a=n(0),o=(n(2),n(1));window.$=a;var i=a("body").data("path").replace(/\/$/,"");a("[data-toggle]").each(function(){var e=a(this).find(a(this).data("toggle"));e.click(function(){a(this).toggleClass("active")})}),a("[data-choice]").each(function(){var e=a(this).find(a(this).data("choice"));e.click(function(){e.removeClass("active"),a(this).addClass("active")})}),a('[data-action="toggle-menu"]').click(function(e){e.preventDefault(),a("body").toggleClass("show-menu"),e.stopPropagation()}),a("body").click(function(e){a("body").hasClass("show-menu")&&a("body").removeClass("show-menu")}),o.define("close",function(){var e=a(".frame-content [data-path]");e.length>0&&(location.href=i+"/files?path="+e.data("path"))})}},[54]);
//# sourceMappingURL=main.js.map