/*
 * TEXTSTEP
 * Copyright (c) 2016 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import DirView from './dirview';

export {DirView};

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

export class Component {
    constructor() {
        this.outer = elem('div');
    }

    get width() {
        return this.outer.getBoundingClientRect().width;
    }

    set width(width) {
        this.outer.style.width = width;
    }

    get height() {
        return this.outer.getBoundingClientRect().height;
    }

    set height(height) {
        this.outer.style.height = height;
    }

    set minWidth(width) {
        this.outer.style.minWidth = width;
    }

    set maxWidth(width) {
        this.outer.style.maxWidth = width;
    }

    set minHeight(height) {
        this.outer.style.minHeight = height;
    }

    set maxHeight(height) {
        this.outer.style.maxHeight = height;
    }

    get visible() {
        return this.outer.style.display !== 'none';
    }

    set visible(visible) {
        this.outer.style.display = visible ? '' : 'none';
    }
}

export class Container extends Component {
    constructor() {
        super();
        this.inner = this.outer;
    }

    append(child, properties = {}) {
        if (child instanceof Component) {
            child = child.outer;
        }
        if (properties.hasOwnProperty('grow')) {
            child.style.flexGrow = properties.grow;
        }
        this.inner.appendChild(child);
    }

    remove(child) {
        if (child instanceof Component) {
            this.inner.removeChild(child.outer);
        } else {
            this.inner.removeChild(child);
        }
    }
}

export class StackPanel extends Container {
    constructor(direction = 'column') {
        super();
        this.outer.className = 'ts-stack-panel';
        this.outer.style.flexDirection = direction;
    }

    get direction() {
        return this.outer.style.flexDirection;
    }

    set direction(direction) {
        this.outer.style.flexDirection = direction;
    }
}

export class ListView extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-list-view-items'});
        this.outer.className = 'ts-list-view';
        this.outer.appendChild(this.inner);
        this.onselect = () => {};
    }

    add(label) {
        let item = elem('a', {'class': 'ts-list-view-item'}, [label]);
        item.onclick = () => this.onselect(item);
        this.inner.appendChild(item);
        return item;
    }
    
    select(item) {
        for (let i = 0; i < this.inner.children.length; i++) {
            this.inner.children[i].classList.remove('active');
        }
        if (item) {
            item.classList.add('active');
        }
    }

}

export class ScrollPanel extends Container {
    constructor() {
        super();
        this.inner = elem('div', {'class': 'ts-scroll-panel-inner'});
        this.outer.className = 'ts-scroll-panel';
        this.outer.appendChild(this.inner);
    }
}

export class ProgressBar extends Component {
    constructor() {
        super();
        this.bar = elem('div', {'class': 'ts-progress-bar'});
        this.label = elem('div', {'class': 'ts-progress-label'});
        this.outer = elem('div', { 'class': 'ts-progress' }, [
            this.bar,
            this.label,
        ]);
    }

    set progress(progress) {
        progress = Math.floor(progress);
        if (progress >= 100) {
            this.outer.className = 'ts-progress ts-progress-success';
        } else {
            this.outer.className = 'ts-progress ts-progress-active';
        }
        this.bar.style.width = progress + '%';
        this.bar.innerText = progress + '%';
    }

    set status(status) {
        this.label.innerText = status;
    }
}
