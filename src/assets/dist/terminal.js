webpackJsonp([5],{2:function(e,t,n){var o=n(0);t.shake=function(e,t){t="undefined"==typeof t?10:t;var n=2*t;return o(e).width(o(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){o(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,o=function(e){n=!0},a=function(e){n=!1};e.addEventListener("touchstart",o),e.addEventListener("touchend",a),e.addEventListener("touchcancel",a),e.addEventListener("touchmove",a),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var o=e.children[0],a=e.children[1];t=Math.floor(t),t>=100?e.className="progress success":e.className="progress active",o.style.width=t+"%",o.innerText=t+"%","undefined"!=typeof n&&(a.innerText=n)},t.handleLogin=function(e){var n=o("body").data("path").replace(/\/$/,"");o("#login").find("input").prop("disabled",!1),o(".login-frame").show(),o("#login").submit(function(){var a=o(this).find('[name="request_token"]').val();return o(this).find("input").prop("disabled",!0),o.ajax({url:n,method:"post",data:{request_token:a,username:o("#username").val(),password:o("#password").val(),remember:o("#remember_remember").is(":checked")?{remember:"remember"}:null},success:function(){o(".login-frame").css({overflow:"hidden",whiteSpace:"no-wrap"}).animate({width:0},function(){o(this).hide().css({overflow:"",whiteSpace:"",width:""}),o("#login").off("submit"),o("#password").val(""),e()})},error:function(e){o("#login").find("input").prop("disabled",!1),t.shake(o(".login-frame")),o("#username").select(),o("#password").val("")},global:!1}),!1})},t.handleError=function(e,n,a,i){return 401===n.status?(o("#login-overlay").show(),o("#password").focus(),void t.handleLogin(function(){o("#login-overlay").hide(),o.ajax(a)})):("undefined"!=typeof n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(o("main > .frame")),void console.log(e,n,a,i))}},3:function(e,t,n){function o(e,t){for(var n=e.toLowerCase().split(/-|\+/),o={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],a=0;a<n.length-1;a++)switch(n[a]){case"c":o.ctrlKey="c-";break;case"a":o.altKey="a-";break;case"s":o.shiftKey="s-"}e=o.ctrlKey+o.altKey+o.shiftKey+e,p[e]=t}function a(e,t,n){u[e]=t,l('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1}),"undefined"!=typeof n&&n.forEach(function(t){d.hasOwnProperty(t)||(d[t]=[]),d[t].push(e)})}function i(e){u[e]()}function r(e){d.hasOwnProperty(e)&&d[e].forEach(function(e){c(e)})}function s(e){d.hasOwnProperty(e)&&d[e].forEach(function(e){f(e)})}function c(e){"string"==typeof e?l('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(c)}function f(e){"string"==typeof e?l('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(f)}var l=n(0);t.define=a,t.enable=c,t.disable=f,t.enableGroup=r,t.disableGroup=s,t.activate=i,t.bind=o;var u={},d={},p={};l(window).keydown(function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),e.metaKey&&(t+="m-"),t+=e.key.toLowerCase(),p.hasOwnProperty(t)?(i(p[t]),!1):void 0}})},55:function(e,t,n){function o(e){e=e.trim(),e.startsWith("~")?e=g.home+e.substr(1):e.startsWith("/")||(e=w+"/"+e);for(var t=e.split("/"),n=[],o=0;o<t.length;o++)".."===t[o]?n.length>=1&&n.pop():""!==t[o]&&"."!==t[o]&&n.push(t[o]);return"/"+n.join("/")}function a(){p.val(h),p[0].scrollTop=p[0].scrollHeight}function i(e){h+=e,a()}function r(e){i(e+"\n")}function s(e){p.attr("readonly",!1).focus(),y=e}function c(e,t,n){t.request_token=k,l.ajax({url:b+"/api/"+e,method:"post",data:t,success:n,error:function(t){d.shake(l(".frame")),r(404===t.status?t.status+" "+e+": command not found":"undefined"!=typeof t.responseJSON?t.status+"("+t.responseJSON.code+") "+t.responseJSON.message:t.status+" "+t.statusText+": "+t.responseText)},complete:f})}function f(){i(g.username+" "+w+"> "),v=-1,s(function(e){var t=e.trim().match(/^([^ ]+)(?: (.*))?/);if(null===t)r("Invalid command"),f();else{var n=t[1];if(L.hasOwnProperty(n))L[n]("undefined"==typeof t[2]?"":t[2]);else try{var o="undefined"==typeof t[2]?{}:JSON.parse(t[2]);c(n,o,function(e){r(JSON.stringify(e,null,"  "))})}catch(a){r(a),f()}}})}var l=n(0),u=n(3),d=n(2),p=l("#terminal"),h="",m=[],v=-1,y=null,g={},w="/",b=l("body").data("path").replace(/\/$/,""),k=p.data("token"),E=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];u.define("close",function(){location.href=b+"/files"+w});var L={clear:function(e){h="",a(),f()},cd:function(e){var t=o(e);c("list-files?path="+t,{},function(e){"directory"===e.type?w=t:r("not a directory")})},pwd:function(e){r(w),f()},ls:function(e){c("list-files?path="+w,{},function(e){"undefined"!=typeof e.files&&e.files.forEach(function(e){var t=e.modeString;t+=" \t"+e.owner,t+=" \t"+e.group;var n=new Date(1e3*e.modified);t+=" \t"+n.getFullYear(),t+=" "+E[n.getMonth()],t+=" "+n.getDate(),t+=" \t"+e.name,"directory"===e.type&&(t+="/"),r(t)})})},touch:function(e){c("make-file",{path:o(e)},function(e){})},mkdir:function(e){c("make-dir",{path:o(e)},function(e){})},rm:function(e){c("delete",{path:o(e)},function(e){})},cp:function(e){e=e.split(" "),c("copy",{path:o(e[0]),destination:o(e[1])},function(e){})},mv:function(e){e=e.split(" "),c("move",{path:o(e[0]),destination:o(e[1])},function(e){})},cat:function(e){c("download?path="+o(e),{},function(e){r(e)})},exit:function(e){location.href=b+"/files"+o(e)},open:function(e){location.href=b+"/open"+o(e)},edit:function(e){location.href=b+"/edit"+o(e)},cedit:function(e){location.href=b+"/code-edit"+o(e)}};p.attr("readonly",!0),p.keydown(function(e){if("Enter"!==e.key||e.shiftKey){if("ArrowUp"==e.key)null!==y&&m.length>0&&(v<0?v=m.length-1:v>0&&v--,p.val(h+m[v])),e.preventDefault(),e.stopPropagation();else if("ArrowDown"==e.key)null!==y&&m.length>0&&v>=0&&(v<m.length-1?(v++,p.val(h+m[v])):(v=-1,p.val(h))),e.preventDefault(),e.stopPropagation();else if("ArrowLeft"==e.key||"Backspace"==e.key){var t=p[0].selectionStart,n=p[0].selectionEnd;t===n&&t<=h.length&&(e.preventDefault(),e.stopPropagation())}}else{if(null!==y){p.attr("readonly",!0).blur();var o=p.val().substr(h.length);m.push(o),h+=o+"\n",a();var i=y;y=null,i(o)}e.preventDefault(),e.stopPropagation()}}),p.click(function(){var e=p[0].selectionStart,t=p[0].selectionEnd;e===t&&e<h.length&&(p[0].selectionStart=p.val().length)}),c("who-am-i",{},function(e){g=e})}},[55]);
//# sourceMappingURL=terminal.js.map