webpackJsonp([3],{2:function(t,n,e){function o(t,n){r('[data-action="'+t+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),n(),!1})}function i(t){r('[data-action="'+t+'"]').click()}function a(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!1):t.forEach(a)}function c(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!0):t.forEach(c)}var r=e(1);n.define=o,n.enable=a,n.disable=c,n.active=i},39:function(t,n,e){function o(t){t=t.trim(),t.startsWith("~")?t=m.home+t.substr(1):t.startsWith("/")||(t=k+"/"+t);for(var n=t.split("/"),e=[],o=0;o<n.length;o++)".."===n[o]?e.length>=1&&e.pop():""!==n[o]&&"."!==n[o]&&e.push(n[o]);return"/"+e.join("/")}function i(){d.height(s(window).height()-200)}function a(){d.val(h),d[0].scrollTop=d[0].scrollHeight}function c(t){h+=t,a()}function r(t){c(t+"\n")}function l(t){d.attr("readonly",!1).focus(),y=t}function f(t,n,e){n.request_token=b,s.ajax({url:w+"/api/"+t,method:"post",data:n,success:e,error:function(t){r(t.status+" "+t.statusText)},complete:u})}function u(){c(m.username+" "+k+"> "),g=-1,l(function(t){var n=t.trim().match(/^([^ ]+)(?: (.*))?/);if(null===n)r("Invalid command"),u();else{var e=n[1];if(S.hasOwnProperty(e))S[e]("undefined"==typeof n[2]?"":n[2]);else try{var o="undefined"==typeof n[2]?{}:JSON.parse(n[2]);f(e,o,function(t){r(JSON.stringify(t,null,"  "))})}catch(i){r(i),u()}}})}var s=e(1),p=e(2),d=s("#terminal"),h="",v=[],g=-1,y=null,m={},k="/",w=s("body").data("path").replace(/\/$/,""),b=d.data("token"),D=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];p.define("close",function(){location.href=w+"/files"+k});var S={clear:function(t){h="",a(),u()},cd:function(t){var n=o(t);f("list-files?path="+n,{},function(t){"directory"===t.type?k=n:r("not a directory")})},pwd:function(t){r(k),u()},ls:function(t){f("list-files?path="+k,{},function(t){"undefined"!=typeof t.files&&t.files.forEach(function(t){var n=t.modeString;n+=" \t"+t.owner,n+=" \t"+t.group;var e=new Date(1e3*t.modified);n+=" \t"+e.getFullYear(),n+=" "+D[e.getMonth()],n+=" "+e.getDate(),n+=" \t"+t.name,"directory"===t.type&&(n+="/"),r(n)})})},touch:function(t){f("make-file",{path:o(t)},function(t){})},mkdir:function(t){f("make-dir",{path:o(t)},function(t){})},rm:function(t){f("delete",{path:o(t)},function(t){})},cp:function(t){t=t.split(" "),f("copy",{path:o(t[0]),destination:o(t[1])},function(t){})},mv:function(t){t=t.split(" "),f("move",{path:o(t[0]),destination:o(t[1])},function(t){})},cat:function(t){f("download?path="+o(t),{},function(t){r(t)})},exit:function(t){location.href=w+"/files"+o(t)},open:function(t){location.href=w+"/open"+o(t)},edit:function(t){location.href=w+"/edit"+o(t)},cedit:function(t){location.href=w+"/code-edit"+o(t)}};d.attr("readonly",!0),d.keydown(function(t){if("Enter"!==t.key||t.shiftKey){if("ArrowUp"==t.key)null!==y&&v.length>0&&(g<0?g=v.length-1:g>0&&g--,d.val(h+v[g])),t.preventDefault(),t.stopPropagation();else if("ArrowDown"==t.key)null!==y&&v.length>0&&g>=0&&(g<v.length-1?(g++,d.val(h+v[g])):(g=-1,d.val(h))),t.preventDefault(),t.stopPropagation();else if("ArrowLeft"==t.key||"Backspace"==t.key){var n=d[0].selectionStart,e=d[0].selectionEnd;n===e&&n<=h.length&&(t.preventDefault(),t.stopPropagation())}}else{if(null!==y){d.attr("readonly",!0).blur();var o=d.val().substr(h.length);v.push(o),h+=o+"\n",a();var i=y;y=null,i(o)}t.preventDefault(),t.stopPropagation()}}),d.click(function(){var t=d[0].selectionStart,n=d[0].selectionEnd;t===n&&t<h.length&&(d[0].selectionStart=d.val().length)}),f("who-am-i",{},function(t){m=t}),i(),s(window).resize(i)}},[39]);