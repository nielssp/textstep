webpackJsonp([8],{31:function(e,t,n){"use strict";n(0);BLOGSTEP.init("test",function(e){e.frame.find(".header-path").text("loaded"),e.defineAction("test",function(){e.frame.find(".header-path").text("activated"),e.disableAction("test"),setTimeout(function(){e.enableAction("test")},5e3)}),e.bindKey("c-a","test");var t=e.addMenu("Test menu");t.addItem("Test","test"),t.addItem("Open terminal",function(){BLOGSTEP.run("terminal")}),t.addItem("Open file",function(){BLOGSTEP.run("editor",{path:"/content/pages/things.md"})}),t.addItem("Who am I",function(){BLOGSTEP.get("who-am-i").done(function(e){alert("you are "+e.username)})}),t.addItem("File selection",function(){BLOGSTEP.selectFile().done(function(e){alert("you selected "+e.path)})}),e.onOpen=function(e,t){e.frame.find(".header-path").text("opened")},e.onResume=function(e,t){e.frame.find(".header-path").text("resumed")},e.onResize=function(){e.frame.find(".header-path").text("resized")}})}},[31]);
//# sourceMappingURL=test.js.map