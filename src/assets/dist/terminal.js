webpackJsonp([2],{2:function(t,n,e){function o(t,n){r('[data-action="'+t+'"]').click(function(t){return t.preventDefault(),t.stopPropagation(),n(),!1})}function i(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!1):t.forEach(i)}function a(t){"string"==typeof t?r('[data-action="'+t+'"]').attr("disabled",!0):t.forEach(a)}var r=e(1);n.define=o,n.enable=i,n.disable=a},36:function(t,n,e){function o(t){t=t.trim(),t.startsWith("~")?t=v.home+t.substr(1):t.startsWith("/")||(t=m+"/"+t);for(var n=t.split("/"),e=[],o=0;o<n.length;o++)".."===n[o]?e.length>=1&&e.pop():""!==n[o]&&"."!==n[o]&&e.push(n[o]);return"/"+e.join("/")}function i(){p.height(s(window).height()-200)}function a(){p.val(d),p.scrollTop(p.innerHeight())}function r(t){d+=t,a()}function f(t){r(t+"\n")}function c(t){p.attr("readonly",!1).focus(),y=t}function u(t,n,e){n.request_token=k,s.ajax({url:w+"/api/"+t,method:"post",data:n,success:e,error:function(t){f(t.status+" "+t.statusText)},complete:l})}function l(){r(v.username+" "+m+"> "),g=-1,c(function(t){var n=t.trim().match(/^([^ ]+)(?: (.*))?/);if(null===n)f("Invalid command"),l();else{var e=n[1];if(D.hasOwnProperty(e))D[e]("undefined"==typeof n[2]?"":n[2]);else try{var o="undefined"==typeof n[2]?{}:JSON.parse(n[2]);u(e,o,function(t){f(JSON.stringify(t,null,"  "))})}catch(i){f(i),l()}}})}var s=e(1),p=(e(2),s("#terminal")),d="",h=[],g=-1,y=null,v={},m="/",w=s("body").data("path").replace(/\/$/,""),k=p.data("token"),b=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],D={clear:function(t){d="",a(),l()},cd:function(t){var n=o(t);u("list-files?path="+n,{},function(t){"directory"===t.type?m=n:f("not a directory")})},pwd:function(t){f(m),l()},ls:function(t){u("list-files?path="+m,{},function(t){"undefined"!=typeof t.files&&t.files.forEach(function(t){var n=t.modeString;n+=" \t"+t.owner,n+=" \t"+t.group;var e=new Date(1e3*t.modified);n+=" \t"+e.getFullYear(),n+=" "+b[e.getMonth()],n+=" "+e.getDate(),n+=" \t"+t.name,"directory"===t.type&&(n+="/"),f(n)})})},touch:function(t){u("make-file",{path:o(t)},function(t){})},mkdir:function(t){u("make-dir",{path:o(t)},function(t){})},rm:function(t){u("delete",{path:o(t)},function(t){})},cat:function(t){u("download?path="+o(t),{},function(t){f(t)})},exit:function(t){location.href=w+"/files"+o(t)},open:function(t){location.href=w+"/open"+o(t)},edit:function(t){location.href=w+"/edit"+o(t)},cedit:function(t){location.href=w+"/code-edit"+o(t)}};p.attr("readonly",!0),p.keydown(function(t){if("Enter"!==t.key||t.shiftKey)"ArrowUp"==t.key?(null!==y&&h.length>0&&(g<0?g=h.length-1:g>0&&g--,p.val(d+h[g])),t.preventDefault(),t.stopPropagation()):"ArrowDown"==t.key&&(null!==y&&h.length>0&&g>=0&&(g<h.length-1?(g++,p.val(d+h[g])):(g=-1,p.val(d))),t.preventDefault(),t.stopPropagation());else{if(null!==y){p.attr("readonly",!0).blur();var n=p.val().substr(d.length);h.push(n),d+=n+"\n",a();var e=y;y=null,e(n)}t.preventDefault(),t.stopPropagation()}}),u("who-am-i",{},function(t){v=t}),i(),s(window).resize(i)}},[36]);