webpackJsonp([7],{2:function(e,n,t){var a=t(0);n.shake=function(e,n){n="undefined"==typeof n?10:n;var t=2*n;return a(e).width(a(e).width()).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).queue(function(){a(e).css("width","").css("margin-left","").finish()})},n.onLongPress=function(e,n){var t=!1,a=function(e){t=!0},i=function(e){t=!1};e.addEventListener("touchstart",a),e.addEventListener("touchend",i),e.addEventListener("touchcancel",i),e.addEventListener("touchmove",i),e.addEventListener("contextmenu",function(e){if(t)return n(e)})},n.setProgress=function(e,n,t){var a=e.children[0],i=e.children[1];n=Math.floor(n),n>=100?e.className="progress success":e.className="progress active",a.style.width=n+"%",a.innerText=n+"%","undefined"!=typeof t&&(i.innerText=t)},n.handleLogin=function(e){var t=a("body").data("path").replace(/\/$/,"");a("#login").find("input").prop("disabled",!1),a(".login-frame").show(),a("#login").submit(function(){var i=a(this).find('[name="request_token"]').val();return a(this).find("input").prop("disabled",!0),a.ajax({url:t,method:"post",data:{request_token:i,username:a("#username").val(),password:a("#password").val(),remember:a("#remember_remember").is(":checked")?{remember:"remember"}:null},success:function(){a(".login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){a(this).hide().css({overflow:"",whiteSpace:"",width:""}),a("#login").off("submit"),a("#password").val(""),e()})},error:function(e){a("#login").find("input").prop("disabled",!1),n.shake(a(".login-frame")),a("#username").select(),a("#password").val("")},global:!1}),!1})},n.handleError=function(e,t,i,o){return 401===t.status?(a("#login-overlay").show(),a("#password").focus(),void n.handleLogin(function(){a("#login-overlay").hide(),a.ajax(i)})):("undefined"!=typeof t.responseJSON?alert(t.responseJSON.message):alert(t.responseText),n.shake(a("main > .frame")),void console.log(e,t,i,o))}},53:function(e,n,t){var a=t(0),i=t(2);a("#login #username").focus(),i.handleLogin(function(){location.reload()})}},[53]);
//# sourceMappingURL=login.js.map