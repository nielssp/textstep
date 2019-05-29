/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import * as util from './util';
import Menu from './menu';
import ToolFrame from './toolframe';
import Toolbar from './toolbar';
import Dialog from './dialog';

export default function Frame(title) {
    this.id = null;
    this.title = title;
    this.isOpen = false;
    this.isVisible = false;
    this.hasFocus = false;
    this.wasResized = false;
    this.className = '';

    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    this.titleElem = ui.elem('div', {'class': 'frame-title'}, [this.title]);
    this.headElem = ui.elem('div', {'class': 'frame-head'}, [this.titleElem]);
    this.contentElem = ui.elem('div', {'class': 'frame-content'});
    this.bodyElem = ui.elem('div', {'class': 'frame-body'}, [this.contentElem]);
    this.elem = ui.elem('div', {'class': 'frame'}, [this.headElem, this.bodyElem]);

    this.actions = {};
    this.actionGroups = {};
    this.keyMap = {};

    this.menus = [];
    this.toolFrames = {};

    this.dialogs = [];

    this.isUnsaved = null;

    this.confirmClose = () => Promise.resolve(true);

    this.onOpen = null;
    this.onClose = null;
    this.onShow = null;
    this.onHide = null;
    this.onFocus = null;
    this.onBlur = null;
    this.onKeydown = null;
    this.onResize = null;

    this.elem.style.display = 'none';

    this.elem.onclick = () => this.requestFocus();

    var closeButton = ui.elem('a', {'data-action': 'close'});
    closeButton.onclick = () => this.close();
    this.headElem.appendChild(ui.elem('div', {'class': 'frame-actions'}, [closeButton]));

    var menuButton = ui.elem('a', {'data-action': 'toggle-menu'});
    menuButton.onclick = e => {
      e.stopPropagation();
      TEXTSTEP.toggleMenu();
    };
    this.headElem.insertBefore(ui.elem('div', {'class': 'frame-actions'}, [menuButton]), this.headElem.children[0]);
}

util.eventify(Frame.prototype);

Frame.prototype.updateElem = function () {
    this.elem.className = 'frame';
    if (this.hasFocus) {
        this.elem.className += ' frame-focus';
    }
    this.elem.className += ' ' + this.className;
};

Frame.prototype.addMenu = function (title) {
    var menu = new Menu(this, title);
    this.menus.push(menu);
    return menu;
};

Frame.prototype.createToolFrame = function (name, title) {
    var toolFrame = new ToolFrame(title);
    this.toolFrames[name] = toolFrame;
    return toolFrame;
};

Frame.prototype.createToolbar = function () {
    var toolbar = new Toolbar(this);
    this.bodyElem.insertBefore(toolbar.elem, this.contentElem);
    return toolbar;
};

Frame.prototype.alert = function (title, message) {
    if (!this.isOpen) {
        throw 'Frame not open';
    }
    return Dialog.alert(this.bodyElem, title, message);
};

Frame.prototype.confirm = function (title, message, choices, defaultChoice) {
    return Dialog.confirm(this.bodyElem, title, message, choices, defaultChoice);
};

Frame.prototype.prompt = function (title, message, value) {
    return Dialog.prompt(this.bodyElem, title, message, value);
};

Frame.prototype.file = function (title) {
    return Dialog.file(this.bodyElem, title);
};

Frame.prototype.keydown = function (e) {
    if (e.defaultPrevented || this.isDialogOpen()) {
        return;
    }
    if (this.onKeydown !== null) {
        if (!this.onKeydown(e)) {
            return false;
        }
    }
    var key = '';
    if (e.ctrlKey) {
        key += 'Ctrl+';
    }
    if (e.altKey) {
        key += 'Alt+';
    }
    if (e.shiftKey) {
        key += 'Shift+';
    }
    if (e.metaKey) {
        key += 'Meta+';
    }
    key += e.key.toUpperCase();
    if (this.keyMap.hasOwnProperty(key)) {
        e.preventDefault();
        this.activate(this.keyMap[key]);
        return false;
    }
};

Frame.prototype.bindKey = function (key, action) {
    var parts = key.toLowerCase().split(/-|\+/);
    var e = {ctrlKey: '', altKey: '', shiftKey: ''};
    var key = parts[parts.length - 1];
    for (var i = 0; i < parts.length - 1; i++) {
        switch (parts[i]) {
            case 'c':
                e.ctrlKey = 'Ctrl+';
                break;
            case 'a':
                e.altKey = 'Alt+';
                break;
            case 's':
                e.shiftKey = 'Shift+';
                break;
            case 'm':
                e.metaKey = 'Meta+';
                break;
        }
    }
    key = e.ctrlKey + e.altKey + e.shiftKey + key.toUpperCase();
    this.keyMap[key] = action;
};

Frame.prototype.defineAction = function (name, callback, groups) {
    if (!this.actions.hasOwnProperty(name)) {
        this.actions[name] = {
            callback: null,
            bindings: []
        };
    }
    this.actions[name].callback = callback;
    if (typeof groups !== 'undefined') {
        groups.forEach(function (group) {
            if (!this.actionGroups.hasOwnProperty(group)) {
                this.actionGroups[group] = [];
            }
            this.actionGroups[group].push(name);
        }, this);
    }
};

Frame.prototype.activate = function (name) {
    if (typeof name === 'string') {
        if (!this.actions.hasOwnProperty(name) || this.actions[name].callback === null) {
            console.error('Undefined action: ' + name);
        } else {
            this.actions[name].callback.apply(this, [name]);
        }
    } else {
        name.apply(this);
    }
};

Frame.prototype.bindAction = function (name, element) {
    if (typeof name !== 'string') {
        return;
    }
    if (!this.actions.hasOwnProperty(name)) {
        this.actions[name] = {
            callback: null,
            bindings: []
        };
    }
    this.actions[name].bindings.push(element);
}

Frame.prototype.isDialogOpen = function () {
    return this.dialogs.length > 0;
};

Frame.prototype.enableGroup = function (group) {
    if (this.actionGroups.hasOwnProperty(group)) {
        this.actionGroups[group].forEach(this.enableAction, this);
    }
};

Frame.prototype.disableGroup = function (group) {
    if (this.actionGroups.hasOwnProperty(group)) {
        this.actionGroups[group].forEach(this.disableAction, this);
    }
};

Frame.prototype.enableAction = function (name) {
    if (typeof name === 'string') {
        if (this.actions.hasOwnProperty(name)) {
            this.actions[name].bindings.forEach(function (element) {
                element.disabled = false;
            });
        }
    } else {
        name.forEach(this.enableAction, this);
    }
};

Frame.prototype.disableAction = function (name) {
    if (typeof name === 'string') {
        if (this.actions.hasOwnProperty(name)) {
            this.actions[name].bindings.forEach(function (element) {
                element.disabled = true;
            });
        }
    } else {
        name.forEach(this.disableAction, this);
    }
};

Frame.prototype.setTitle = function (title) {
    this.title = title;
    this.titleElem.textContent = this.title;
};

Frame.prototype.open = function () {
    if (this.isOpen) {
        return;
    }
    TEXTSTEP.openFrame(this);
    var rect = this.elem.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    if (this.isOpen) {
        if (this.onOpen !== null) {
            this.onOpen();
        }
    }
};

Frame.prototype.close = function () {
    if (!this.isOpen) {
        return;
    }
    this.confirmClose().then(close => {
        if (close) {
            TEXTSTEP.closeFrame(this);
            if (!this.isOpen) {
                if (this.onClose !== null) {
                    this.onClose();
                }
            }
        }
    });
};

Frame.prototype.show = function () {
    if (!this.isOpen || this.isVisible) {
        return;
    }
    this.elem.style.display = '';
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].show();
    }
    for (var tool in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(tool)) {
            this.toolFrames[tool].show();
        }
    }
    this.isVisible = true;
    if (this.onShow !== null) {
        this.onShow();
    }
};

Frame.prototype.hide = function () {
    if (!this.isVisible) {
        return;
    }
    this.elem.style.display = 'none';
    for (var i = 0; i < this.menus.length; i++) {
        this.menus[i].hide();
    }
    for (var tool in this.toolFrames) {
        if (this.toolFrames.hasOwnProperty(tool)) {
            this.toolFrames[tool].hide();
        }
    }
    this.isVisible = false;
    if (this.onHide !== null) {
        this.onHide();
    }
};

Frame.prototype.requestFocus = function () {
    TEXTSTEP.focusFrame(this);
};

Frame.prototype.receiveFocus = function () {
    this.hasFocus = true;
    this.updateElem();
    if (this.wasResized) {
        this.wasResized = false;
        this.resized();
    }
    if (this.onFocus !== null) {
        this.onFocus();
    }
};

Frame.prototype.loseFocus = function () {
    this.hasFocus = false;
    this.updateElem();
    if (this.onBlur !== null) {
        this.onBlur();
    }
};

Frame.prototype.resized = function () {
    if (!this.hasFocus) {
        this.wasResized = true;
    }
    var rect = this.elem.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    if (this.onResize !== null) {
        this.onResize();
    }
};

Frame.prototype.mouseDown = function (e) {

};

Frame.prototype.mouseMove = function (e) {
};

Frame.prototype.mouseUp = function (e) {
};

Frame.prototype.appendChild = function (element) {
    this.contentElem.appendChild(element);
};
