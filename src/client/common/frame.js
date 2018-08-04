/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import Menu from './menu';
import Dialog from './dialog';

export default function Frame(title) {
    this.id = null;
    this.title = title;
    this.isOpen = false;
    this.isVisible = false;
    this.hasFocus = false;

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

    this.onOpen = null;
    this.onClose = null;
    this.onShow = null;
    this.onHide = null;
    this.onFocus = null;
    this.onBlur = null;
    this.onKeydown = null;
    this.onResize = null;

    this.elem.style.display = 'none';
}

Frame.prototype.addMenu = function (title) {
    var menu = new Menu(this, title);
    this.menus.push(menu);
    return menu;
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
    this.actions[name] = callback;
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
        this.actions[name].apply(this, [name]);
    } else {
        name.apply(this);
    }
};

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
        this.frame.find('[data-action="' + name + '"]').attr('disabled', false);
        this.menus.forEach(function (menu) {
            menu.frame.find('[data-action="' + name + '"]').attr('disabled', false);
        });
    } else {
        name.forEach(this.enableAction, this);
    }
};

Frame.prototype.disableAction = function (name) {
    if (typeof name === 'string') {
        this.frame.find('[data-action="' + name + '"]').attr('disabled', true);
        this.menus.forEach(function (menu) {
            menu.frame.find('[data-action="' + name + '"]').attr('disabled', true);
        });
    } else {
        name.forEach(this.disableAction, this);
    }
};

Frame.prototype.setTitle = function (title) {
    this.title = title;
    this.head.find('.frame-title').text(this.title);
    this.dockFrame.attr('title', this.title);
    document.title = this.title;
};

Frame.prototype.open = function () {
    if (this.isOpen) {
        return;
    }
    TEXTSTEP.openFrame(this);
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
    TEXTSTEP.closeFrame(this);
    if (!this.isOpen) {
        if (this.onClose !== null) {
            this.onClose();
        }
    }
};

Frame.prototype.show = function () {
    if (!this.isOpen || this.isVisible) {
        return;
    }
    this.elem.style.display = '';
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
    if (this.onFocus !== null) {
        this.onFocus();
    }
};

Frame.prototype.loseFocus = function () {
    this.hasFocus = false;
    if (this.onBlur !== null) {
        this.onBlur();
    }
};

Frame.prototype.appendChild = function (element) {
    this.contentElem.appendChild(element);
};
