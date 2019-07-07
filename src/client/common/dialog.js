/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import DirView from './dirview';
import {Toolbar} from './toolbar';
import {Container, StackRow} from './component';

export class Dialog extends Container {
    constructor(parent) {
        super();
        this.deferred = null;
        this.parent = parent;

        this.titleElem = ui.elem('div', {'class': 'frame-title'}, []);
        this.headElem = ui.elem('div', {'class': 'frame-head'}, [this.titleElem]);
        this.inner = ui.elem('form', {'class': 'frame-body'}, []);
        this.inner.onsubmit = () => false;
        this.frameElem = ui.elem('div', {'class': 'frame frame-focus'}, [this.headElem, this.inner]);
        this.outer = ui.elem('div', {'class': 'dialog-overlay'}, [this.frameElem]);

        this.onOpen = null;
    };

    get title() {
        return this.titleElem.textContent;
    }

    set title(title) {
        this.titleElem.textContent = title;
    }

    open() {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.deferred = {
                resolve: resolve,
                reject: reject
            };
            self.parent.appendChild(self.outer);
            if (self.onOpen !== null) {
                self.onOpen();
            }
        });
    }

    close(result) {
        this.outer.parentNode.removeChild(this.outer);
        if (this.deferred !== null) {
            this.deferred.resolve(result);
            this.deferred = null;
        }
    }

    static alert(parent, title, message, details = null) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var content = ui.elem('div', {}, ['' + message]);
        if (details) {
            content.appendChild(ui.elem('textarea', {}, [details]));
        }
        var okButton = ui.elem('button', {}, ['OK']);
        okButton.onclick = function () {
            dialog.close();
        };
        okButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.append(okButton);
        dialog.append(content);
        dialog.append(footer);
        var promise = dialog.open();
        okButton.focus();
        return promise;
    }

    static confirm(parent, title, message, choices = ['OK', 'Cancel'], defaultChoice = 'OK') {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var content = ui.elem('div', {'class': 'frame-content'}, ['' + message]);
        var footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.innerPadding = true;
        var defaultButton = null;
        for (var i = 0; i < choices.length; i++) {
            let button = ui.elem('button', {}, [choices[i]]);
            footer.append(button);
            button.onclick = function () {
                dialog.close(button.textContent);
            };
            button.onkeydown = function (e) {
                if (e.key === 'Escape') {
                    dialog.close(null);
                }
            };
            if (choices[i] === defaultChoice) {
                defaultButton = button;
            }
        }
        dialog.append(content);
        dialog.append(footer);
        var promise = dialog.open();
        if (defaultButton !== null) {
            defaultButton.focus();
        }
        return promise;
    }

    static prompt(parent, title, message, value = '') {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var input = ui.elem('input', {type: 'text'}, []);
        var content = ui.elem('div', {'class': 'frame-content'}, [
            ui.elem('div', {}, ['' + message]),
            input
        ]);
        dialog.inner.onsubmit = function (e) {
            dialog.close(input.value);
            return false;
        };
        input.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var okButton = ui.elem('button', {}, ['OK']);
        okButton.onclick = function () {
            dialog.close(input.value);
        };
        okButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var cancelButton = ui.elem('button', {}, ['Cancel']);
        cancelButton.onclick = function () {
            dialog.close(null);
        };
        cancelButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.innerPadding = true;
        footer.append(okButton);
        footer.append(cancelButton);
        dialog.append(content);
        dialog.append(footer);
        var promise = dialog.open();
        input.focus();
        if (value.length > 0) {
            input.value = value;
            input.setSelectionRange(0, value.length)
        }
        return promise;
    }

    static file(parent, title) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var dirView = new DirView();
        var toolbar = new Toolbar();
        toolbar.padding('bottom');
        toolbar.createGroup()
            .addItem('Go up', 'go-up', () => dirView.goUp())
            .addItem('Go to root', 'go-home', () => dirView.cd('/'))
            .addItem('Reload', 'reload', () => dirView.reload());
        dialog.append(toolbar.outer);
        dialog.append(dirView.elem);
        dialog.inner.style.width = '450px';
        dialog.inner.style.height = '300px';
        dialog.onOpen = () => dirView.cd('/');
        var okButton = ui.elem('button', {}, ['OK']);
        okButton.onclick = function () {
            dialog.close(dirView.selection);
        };
        okButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var cancelButton = ui.elem('button', {}, ['Cancel']);
        cancelButton.onclick = function () {
            dialog.close(null);
        };
        cancelButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.innerPadding = true;
        footer.append(okButton);
        footer.append(cancelButton);
        dialog.append(footer);
        return dialog.open();
    }

    static color(parent, title, value) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var colorPicker = new ui.HsvPicker();
        colorPicker.color = value;
        colorPicker.outer.style.minHeight = '200px';
        colorPicker.outer.style.minWidth = '240px';
        dialog.append(colorPicker);
        var okButton = ui.elem('button', {}, ['OK']);
        okButton.onclick = function () {
            dialog.close(colorPicker.color);
        };
        okButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var cancelButton = ui.elem('button', {}, ['Cancel']);
        cancelButton.onclick = function () {
            dialog.close(null);
        };
        cancelButton.onkeydown = function (e) {
            if (e.key === 'Escape') {
                dialog.close(null);
            }
        };
        var inputRow = new StackRow();
        inputRow.innerPadding = true;
        inputRow.padding('top');
        dialog.append(inputRow);

        var input = ui.elem('input', {type: 'text', value: value})
        inputRow.append(input, {grow: 1});

        var color = ui.elem('div', {'class': 'ts-inset'});
        color.style.width = '100%';
        color.style.backgroundColor = value;
        inputRow.append(color, {grow: 1});

        colorPicker.onchange = value => {
            input.value = value;
            color.style.backgroundColor = value;
        };

        var footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.innerPadding = true;
        footer.append(okButton);
        footer.append(cancelButton);
        dialog.append(footer);
        return dialog.open();
    }
}
