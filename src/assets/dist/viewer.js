webpackJsonp([3],{2:function(e,t,i){function n(e,t){for(var i=e.toLowerCase().split(/-|\+/),n={ctrlKey:"",altKey:"",shiftKey:""},e=i[i.length-1],a=0;a<i.length-1;a++)switch(i[a]){case"c":n.ctrlKey="c-";break;case"a":n.altKey="a-";break;case"s":n.shiftKey="s-"}e=n.ctrlKey+n.altKey+n.shiftKey+e,u[e]=t}function a(e,t){c[e]=t,l('[data-action="'+e+'"]').click(function(e){return e.preventDefault(),e.stopPropagation(),t(),!1})}function r(e){c[e]()}function o(e){"string"==typeof e?l('[data-action="'+e+'"]').attr("disabled",!1):e.forEach(o)}function s(e){"string"==typeof e?l('[data-action="'+e+'"]').attr("disabled",!0):e.forEach(s)}var l=i(1);t.define=a,t.enable=o,t.disable=s,t.activate=r,t.bind=n;var c={},u={};l(window).keydown(function(e){if(!e.defaultPrevented){var t="";return e.ctrlKey&&(t+="c-"),e.altKey&&(t+="a-"),e.shiftKey&&(t+="s-"),t+=e.key.toLowerCase(),console.log("pressed "+t),u.hasOwnProperty(t)?(r(u[t]),!1):void 0}})},20:function(e,t){},23:function(e,t,i){var n,a;/*!
 * Viewer.js v0.5.0
 * https://github.com/fengyuanchen/viewerjs
 *
 * Copyright (c) 2015-2016 Fengyuan Chen
 * Released under the MIT license
 *
 * Date: 2016-07-22T08:46:05.003Z
 */
!function(t,i){"object"==typeof e&&"object"==typeof e.exports?e.exports=t.document?i(t,!0):function(e){if(!e.document)throw new Error("Viewer requires a window with a document");return i(e)}:i(t)}("undefined"!=typeof window?window:this,function(i,r){"use strict";function o(e){return qe.call(e).slice(8,-1).toLowerCase()}function s(e){return"string"==typeof e}function l(e){return"number"==typeof e&&!isNaN(e)}function c(e){return"undefined"==typeof e}function u(e){return"object"==typeof e&&null!==e}function d(e){var t,i;if(!u(e))return!1;try{return t=e.constructor,i=t.prototype,t&&i&&Me.call(i,"isPrototypeOf")}catch(n){return!1}}function f(e){return"function"===o(e)}function m(e){return Array.isArray?Array.isArray(e):"array"===o(e)}function h(e,t){return t=t>=0?t:0,Array.from?Array.from(e).slice(t):Oe.call(e,t)}function v(e,t){var i=-1;return t.indexOf?t.indexOf(e):(p(t,function(t,n){if(t===e)return i=n,!1}),i)}function g(e){return s(e)&&(e=e.trim?e.trim():e.replace(Se,"1")),e}function p(e,t){var i,n;if(e&&f(t))if(m(e)||l(e.length))for(n=0,i=e.length;n<i&&t.call(e,e[n],n,e)!==!1;n++);else if(u(e))for(n in e)if(e.hasOwnProperty(n)&&t.call(e,e[n],n,e)===!1)break;return e}function w(e){var t;if(arguments.length>1){if(t=h(arguments),Object.assign)return Object.assign.apply(Object,t);t.shift(),p(t,function(t){p(t,function(t,i){e[i]=t})})}return e}function b(e,t){var i=h(arguments,2);return function(){return e.apply(t,i.concat(h(arguments)))}}function y(e,t){var i=e.style;p(t,function(e,t){Fe.test(t)&&l(e)&&(e+="px"),i[t]=e})}function x(e){return i.getComputedStyle?i.getComputedStyle(e,null):e.currentStyle}function z(e,t){return e.classList?e.classList.contains(t):e.className.indexOf(t)>-1}function E(e,t){var i;if(t){if(l(e.length))return p(e,function(e){E(e,t)});if(e.classList)return e.classList.add(t);i=g(e.className),i?i.indexOf(t)<0&&(e.className=i+" "+t):e.className=t}}function D(e,t){if(t)return l(e.length)?p(e,function(e){D(e,t)}):e.classList?e.classList.remove(t):void(e.className.indexOf(t)>=0&&(e.className=e.className.replace(t,"")))}function k(e,t,i){return l(e.length)?p(e,function(e){k(e,t,i)}):void(i?E(e,t):D(e,t))}function I(e){return e.replace(Xe,"$1-$2").toLowerCase()}function L(e,t){return u(e[t])?e[t]:e.dataset?e.dataset[t]:e.getAttribute("data-"+I(t))}function Y(e,t,i){u(i)?e[t]=i:e.dataset?e.dataset[t]=i:e.setAttribute("data-"+I(t),i)}function T(e,t){u(e[t])?delete e[t]:e.dataset?delete e.dataset[t]:e.removeAttribute("data-"+I(t))}function F(e,t,i,n){var a=g(t).split(Ce),r=i;return a.length>1?p(a,function(t){F(e,t,i)}):(n&&(i=function(){return X(e,t,i),r.apply(e,arguments)}),void(e.addEventListener?e.addEventListener(t,i,!1):e.attachEvent&&e.attachEvent("on"+t,i)))}function X(e,t,i){var n=g(t).split(Ce);return n.length>1?p(n,function(t){X(e,t,i)}):void(e.removeEventListener?e.removeEventListener(t,i,!1):e.detachEvent&&e.detachEvent("on"+t,i))}function S(e,t,i){var n;return e.dispatchEvent?(f(Z)&&f(CustomEvent)?n=c(i)?new Z(t,{bubbles:!0,cancelable:!0}):new CustomEvent(t,{detail:i,bubbles:!0,cancelable:!0}):c(i)?(n=$.createEvent("Event"),n.initEvent(t,!0,!0)):(n=$.createEvent("CustomEvent"),n.initCustomEvent(t,!0,!0,i)),e.dispatchEvent(n)):e.fireEvent?e.fireEvent("on"+t):void 0}function C(e){e.preventDefault?e.preventDefault():e.returnValue=!1}function V(e){var t,n=e||i.event;return n.target||(n.target=n.srcElement||$),l(n.pageX)||(t=$.documentElement,n.pageX=n.clientX+(i.scrollX||t&&t.scrollLeft||0)-(t&&t.clientLeft||0),n.pageY=n.clientY+(i.scrollY||t&&t.scrollTop||0)-(t&&t.clientTop||0)),n}function N(e){var t=$.documentElement,n=e.getBoundingClientRect();return{left:n.left+(i.scrollX||t&&t.scrollLeft||0)-(t&&t.clientLeft||0),top:n.top+(i.scrollY||t&&t.scrollTop||0)-(t&&t.clientTop||0)}}function P(e){var t=e.length,i=0,n=0;return t&&(p(e,function(e){i+=e.pageX,n+=e.pageY}),i/=t,n/=t),{pageX:i,pageY:n}}function A(e,t){return e.getElementsByTagName(t)}function W(e,t){return e.getElementsByClassName?e.getElementsByClassName(t):e.querySelectorAll("."+t)}function R(e,t){return t.length?p(t,function(t){R(e,t)}):void e.appendChild(t)}function _(e){e.parentNode&&e.parentNode.removeChild(e)}function q(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function M(e,t){c(e.textContent)?e.innerText=t:e.textContent=t}function O(e){return e.offsetWidth}function B(e){return s(e)?e.replace(/^.*\//,"").replace(/[\?&#].*$/,""):""}function K(e,t){var i;return e.naturalWidth?t(e.naturalWidth,e.naturalHeight):(i=$.createElement("img"),i.onload=function(){t(this.width,this.height)},void(i.src=e.src))}function H(e){var t=[],i=e.rotate,n=e.scaleX,a=e.scaleY;return l(i)&&t.push("rotate("+i+"deg)"),l(n)&&t.push("scaleX("+n+")"),l(a)&&t.push("scaleY("+a+")"),t.length?t.join(" "):"none"}function j(e){switch(e){case 2:return ie;case 3:return ne;case 4:return ae}}function U(e,t){var i=this;i.element=e,i.options=w({},U.DEFAULTS,d(t)&&t),i.isImg=!1,i.isBuilt=!1,i.isShown=!1,i.isViewed=!1,i.isFulled=!1,i.isPlayed=!1,i.wheeling=!1,i.playing=!1,i.fading=!1,i.tooltiping=!1,i.transitioning=!1,i.action=!1,i.target=!1,i.timeout=!1,i.index=0,i.length=0,i.init()}var $=i.document,Z=i.Event,J="viewer",G=J+"-fixed",Q=J+"-open",ee=J+"-show",te=J+"-hide",ie="viewer-hide-xs-down",ne="viewer-hide-sm-down",ae="viewer-hide-md-down",re=J+"-fade",oe=J+"-in",se=J+"-move",le=J+"-active",ce=J+"-invisible",ue=J+"-transition",de=J+"-fullscreen",fe=J+"-fullscreen-exit",me=J+"-close",he="mousedown touchstart pointerdown MSPointerDown",ve="mousemove touchmove pointermove MSPointerMove",ge="mouseup touchend touchcancel pointerup pointercancel MSPointerUp MSPointerCancel",pe="wheel mousewheel DOMMouseScroll",we="transitionend",be="load",ye="keydown",xe="click",ze="resize",Ee="ready",De="show",ke="shown",Ie="hide",Le="hidden",Ye="view",Te="viewed",Fe=/^(width|height|left|top|marginLeft|marginTop)$/,Xe=/([a-z\d])([A-Z])/g,Se=/^\s+(.*)\s+$/,Ce=/\s+/,Ve="undefined"!=typeof $.createElement(J).style.transition,Ne=Math.min,Pe=Math.max,Ae=Math.abs,We=Math.sqrt,Re=Math.round,_e=Object.prototype,qe=_e.toString,Me=_e.hasOwnProperty,Oe=Array.prototype.slice;U.prototype={constructor:U,init:function(){var e=this,t=e.options,n=e.element,a="img"===n.tagName.toLowerCase(),r=a?[n]:A(n,"img"),o=r.length,s=b(e.ready,e);L(n,J)||(Y(n,J,e),o&&(f(t.ready)&&F(n,Ee,t.ready,!0),Ve||(t.transition=!1),e.isImg=a,e.length=o,e.count=0,e.images=r,e.body=$.body,e.scrollbarWidth=i.innerWidth-$.body.clientWidth,t.inline?(F(n,Ee,function(){e.view()},!0),p(r,function(e){e.complete?s():F(e,be,s,!0)})):F(n,xe,e._start=b(e.start,e))))},ready:function(){var e=this;e.count++,e.count===e.length&&e.build()},build:function(){var e,t,i,n,a,r,o,s,l=this,c=l.options,u=l.element;l.isBuilt||(e=$.createElement("div"),e.innerHTML=U.TEMPLATE,l.parent=t=u.parentNode,l.viewer=i=W(e,"viewer-container")[0],l.canvas=W(i,"viewer-canvas")[0],l.footer=W(i,"viewer-footer")[0],l.title=o=W(i,"viewer-title")[0],l.toolbar=a=W(i,"viewer-toolbar")[0],l.navbar=r=W(i,"viewer-navbar")[0],l.button=n=W(i,"viewer-button")[0],l.tooltipBox=W(i,"viewer-tooltip")[0],l.player=W(i,"viewer-player")[0],l.list=W(i,"viewer-list")[0],E(o,c.title?j(c.title):te),E(a,c.toolbar?j(c.toolbar):te),E(r,c.navbar?j(c.navbar):te),k(n,te,!c.button),k(a.querySelector(".viewer-one-to-one"),ce,!c.zoomable),k(a.querySelectorAll('li[class*="zoom"]'),ce,!c.zoomable),k(a.querySelectorAll('li[class*="flip"]'),ce,!c.scalable),c.rotatable||(s=a.querySelectorAll('li[class*="rotate"]'),E(s,ce),R(a,s)),c.inline?(E(n,de),y(i,{zIndex:c.zIndexInline}),"static"===x(t).position&&y(t,{position:"relative"})):(E(n,me),E(i,G),E(i,re),E(i,te),y(i,{zIndex:c.zIndex})),t.insertBefore(i,u.nextSibling),c.inline&&(l.render(),l.bind(),l.isShown=!0),l.isBuilt=!0,S(u,Ee))},unbuild:function(){var e=this;e.isBuilt&&(e.isBuilt=!1,_(e.viewer))},bind:function(){var e=this,t=e.options,n=e.element,a=e.viewer;f(t.view)&&F(n,Ye,t.view),f(t.viewed)&&F(n,Te,t.viewed),F(a,xe,e._click=b(e.click,e)),F(a,pe,e._wheel=b(e.wheel,e)),F(e.canvas,he,e._mousedown=b(e.mousedown,e)),F($,ve,e._mousemove=b(e.mousemove,e)),F($,ge,e._mouseup=b(e.mouseup,e)),F($,ye,e._keydown=b(e.keydown,e)),F(i,ze,e._resize=b(e.resize,e))},unbind:function(){var e=this,t=e.options,n=e.element,a=e.viewer;f(t.view)&&X(n,Ye,t.view),f(t.viewed)&&X(n,Te,t.viewed),X(a,xe,e._click),X(a,pe,e._wheel),X(e.canvas,he,e._mousedown),X($,ve,e._mousemove),X($,ge,e._mouseup),X($,ye,e._keydown),X(i,ze,e._resize)},render:function(){var e=this;e.initContainer(),e.initViewer(),e.initList(),e.renderViewer()},initContainer:function(){var e=this;e.containerData={width:i.innerWidth,height:i.innerHeight}},initViewer:function(){var e,t=this,i=t.options,n=t.parent;i.inline&&(t.parentData=e={width:Pe(n.offsetWidth,i.minWidth),height:Pe(n.offsetHeight,i.minHeight)}),!t.isFulled&&e||(e=t.containerData),t.viewerData=w({},e)},renderViewer:function(){var e=this;e.options.inline&&!e.isFulled&&y(e.viewer,e.viewerData)},initList:function(){var e=this,t=e.options,i=e.element,n=e.list,a=[];p(e.images,function(e,i){var n=e.src,r=e.alt||B(n),o=t.url;n&&(s(o)?o=e.getAttribute(o):f(o)&&(o=o.call(e,e)),a.push('<li><img src="'+n+'" data-action="view" data-index="'+i+'" data-original-url="'+(o||n)+'" alt="'+r+'"></li>'))}),n.innerHTML=a.join(""),p(A(n,"img"),function(t){Y(t,"filled",!0),F(t,be,b(e.loadImage,e),!0)}),e.items=A(n,"li"),t.transition&&F(i,Te,function(){E(n,ue)},!0)},renderList:function(e){var t=this,i=e||t.index,n=t.items[i].offsetWidth||30,a=n+1;y(t.list,{width:a*t.length,marginLeft:(t.viewerData.width-n)/2-a*i})},resetList:function(){var e=this;q(e.list),D(e.list,ue),y({marginLeft:0})},initImage:function(e){var t=this,i=t.options,n=t.image,a=t.viewerData,r=t.footer.offsetHeight,o=a.width,s=Pe(a.height-r,r),l=t.imageData||{};K(n,function(n,a){var r,c,u=n/a,d=o,m=s;s*u>o?m=o/u:d=s*u,d=Ne(.9*d,n),m=Ne(.9*m,a),c={naturalWidth:n,naturalHeight:a,aspectRatio:u,ratio:d/n,width:d,height:m,left:(o-d)/2,top:(s-m)/2},r=w({},c),i.rotatable&&(c.rotate=l.rotate||0,r.rotate=0),i.scalable&&(c.scaleX=l.scaleX||1,c.scaleY=l.scaleY||1,r.scaleX=1,r.scaleY=1),t.imageData=c,t.initialImageData=r,f(e)&&e()})},renderImage:function(e){var t=this,i=t.image,n=t.imageData,a=H(n);y(i,{width:n.width,height:n.height,marginLeft:n.left,marginTop:n.top,WebkitTransform:a,msTransform:a,transform:a}),f(e)&&(t.transitioning?F(i,we,e,!0):e())},resetImage:function(){var e=this;e.image&&(_(e.image),e.image=null)},start:function(e){var t=this,i=V(e),n=i.target;"img"===n.tagName.toLowerCase()&&(t.target=n,t.show())},click:function(e){var t=this,i=V(e),n=i.target,a=L(n,"action"),r=t.imageData;switch(a){case"mix":t.isPlayed?t.stop():t.options.inline?t.isFulled?t.exit():t.full():t.hide();break;case"view":t.view(L(n,"index"));break;case"zoom-in":t.zoom(.1,!0);break;case"zoom-out":t.zoom(-.1,!0);break;case"one-to-one":t.toggle();break;case"reset":t.reset();break;case"prev":t.prev();break;case"play":t.play();break;case"next":t.next();break;case"rotate-left":t.rotate(-90);break;case"rotate-right":t.rotate(90);break;case"flip-horizontal":t.scaleX(-r.scaleX||-1);break;case"flip-vertical":t.scaleY(-r.scaleY||-1);break;default:t.isPlayed&&t.stop()}},load:function(){var e=this,t=e.options,i=e.image,n=e.index,a=e.viewerData;e.timeout&&(clearTimeout(e.timeout),e.timeout=!1),D(i,ce),i.style.cssText="width:0;height:0;margin-left:"+a.width/2+"px;margin-top:"+a.height/2+"px;max-width:none!important;visibility:visible;",e.initImage(function(){k(i,ue,t.transition),k(i,se,t.movable),e.renderImage(function(){e.isViewed=!0,S(e.element,Te,{originalImage:e.images[n],index:n,image:i})})})},loadImage:function(e){var t=V(e),i=t.target,n=i.parentNode,a=n.offsetWidth||30,r=n.offsetHeight||50,o=!!L(i,"filled");K(i,function(e,t){var n=e/t,s=a,l=r;r*n>a?o?s=r*n:l=a/n:o?l=a/n:s=r*n,y(i,{width:s,height:l,marginLeft:(a-s)/2,marginTop:(r-l)/2})})},resize:function(){var e=this;e.initContainer(),e.initViewer(),e.renderViewer(),e.renderList(),e.isViewed&&e.initImage(function(){e.renderImage()}),e.isPlayed&&p(A(e.player,"img"),function(t){F(t,be,b(e.loadImage,e),!0),S(t,be)})},wheel:function(e){var t=this,i=V(e),n=Number(t.options.zoomRatio)||.1,a=1;t.isViewed&&(C(i),t.wheeling||(t.wheeling=!0,setTimeout(function(){t.wheeling=!1},50),i.deltaY?a=i.deltaY>0?1:-1:i.wheelDelta?a=-i.wheelDelta/120:i.detail&&(a=i.detail>0?1:-1),t.zoom(-a*n,!0,i)))},keydown:function(e){var t=this,i=V(e),n=t.options,a=i.keyCode||i.which||i.charCode;if(t.isFulled&&n.keyboard)switch(a){case 27:t.isPlayed?t.stop():n.inline?t.isFulled&&t.exit():t.hide();break;case 32:t.isPlayed&&t.stop();break;case 37:t.prev();break;case 38:C(i),t.zoom(n.zoomRatio,!0);break;case 39:t.next();break;case 40:C(i),t.zoom(-n.zoomRatio,!0);break;case 48:case 49:(i.ctrlKey||i.shiftKey)&&(C(i),t.toggle())}},mousedown:function(e){var t,i,n=this,a=n.options,r=V(e),o=!!a.movable&&"move",s=r.touches;if(n.isViewed){if(s){if(t=s.length,t>1){if(!a.zoomable||2!==t)return;i=s[1],n.startX2=i.pageX,n.startY2=i.pageY,o="zoom"}else n.isSwitchable()&&(o="switch");i=s[0]}o&&(C(r),n.action=o,n.startX=i?i.pageX:r.pageX,n.startY=i?i.pageY:r.pageY)}},mousemove:function(e){var t,i,n=this,a=n.options,r=V(e),o=n.action,s=n.image,l=r.touches;if(n.isViewed){if(l){if(t=l.length,t>1){if(!a.zoomable||2!==t)return;i=l[1],n.endX2=i.pageX,n.endY2=i.pageY}i=l[0]}o&&(C(r),"move"===o&&a.transition&&z(s,ue)&&D(s,ue),n.endX=i?i.pageX:r.pageX,n.endY=i?i.pageY:r.pageY,n.change(r))}},mouseup:function(e){var t=this,i=V(e),n=t.action;n&&(C(i),"move"===n&&t.options.transition&&E(t.image,ue),t.action=!1)},show:function(){var e,t=this,i=t.options,n=t.element;return i.inline||t.transitioning?t:(t.isBuilt||t.build(),e=t.viewer,f(i.show)&&F(n,De,i.show,!0),S(n,De)===!1?t:(t.open(),D(e,te),F(n,ke,function(){t.view(t.target?v(t.target,h(t.images)):t.index),t.target=!1},!0),i.transition?(t.transitioning=!0,E(e,ue),O(e),F(e,we,b(t.shown,t),!0),E(e,oe)):(E(e,oe),t.shown()),t))},hide:function(){var e=this,t=e.options,i=e.element,n=e.viewer;return t.inline||e.transitioning||!e.isShown?e:(f(t.hide)&&F(i,Ie,t.hide,!0),S(i,Ie)===!1?e:(e.isViewed&&t.transition?(e.transitioning=!0,F(e.image,we,function(){F(n,we,b(e.hidden,e),!0),D(n,oe)},!0),e.zoomTo(0,!1,!1,!0)):(D(n,oe),e.hidden()),e))},view:function(e){var t,i,n,a,r,o=this,s=o.element,l=o.title,c=o.canvas;return e=Number(e)||0,!o.isShown||o.isPlayed||e<0||e>=o.length||o.isViewed&&e===o.index?o:(i=o.items[e],n=A(i,"img")[0],a=L(n,"originalUrl"),r=n.getAttribute("alt"),t=$.createElement("img"),t.src=a,t.alt=r,S(s,Ye,{originalImage:o.images[e],index:e,image:t})===!1?o:(o.image=t,o.isViewed&&D(o.items[o.index],le),E(i,le),o.isViewed=!1,o.index=e,o.imageData=null,E(t,ce),q(c),R(c,t),o.renderList(),q(l),F(s,Te,function(){var e=o.imageData,t=e.naturalWidth,i=e.naturalHeight;M(l,r+" ("+t+" × "+i+")")},!0),t.complete?o.load():(F(t,be,b(o.load,o),!0),o.timeout&&clearTimeout(o.timeout),o.timeout=setTimeout(function(){D(t,ce),o.timeout=!1},1e3)),o))},prev:function(){var e=this;return e.view(Pe(e.index-1,0)),e},next:function(){var e=this;return e.view(Ne(e.index+1,e.length-1)),e},move:function(e,t){var i=this,n=i.imageData;return i.moveTo(c(e)?e:n.left+Number(e),c(t)?t:n.top+Number(t)),i},moveTo:function(e,t){var i=this,n=i.imageData,a=!1;return c(t)&&(t=e),e=Number(e),t=Number(t),i.isViewed&&!i.isPlayed&&i.options.movable&&(l(e)&&(n.left=e,a=!0),l(t)&&(n.top=t,a=!0),a&&i.renderImage()),i},zoom:function(e,t,i){var n=this,a=n.imageData;return e=Number(e),e=e<0?1/(1-e):1+e,n.zoomTo(a.width*e/a.naturalWidth,t,i),n},zoomTo:function(e,t,i,n){var a,r,o,s,c=this,u=c.options,d=.01,f=100,m=c.imageData;return e=Pe(0,e),l(e)&&c.isViewed&&!c.isPlayed&&(n||u.zoomable)&&(n||(d=Pe(d,u.minZoomRatio),f=Ne(f,u.maxZoomRatio),e=Ne(Pe(e,d),f)),e>.95&&e<1.05&&(e=1),a=m.naturalWidth*e,r=m.naturalHeight*e,i?(o=N(c.viewer),s=i.touches?P(i.touches):{pageX:i.pageX,pageY:i.pageY},m.left-=(a-m.width)*((s.pageX-o.left-m.left)/m.width),m.top-=(r-m.height)*((s.pageY-o.top-m.top)/m.height)):(m.left-=(a-m.width)/2,m.top-=(r-m.height)/2),m.width=a,m.height=r,m.ratio=e,c.renderImage(),t&&c.tooltip()),c},rotate:function(e){var t=this;return t.rotateTo((t.imageData.rotate||0)+Number(e)),t},rotateTo:function(e){var t=this,i=t.imageData;return e=Number(e),l(e)&&t.isViewed&&!t.isPlayed&&t.options.rotatable&&(i.rotate=e,t.renderImage()),t},scale:function(e,t){var i=this,n=i.imageData,a=!1;return c(t)&&(t=e),e=Number(e),t=Number(t),i.isViewed&&!i.isPlayed&&i.options.scalable&&(l(e)&&(n.scaleX=e,a=!0),l(t)&&(n.scaleY=t,a=!0),a&&i.renderImage()),i},scaleX:function(e){var t=this;return t.scale(e,t.imageData.scaleY),t},scaleY:function(e){var t=this;return t.scale(t.imageData.scaleX,e),t},play:function(){var e,t=this,i=t.options,n=t.player,a=b(t.loadImage,t),r=[],o=0,s=0;return!t.isShown||t.isPlayed?t:(i.fullscreen&&t.requestFullscreen(),t.isPlayed=!0,E(n,ee),p(t.items,function(e,t){var l=A(e,"img")[0],c=$.createElement("img");c.src=L(l,"originalUrl"),c.alt=l.getAttribute("alt"),o++,E(c,re),k(c,ue,i.transition),z(e,le)&&(E(c,oe),s=t),r.push(c),F(c,be,a,!0),R(n,c)}),l(i.interval)&&i.interval>0&&(e=function(){t.playing=setTimeout(function(){D(r[s],oe),s++,s=s<o?s:0,E(r[s],oe),e()},i.interval)},o>1&&e()),t)},stop:function(){var e=this,t=e.player;return e.isPlayed?(e.options.fullscreen&&e.exitFullscreen(),e.isPlayed=!1,clearTimeout(e.playing),D(t,ee),q(t),e):e},full:function(){var e=this,t=e.options,i=e.viewer,n=e.image,a=e.list;return!e.isShown||e.isPlayed||e.isFulled||!t.inline?e:(e.isFulled=!0,e.open(),E(e.button,fe),t.transition&&(D(n,ue),D(a,ue)),E(i,G),i.setAttribute("style",""),y(i,{zIndex:t.zIndex}),e.initContainer(),e.viewerData=w({},e.containerData),e.renderList(),e.initImage(function(){e.renderImage(function(){t.transition&&setTimeout(function(){E(n,ue),E(a,ue)},0)})}),e)},exit:function(){var e=this,t=e.options,i=e.viewer,n=e.image,a=e.list;return e.isFulled?(e.isFulled=!1,e.close(),D(e.button,fe),t.transition&&(D(n,ue),D(a,ue)),D(i,G),y(i,{zIndex:t.zIndexInline}),e.viewerData=w({},e.parentData),e.renderViewer(),e.renderList(),e.initImage(function(){e.renderImage(function(){t.transition&&setTimeout(function(){E(n,ue),E(a,ue)},0)})}),e):e},tooltip:function(){var e=this,t=e.options,i=e.tooltipBox,n=e.imageData;return e.isViewed&&!e.isPlayed&&t.tooltip?(M(i,Re(100*n.ratio)+"%"),e.tooltiping?clearTimeout(e.tooltiping):t.transition?(e.fading&&S(i,we),E(i,ee),E(i,re),E(i,ue),O(i),E(i,oe)):E(i,ee),e.tooltiping=setTimeout(function(){t.transition?(F(i,we,function(){D(i,ee),D(i,re),D(i,ue),e.fading=!1},!0),D(i,oe),e.fading=!0):D(i,ee),e.tooltiping=!1},1e3),e):e},toggle:function(){var e=this;return 1===e.imageData.ratio?e.zoomTo(e.initialImageData.ratio,!0):e.zoomTo(1,!0),e},reset:function(){var e=this;return e.isViewed&&!e.isPlayed&&(e.imageData=w({},e.initialImageData),e.renderImage()),e},update:function(){var e,t=this,i=[];return t.isImg&&!t.element.parentNode?t.destroy():(t.length=t.images.length,t.isBuilt&&(p(t.items,function(e,n){var a=A(e,"img")[0],r=t.images[n];r?r.src!==a.src&&i.push(n):i.push(n)}),y(t.list,{width:"auto"}),t.initList(),t.isShown&&(t.length?t.isViewed&&(e=v(t.index,i),e>=0?(t.isViewed=!1,t.view(Pe(t.index-(e+1),0))):E(t.items[t.index],le)):(t.image=null,t.isViewed=!1,t.index=0,t.imageData=null,q(t.canvas),q(t.title)))),t)},destroy:function(){var e=this,t=e.element;return e.options.inline?e.unbind():(e.isShown&&e.unbind(),X(t,xe,e._start)),e.unbuild(),T(t,J),e},open:function(){var e=this.body;E(e,Q),e.style.paddingRight=this.scrollbarWidth+"px"},close:function(){var e=this.body;D(e,Q),e.style.paddingRight=0},shown:function(){var e=this,t=e.options,i=e.element;e.transitioning=!1,e.isFulled=!0,e.isShown=!0,e.isVisible=!0,e.render(),e.bind(),f(t.shown)&&F(i,ke,t.shown,!0),S(i,ke)},hidden:function(){var e=this,t=e.options,i=e.element;e.transitioning=!1,e.isViewed=!1,e.isFulled=!1,e.isShown=!1,e.isVisible=!1,e.unbind(),e.close(),E(e.viewer,te),e.resetList(),e.resetImage(),f(t.hidden)&&F(i,Le,t.hidden,!0),S(i,Le)},requestFullscreen:function(){var e=this,t=$.documentElement;!e.isFulled||$.fullscreenElement||$.mozFullScreenElement||$.webkitFullscreenElement||$.msFullscreenElement||(t.requestFullscreen?t.requestFullscreen():t.msRequestFullscreen?t.msRequestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT))},exitFullscreen:function(){var e=this;e.isFulled&&($.exitFullscreen?$.exitFullscreen():$.msExitFullscreen?$.msExitFullscreen():$.mozCancelFullScreen?$.mozCancelFullScreen():$.webkitExitFullscreen&&$.webkitExitFullscreen())},change:function(e){var t=this,i=t.endX-t.startX,n=t.endY-t.startY;switch(t.action){case"move":t.move(i,n);break;case"zoom":t.zoom(function(e,t,i,n){var a=We(e*e+t*t),r=We(i*i+n*n);return(r-a)/a}(Ae(t.startX-t.startX2),Ae(t.startY-t.startY2),Ae(t.endX-t.endX2),Ae(t.endY-t.endY2)),!1,e),t.startX2=t.endX2,t.startY2=t.endY2;break;case"switch":t.action="switched",Ae(i)>Ae(n)&&(i>1?t.prev():i<-1&&t.next())}t.startX=t.endX,t.startY=t.endY},isSwitchable:function(){var e=this,t=e.imageData,i=e.viewerData;return t.left>=0&&t.top>=0&&t.width<=i.width&&t.height<=i.height}},U.DEFAULTS={inline:!1,button:!0,navbar:!0,title:!0,toolbar:!0,tooltip:!0,movable:!0,zoomable:!0,rotatable:!0,scalable:!0,transition:!0,fullscreen:!0,keyboard:!0,interval:5e3,minWidth:200,minHeight:100,zoomRatio:.1,minZoomRatio:.01,maxZoomRatio:100,zIndex:2015,zIndexInline:0,url:"src",build:null,built:null,show:null,shown:null,hide:null,hidden:null,view:null,viewed:null},U.TEMPLATE='<div class="viewer-container"><div class="viewer-canvas"></div><div class="viewer-footer"><div class="viewer-title"></div><ul class="viewer-toolbar"><li class="viewer-zoom-in" data-action="zoom-in"></li><li class="viewer-zoom-out" data-action="zoom-out"></li><li class="viewer-one-to-one" data-action="one-to-one"></li><li class="viewer-reset" data-action="reset"></li><li class="viewer-prev" data-action="prev"></li><li class="viewer-play" data-action="play"></li><li class="viewer-next" data-action="next"></li><li class="viewer-rotate-left" data-action="rotate-left"></li><li class="viewer-rotate-right" data-action="rotate-right"></li><li class="viewer-flip-horizontal" data-action="flip-horizontal"></li><li class="viewer-flip-vertical" data-action="flip-vertical"></li></ul><div class="viewer-navbar"><ul class="viewer-list"></ul></div></div><div class="viewer-tooltip"></div><div class="viewer-button" data-action="mix"></div><div class="viewer-player"></div></div>';var Be=i.Viewer;return U.noConflict=function(){return i.Viewer=Be,U},U.setDefaults=function(e){w(U.DEFAULTS,e)},n=[],a=function(){return U}.apply(t,n),!(void 0!==a&&(e.exports=a)),r||(i.Viewer=U),U})},3:function(e,t){function i(e){var e=e.replace(/\/[^\/]+$/,"");return""===e?"/":e}function n(e){return e.replace(/^.*\//,"")}function a(e,t){e=e.trim(),e.startsWith("/")||(e=t+"/"+e);for(var i=e.split("/"),n=[],a=0;a<i.length;a++)".."===i[a]?n.length>=1&&n.pop():""!==i[a]&&"."!==i[a]&&n.push(i[a]);return"/"+n.join("/")}t.dirName=i,t.fileName=n,t.convert=a},55:function(e,t,i){var n=i(1),a=i(2);i(3);i(20);var r=i(23),o=n("body").data("path").replace(/\/$/,""),s=!0,l=new r(n("#viewer")[0],{inline:!0,viewed:function(e){if(s)return l.view(n("#viewer").children(".active").index()),s=!1,e.stopPropagation(),!1;n("#viewer img.active").removeClass("active");var t=n(e.detail.originalImage);t.addClass("active"),n("#viewer-name").text(t.attr("alt"))}});a.define("close",function(){location.href=o+"/files"+n("#viewer img.active").data("path")})}},[55]);
//# sourceMappingURL=viewer.js.map