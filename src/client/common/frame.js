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
import {Toolbar} from './toolbar';
import {Dialog} from './dialog';
import {CommandMap} from './command';
import {Component, Container} from './component';

export class Frame extends Container {
    constructor(title) {
        super();
        this.frameId = null;
        this.title = title;
        this.isOpen = false;
        this.isVisible = false;
        this.hasFocus = false;
        this.wasResized = false;
        this.className = '';

        this.x = 0;
        this.y = 0;

        this.titleElem = ui.elem('div', {'class': 'frame-title'}, [this.title]);
        this.headElem = ui.elem('div', {'class': 'frame-head'}, [this.titleElem]);
        this.inner = ui.elem('div', {'class': 'frame-body'}, []);
        this.outer = ui.elem('div', {'class': 'frame'}, [this.headElem, this.inner]);

        this.commands = new CommandMap();

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
        this.onresize = null;

        this.outer.style.display = 'none';

        this.outer.onclick = () => this.requestFocus();

        var closeButton = ui.elem('a', {'data-action': 'close'});
        closeButton.onclick = () => this.close();
        this.headElem.appendChild(ui.elem('div', {'class': 'frame-actions'}, [closeButton]));

        var menuButton = ui.elem('a', {'data-action': 'toggle-menu'});
        menuButton.onclick = e => {
            e.stopPropagation();
            TEXTSTEP.toggleMenu();
        };
        this.headElem.insertBefore(ui.elem('div', {'class': 'frame-actions'}, [menuButton]), this.headElem.children[0]);

        this.defineAction('close', () => this.close());
    }

    updateElem() {
        this.outer.className = 'frame';
        if (this.hasFocus) {
            this.outer.className += ' frame-focus';
        }
        this.outer.className += ' ' + this.className;
    }

    addMenu(title) {
        var menu = new Menu(title, this.commands);
        this.menus.push(menu);
        return menu;
    }

    createToolFrame(name, title) {
        var toolFrame = new ToolFrame(title);
        this.toolFrames[name] = toolFrame;
        return toolFrame;
    }

    createToolbar() {
        var toolbar = new Toolbar(this.commands);
        if (this.inner.children) {
            this.inner.insertBefore(toolbar.outer, this.inner.children[0]);
        } else {
            this.appendChild(toolbar);
        }
        return toolbar;
    }

    openDialog(dialog) {
        if (!this.hasFocus) {
            this.requestFocus();
        }
        this.dialogs.push(dialog);
        dialog.addEventListener('close', () => this.dialogs.pop());
        return dialog.open();
    }

    alert(title, message, error = {}) {
        if (!this.isOpen) {
            throw 'Frame not open';
        }
        let details = null;
        if (error.context && error.context.details) {
            details = error.context.details;
        }
        return this.openDialog(Dialog.alert(this.inner, title, message, details));
    }

    confirm(title, message, choices, defaultChoice) {
        return this.openDialog(Dialog.confirm(this.inner, title, message, choices, defaultChoice));
    }

    prompt(title, message, value = '', type = 'text') {
        return this.openDialog(Dialog.prompt(this.inner, title, message, value, type));
    }

    file(title) {
        return this.openDialog(Dialog.file(this.inner, title));
    }

    openFile(title, multiple = false) {
        return this.openDialog(Dialog.file(this.inner, title, multiple));
    }

    saveFile(title) {
        return this.openDialog(Dialog.save(this.inner, title));
    }

    color(title, value) {
        return this.openDialog(Dialog.color(this.inner, title, value));
    }

    keydown(e) {
        if (e.defaultPrevented || this.isDialogOpen()) {
            return;
        }
        if (this.onKeydown !== null) {
            if (!this.onKeydown(e)) {
                return false;
            }
        }
        if (this.commands.activateKey(e)) {
            e.preventDefault();
            return false;
        }
    }

    bindKey(key, action) {
        this.commands.bindKey(key, action);
    }

    defineAction(name, callback, groups) {
        this.commands.define(name, callback, groups);
    }

    activate(name) {
        this.commands.activate(name);
    }

    bindAction(name, element) {
        this.commands.bindElement(element, name);
    }

    isDialogOpen() {
        return this.dialogs.length > 0;
    }

    enableGroup(group) {
        this.commands.enableGroup(group);
    }

    disableGroup(group) {
        this.commands.disableGroup(group);
    }

    enableAction(name) {
        this.commands.enable(name);
    }

    disableAction(name) {
        this.commands.disable(name);
    }

    setTitle(title) {
        this.title = title;
        this.titleElem.textContent = this.title;
    }

    open() {
        if (this.isOpen) {
            return;
        }
        TEXTSTEP.openFrame(this);
        if (this.isOpen) {
            if (this.onOpen !== null) {
                this.onOpen();
            }
        }
    }

    close() {
        if (!this.isOpen) {
            return Promise.resolve(true);
        }
        return this.confirmClose().then(close => {
            if (close) {
                TEXTSTEP.closeFrame(this);
                if (!this.isOpen) {
                    if (this.onClose !== null) {
                        this.onClose();
                    }
                }
                return true;
            }
            return false;
        });
    }

    show() {
        if (!this.isOpen || this.isVisible) {
            return;
        }
        this.outer.style.display = '';
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
    }

    hide() {
        if (!this.isVisible) {
            return;
        }
        this.outer.style.display = 'none';
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
    }

    requestFocus() {
        TEXTSTEP.focusFrame(this);
    }

    receiveFocus() {
        this.hasFocus = true;
        this.updateElem();
        if (this.wasResized) {
            this.wasResized = false;
            this.resized();
        }
        if (this.onFocus !== null) {
            this.onFocus();
        }
    }

    loseFocus() {
        this.hasFocus = false;
        this.updateElem();
        if (this.onBlur !== null) {
            this.onBlur();
        }
    }

    resized() {
        if (!this.hasFocus) {
            this.wasResized = true;
        }
        this.trigger('resize');
        this.update();
    }

    mouseDown(e) {

    }

    mouseMove(e) {
    }

    mouseUp(e) {
    }

    appendChild(child, properties = {}) {
        console.warn('deprecated');
        this.append(child, properties);
    }

}

util.eventify(Frame.prototype);
