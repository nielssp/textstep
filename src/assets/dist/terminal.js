webpackJsonp([3],{2:function(t,n,e){function o(t,n){r('[data-action="'+t+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),n(),!1})}function i(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!1):t.forEach(i)}function a(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!0):t.forEach(a)}var r=e(1);n.define=o,n.enable=i,n.disable=a},38:function(t,n,e){function o(t){t=t.trim(),t.startsWith("~")?t=m.home+t.substr(1):t.startsWith("/")||(t=w+"/"+t);for(var n=t.split("/"),e=[],o=0;o<n.length;o++)".."===n[o]?e.length>=1&&e.pop():""!==n[o]&&"."!==n[o]&&e.push(n[o]);return"/"+e.join("/")}function i(){d.height(s(window).height()-200)}function a(){d.val(h),d.scrollTop(d.innerHeight())}function r(t){h+=t,a()}function c(t){r(t+"\n")}function f(t){d.attr("readonly",!1).focus(),g=t}function u(t,n,e){n.request_token=b,s.ajax({url:k+"/api/"+t,method:"post",data:n,success:e,error:function(t){c(t.status+" "+t.statusText)},complete:l})}function l(){r(m.username+" "+w+"> "),y=-1,f(function(t){var n=t.trim().match(/^([^ ]+)(?: (.*))?/);if(null===n)c("Invalid command"),l();else{var e=n[1];if(J.hasOwnProperty(e))J[e]("undefined"==typeof n[2]?"":n[2]);else try{var o="undefined"==typeof n[2]?{}:JSON.parse(n[2]);u(e,o,function(t){c(JSON.stringify(t,null,"  "))})}catch(i){c(i),l()}}})}var s=e(1),p=e(2),d=s("#terminal"),h="",v=[],y=-1,g=null,m={},w="/",k=s("body").data("path").replace(/\/$/,""),b=d.data("token"),D=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];p.define("close",function(){location.href=k+"/files"+w});var J={clear:function(t){h="",a(),l()},cd:function(t){var n=o(t);u("list-files?path="+n,{},function(t){"directory"===t.type?w=n:c("not a directory")})},pwd:function(t){c(w),l()},ls:function(t){u("list-files?path="+w,{},function(t){"undefined"!=typeof t.files&&t.files.forEach(function(t){var n=t.modeString;n+=" \t"+t.owner,n+=" \t"+t.group;var e=new Date(1e3*t.modified);n+=" \t"+e.getFullYear(),n+=" "+D[e.getMonth()],n+=" "+e.getDate(),n+=" \t"+t.name,"directory"===t.type&&(n+="/"),c(n)})})},touch:function(t){u("make-file",{path:o(t)},function(t){})},mkdir:function(t){u("make-dir",{path:o(t)},function(t){})},rm:function(t){u("delete",{path:o(t)},function(t){})},cp:function(t){t=t.split(" "),u("copy",{path:o(t[0]),destination:o(t[1])},function(t){})},mv:function(t){t=t.split(" "),u("move",{path:o(t[0]),destination:o(t[1])},function(t){})},cat:function(t){u("download?path="+o(t),{},function(t){c(t)})},exit:function(t){location.href=k+"/files"+o(t)},open:function(t){location.href=k+"/open"+o(t)},edit:function(t){location.href=k+"/edit"+o(t)},cedit:function(t){location.href=k+"/code-edit"+o(t)}};d.attr("readonly",!0),d.keydown(function(t){if("Enter"!==t.key||t.shiftKey)"ArrowUp"==t.key?(null!==g&&v.length>0&&(y<0?y=v.length-1:y>0&&y--,d.val(h+v[y])),t.preventDefault(),t.stopPropagation()):"ArrowDown"==t.key&&(null!==g&&v.length>0&&y>=0&&(y<v.length-1?(y++,d.val(h+v[y])):(y=-1,d.val(h))),t.preventDefault(),t.stopPropagation());else{if(null!==g){d.attr("readonly",!0).blur();var n=d.val().substr(h.length);v.push(n),h+=n+"\n",a();var e=g;g=null,e(n)}t.preventDefault(),t.stopPropagation()}}),u("who-am-i",{},function(t){m=t}),i(),s(window).resize(i)}},[38]);