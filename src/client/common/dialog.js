/*
 * TEXTSTEP
 * Copyright (c) 2018 Niels Sonnich Poulsen (http://nielssp.dk)
 * Licensed under the MIT license.
 * See the LICENSE file or http://opensource.org/licenses/MIT for more information.
 */

import * as ui from './ui';
import * as paths from './paths';
import {DirView} from './dirview';
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

        this.onopen = () => {};
    };

    get width() {
        return this.frameElem.getBoundingClientRect().width;
    }

    set width(width) {
        this.frameElem.style.width = width;
    }

    get height() {
        return this.frameElem.getBoundingClientRect().height;
    }

    set height(height) {
        this.frameElem.style.height = height;
    }

    set minWidth(width) {
        this.frameElem.style.minWidth = width;
    }

    set maxWidth(width) {
        this.frameElem.style.maxWidth = width;
    }

    set minHeight(height) {
        this.frameElem.style.minHeight = height;
    }

    set maxHeight(height) {
        this.frameElem.style.maxHeight = height;
    }

    get title() {
        return this.titleElem.textContent;
    }

    set title(title) {
        this.titleElem.textContent = title;
    }

    open() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.deferred = {
                resolve: resolve,
                reject: reject
            };
            self.parent.appendChild(self.outer);
            this.trigger('open', null);
        });
    }

    close(result) {
        this.outer.parentNode.removeChild(this.outer);
        if (this.deferred !== null) {
            this.deferred.resolve(result);
            this.deferred = null;
        }
    }

    static footer(dialog, choices = ['OK', 'Cancel'], defaultChoice = 0) {
        let footer = new StackRow();
        footer.justifyContent = 'flex-end';
        footer.padding('top');
        footer.innerPadding = true;
        let defaultButton = null;
        for (let i = 0; i < choices.length; i++) {
            let button = ui.elem('button', {}, [choices[i]]);
            footer.append(button);
            button.onclick = function () {
                dialog.close(i);
            };
            button.onkeydown = function (e) {
                if (e.key === 'Escape') {
                    dialog.close(null);
                }
            };
            if (i === defaultChoice) {
                defaultButton = button;
            }
        }
        if (defaultButton !== null) {
            dialog.addEventListener('open', () => {
                defaultButton.focus();
            });
        }
        return footer;
    }

    static alert(parent, title, message, details = null) {
        let dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        let content = ui.elem('div', {}, ['' + message]);
        if (details) {
            content.appendChild(ui.elem('textarea', {}, [details]));
        }
        dialog.append(content);
        dialog.append(Dialog.footer(dialog, ['OK']));
        return dialog.open();
    }

    static confirm(parent, title, message, choices = ['OK', 'Cancel'], defaultChoice = 0) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var content = ui.elem('div', {'class': 'frame-content'}, ['' + message]);
        dialog.append(content);
        dialog.append(Dialog.footer(dialog, choices, defaultChoice));
        return dialog.open();
    }

    static prompt(parent, title, message, value = '', type = 'text') {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var input = ui.elem('input', {type: type}, []);
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

    static file(parent, title, multiple = false) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var dirView = new DirView();
        dirView.touchOpen = false;
        dirView.multiSelect = multiple;
        dirView.showPreview = false;
        dirView.addEventListener('fileOpen', path => dialog.close([path]));
        var toolbar = new Toolbar();
        toolbar.padding('bottom');
        toolbar.createGroup()
            .addItem('Go up', 'go-up', () => dirView.goUp())
            .addItem('Go to root', 'go-home', () => dirView.cd('/'))
            .addItem('Reload', 'reload', () => dirView.reload());
        dialog.append(toolbar);
        dialog.append(dirView);
        dialog.inner.style.width = '450px';
        dialog.inner.style.height = '300px';
        dialog.onopen = () => dirView.cd('/');
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

    static save(parent, title) {
        var dialog = new Dialog(parent);
        dialog.padding();
        dialog.title = title;
        var dirView = new DirView();
        dirView.touchOpen = false;
        dirView.multiSelect = false;
        dirView.showPreview = false;
        var toolbar = new Toolbar();
        toolbar.padding('bottom');
        toolbar.createGroup()
            .addItem('Go up', 'go-up', () => dirView.goUp())
            .addItem('Go to root', 'go-home', () => dirView.cd('/'))
            .addItem('Reload', 'reload', () => dirView.reload());
        dialog.append(toolbar);
        dialog.append(dirView);
        dialog.inner.style.width = '450px';
        dialog.inner.style.height = '300px';
        dialog.onopen = () => dirView.cd('/');
        dialog.inner.onsubmit = function (e) {
            dialog.close(dirView.cwd + '/' + input.value);
            return false;
        };
        var input = ui.elem('input', {type: 'text'}, []);
        var nameStack = new StackRow();
        nameStack.padding('top');
        nameStack.innerPadding = true;
        nameStack.append(ui.elem('label', {}, ['File name:']), {shrink: 0, align: 'center'});
        nameStack.append(input);
        dialog.append(nameStack);
        var okButton = ui.elem('button', {}, ['OK']);
        okButton.onclick = function () {
            dialog.close(dirView.cwd + '/' + input.value);
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

        dirView.addEventListener('fileOpen', path => dialog.close(path));
        dirView.addEventListener('cwdChanged', path => input.focus());
        dirView.addEventListener('selectionChanged', selection => {
            if (selection.length === 1) {
                input.value = paths.fileName(selection[0]);
                input.setSelectionRange(0, input.value.length)
            }
            input.focus();
        });

        var promise = dialog.open();
        input.focus();
        return promise;
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

        input.onkeyup = () => {
            colorPicker.color = input.value;
            color.style.backgroundColor = colorPicker.color;
        };
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
        let promise = dialog.open();
        input.focus();
        if (value.length > 0) {
            input.value = value;
            input.setSelectionRange(0, value.length)
        }
        return promise;
    }
}
