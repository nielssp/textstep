webpackJsonp([4],{2:function(e,t,n){function r(e,t){for(var n=e.toLowerCase().split(/-|\+/),r={ctrlKey:"",altKey:"",shiftKey:""},e=n[n.length-1],a=0;a<n.length-1;a++)switch(n[a]){case"c":r.ctrlKey="c-";break;case"a":r.altKey="a-";break;case"s":r.shiftKey="s-"}e=r.ctrlKey+r.altKey+r.shiftKey+e,u[e]=t}function a(e,t){f[e]=t,c('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1})}function o(e){f[e]()}function s(e){"string"==typeof e?c('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(s)}function i(e){"string"==typeof e?c('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(i)}var c=n(1);t.define=a,t.enable=s,t.disable=i,t.activate=o,t.bind=r;var f={},u={};c(window).keydown(function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),t+=e.key.toLowerCase(),console.log("pressed "+t),u.hasOwnProperty(t)?(o(u[t]),e.preventDefault(),e.stopPropagation(),!1):void 0}})},24:function(e,t,n){var r=n(1);t.shake=function(e,t){t="undefined"==typeof t?10:t;var n=2*t;return r(e).width(r(e).width()).animate({marginLeft:"+="+t},50).animate({marginLeft:"-="+n},50).animate({marginLeft:"+="+n},50).animate({marginLeft:"-="+t},50).queue(function(){r(e).css("width","").css("margin-left","").finish()})},t.onLongPress=function(e,t){var n=!1,r=function(e){n=!0},a=function(e){n=!1};e.addEventListener("touchstart",r),e.addEventListener("touchend",a),e.addEventListener("touchcancel",a),e.addEventListener("touchmove",a),e.addEventListener("contextmenu",function(e){if(n)return t(e)})},t.setProgress=function(e,t,n){var r=e.children[0],a=e.children[1];t=Math.floor(t),t>=100?e.className="progress success":e.className="progress active",r.style.width=t+"%",r.innerText=t+"%","undefined"!=typeof n&&(a.innerText=n)},t.handleError=function(e,n,a,o){"undefined"!=typeof n.responseJSON?alert(n.responseJSON.message):alert(n.responseText),t.shake(r(".frame")),console.log(e,n,a,o)}},3:function(e,t){function n(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function r(e){return e.replace(/^.*\//,"")}function a(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var n=e.split("/"),r=[],a=0;a<n.length;a++)".."===n[a]?r.length>=1&&r.pop():""!==n[a]&&"."!==n[a]&&r.push(n[a]);return"/"+r.join("/")}t.dirName=n,t.fileName=r,t.convert=a},49:function(e,t,n){function r(){s.setProgress(f,0,"Building..."),a.ajax({url:i+"/api/build",method:"post",data:{request_token:c},progress:function(e){e.upload.onprogress=function(e){if(e.lengthComputable){var t=e.loaded/e.total*50;s.setProgress(f,t)}},e.onprogress=function(e){if(e.lengthComputable){var t=50+e.loaded/e.total*50;s.setProgress(f,t)}}},success:function(e){s.setProgress(f,100,"Done")},error:function(){s.shake(a(".frame")),s.setProgress(f,100,"Error")}})}var a=n(1),o=n(2),s=(n(3),n(24)),i=a("body").data("path").replace(/\/$/,""),c=a("#build").data("token"),f=a("#build-progress")[0];o.define("build",r)}},[49]);
//# sourceMappingURL=build.js.map