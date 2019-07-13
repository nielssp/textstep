/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import {
    Component,
    Container,
    StackRow,
    StackColumn,
    Grid,
    Button,
    ListItem,
    ListView,
    FieldSet,
    ScrollPanel,
    DialogContainer,
    ProgressBar,
    HueSlider,
    ValueSaturation,
    HsvPicker,
    ColorButton,
} from './component';
import {Toolbar} from './toolbar';
import DirView from './dirview';

export {
    Component,
    Container,
    StackRow,
    StackColumn,
    Grid,
    Button,
    ListItem,
    ListView,
    FieldSet,
    ScrollPanel,
    DialogContainer,
    ProgressBar,
    HueSlider,
    ValueSaturation,
    HsvPicker,
    ColorButton,
    Toolbar,
    DirView,
};

export function elem(tag, attributes = {}, children = []) {
    var elem = document.createElement(tag);
    for (var k in attributes) {
        if (attributes.hasOwnProperty(k)) {
            elem.setAttribute(k, attributes[k]);
        }
    }
    for (var i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
            elem.appendChild(document.createTextNode(children[i]));
        } else {
            elem.appendChild(children[i]);
        }
    }
    return elem;
}

export function byId(id) {
    return document.getElementById(id);
}

var gaid = 0;

export function animate(element) {
    var id = gaid++;
    var queue = [];
    var previous = null;
    var animation = {};
    animation.step = function (time) {
        if (queue.length === 0) {
            if (element.getAttribute('data-animation') == id) {
                element.removeAttribute('data-animation');
            }
            return;
        } else if (previous !== null) {
            if (!element.hasAttribute('data-animation')) {
                element.setAttribute('data-animation', id);
            } else if (element.getAttribute('data-animation') == id) {
                var delta = time - previous;
                if (!queue[0](delta)) {
                    queue.splice(0, 1);
                }
            }
        }
        previous = time;
        requestAnimationFrame(animation.step);
        return animation;
    };
    animation.run = function () {
        requestAnimationFrame(animation.step);
        return animation;
    };
    animation.css = function (property, init, target, duration) {
        var elapsed = 0;
        var diff = target - init;
        queue.push(function (delta) {
            elapsed += delta;
            if (elapsed >= duration) {
                element.style[property] = target + 'px';
                return false;
            } else {
                element.style[property] = (init + diff * elapsed / duration) + 'px';
                return true;
            }
        });
        return animation;
    };
    animation.then = function (callback) {
        queue.push(function (delta) {
            callback();
            return false;
        });
        return animation;
    };
    return animation;
}

export var shake = function (element, amount) {
    amount = typeof amount === "undefined" ? 10 : amount;
    var dbl = amount * 2;
    // TODO: getComputedStyle() may be a better solution??
    var rect = element.getBoundingClientRect();
    animate(element)
      .then(function () {
          element.style.position = 'absolute';
          element.style.left = rect.left + 'px';
          element.style.top = rect.top + 'px';
          element.style.marginTop = '0';
          element.style.marginLeft = '0';
      })
      .css('left', rect.left, rect.left + amount, 50)
      .css('left', rect.left + amount, rect.left - amount, 50)
      .css('left', rect.left - amount, rect.left + amount, 50)
      .css('left', rect.left + amount, rect.left, 50)
      .then(function () {
          element.style.position = '';
          element.style.left = '';
          element.style.top = '';
          element.style.marginTop = '';
          element.style.marginLeft = '';
      })
      .run();
};

export var onLongPress = function(el, callback) {
    var touching = false;
    
    var start = function (e) {
        touching = true;
    };
    
    var end = function (e) {
        touching = false;
    };
    
    el.addEventListener('touchstart', start, {passive: true});
    el.addEventListener('touchend', end, {passive: true});
    el.addEventListener('touchcancel', end, {passive: true});
    el.addEventListener('touchmove', end, {passive: true});
    el.addEventListener('contextmenu', function (e) {
        if (touching) {
            return callback(e);
        }
    });
};
